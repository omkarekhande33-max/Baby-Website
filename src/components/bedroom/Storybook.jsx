import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Star, Moon, Heart } from 'lucide-react';

const STORY_PAGES = [
  {
    title: "1. Dusk in the Cozy Bedroom",
    image: "assets/pip_cozy_bedroom.jpg",
    text: "As dusk settled softly over the rooftops, Pip the little bear stretched his paws, yawned a sleepy yawn, and pulled on his striped blue nightcap. Outside his arched nursery window, the first stars began to whisper.",
    interactiveHint: "Tap Pip's nightcap to hear a gentle bedtime chime! 🌟",
    tag: "Waking at Twilight"
  },
  {
    title: "2. The Moonlit Rooftops",
    image: "assets/bedroom.jpg",
    text: "Pip climbed aboard his fluffy cloud pillow with his warm brass lantern. Together, they floated high above the quiet chimneys, watching sleepy chimney smoke spiral into the deep indigo night sky.",
    interactiveHint: "Tap the cloud pillow to give Pip a gentle breeze! ☁️",
    tag: "Floating Across Houses"
  },
  {
    title: "3. Gathering Starlight",
    image: "assets/pip_gathering_stars.jpg",
    text: "High among the constellations, golden starlight drifted down like soft sugar. Pip carefully wound his antique music box, catching the twinkling beams to turn them into peaceful lullabies.",
    interactiveHint: "Tap the falling stars to gather them into the music box! ✨",
    tag: "Starlight Collector"
  },
  {
    title: "4. Sweet Dreams to All",
    image: "assets/whimsical_music_box.jpg",
    text: "With a heart full of starlight, Pip sprinkled the gentle lullaby notes over all the tired woodland creatures—the curled-up baby fox, the sleepy owl, and every resting child. 'Goodnight, world,' Pip whispered, drifting into a cozy dream.",
    interactiveHint: "Tap the heart to send loving sweet dreams! 💖",
    tag: "Peaceful Sleep"
  }
];

export default function Storybook({ onStoryComplete = () => {}, className = '' }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [interactiveCount, setInteractiveCount] = useState(0);
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

  // Pure Web Audio: Synthesize paper page rustle / turn
  const playPageTurnSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.12;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.12);
  };

  // Celestial sparkle chime
  const playSparkleChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const t = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  };

  const handleNextPage = () => {
    if (currentPage < STORY_PAGES.length - 1) {
      playPageTurnSound();
      setCurrentPage((prev) => {
        const next = prev + 1;
        if (next === STORY_PAGES.length - 1) {
          onStoryComplete();
        }
        return next;
      });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      playPageTurnSound();
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleInteractiveTap = () => {
    playSparkleChime();
    setInteractiveCount((prev) => prev + 1);
  };

  const page = STORY_PAGES[currentPage];

  return (
    <div className={`relative bg-gradient-to-b from-[#fff8f1] to-[#f7ebd9] rounded-3xl p-6 md:p-8 shadow-tactile-lg border-4 border-[#a34063]/30 font-fredoka overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#e2a76f]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a34063] to-[#7e2d49] flex items-center justify-center text-white shadow-berry-glow">
            <BookOpen className="w-6 h-6 animate-wobble-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#5c4033]">Pip's Bedtime Storybook</h3>
            <p className="text-sm text-[#a34063] font-medium">Interactive flipbook: "Pip's Starlight Voyage"</p>
          </div>
        </div>

        {/* Page Indicator Badge */}
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-[#a34063]/30 shadow-sm text-xs font-bold text-[#5c4033]">
          <span>Page {currentPage + 1} of {STORY_PAGES.length}</span>
        </div>
      </div>

      {/* Main Storybook Container */}
      <div className="relative max-w-4xl mx-auto bg-[#fffcf7] rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-[#5c4033] flex flex-col md:flex-row gap-8 items-center overflow-hidden">
        {/* Decorative Gold Leaf Corner Filigree */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#d49b42] rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#d49b42] rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#d49b42] rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#d49b42] rounded-br-xl pointer-events-none" />

        {/* Red Silk Ribbon Bookmark */}
        <div className="absolute top-0 right-12 w-6 h-16 bg-gradient-to-b from-[#a34063] to-[#7e2d49] rounded-b-md shadow-md pointer-events-none z-10" />

        {/* Left Side: Story Illustration */}
        <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-tactile border-2 border-[#e2a76f]/50 relative group cursor-pointer" onClick={handleInteractiveTap}>
          <img
            src={page.image}
            alt={page.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
            <span className="text-white text-xs font-bold bg-[#a34063]/80 px-3 py-1 rounded-full backdrop-blur-sm shadow">
              {page.tag}
            </span>
          </div>
        </div>

        {/* Right Side: Story Text & Narrative */}
        <div className="w-full md:w-1/2 flex flex-col justify-between min-h-[260px]">
          <div>
            <h4 className="text-xl font-bold text-[#5c4033] mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d49b42]" /> {page.title}
            </h4>
            <p className="text-base text-[#5c4033]/90 leading-relaxed font-tactile font-medium mb-4">
              {page.text}
            </p>

            {/* Interactive Tap Prompt */}
            <button
              onClick={handleInteractiveTap}
              className="w-full p-3 rounded-2xl bg-[#fff8f1] border-2 border-dashed border-[#a34063]/40 text-xs font-bold text-[#a34063] flex items-center justify-center gap-2 shadow-sm hover:bg-[#ffe5b4]/50 active:scale-95 transition-all text-left"
            >
              <Heart className="w-4 h-4 fill-current text-[#a34063] animate-pulse" />
              <span>{page.interactiveHint}</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e2a76f]/30">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none bg-[#f7ebd9] text-[#5c4033] hover:bg-[#e2a76f]/40 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Dot Pagination */}
            <div className="flex items-center gap-1.5">
              {STORY_PAGES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentPage ? 'bg-[#a34063] w-6' : 'bg-[#e2a76f]/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === STORY_PAGES.length - 1}
              className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none bg-gradient-to-r from-[#a34063] to-[#7e2d49] text-white shadow-berry-glow hover:brightness-110 active:scale-95"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
