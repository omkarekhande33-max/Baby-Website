import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Sparkles, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';

const MILESTONES = [
  {
    inch: 12,
    age: "3 Months",
    title: "First Sweet Giggle",
    icon: "🧸",
    description: "Pip smiled and let out his very first gentle chime giggle.",
    unlocked: true
  },
  {
    inch: 18,
    age: "6 Months",
    title: "Star Catcher",
    icon: "⭐",
    description: "Reached out little paws to catch twinkling bedroom nightlight beams.",
    unlocked: true
  },
  {
    inch: 24,
    age: "9 Months",
    title: "Master Block Stacker",
    icon: "🪵",
    description: "Built a 3-block high wooden tower all by himself!",
    unlocked: true
  },
  {
    inch: 30,
    age: "12 Months",
    title: "Lullaby Dream Engineer",
    icon: "🎵",
    description: "Turned the brass winding key and filled the bedroom with music.",
    unlocked: false
  },
  {
    inch: 36,
    age: "18 Months",
    title: "Celestial Explorer",
    icon: "🌙",
    description: "Ready to guide little dreamers across the midnight sky.",
    unlocked: false
  }
];

export default function GrowthChart({ className = '' }) {
  const [currentHeight, setCurrentHeight] = useState(24);
  const [milestones, setMilestones] = useState(MILESTONES);
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

  // Play celebratory xylophone fanfare
  const playFanfare = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  };

  const handleUnlock = (inch) => {
    playFanfare();
    setMilestones((prev) =>
      prev.map((m) => (m.inch === inch ? { ...m, unlocked: true } : m))
    );
    setCurrentHeight(inch);
  };

  return (
    <div className={`relative bg-gradient-to-b from-[#fff8f1] to-[#f7ebd9] rounded-3xl p-6 md:p-8 shadow-tactile-lg border-4 border-[#e2a76f]/40 font-fredoka overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#e2a76f]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d49b42] to-[#b8860b] flex items-center justify-center text-white shadow-md">
            <Award className="w-6 h-6 animate-wobble-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#5c4033]">Pip's Nursery Growth Chart</h3>
            <p className="text-sm text-[#a34063] font-medium">Vintage wooden wall ruler & unlocked bedtime skills</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-[#d49b42]/30 shadow-sm">
          <Star className="w-4 h-4 fill-[#f4d06f] text-[#d49b42]" />
          <span className="text-sm font-bold text-[#5c4033]">{currentHeight} Inches</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Vintage Wooden Wall Ruler */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-28 h-[380px] bg-gradient-to-r from-[#d8a876] via-[#e8be93] to-[#c4925e] rounded-2xl border-4 border-[#5c4033] shadow-wood-bevel p-2 flex flex-col justify-between items-center select-none">
            {/* Top Hanging Brass Loop */}
            <div className="absolute -top-4 w-8 h-8 rounded-full border-4 border-[#d49b42] bg-[#5c4033]" />

            {/* Height Ruler Markings */}
            {[36, 30, 24, 18, 12].map((inch) => (
              <div
                key={inch}
                onClick={() => setCurrentHeight(inch)}
                className="w-full flex items-center justify-between px-1 cursor-pointer group"
              >
                <div className="flex items-center gap-1">
                  <div className={`h-0.5 ${inch % 12 === 0 ? 'w-5 bg-[#5c4033]' : 'w-3 bg-[#5c4033]/60'}`} />
                  <span className="text-xs font-bold text-[#5c4033]">{inch}"</span>
                </div>
                {milestones.find((m) => m.inch === inch)?.unlocked && (
                  <span className="text-xs">⭐</span>
                )}
              </div>
            ))}

            {/* Sliding Pip Cloud Marker */}
            <motion.div
              animate={{
                top: `${((36 - currentHeight) / 24) * 75 + 10}%`
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute left-[-22px] w-14 h-10 bg-white rounded-full shadow-lg border-2 border-[#d49b42] flex items-center justify-center text-xl cursor-grab"
              title="Pip's Current Height"
            >
              ☁️
            </motion.div>
          </div>
        </div>

        {/* Right Side: Milestone Achievements List */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {milestones.map((m) => (
            <div
              key={m.inch}
              onClick={() => handleUnlock(m.inch)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                m.unlocked
                  ? 'bg-white/90 border-[#d49b42]/60 shadow-sm'
                  : 'bg-white/40 border-dashed border-[#5c4033]/20 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-[#fff8f1] rounded-xl border border-[#e2a76f]/40 shadow-inner">
                  {m.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-[#5c4033]">{m.title}</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2a76f]/30 text-[#5c4033]">
                      {m.inch}" ({m.age})
                    </span>
                  </div>
                  <p className="text-xs text-[#5c4033]/80 mt-0.5">{m.description}</p>
                </div>
              </div>

              <div>
                {m.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlock(m.inch);
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-[#d49b42] to-[#b8860b] text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Unlock!
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
