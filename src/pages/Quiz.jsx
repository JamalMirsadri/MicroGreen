import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QUIZ_QUESTIONS, resolveIdentity } from '../lib/gameData';
import { setPendingQuiz } from '@/lib/quizAccount';
import QuizCard from '../components/quiz/QuizCard';
import EnergyScale from '../components/quiz/EnergyScale';
import GlowButton from '../components/shared/GlowButton';

const BG_VIDEO = 'https://media.base44.com/videos/public/6a0df0f9dbfc9532afb5c41c/a8c01d165_videomp_.mp4';

const MICROGREEN_HINTS = {
  very_low: { green: 'Sunflower Microgreens', reason: 'Rich in protein & Vitamin E to reignite your spark' },
  low: { green: 'Pea Shoots', reason: 'Gentle iron & folate to steadily lift your energy' },
  moderate: { green: 'Broccoli Microgreens', reason: 'Sulforaphane to maintain your momentum' },
  high: { green: 'Radish Microgreens', reason: 'Spicy compounds to amplify your fire' },
  very_high: { green: 'Basil Microgreens', reason: 'Adaptogens to channel your peak performance' },
};

function QuestionSection({ question, index, total, answers, onAnswer, onFinish, onScrollToNext }) {
  const [selected, setSelected] = useState(answers[question.id] || null);
  const sectionRef = useRef(null);
  const isLast = index === total - 1;
  const isEnergyStep = question.type === 'scale';
  const hint = isEnergyStep && selected ? MICROGREEN_HINTS[selected] : null;

  const handleSelect = useCallback((value) => {
    setSelected(value);
    onAnswer(question.id, value);
    if (!isLast) {
      setTimeout(() => onScrollToNext(index), 500);
    }
  }, [isLast, index, question.id, onAnswer, onScrollToNext]);

  useEffect(() => {
    if (answers[question.id]) setSelected(answers[question.id]);
  }, [answers, question.id]);

  const handleCommit = useCallback(() => {
    if (!selected) return;
    onAnswer(question.id, selected);
    if (isLast) {
      onFinish();
    } else {
      onScrollToNext(index);
    }
  }, [selected, question.id, isLast, onAnswer, onFinish, onScrollToNext, index]);

  const progress = ((index + 1) / total) * 100;

  return (
    <section
      ref={sectionRef}
      data-index={index}
      className="relative flex items-center justify-center"
      style={{ minHeight: '100vh' }}
    >

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl mx-auto px-5 py-10 lg:py-14"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-body text-xs text-white/40">Question {index + 1} of {total}</span>
            <span className="font-body text-xs text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-px bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>

        {/* Question header */}
        <div className="mb-8">
          <p className="font-body text-[10px] uppercase tracking-[0.30em] text-primary/70 mb-3">
            {question.subtitle}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white/90 leading-snug">
            {question.question}
          </h2>
          <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        </div>

        {/* Options */}
        {isEnergyStep ? (
          <>
            <EnergyScale options={question.options} selected={selected} onSelect={handleSelect} />
            <AnimatePresence>
              {hint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-start gap-3"
                >
                  <span className="text-xl">🌱</span>
                  <div>
                    <p className="font-body text-sm font-semibold text-primary">{hint.green}</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{hint.reason}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="space-y-2.5">
            {question.options.map((option, i) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <QuizCard option={option} selected={selected} onSelect={handleSelect} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Action button */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex justify-end"
            >
              <GlowButton onClick={handleCommit} variant="primary" size="md">
                {isLast ? '✨ Reveal My Plant' : 'Next Question ↓'}
              </GlowButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default function Quiz() {
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const sectionRefs = useRef([]);

  // Scroll-driven video: currentTime maps directly to scroll position
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    let rafId = null;
    let targetTime = 0;
    let displayTime = 0;

    video.pause();
    video.currentTime = 0;

    const onScroll = () => {
      if (!video.duration || !isFinite(video.duration)) return;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const progress = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
      targetTime = progress * video.duration;
    };

    const tick = () => {
      // Smooth lerp toward target — no jumps
      displayTime += (targetTime - displayTime) * 0.1;
      if (Math.abs(displayTime - video.currentTime) > 0.02) {
        video.currentTime = displayTime;
      }
      rafId = requestAnimationFrame(tick);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToSection = useCallback((index) => {
    const container = containerRef.current;
    const section = sectionRefs.current[index + 1];
    if (!container || !section) return;
    const top = section.offsetTop;
    container.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleFinish = useCallback(() => {
    setTimeout(() => {
      const identity = resolveIdentity(answers);
      const payload = { ...answers, identity };
      setPendingQuiz(payload);
      navigate('/create-account');
    }, 300);
  }, [answers, navigate]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Scroll-driven background video */}
      <div className="fixed inset-0 top-[64px] pointer-events-none" style={{ zIndex: 0 }}>
        <video
          ref={videoRef}
          src={BG_VIDEO}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.85) saturate(1.2)', willChange: 'contents' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/25" />
      </div>

      {/* Questions — each full viewport height */}
      <div className="relative" style={{ zIndex: 1 }}>
        {QUIZ_QUESTIONS.map((question, index) => (
          <div key={question.id} ref={el => sectionRefs.current[index] = el}>
            <QuestionSection
              question={question}
              index={index}
              total={QUIZ_QUESTIONS.length}
              answers={answers}
              onAnswer={handleAnswer}
              onFinish={handleFinish}
              onScrollToNext={scrollToSection}
            />
          </div>
        ))}
      </div>
    </div>
  );
}