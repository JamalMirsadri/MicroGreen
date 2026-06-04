import Stripe from 'stripe';
import { newId, readDb, writeDb } from './db.js';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Creates a Stripe Checkout Session from cart items.
 * Persists a pending order first, then passes the order ID as metadata.
 */
export async function createCheckoutSession(req, res) {
  const { items, origin } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.',
      stripe_missing: true,
    });
  }

  // Build line items for Stripe
  const lineItems = items.map((item) => {
    const unitAmount = Math.round(Number(item.price) * 100); // cents
    const entry = {
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'usd',
        product_data: {
          name: item.name,
          metadata: { product_id: item.id },
        },
        unit_amount: unitAmount,
      },
      quantity: Number(item.quantity) || 1,
    };
    if (item.image_url) {
      try {
        const url = new URL(item.image_url);
        if (url.protocol === 'https:') {
          entry.price_data.product_data.images = [item.image_url];
        }
      } catch { /* ignore bad URLs */ }
    }
    return entry;
  });

  // Persist a pending order in the local DB
  const db = readDb();
  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const orderId = newId();
  const order = {
    id: orderId,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    user_id: req.user?.id || null,
    items: items.map((i) => ({
      product_id: i.id,
      product_name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    total: parseFloat(total.toFixed(2)),
    status: 'pending_payment',
    payment_provider: 'stripe',
  };
  db.orders.push(order);
  writeDb(db);

  // Determine app origin for redirect URLs
  const appOrigin = origin || process.env.APP_URL || 'http://localhost:5173';
  const successUrl = `${appOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`;
  const cancelUrl  = `${appOrigin}/checkout/cancel?order_id=${orderId}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      metadata: { order_id: orderId },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Enable Stripe Link (one-click checkout for returning Stripe users)
      payment_method_options: {
        link: { display: 'auto' },
      },
      // Collect billing/shipping details
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'AE', 'SA'],
      },
      // Allow promo codes
      allow_promotion_codes: true,
    });

    res.json({ url: session.url, session_id: session.id, order_id: orderId });
  } catch (err) {
    console.error('[Stripe] create session error:', err.message);
    // Roll back the pending order
    const rollbackDb = readDb();
    rollbackDb.orders = rollbackDb.orders.filter((o) => o.id !== orderId);
    writeDb(rollbackDb);
    res.status(500).json({ message: err.message });
  }
}

/**
 * Retrieves a Stripe Checkout Session and updates the order status.
 */
export async function getCheckoutSession(req, res) {
  const { sessionId } = req.params;
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    // Update local order status based on session
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const db = readDb();
      const idx = db.orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        const newStatus =
          session.payment_status === 'paid' ? 'paid' :
          session.status === 'expired'      ? 'cancelled' :
          'pending_payment';
        if (db.orders[idx].status !== newStatus) {
          db.orders[idx].status       = newStatus;
          db.orders[idx].updated_date = new Date().toISOString();
          db.orders[idx].stripe_session_id = sessionId;
          if (session.customer_details?.email) {
            db.orders[idx].customer_email = session.customer_details.email;
          }
          writeDb(db);
        }
      }
    }

    res.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      order_id: orderId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Stripe webhook — verifies signature and handles checkout.session.completed.
 */
export async function handleWebhook(req, res) {
  const stripe = getStripe();
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (secret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      console.error('[Stripe webhook] signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Without a webhook secret (local dev), parse JSON directly
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).send('Invalid JSON');
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const db = readDb();
      const idx = db.orders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        db.orders[idx].status           = 'paid';
        db.orders[idx].updated_date     = new Date().toISOString();
        db.orders[idx].stripe_session_id = session.id;
        db.orders[idx].customer_email   = session.customer_details?.email || '';
        writeDb(db);
        console.log(`[Stripe] Order ${orderId} marked as paid`);
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const db = readDb();
      const idx = db.orders.findIndex((o) => o.id === orderId);
      if (idx !== -1 && db.orders[idx].status === 'pending_payment') {
        db.orders[idx].status       = 'cancelled';
        db.orders[idx].updated_date = new Date().toISOString();
        writeDb(db);
      }
    }
  }

  res.json({ received: true });
}
