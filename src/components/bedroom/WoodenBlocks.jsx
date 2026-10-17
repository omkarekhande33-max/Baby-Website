import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Volume2, Layers } from 'lucide-react';

const INITIAL_BLOCKS = [
  { id: 1, letter: 'P', color: 'from-[#d49b42] to-[#b8860b]', textColor: 'text-amber-100', icon: '★', x: 0, y: 0, rotate: 0 },
  { id: 2, letter: 'I', color: 'from-[#a34063] to-[#7e2d49]', textColor: 'text-pink-100', icon: '🌙', x: 0, y: 0, rotate: 0 },
  { id: 3, letter: 'P', color: 'from-[#5c4033] to-[#3d2a21]', textColor: 'text-amber-200', icon: '🧸', x: 0, y: 0, rotate: 0 },
  { id: 4, letter: '1', color: 'from-[#6b8e23] to-[#4c6618]', textColor: 'text-emerald-100', icon: '🌟', x: 0, y: 0, rotate: 0 },
  { id: 5, letter: '2', color: 'from-[#4682b4] to-[#2f5777]', textColor: 'text-sky-100', icon: '☁️', x: 0, y: 0, rotate: 0 },
  { id: 6, letter: '3', color: 'from-[#cd853f] to-[#8b5a2b]', textColor: 'text-amber-100', icon: '✨', x: 0, y: 0, rotate: 0 }
];

export default function WoodenBlocks({ onStackMilestone = () => {}, className = '' }) {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [tumbled, setTumbled] = useState(false);
  const [rattleWobble, setRattleWobble] = useState(0);
  const [activeStackCount, setActiveStackCount] = useState(0);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Pure Web Audio: Synthesize authentic tactile wooden clack sound
  const playWoodClack = (pitchMultiplier = 1) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime((320 + Math.random() * 80) * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.value = 850 * pitchMultiplier;
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  };

  // Synthesize soft baby rattle beads shaking sound
  const playRattleSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const burstTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, burstTime);
      gain.gain.setValueAtTime(0.12, burstTime);
      gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(burstTime);
      osc.stop(burstTime + 0.04);
    }
  };

  // Tap block to bounce and clack
  const handleBlockClick = (id) => {
    playWoodClack(1 + (id % 4) * 0.2);
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              y: b.y - 35,
              rotate: (Math.random() - 0.5) * 20
            }
          : b
      )
    );
    setTimeout(() => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, y: 0, rotate: 0 } : b))
      );
    }, 350);
  };

  // Tumble all blocks
  const handleTumble = () => {
    playWoodClack(0.8);
    setTimeout(() => playWoodClack(1.2), 60);
    setTimeout(() => playWoodClack(0.9), 120);

    setTumbled(true);
    setBlocks((prev) =>
      prev.map((b) => ({
        ...b,
        x: (Math.random() - 0.5) * 140,
        y: Math.random() * 40,
        rotate: (Math.random() - 0.5) * 60
      }))
    );
  };

  // Stack neatly
  const handleResetStack = () => {
    playWoodClack(1.4);
    setTumbled(false);
    setBlocks(INITIAL_BLOCKS);
    setActiveStackCount((prev) => {
      const next = prev + 1;
      onStackMilestone(next);
      return next;
    });
  };

  // Shake rattle
  const handleRattleClick = () => {
    playRattleSound();
    setRattleWobble((prev) => prev + 1);
  };

  return (
    <div className={`relative bg-gradient-to-b from-[#fff8f1] to-[#f7ebd9] rounded-3xl p-6 md:p-8 shadow-tactile-lg border-4 border-[#e2a76f]/40 font-fredoka overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#e2a76f]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5c4033] to-[#3d2a21] flex items-center justify-center text-amber-200 shadow-md">
            <Layers className="w-6 h-6 animate-wobble-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#5c4033]">Tactile Wooden Blocks & Rattle</h3>
            <p className="text-sm text-[#a34063] font-medium">Bouncy physics blocks & soft wooden clatter sounds</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTumble}
            className="px-4 py-2 bg-[#a34063] text-white rounded-xl font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all"
            title="Tumble all blocks!"
          >
            Tumble! 💥
          </button>
          <button
            onClick={handleResetStack}
            className="px-4 py-2 bg-[#5c4033] text-amber-100 rounded-xl font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
            title="Stack blocks neatly"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Stack
          </button>
        </div>
      </div>

      {/* Play Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Blocks Play Carpet */}
        <div className="md:col-span-8 bg-[#fff3e0]/60 rounded-3xl p-8 border-2 border-dashed border-[#e2a76f]/60 min-h-[280px] flex flex-wrap items-center justify-center gap-4 relative shadow-inner">
          <div className="absolute top-3 left-4 text-xs font-bold text-[#5c4033]/60 uppercase tracking-wider">
            Nursery Play Rug
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            {blocks.map((block) => (
              <motion.button
                key={block.id}
                onClick={() => handleBlockClick(block.id)}
                animate={{
                  x: block.x,
                  y: block.y,
                  rotate: block.rotate
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${block.color} shadow-wood-bevel border-2 border-white/40 flex flex-col items-center justify-between p-2 cursor-pointer select-none relative group transition-shadow`}
                title={`Block ${block.letter} - Click to bounce!`}
              >
                {/* Wood Grain subtle accent */}
                <span className="text-xs text-white/40 self-end font-bold">{block.icon}</span>
                <span className={`text-3xl md:text-4xl font-extrabold ${block.textColor} drop-shadow-md`}>
                  {block.letter}
                </span>
                <div className="w-full h-1 bg-black/20 rounded-full" />
              </motion.button>
            ))}
          </div>

          <p className="absolute bottom-2 text-center text-xs text-[#5c4033]/70 font-medium">
            Tap any wooden block to knock & bounce with authentic clacking sounds!
          </p>
        </div>

        {/* Right Side: Interactive Baby Rattle */}
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm p-6 rounded-3xl border border-[#e2a76f]/40 shadow-sm text-center">
          <h4 className="text-sm font-bold text-[#5c4033] uppercase tracking-wider mb-2">
            Baby's Bedtime Rattle
          </h4>
          <p className="text-xs text-[#a34063] mb-4">Click to shake & soothe</p>

          <motion.div
            key={rattleWobble}
            animate={{
              rotate: [0, -18, 18, -12, 12, 0],
              scale: [1, 1.06, 1]
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onClick={handleRattleClick}
            className="w-28 h-44 cursor-pointer select-none flex flex-col items-center justify-center group"
            title="Click or shake the rattle!"
          >
            {/* Rattle Head */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffd1dc] via-[#ffe5b4] to-[#f4d06f] border-4 border-[#e2a76f] shadow-lg flex items-center justify-center relative group-hover:shadow-brass-glow transition-shadow">
              <span className="text-2xl animate-spin-slow">🌟</span>
              <div className="absolute top-2 left-3 w-4 h-2 bg-white/60 rounded-full rotate-[-30deg]" />
            </div>
            {/* Rattle Handle */}
            <div className="w-4 h-16 bg-gradient-to-b from-[#e2a76f] to-[#5c4033] rounded-b-full shadow-md -mt-1 flex flex-col items-center justify-end pb-2">
              <div className="w-6 h-6 rounded-full bg-[#f4d06f] border-2 border-[#5c4033] shadow-inner" />
            </div>
          </motion.div>

          <button
            onClick={handleRattleClick}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#e2a76f] to-[#d49b42] text-[#5c4033] font-bold text-xs rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            Shake Rattle 🪇
          </button>
        </div>
      </div>
    </div>
  );
}
