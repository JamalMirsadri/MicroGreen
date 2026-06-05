import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ImagePlus,
  Leaf,
  RefreshCw,
  Save,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { getToken } from '@/api/apiClient';
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

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function titleize(key = '') {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function setAtPath(source, path, value) {
  if (path.length === 0) return value;
  const next = Array.isArray(source) ? [...source] : { ...(source || {}) };
  const [head, ...rest] = path;
  next[head] = setAtPath(next[head], rest, value);
  return next;
}

function deleteAtPath(source, path) {
  if (path.length === 0) return source;
  const next = Array.isArray(source) ? [...source] : { ...(source || {}) };
  const [head, ...rest] = path;
  if (rest.length === 0) {
    if (Array.isArray(next)) next.splice(head, 1);
    else delete next[head];
    return next;
  }
  next[head] = deleteAtPath(next[head], rest);
  return next;
}

function inferArrayItem(items) {
  const sample = items?.find((item) => item !== null && item !== undefined);
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === 'object') {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, inferEmptyValue(value)]));
  }
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  return '';
}

function inferEmptyValue(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, inferEmptyValue(child)]));
  }
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return '';
}

function FieldLabel({ name, path }) {
  return (
    <label className="block font-body text-xs font-medium text-muted-foreground mb-1">
      {name || titleize(String(path[path.length - 1] || 'Value'))}
    </label>
  );
}

function ImageField({ name, value, path, onChange }) {
  const fileRef   = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(value || '');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const token = getToken();
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setPreview(url);
      onChange(path, url);
    } catch (err) {
      toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FieldLabel name={name} path={path} />
      <div className="space-y-2">
        {/* Preview */}
        {preview && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/40 bg-background/30">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
              onError={() => setPreview('')}
            />
          </div>
        )}
        {/* Upload button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Image</>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        {/* URL fallback */}
        <input
          type="text"
          value={value ?? ''}
          placeholder="Or paste image URL…"
          onChange={(e) => { setPreview(e.target.value); onChange(path, e.target.value); }}
          className="w-full h-10 rounded-xl bg-background/50 border border-border/50 px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

