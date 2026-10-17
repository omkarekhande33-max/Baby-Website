import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, RotateCw, Sparkles, Volume2, Star } from 'lucide-react';

// Melodies encoded as [note, duration (ms), rest (ms)]
const MELODIES = {
  twinkle: {
    title: 'Twinkle Twinkle Little Star',
    notes: [
      { pitch: 'C5', time: 400 }, { pitch: 'C5', time: 400 },
      { pitch: 'G5', time: 400 }, { pitch: 'G5', time: 400 },
      { pitch: 'A5', time: 400 }, { pitch: 'A5', time: 400 },
      { pitch: 'G5', time: 800 },
      { pitch: 'F5', time: 400 }, { pitch: 'F5', time: 400 },
      { pitch: 'E5', time: 400 }, { pitch: 'E5', time: 400 },
      { pitch: 'D5', time: 400 }, { pitch: 'D5', time: 400 },
      { pitch: 'C5', time: 800 }
    ]
  },
  brahms: {
    title: "Brahms' Lullaby",
    notes: [
      { pitch: 'E5', time: 350 }, { pitch: 'E5', time: 350 }, { pitch: 'G5', time: 700 },
      { pitch: 'E5', time: 350 }, { pitch: 'E5', time: 350 }, { pitch: 'G5', time: 700 },
      { pitch: 'E5', time: 350 }, { pitch: 'G5', time: 350 }, { pitch: 'C6', time: 700 },
      { pitch: 'B5', time: 350 }, { pitch: 'A5', time: 350 }, { pitch: 'A5', time: 350 }, { pitch: 'G5', time: 700 }
    ]
  },
  clair: {
    title: 'Clair de Lune (Bedtime Glow)',
    notes: [
      { pitch: 'F5', time: 450 }, { pitch: 'E5', time: 450 }, { pitch: 'F5', time: 450 },
      { pitch: 'A5', time: 600 }, { pitch: 'C6', time: 800 },
      { pitch: 'B5', time: 450 }, { pitch: 'A5', time: 450 }, { pitch: 'G5', time: 900 }
    ]
  }
};

const FREQUENCIES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51
};

const TINES = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

