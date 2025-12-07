
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, AppSettings, ViewState } from './types';
import { DEFAULT_QUOTES, DEFAULT_FREQUENCY } from './constants';
import { Settings } from './components/Settings';
import { QuoteList } from './components/QuoteList';
import { Button } from './components/Button';
import { BreathingVisual } from './components/BreathingVisual';
import { initializeAudio, playMeditationBell } from './services/audioService';

// Helper to get random item
const getRandomQuote = (quotes: Quote[]) => quotes[Math.floor(Math.random() * quotes.length)];

export default function App() {
  // State
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('pm_quotes');
    return saved ? JSON.parse(saved) : DEFAULT_QUOTES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pm_settings');
    return saved ? JSON.parse(saved) : {
      frequencyMinutes: DEFAULT_FREQUENCY,
      notificationsEnabled: false,
      soundEnabled: true
    };
  });

  const [view, setView] = useState<ViewState>(ViewState.SETTINGS);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [nextReminderTime, setNextReminderTime] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pm_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('pm_settings', JSON.stringify(settings));
  }, [settings]);

  // Logic to trigger a reminder
  const triggerReminder = useCallback(() => {
    if (quotes.length === 0) return;
    
    const quote = getRandomQuote(quotes);
    setActiveQuote(quote);

    // 1. Play Custom Sound
    if (settings.soundEnabled) {
        playMeditationBell();
    }

    // 2. Trigger Browser Notification (Silent, so our bell handles audio)
    if (settings.notificationsEnabled && Notification.permission === 'granted') {
      // Check visibility. Notification API handles "inactive" tab automatically by popping up.
      // We set silent: true so the OS doesn't play its own ding over our bell.
      try {
        new Notification("Presence Buddy", {
          body: quote.text,
          icon: '/favicon.ico', 
          silent: true,
          requireInteraction: true // Keeps it on screen until user sees it
        });
      } catch (e) {
        console.error("Notification failed", e);
      }
    }

    // Schedule next
    const nextTime = Date.now() + settings.frequencyMinutes * 60 * 1000;
    setNextReminderTime(nextTime);
  }, [quotes, settings]);

  // Timer Management
  const startSession = useCallback(() => {
    if (timerId) clearInterval(timerId);
    
    // Initialize Audio Context (requires user interaction)
    initializeAudio();

    const initialNextTime = Date.now() + settings.frequencyMinutes * 60 * 1000;
    setNextReminderTime(initialNextTime);
    setIsSessionActive(true);
    setActiveQuote(null); // Clear previous

    const id = setInterval(() => {
        triggerReminder();
    }, settings.frequencyMinutes * 60 * 1000);
    
    setTimerId(id);
  }, [settings.frequencyMinutes, timerId, triggerReminder]);

  const stopSession = () => {
    if (timerId) clearInterval(timerId);
    setTimerId(null);
    setIsSessionActive(false);
    setNextReminderTime(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // Countdown for UI (purely visual)
  const [timeLeft, setTimeLeft] = useState<string>('');
  useEffect(() => {
    if (!nextReminderTime || !isSessionActive) return;
    const interval = setInterval(() => {
      const diff = nextReminderTime - Date.now();
      if (diff <= 0) {
        setTimeLeft('Now');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextReminderTime, isSessionActive]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 selection:bg-stone-700 selection:text-white">
      {/* Top Title Header */}
      <header className="fixed top-0 left-0 w-full flex justify-center py-6 z-50 pointer-events-none">
        <h1 className="serif-font text-xl md:text-2xl tracking-[0.2em] text-stone-500 opacity-90 font-semibold uppercase">
          Presence Buddy
        </h1>
      </header>

      {/* Main Content Area */}
      {view === ViewState.QUOTES && (
        <QuoteList 
          quotes={quotes} 
          onUpdateQuotes={setQuotes} 
          onBack={() => setView(ViewState.SETTINGS)} 
        />
      )}

      {view === ViewState.SETTINGS && (
        <Settings 
          settings={settings} 
          onSave={(newSettings) => {
            setSettings(newSettings);
            // We do not auto-restart here to avoid resetting the timer unexpectedly.
            // But if user hits "Start Session" in settings, it will call onNavigate(HOME) which calls startSession
          }} 
          onNavigate={(v) => {
            if (v === ViewState.HOME) {
              startSession();
            }
            setView(v);
          }}
        />
      )}

      {view === ViewState.HOME && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 relative overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-stone-900/50 to-transparent pointer-events-none" />
          
          {/* Main Content */}
          <div className="z-10 flex flex-col items-center max-w-3xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-1000 mt-12">
            
            {activeQuote ? (
              <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl serif-font leading-tight text-stone-100 drop-shadow-lg">
                  "{activeQuote.text}"
                </h1>
                <p className="text-xl text-stone-500 italic font-light">— {activeQuote.author}</p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                 <BreathingVisual />
                 <h1 className="text-2xl md:text-3xl serif-font text-stone-600 mt-8 tracking-widest opacity-80">
                   BE HERE NOW
                 </h1>
              </div>
            )}

            {/* Status & Controls */}
            <div className="fixed bottom-10 flex flex-col items-center gap-4">
              <div className="text-stone-600 text-xs font-light tracking-[0.2em] uppercase">
                 Next Reminder: <span className="font-mono text-stone-400">{timeLeft || '--:--'}</span>
              </div>
              
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => {
                  stopSession();
                  setView(ViewState.SETTINGS);
                }}>
                  Settings / Stop
                </Button>
                
                <Button variant="primary" onClick={triggerReminder}>
                   Show Quote Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
