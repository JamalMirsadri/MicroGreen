import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Bot,
  CreditCard,
  Database,
  Edit3,
  FileText,
  HelpCircle,
  Home,
  Leaf,
  RefreshCw,
  Save,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

const ARRAY_SECTIONS = [
  { key: 'products', label: 'Products', icon: ShoppingBag, description: 'Catalog, prices, stock, tags, recommendations.' },
  { key: 'orders', label: 'Orders & Subscriptions', icon: CreditCard, description: 'Customer orders, subscriptions, statuses, totals.' },
  { key: 'users', label: 'Users', icon: Users, description: 'Customer accounts and admin roles.' },
  { key: 'userGardens', label: 'My Garden Data', icon: Leaf, description: 'XP, streaks, badges, plants, identity.' },
  { key: 'quizResults', label: 'Quiz Results', icon: Sparkles, description: 'Submitted discovery answers and identities.' },
];

const CONFIG_SECTIONS = [
  { key: 'siteContent', label: 'Home & Website Content', icon: Home, description: 'Hero copy, CTA copy, footer, support email.' },
  { key: 'quizQuestions', label: 'Questions', icon: HelpCircle, description: 'Discover quiz questions, options, labels, and icons.' },
  { key: 'gameConfig', label: 'Game, Rewards & Subscribe', icon: Award, description: 'Levels, daily challenges, badges, identities, subscription tiers.' },
  { key: 'integrations', label: 'Payments & AI APIs', icon: Bot, description: 'Stripe/payment setup, AI providers, prompts, API environment key names.' },
];

const PRODUCT_TEMPLATE = {
  name: 'New Microgreen',
  description: 'Product description',
  short_description: 'Short tagline',
  price: 9.99,
  image_url: '',
  category: 'microgreen',
  tags: ['Energy'],
  benefits: ['Wellness'],
  flavor_profile: 'fresh',
  mood_match: ['all'],
  goal_match: ['all'],
  is_featured: false,
  stock_status: 'in_stock',
};

const ORDER_TEMPLATE = {
  items: [{ product_name: 'Product', quantity: 1, price: 9.99 }],
  total: 9.99,
  status: 'pending',
  subscription_tier: '',
  shipping_address: '',
};

