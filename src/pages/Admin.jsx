import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, ShoppingBag, Target, Repeat, TrendingUp, Award } from 'lucide-react';
import { api } from '@/api/apiClient';

const COLORS = ['hsl(42, 80%, 55%)', 'hsl(145, 60%, 40%)', 'hsl(160, 50%, 35%)', 'hsl(30, 60%, 50%)', 'hsl(140, 10%, 45%)'];

export default function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.admin.stats().then(setData).catch(console.error);
  }, []);

  const stats = data?.stats;
  const quizData = data?.quizData || [];
  const identityData = (data?.identityData || []).map((d, i) => ({
    ...d,
    color: COLORS[i % COLORS.length],
  }));
  const revenueData = data?.revenueData || [];

  const STATS = stats
    ? [
        { label: 'Total Users', value: String(stats.totalUsers), icon: Users, change: 'live' },
        { label: 'Orders', value: String(stats.orders), icon: ShoppingBag, change: 'live' },
        { label: 'Quiz Completions', value: String(stats.quizCompletions), icon: Target, change: 'live' },
        { label: 'Subscriptions', value: String(stats.subscriptions), icon: Repeat, change: 'live' },
        { label: 'Avg Streak', value: `${stats.avgStreak} days`, icon: TrendingUp, change: 'live' },
        { label: 'Badges Earned', value: String(stats.badgesEarned), icon: Award, change: 'live' },
      ]
    : [];

  return (
    <div className="min-h-screen px-4 py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="font-body text-muted-foreground mt-1">Live data from your local API</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card border border-border/50 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="font-body text-xs text-primary">{stat.change}</span>
              </div>
              <div className="font-display text-xl font-bold text-foreground">{stat.value}</div>
              <div className="font-body text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-border/50 p-6"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quiz Completions</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={quizData}>
                <XAxis dataKey="name" stroke="hsl(60,10%,55%)" fontSize={12} />
                <YAxis stroke="hsl(60,10%,55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(140,15%,8%)', border: '1px solid hsl(140,10%,16%)', borderRadius: '8px', color: 'hsl(60,20%,95%)' }} />
                <Bar dataKey="completions" fill="hsl(145,60%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card border border-border/50 p-6"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Identities</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={identityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {identityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(140,15%,8%)', border: '1px solid hsl(140,10%,16%)', borderRadius: '8px', color: 'hsl(60,20%,95%)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {identityData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border/50 p-6"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <XAxis dataKey="name" stroke="hsl(60,10%,55%)" fontSize={12} />
              <YAxis stroke="hsl(60,10%,55%)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(140,15%,8%)', border: '1px solid hsl(140,10%,16%)', borderRadius: '8px', color: 'hsl(60,20%,95%)' }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(42,80%,55%)" strokeWidth={2} dot={{ fill: 'hsl(42,80%,55%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