function PrimitiveField({ name, value, path, onChange }) {
  const fieldKey = String(path[path.length - 1] || '').toLowerCase();

  // Detect image URL fields
  if (fieldKey === 'image_url' || fieldKey === 'image' || fieldKey.endsWith('_image_url')) {
    return <ImageField name={name} value={value} path={path} onChange={onChange} />;
  }

  const isLongText = typeof value === 'string' && (value.length > 80 || fieldKey.includes('description') || fieldKey.includes('prompt'));

  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between rounded-xl bg-background/40 border border-border/40 px-4 py-3">
        <div>
          <FieldLabel name={name} path={path} />
          <p className="text-xs text-muted-foreground">{value ? 'Enabled / Yes' : 'Disabled / No'}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(path, !value)}
          className={classNames(
            'w-12 h-6 rounded-full p-1 transition-colors',
            value ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span className={classNames('block w-4 h-4 rounded-full bg-white transition-transform', value && 'translate-x-6')} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel name={name} path={path} />
      {isLongText ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(path, e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-background/50 border border-border/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(path, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full h-10 rounded-xl bg-background/50 border border-border/50 px-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </div>
  );
}

function ArrayField({ name, value = [], path, onChange }) {
  const addItem = () => onChange(path, [...value, inferArrayItem(value)]);
  const removeItem = (index) => onChange(path, deleteAtPath(value, [index]));

  const setChild = (childPath, nextValue) => {
    onChange(path, setAtPath(value, childPath, nextValue));
  };

  const isPrimitiveArray = value.every((item) => item === null || typeof item !== 'object');

  return (
    <div className="rounded-2xl bg-background/30 border border-border/40 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="font-body text-sm font-semibold text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{value.length} item{value.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" onClick={addItem} className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs">
          Add Item
        </button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          No items yet. Click Add Item.
        </div>
      ) : (
        <div className={classNames('space-y-3', isPrimitiveArray && 'grid sm:grid-cols-2 gap-3 space-y-0')}>
          {value.map((item, index) => (
            <div key={index} className="rounded-xl bg-card/50 border border-border/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-semibold text-muted-foreground">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
              <VisualField
                name=""
                value={item}
                path={[index]}
                onChange={setChild}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectField({ name, value = {}, path, onChange, compact = false }) {
  const entries = Object.entries(value || {});
  const setChild = (childPath, nextValue) => {
    onChange(path, setAtPath(value, childPath, nextValue));
  };

  return (
    <div className={classNames(!compact && 'rounded-2xl bg-background/30 border border-border/40 p-4')}>
      {name && (
        <div className="mb-3">
          <h4 className="font-body text-sm font-semibold text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">Edit fields visually. No code required.</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {entries.map(([key, child]) => (
          <div key={key} className={classNames((Array.isArray(child) || (child && typeof child === 'object')) && 'md:col-span-2')}>
            <VisualField
              name={titleize(key)}
              value={child}
              path={[key]}
              onChange={setChild}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualField({ name, value, path, onChange, compact = false }) {
  if (Array.isArray(value)) {
    return <ArrayField name={name || titleize(String(path[path.length - 1] || 'Items'))} value={value} path={path} onChange={onChange} />;
  }

  if (value && typeof value === 'object') {
    return <ObjectField name={name} value={value} path={path} onChange={onChange} compact={compact} />;
  }

  return <PrimitiveField name={name} value={value} path={path} onChange={onChange} />;
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

function VisualEditor({ label, value, onSave }) {
  const [draft, setDraft] = useState(clone(value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(clone(value));
  }, [value]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
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
      <VisualField
        name=""
        value={draft}
        path={[]}
        onChange={(path, nextValue) => setDraft(path.length === 0 ? nextValue : setAtPath(draft, path, nextValue))}
      />
    </div>
  );
}

function RecordManager({ section, records, onCreate, onUpdate, onDelete, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft]           = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving]         = useState(false);

  // Initialise selection only when records first load
  useEffect(() => {
    if (isCreating) return;          // Don't override an in-progress new-record form
    if (selectedId) {
      const still = records?.find((r) => r.id === selectedId);
      if (still) { setDraft(clone(still)); return; }
    }
    const first = records?.[0] || null;
    setSelectedId(first?.id || null);
    setDraft(first ? clone(first) : null);
  }, [records]); // intentionally only re-run when records change

  const current = records?.find((r) => r.id === selectedId) ?? null;

  const saveRecord = async () => {
    setSaving(true);
    try {
      if (current?.id) {
        await onUpdate(section.key, current.id, draft);
      } else {
        await onCreate(section.key, draft);
      }
      toast({ title: `${section.label} saved` });
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addTemplate = () => {
    const template =
      section.key === 'products' ? PRODUCT_TEMPLATE :
      section.key === 'orders'   ? ORDER_TEMPLATE   : {};
    setSelectedId(null);
    setDraft(clone(template));
    setIsCreating(true);
  };

  const selectRecord = (item) => {
    setSelectedId(item.id);
    setDraft(clone(item));
    setIsCreating(false);
  };

  const removeRecord = async () => {
    if (!current?.id) return;
    if (!window.confirm(`Delete this ${section.label} record?`)) return;
    try {
      await onDelete(section.key, current.id);
      toast({ title: 'Record deleted' });
      setSelectedId(null);
      setDraft(null);
      setIsCreating(false);
      onRefresh();
    } catch (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  };

  const cancelNew = () => {
    const first = records?.[0] || null;
    setSelectedId(first?.id || null);
    setDraft(first ? clone(first) : null);
    setIsCreating(false);
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      {/* ── Record list ─────────────────────────────────── */}
      <div className="rounded-2xl bg-card/70 border border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">{section.label}</h3>
            <p className="text-xs text-muted-foreground">{records?.length || 0} records</p>
          </div>
          <button
            type="button"
            onClick={addTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            + Add New
          </button>
        </div>
        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
          {(records || []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectRecord(item)}
              className={classNames(
                'w-full text-left rounded-xl border px-3 py-2 transition-colors',
                selectedId === item.id && !isCreating
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border/40 bg-background/30 hover:bg-secondary/40'
              )}
            >
              <div className="font-body text-sm text-foreground truncate">
                {item.name || item.email || item.identity_name || item.status || item.id}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">{item.id}</div>
            </button>
          ))}
          {records?.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No records yet. Click <strong>+ Add New</strong> to create one.
            </p>
          )}
        </div>
      </div>

      {/* ── Editor panel ────────────────────────────────── */}
      <div className="rounded-2xl bg-card/70 border border-border/50 p-5">
        {draft === null ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-12">
            <p className="text-4xl">📝</p>
            <p className="font-display text-lg font-semibold text-foreground">Select a record to edit</p>
            <p className="font-body text-sm text-muted-foreground">or click <strong>+ Add New</strong> to create one</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                {isCreating ? `New ${section.label}` : 'Edit Record'}
              </h3>
              <div className="flex gap-2">
                {isCreating && (
                  <button
                    type="button"
                    onClick={cancelNew}
                    className="px-3 py-2 rounded-full bg-secondary text-muted-foreground text-xs hover:text-foreground"
                  >
                    Cancel
                  </button>
                )}
                {!isCreating && current && (
                  <button
                    type="button"
                    onClick={removeRecord}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/10 text-red-300 text-xs hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveRecord}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)] transition-shadow"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : isCreating ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[600px] pr-1">
              <VisualField
                name=""
                value={draft}
                path={[]}
                onChange={(path, nextValue) =>
                  setDraft((prev) => path.length === 0 ? nextValue : setAtPath(prev, path, nextValue))
                }
              />
            </div>
          </>
        )}
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
              <VisualEditor
                label={activeSection?.label || active}
                value={collections[active]}
                onSave={(value) => saveCollection(active, value)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
