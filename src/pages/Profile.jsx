import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Calendar, Check, CreditCard, Loader2,
  Mail, MapPin, Phone, Save, ShoppingBag, User,
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const COUNTRIES = [
  'Portugal', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Spain', 'Netherlands', 'Brazil', 'United Arab Emirates',
  'Saudi Arabia', 'Sweden', 'Italy', 'Other',
];

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, disabled, readOnly }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className="w-full h-11 rounded-xl bg-background/60 border border-border/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed read-only:opacity-60 transition-all"
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 rounded-xl bg-background/60 border border-border/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
    >
      {children}
    </select>
  );
}

const EMPTY_ADDRESS = {
  street: '', city: '', state: '', postal_code: '', country: 'Portugal',
};

export default function Profile() {
  const { user } = useAuth();

  const [loading, setSaving_]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved]       = useState(false);

  const [form, setForm] = useState({
    full_name:        '',
    phone:            '',
    nif:              '',
    birthday:         '',
    shipping_address: { ...EMPTY_ADDRESS },
    billing_address:  { ...EMPTY_ADDRESS },
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.profile.get()
      .then((data) => {
        setForm({
          full_name:        data.full_name        || '',
          phone:            data.phone            || '',
          nif:              data.nif              || '',
          birthday:         data.birthday         || '',
          shipping_address: { ...EMPTY_ADDRESS, ...(data.shipping_address || {}) },
          billing_address:  { ...EMPTY_ADDRESS, ...(data.billing_address  || {}) },
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user?.id]);

  const setTop    = (key, val)           => setForm((f) => ({ ...f, [key]: val }));
  const setAddr   = (type, key, val)     => setForm((f) => ({
    ...f,
    [type]: { ...f[type], [key]: val },
    ...(sameAsBilling && type === 'shipping_address'
      ? { billing_address: { ...f.billing_address, [key]: val } }
      : {}),
  }));

  const handleSave = async () => {
    setSaving_(true);
    setSaved(false);
    try {
      const payload = { ...form };
      if (sameAsBilling) payload.billing_address = { ...form.shipping_address };
      await api.profile.update(payload);
      setSaved(true);
      toast({ title: 'Profile saved successfully' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving_(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20 px-4 text-center">
        <User className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="font-display text-2xl font-bold text-foreground">Sign in to view your profile</h2>
        <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* Hero */}
      <div className="relative px-4 py-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,197,94,0.1), transparent 55%)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4"
          >
            <span className="font-display text-2xl font-bold text-primary">
              {(form.full_name || user.email || '?')[0].toUpperCase()}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground"
          >
            {form.full_name || 'Your Profile'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body text-muted-foreground mt-1"
          >
            {user.email}
          </motion.p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">

        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Personal Info ────────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-card border border-border/40 p-7"
            >
              <h2 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name" icon={User}>
                  <Input value={form.full_name} onChange={(v) => setTop('full_name', v)} placeholder="Jane Doe" />
                </Field>
                <Field label="Email" icon={Mail}>
                  <Input value={user.email} readOnly />
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <Input value={form.phone} onChange={(v) => setTop('phone', v)} placeholder="+351 912 345 678" type="tel" />
                </Field>
                <Field label="Date of Birth" icon={Calendar}>
                  <Input value={form.birthday} onChange={(v) => setTop('birthday', v)} type="date" />
                </Field>
                <Field label="NIF / Tax ID" icon={CreditCard}>
                  <Input value={form.nif} onChange={(v) => setTop('nif', v)} placeholder="123 456 789" />
                </Field>
              </div>
            </motion.section>

            {/* ── Shipping Address ──────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl bg-card border border-border/40 p-7"
            >
              <h2 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Shipping Address
              </h2>
              <div className="space-y-4">
                <Field label="Street Address">
                  <Input
                    value={form.shipping_address.street}
                    onChange={(v) => setAddr('shipping_address', 'street', v)}
                    placeholder="Rua das Flores, 42, 2º Esq"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City">
                    <Input
                      value={form.shipping_address.city}
                      onChange={(v) => setAddr('shipping_address', 'city', v)}
                      placeholder="Lisboa"
                    />
                  </Field>
                  <Field label="State / Region">
                    <Input
                      value={form.shipping_address.state}
                      onChange={(v) => setAddr('shipping_address', 'state', v)}
                      placeholder="Lisboa"
                    />
                  </Field>
                  <Field label="Postal Code">
                    <Input
                      value={form.shipping_address.postal_code}
                      onChange={(v) => setAddr('shipping_address', 'postal_code', v)}
                      placeholder="1000-001"
                    />
                  </Field>
                  <Field label="Country">
                    <Select
                      value={form.shipping_address.country}
                      onChange={(v) => setAddr('shipping_address', 'country', v)}
                    >
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
              </div>
            </motion.section>

            {/* ── Billing Address ───────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl bg-card border border-border/40 p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Billing Address
                </h2>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setSameAsBilling((v) => !v)}
                    className={`w-10 h-5 rounded-full transition-colors ${sameAsBilling ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${sameAsBilling ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="font-body text-sm text-muted-foreground">Same as shipping</span>
                </label>
              </div>

              {sameAsBilling ? (
                <p className="font-body text-sm text-muted-foreground italic">
                  Using shipping address as billing address.
                </p>
              ) : (
                <div className="space-y-4">
                  <Field label="Street Address">
                    <Input
                      value={form.billing_address.street}
                      onChange={(v) => setAddr('billing_address', 'street', v)}
                      placeholder="Avenida da República, 10"
                    />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="City">
                      <Input
                        value={form.billing_address.city}
                        onChange={(v) => setAddr('billing_address', 'city', v)}
                        placeholder="Porto"
                      />
                    </Field>
                    <Field label="State / Region">
                      <Input
                        value={form.billing_address.state}
                        onChange={(v) => setAddr('billing_address', 'state', v)}
                        placeholder="Porto"
                      />
                    </Field>
                    <Field label="Postal Code">
                      <Input
                        value={form.billing_address.postal_code}
                        onChange={(v) => setAddr('billing_address', 'postal_code', v)}
                        placeholder="4000-001"
                      />
                    </Field>
                    <Field label="Country">
                      <Select
                        value={form.billing_address.country}
                        onChange={(v) => setAddr('billing_address', 'country', v)}
                      >
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                </div>
              )}
            </motion.section>

            {/* ── Quick links ───────────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              <Link
                to="/shop"
                className="flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/40 transition-colors group"
              >
                <ShoppingBag className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Shop Products</p>
                  <p className="font-body text-xs text-muted-foreground">Browse and order microgreens</p>
                </div>
              </Link>
              <Link
                to="/garden"
                className="flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/40 transition-colors group"
              >
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">My Garden</p>
                  <p className="font-body text-xs text-muted-foreground">Track your growth & XP</p>
                </div>
              </Link>
            </motion.section>

            {/* ── Save button ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex justify-end pb-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center gap-2.5 px-8 py-4 rounded-xl font-display font-bold text-base transition-all ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(34,197,94,0.5)]'
                    : 'bg-primary text-primary-foreground hover:shadow-[0_0_28px_rgba(34,197,94,0.4)]'
                } disabled:opacity-60`}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                ) : saved ? (
                  <><Check className="w-5 h-5" /> Saved!</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Profile</>
                )}
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