export default function MusicBox({ onStarGather = () => {}, className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tension, setTension] = useState(65); // Spring tension 0 - 100%
  const [currentMelody, setCurrentMelody] = useState('twinkle');
  const [currentNoteIdx, setCurrentNoteIdx] = useState(null);
  const [keyAngle, setKeyAngle] = useState(0);
  const [starlightSparkles, setStarlightSparkles] = useState([]);
  const [starsCollected, setStarsCollected] = useState(0);
  
  const audioCtxRef = useRef(null);
  const playTimerRef = useRef(null);

  // Initialize Web Audio Context safely
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Pure Web Audio API: Realistic Music Box Tine Synthesizer
  const playTineSound = (pitch) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const freq = FREQUENCIES[pitch] || 523.25;
    const now = ctx.currentTime;

    // Master tine gain node
    const tineGain = ctx.createGain();
    tineGain.gain.setValueAtTime(0.35, now);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Fundamental tine tone (sine)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Metallic overtone (triangle) simulating the steel comb resonance
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // Inharmonic metallic ratio

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    // Mechanical tine "plink" noise transient
    const bufferSize = ctx.sampleRate * 0.02;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3200;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc1.connect(tineGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(tineGain);
    tineGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    noise.start(now);

    osc1.stop(now + 1.9);
    osc2.stop(now + 0.5);

    // Sparkle visual FX
    triggerSparkle(pitch);
  };

  // Sound effect for mechanical ratchet winding
  const playRatchetClick = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  };

  const triggerSparkle = (pitch) => {
    const id = Date.now() + Math.random();
    const newSparkle = {
      id,
      x: 35 + Math.random() * 30,
      y: 45 + Math.random() * 20,
      note: pitch
    };
    setStarlightSparkles((prev) => [...prev.slice(-8), newSparkle]);
    setTimeout(() => {
      setStarlightSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 1800);
  };

  // Winding the music box key
  const handleWindKey = () => {
    playRatchetClick();
    setKeyAngle((prev) => prev + 90);
    setTension((prev) => {
      const next = Math.min(100, prev + 15);
      return next;
    });
  };

  // Playback engine
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      setCurrentNoteIdx(null);
      return;
    }

    if (tension <= 0) {
      setIsPlaying(false);
      return;
    }

    const melody = MELODIES[currentMelody].notes;
    let index = currentNoteIdx === null ? 0 : (currentNoteIdx + 1) % melody.length;

    const playNextNote = () => {
      if (tension <= 0) {
        setIsPlaying(false);
        return;
      }

      const note = melody[index];
      playTineSound(note.pitch);
      setCurrentNoteIdx(index);

      // Deplete tension slightly as it plays
      setTension((prev) => {
        const next = Math.max(0, prev - 1.8);
        if (next === 0) setIsPlaying(false);
        return next;
      });

      // Award starlight every few notes
      if (index % 4 === 0) {
        setStarsCollected((prev) => {
          const next = prev + 1;
          onStarGather(next);
          return next;
        });
      }

      index = (index + 1) % melody.length;
      playTimerRef.current = setTimeout(playNextNote, note.time);
    };

    playTimerRef.current = setTimeout(playNextNote, 200);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentMelody]);

  return (
    <div className={`relative bg-gradient-to-b from-hax-cream to-[#f7ebd9] rounded-3xl p-6 md:p-8 shadow-tactile-lg border-4 border-hax-honey/40 overflow-hidden font-fredoka ${className}`}>
      {/* Background Starlight Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {starlightSparkles.map((spark) => (
          <motion.div
            key={spark.id}
            initial={{ opacity: 0, scale: 0.4, y: 0 }}
            animate={{ opacity: 1, scale: 1.3, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
            className="absolute flex items-center gap-1 text-hax-brass pointer-events-none drop-shadow-md"
          >
            <Sparkles className="w-5 h-5 text-hax-brassGlow animate-spin-slow" />
            <span className="text-xs font-bold text-hax-berry bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">
              {spark.note}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Header with Title and Starlight Counter */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-hax-honey/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hax-berry to-hax-berryDark flex items-center justify-center text-white shadow-berry-glow">
            <Music className="w-6 h-6 animate-wobble-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-hax-wood">Pip's Antique Music Box</h3>
            <p className="text-sm text-hax-berry font-medium">Turn the brass key & gather sweet lullaby dreams</p>
          </div>
        </div>

        {/* Starlight Counter Badge */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-hax-honey/40 shadow-sm">
          <Star className="w-5 h-5 fill-hax-brassGlow text-hax-brass animate-sparkle" />
          <span className="font-bold text-hax-wood">{starsCollected}</span>
          <span className="text-xs text-hax-berry font-semibold uppercase tracking-wider">Starlight</span>
        </div>
      </div>

      {/* Main Music Box Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: 3D Walnut & Brass Music Box Enclosure */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-b from-[#7a4e32] via-[#5c3a25] to-[#42291a] rounded-3xl p-5 shadow-2xl border-4 border-[#b8860b] flex flex-col items-center justify-between">
            {/* Brass Corner Filigree Accents */}
            <div className="absolute top-2 left-2 w-7 h-7 border-t-4 border-l-4 border-hax-brass rounded-tl-xl" />
            <div className="absolute top-2 right-2 w-7 h-7 border-t-4 border-r-4 border-hax-brass rounded-tr-xl" />
            <div className="absolute bottom-2 left-2 w-7 h-7 border-b-4 border-l-4 border-hax-brass rounded-bl-xl" />
            <div className="absolute bottom-2 right-2 w-7 h-7 border-b-4 border-r-4 border-hax-brass rounded-br-xl" />

            {/* Glass Viewing Dome */}
            <div className="relative w-full h-44 bg-gradient-to-b from-white/20 via-transparent to-black/30 rounded-2xl border-2 border-white/30 backdrop-blur-[2px] overflow-hidden flex items-center justify-center shadow-inner">
              {/* Rotating Mirror Pedestal */}
              <div className="absolute bottom-3 w-32 h-6 bg-gradient-to-r from-[#d4af37] via-[#fff3b0] to-[#aa820a] rounded-full shadow-lg border border-amber-200/60" />

              {/* Pip Figurine (Pirouetting Miniature Bear with Nightcap) */}
              <motion.div
                animate={{
                  rotateY: isPlaying ? [0, 360] : 0,
                  y: isPlaying ? [0, -4, 0] : 0
                }}
                transition={{
                  rotateY: { repeat: Infinity, duration: 6, ease: 'linear' },
                  y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                }}
                className="relative z-10 flex flex-col items-center cursor-pointer select-none"
                onClick={() => playTineSound('C6')}
                title="Click miniature Pip to make him chime!"
              >
                {/* Nightcap */}
                <div className="w-10 h-7 bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 rounded-t-full rotate-[-12deg] relative shadow-sm border border-white/40">
                  <div className="absolute -top-1.5 -right-1 w-3 h-3 bg-white rounded-full shadow" />
                </div>
                {/* Bear Head */}
                <div className="w-12 h-10 bg-gradient-to-b from-[#ffd39b] to-[#e0a86c] rounded-full -mt-2 shadow-md relative flex items-center justify-center border border-[#8a5d3b]/40">
                  {/* Eyes */}
                  <div className="flex gap-4">
                    <span className="w-1.5 h-2 bg-hax-wood rounded-full" />
                    <span className="w-1.5 h-2 bg-hax-wood rounded-full" />
                  </div>
                  {/* Nose */}
                  <div className="absolute bottom-2 w-2 h-1.5 bg-[#42291a] rounded-full" />
                  {/* Rosy Cheeks */}
                  <div className="absolute left-1 bottom-2 w-2 h-1 bg-pink-400/60 rounded-full blur-[0.5px]" />
                  <div className="absolute right-1 bottom-2 w-2 h-1 bg-pink-400/60 rounded-full blur-[0.5px]" />
                </div>
                {/* Bear Body */}
                <div className="w-14 h-11 bg-[#d89f66] rounded-t-2xl shadow-sm -mt-1 border border-[#8a5d3b]/30" />
              </motion.div>

              {/* Clockwork Brass Cogs in background */}
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute top-3 left-6 text-hax-brass/40 pointer-events-none"
              >
                <RotateCw className="w-12 h-12" />
              </motion.div>
              <motion.div
                animate={{ rotate: isPlaying ? -360 : 0 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="absolute top-6 right-8 text-hax-brass/30 pointer-events-none"
              >
                <RotateCw className="w-10 h-10" />
              </motion.div>
            </div>

            {/* Interactive Music Box Comb / Tines */}
            <div className="w-full mt-3 bg-[#382315] p-2.5 rounded-xl border border-hax-brass/30 shadow-inner flex items-center justify-between gap-1">
              {TINES.map((pitch, idx) => (
                <button
                  key={pitch}
                  onClick={() => playTineSound(pitch)}
                  className={`flex-1 h-14 rounded-lg flex flex-col items-center justify-end pb-1 font-bold text-[10px] transition-all transform active:scale-95 ${
                    currentNoteIdx !== null && MELODIES[currentMelody].notes[currentNoteIdx]?.pitch === pitch
                      ? 'bg-gradient-to-t from-hax-brass to-amber-200 text-hax-wood shadow-brass-glow translate-y-1'
                      : 'bg-gradient-to-t from-[#aa820a] to-[#d4af37] text-white/90 hover:brightness-110 shadow-sm'
                  }`}
                  title={`Tap tine ${pitch}`}
                >
                  <span className="w-1 h-6 bg-white/30 rounded-full mb-1" />
                  {pitch}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Brass Winding Key Control */}
          <div className="flex items-center gap-6 mt-5 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-2xl border border-hax-honey/30 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWindKey}
              style={{ rotate: keyAngle }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffd54f] to-[#ffb300] border-2 border-[#b8860b] flex items-center justify-center text-[#5c4033] shadow-md hover:shadow-brass-glow transition-shadow"
              title="Click or tap to wind the spring key!"
            >
              <RotateCw className="w-8 h-8" />
            </motion.button>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-hax-wood mb-1">
                <span>Clockwork Spring Tension</span>
                <span className={tension < 20 ? 'text-rose-600 font-extrabold' : 'text-hax-berry'}>
                  {Math.round(tension)}%
                </span>
              </div>
              <div className="w-48 h-3.5 bg-hax-honey/20 rounded-full overflow-hidden p-0.5 border border-hax-honey/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-hax-brass to-hax-berry"
                  animate={{ width: `${tension}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>
              <p className="text-[11px] text-hax-wood/70 mt-1">
                {tension === 0 ? 'Spring ran down! Wind key to recharge.' : 'Wind key to store soothing dream music.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Melody Selector & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-hax-honey/30 shadow-tactile">
            <h4 className="text-sm uppercase tracking-wider text-hax-berry font-extrabold mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-hax-berry" /> Select Bedtime Melody
            </h4>
            
            <div className="flex flex-col gap-2">
              {Object.entries(MELODIES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentMelody(key);
                    if (isPlaying) {
                      setIsPlaying(false);
                      setTimeout(() => setIsPlaying(true), 100);
                    }
                  }}
                  className={`text-left p-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                    currentMelody === key
                      ? 'bg-hax-berry text-white shadow-berry-glow'
                      : 'bg-hax-cream text-hax-wood hover:bg-hax-honey/20'
                  }`}
                >
                  <span>{data.title}</span>
                  {currentMelody === key && <Sparkles className="w-4 h-4 text-amber-200" />}
                </button>
              ))}
            </div>
          </div>

          {/* Master Play / Pause Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (tension <= 0) {
                handleWindKey();
              }
              setIsPlaying(!isPlaying);
            }}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-tactile-lg transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                : 'bg-gradient-to-r from-hax-berry to-hax-berryDark text-white hover:shadow-berry-glow'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-current" /> Pause Lullaby
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" /> Play Music Box
              </>
            )}
          </motion.button>

          {/* Sensory Tip Box */}
          <div className="bg-hax-peach/40 border border-hax-honey/30 rounded-2xl p-4 text-xs text-hax-wood">
            <span className="font-bold text-hax-berry">💡 Sensory Play Tip:</span> Tap the brass tines above to let baby pluck their own chime notes, or let the music box play automatically to soothe bedtime wind-down.
          </div>
        </div>
      </div>
    </div>
  );
}
