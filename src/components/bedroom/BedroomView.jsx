import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Music, BookOpen, Layers, Award, Star, CloudRain, Wind } from 'lucide-react';
import MusicBox from './MusicBox';
import WoodenBlocks from './WoodenBlocks';
import Storybook from './Storybook';
import GrowthChart from './GrowthChart';

export default function BedroomView() {
  const [activeTab, setActiveTab] = useState('musicbox');
  const [totalStars, setTotalStars] = useState(12);
  const [lightWarmth, setLightWarmth] = useState(65); // 0 (Cool Midnight) to 100 (Warm Amber)
  const [ambientSound, setAmbientSound] = useState('off'); // 'off', 'rain', 'wind'
  const audioCtxRef = useRef(null);
  const ambientNodeRef = useRef(null);

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

  // Web Audio Ambient White Noise Soundscape
  const toggleAmbientSound = (type) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ambientNodeRef.current) {
      ambientNodeRef.current.stop();
      ambientNodeRef.current.disconnect();
      ambientNodeRef.current = null;
    }

    if (ambientSound === type || type === 'off') {
      setAmbientSound('off');
      return;
    }

    setAmbientSound(type);

    // Pink / Brown noise generator
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'rain' ? 800 : 400;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    ambientNodeRef.current = noise;
  };

  const handleStarGather = (count) => {
    setTotalStars((prev) => prev + 1);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8 transition-colors duration-700 font-fredoka"
      style={{
        backgroundColor: lightWarmth > 50 ? '#fff8f1' : '#1f1b2c',
        color: lightWarmth > 50 ? '#5c4033' : '#f7ebd9'
      }}
    >
      {/* Top Cozy Nursery Bar */}
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-[#e2a76f]/30 shadow-tactile mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧸</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[#5c4033]">
              Pip's Cozy Bedroom & Music Box
            </h1>
            <p className="text-xs text-[#a34063] font-semibold">
              Track 1, Concept B • Sensory Bedtime Playground
            </p>
          </div>
        </div>

        {/* Nursery Atmosphere Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Nightlight Warmth Slider */}
          <div className="flex items-center gap-2 bg-[#fff8f1] px-3 py-1.5 rounded-2xl border border-[#e2a76f]/40 shadow-inner">
            <Moon className="w-4 h-4 text-indigo-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={lightWarmth}
              onChange={(e) => setLightWarmth(Number(e.target.value))}
              className="w-20 accent-[#d49b42] cursor-pointer"
              title="Adjust Nightlight Warmth"
            />
            <Sun className="w-4 h-4 text-amber-500" />
          </div>

          {/* Ambient Bedtime Noise Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleAmbientSound('rain')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                ambientSound === 'rain'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-[#fff8f1] text-[#5c4033] hover:bg-blue-100'
              }`}
              title="Soothing Window Rain"
            >
              <CloudRain className="w-4 h-4" /> Rain
            </button>
            <button
              onClick={() => toggleAmbientSound('wind')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                ambientSound === 'wind'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-[#fff8f1] text-[#5c4033] hover:bg-indigo-100'
              }`}
              title="Gentle Night Breeze"
            >
              <Wind className="w-4 h-4" /> Breeze
            </button>
          </div>

          {/* Starlight Jar Inventory */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#d49b42] to-[#b8860b] text-white px-4 py-1.5 rounded-full shadow-md">
            <Star className="w-4 h-4 fill-amber-200 text-amber-100 animate-sparkle" />
            <span className="font-extrabold text-sm">{totalStars}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Stars in Jar</span>
          </div>
        </div>
      </header>

      {/* Main Nursery Toy Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('musicbox')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'musicbox'
              ? 'bg-[#a34063] text-white shadow-berry-glow scale-105'
              : 'bg-white/80 text-[#5c4033] hover:bg-white shadow-sm'
          }`}
        >
          <Music className="w-4 h-4" /> Antique Music Box
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'blocks'
              ? 'bg-[#5c4033] text-amber-100 shadow-tactile scale-105'
              : 'bg-white/80 text-[#5c4033] hover:bg-white shadow-sm'
          }`}
        >
          <Layers className="w-4 h-4" /> Wooden Blocks & Rattle
        </button>

        <button
          onClick={() => setActiveTab('storybook')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'storybook'
              ? 'bg-[#d49b42] text-white shadow-brass-glow scale-105'
              : 'bg-white/80 text-[#5c4033] hover:bg-white shadow-sm'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Bedtime Storybook
        </button>

        <button
          onClick={() => setActiveTab('growth')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'growth'
              ? 'bg-[#7e2d49] text-white shadow-berry-glow scale-105'
              : 'bg-white/80 text-[#5c4033] hover:bg-white shadow-sm'
          }`}
        >
          <Award className="w-4 h-4" /> Pip's Growth Chart
        </button>
      </div>

      {/* Active Component Stage */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'musicbox' && <MusicBox onStarGather={handleStarGather} />}
        {activeTab === 'blocks' && <WoodenBlocks onStackMilestone={handleStarGather} />}
        {activeTab === 'storybook' && <Storybook onStoryComplete={() => handleStarGather(5)} />}
        {activeTab === 'growth' && <GrowthChart />}
      </main>
    </div>
  );
}
