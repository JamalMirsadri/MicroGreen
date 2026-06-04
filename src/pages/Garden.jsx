import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GardenPlant from '../components/garden/GardenPlant';
import XPBar from '../components/garden/XPBar';
import GlowButton from '../components/shared/GlowButton';
import { getLevel, DAILY_CHALLENGES } from '../lib/gameData';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { getQuizResult } from '@/lib/quizAccount';

/** Returns today's date as YYYY-MM-DD in local time */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Extract IDs of challenges already completed today from persisted data */
function getTodayCompleted(garden) {
  const today = todayKey();
  return (garden?.daily_completions ?? [])
    .filter((c) => c.date === today)
    .map((c) => c.id);
}

export default function Garden() {
  const { user } = useAuth();
  const [gardenData, setGardenData] = useState(null);
  const [completedToday, setCompletedToday] = useState([]);

  const result = getQuizResult();
  const xp = gardenData?.xp ?? 0;
  const level = getLevel(xp);

  useEffect(() => {
    api.garden.get().then((g) => {
      setGardenData(g);
      sessionStorage.setItem('gardenXP', String(g.xp));
      // Restore which challenges the user already finished today
      setCompletedToday(getTodayCompleted(g));
    }).catch(() => setGardenData({
      xp: 0, streak_days: 0, badges: [], completed_challenges: [],
      daily_completions: [], plants_grown: 0, total_orders: 0,
    }));
  }, [user?.id]);

  const persistGarden = async (next) => {
    setGardenData(next);
    sessionStorage.setItem('gardenXP', String(next.xp));
    await api.garden.update(next);
  };

  const handleCompleteChallenge = (challenge) => {
    if (!gardenData || completedToday.includes(challenge.id)) return;

    const today = todayKey();
    const newCompletions = [
      ...(gardenData.daily_completions ?? []),
      { id: challenge.id, date: today },
    ];

    setCompletedToday((prev) => [...prev, challenge.id]);
    persistGarden({
      ...gardenData,
      xp: gardenData.xp + challenge.xp,
      completed_challenges: [...(gardenData.completed_challenges ?? []), challenge.id],
      daily_completions: newCompletions,
    });
  };

  if (!gardenData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden bg-[#030a06]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(45,140,60,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(30,90,120,0.08), transparent 50%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">
            {result?.identity?.name ? `${result.identity.name}'s Garden` : `${user?.full_name || 'Your'}'s Garden`}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            My <span className="text-primary italic">Inner Garden</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 3D plant & XP */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-card/40 backdrop-blur-md border border-primary/15 p-6 lg:p-8 shadow-[0_0_80px_rgba(34,197,94,0.08)]"
          >
            <GardenPlant xp={xp} />
            <div className="mt-8">
              <XPBar xp={gardenData.xp} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Streak', value: `${gardenData.streak_days}🔥` },
                { label: 'Badges', value: gardenData.badges.length },
                { label: 'Plants', value: gardenData.plants_grown },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-secondary/50 border border-border/30">
                  <div className="font-display text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="font-body text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-card/50 backdrop-blur-md border border-border/40 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground">Daily Challenges</h2>
              <div className="text-right">
                <p className="font-body text-xs text-primary font-semibold">
                  {completedToday.length}/{DAILY_CHALLENGES.length} done
                </p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">resets at midnight</p>
              </div>
            </div>
            <div className="space-y-3">
              {DAILY_CHALLENGES.map((challenge) => {
                const done = completedToday.includes(challenge.id);
                return (
                  <motion.button
                    key={challenge.id}
                    whileHover={{ scale: done ? 1 : 1.01 }}
                    whileTap={{ scale: done ? 1 : 0.98 }}
                    onClick={() => handleCompleteChallenge(challenge)}
                    disabled={done}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      done
                        ? 'bg-primary/10 border-primary/30 opacity-70'
                        : 'bg-secondary/30 border-border/30 hover:border-primary/30'
                    }`}
                  >
                    <span className="text-2xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <p className={`font-body text-sm font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {challenge.title}
                      </p>
                      <p className="font-body text-xs text-primary">+{challenge.xp} XP</p>
                    </div>
                    {done && <span className="text-primary text-lg">✓</span>}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link to="/rewards">
                <GlowButton variant="ghost" size="sm">View All Rewards →</GlowButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}