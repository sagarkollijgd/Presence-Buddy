
export let audioContext: AudioContext | null = null;

export const initializeAudio = () => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Audio resume failed", e));
    }
  }
};

export const playMeditationBell = () => {
  initializeAudio();
  if (!audioContext) return;

  const ctx = audioContext;
  const t = ctx.currentTime;

  // Master Gain for volume control
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0.4, t); // Master volume

  // Create a complex bell sound using additive synthesis
  // Fundamental + Harmonics (tibetan bowl style often has non-integer harmonics)
  const frequencies = [220, 445, 670, 1150]; // Frequencies in Hz
  const decays = [5.0, 4.5, 3.0, 1.5]; // Decay times in seconds

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    
    // Subtle vibrato/beating
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 0.5 + (Math.random() * 2); // Slow modulation
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.value = 2; // Pitch variance
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibrato.start(t);
    vibrato.stop(t + decays[i]);

    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + decays[i]); // Decay

    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(t);
    osc.stop(t + decays[i]);
  });
};