function pretty(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJson(text) {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-card/70 border border-border/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-primary/70">Live</span>
      </div>
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="font-body text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function JsonEditor({ label, value, onSave, rows = 18 }) {
  const [text, setText] = useState(pretty(value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(pretty(value));
  }, [value]);

  const handleSave = async () => {
    const parsed = parseJson(text);
    if (!parsed.ok) {
      toast({ title: 'Invalid JSON', description: parsed.error.message, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed.data);
      toast({ title: `${label} saved` });
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card/70 border border-border/50 p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="font-display text-lg font-semibold text-foreground">{label}</h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full rounded-xl bg-background/70 border border-border/50 p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function RecordManager({ section, records, onCreate, onUpdate, onDelete, onRefresh }) {
  const [selectedId, setSelectedId] = useState(records?.[0]?.id || '');
  const [draft, setDraft] = useState(pretty(records?.[0] || {}));

  useEffect(() => {
    const current = records?.find((item) => item.id === selectedId) || records?.[0];
    if (current) {
      setSelectedId(current.id);
      setDraft(pretty(current));
    } else {
      setSelectedId('');
      setDraft('{}');
    }
  }, [records, selectedId]);

  const current = records?.find((item) => item.id === selectedId);

  const saveRecord = async () => {
    const parsed = parseJson(draft);
    if (!parsed.ok) {
      toast({ title: 'Invalid JSON', description: parsed.error.message, variant: 'destructive' });
      return;
    }
    try {
      if (current?.id) await onUpdate(section.key, current.id, parsed.data);
      else await onCreate(section.key, parsed.data);
      toast({ title: `${section.label} saved` });
      onRefresh();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    }
  };

  const addTemplate = () => {
    const template = section.key === 'products' ? PRODUCT_TEMPLATE : section.key === 'orders' ? ORDER_TEMPLATE : {};
    setSelectedId('');
    setDraft(pretty(template));
  };

  const removeRecord = async () => {
    if (!current?.id) return;
    if (!window.confirm(`Delete ${section.label} record?`)) return;
    try {
      await onDelete(section.key, current.id);
      toast({ title: 'Record deleted' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      <div className="rounded-2xl bg-card/70 border border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">{section.label}</h3>
            <p className="text-xs text-muted-foreground">{records?.length || 0} records</p>
          </div>
          <button onClick={addTemplate} className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs">
            Add
          </button>
        </div>
        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
          {(records || []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                setDraft(pretty(item));
              }}
              className={classNames(
                'w-full text-left rounded-xl border px-3 py-2 transition-colors',
                selectedId === item.id ? 'border-primary/50 bg-primary/10' : 'border-border/40 bg-background/30 hover:bg-secondary/40'
              )}
            >
              <div className="font-body text-sm text-foreground truncate">
                {item.name || item.email || item.identity_name || item.status || item.id}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">{item.id}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card/70 border border-border/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-primary" />
            {current ? 'Edit Record' : 'Create Record'}
          </h3>
          <div className="flex gap-2">
            {current && (
              <button onClick={removeRecord} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/10 text-red-300 text-xs">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button onClick={saveRecord} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={24}
          spellCheck={false}
          className="w-full rounded-xl bg-background/70 border border-border/50 p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);

  const allSections = useMemo(() => [
    { key: 'dashboard', label: 'Dashboard', icon: Database, description: 'Overview and live business metrics.' },
    ...ARRAY_SECTIONS,
    ...CONFIG_SECTIONS,
  ], []);

  const loadAdmin = async () => {
    setLoading(true);
    try {
      const nextOverview = await api.admin.overview();
      setOverview(nextOverview);
      const loaded = {};
      await Promise.all(
        [...ARRAY_SECTIONS, ...CONFIG_SECTIONS].map(async (section) => {
          loaded[section.key] = await api.admin.collection(section.key);
        })
      );
      setCollections(loaded);
    } catch (error) {
      toast({ title: 'Admin load failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') loadAdmin();
  }, [isAuthenticated, user?.role]);

  const saveCollection = async (name, value) => {
    const saved = await api.admin.saveCollection(name, value);
    setCollections((prev) => ({ ...prev, [name]: saved }));
    await loadAdmin();
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen px-4 py-24 bg-background">
        <div className="max-w-2xl mx-auto rounded-3xl bg-card border border-border/50 p-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Access Required</h1>
          <p className="font-body text-muted-foreground mt-3">
            Sign in with an admin account to manage products, questions, rewards, subscriptions, content, payments, and AI settings.
          </p>
          <p className="font-mono text-xs text-primary mt-5">Local default: admin@garden.local / admin1234</p>
        </div>
      </div>
    );
  }

  const activeSection = allSections.find((section) => section.key === active);
  const stats = overview?.counts || {};

  return (
    <div className="min-h-screen px-4 py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">Control Center</p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">Admin Panel</h1>
              <p className="font-body text-muted-foreground mt-2">
                Manage every major part of Inner Garden from one place.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAdmin}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-3xl bg-card/70 border border-border/50 p-4 h-fit sticky top-24">
            <div className="space-y-2">
              {allSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActive(section.key)}
                  className={classNames(
                    'w-full flex items-start gap-3 text-left px-3 py-3 rounded-2xl transition-colors',
                    active === section.key ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <section.icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="block font-body text-sm font-medium">{section.label}</span>
                    <span className="block text-[11px] opacity-70 leading-snug">{section.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main>
            {loading ? (
              <div className="rounded-3xl bg-card border border-border/50 p-10 text-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">Loading admin data...</p>
              </div>
            ) : active === 'dashboard' ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard label="Users" value={stats.users || 0} icon={Users} />
                  <StatCard label="Products" value={stats.products || 0} icon={ShoppingBag} />
                  <StatCard label="Orders" value={stats.orders || 0} icon={CreditCard} />
                  <StatCard label="Gardens" value={stats.userGardens || 0} icon={Leaf} />
                  <StatCard label="Quiz Results" value={stats.quizResults || 0} icon={Sparkles} />
                </div>
                <div className="rounded-3xl bg-card/70 border border-border/50 p-6">
                  <h2 className="font-display text-2xl font-semibold mb-3">What You Can Manage</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...ARRAY_SECTIONS, ...CONFIG_SECTIONS].map((section) => (
                      <button
                        key={section.key}
                        onClick={() => setActive(section.key)}
                        className="text-left p-4 rounded-2xl bg-background/40 border border-border/40 hover:border-primary/30 transition-colors"
                      >
                        <section.icon className="w-5 h-5 text-primary mb-3" />
                        <div className="font-body font-semibold text-foreground">{section.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">{section.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-card/70 border border-border/50 p-6">
                  <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Production Notes
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Payment and AI sections store provider configuration and prompts. Add real secret keys as Render environment variables
                    only; never paste secret API keys into the browser admin panel.
                  </p>
                </div>
              </div>
            ) : ARRAY_SECTIONS.some((section) => section.key === active) ? (
              <RecordManager
                section={activeSection}
                records={collections[active] || []}
                onCreate={api.admin.createRecord}
                onUpdate={api.admin.updateRecord}
                onDelete={api.admin.deleteRecord}
                onRefresh={loadAdmin}
              />
            ) : (
              <JsonEditor
                label={activeSection?.label || active}
                value={collections[active]}
                rows={active === 'gameConfig' || active === 'quizQuestions' ? 28 : 20}
                onSave={(value) => saveCollection(active, value)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
