
import React, { useEffect, useState } from 'react';
import { AppSettings, ViewState } from '../types';
import { Button } from './Button';
import { MIN_FREQUENCY, MAX_FREQUENCY } from '../constants';
import { playMeditationBell } from '../services/audioService';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onNavigate: (view: ViewState) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onNavigate }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLocalSettings({ ...localSettings, frequencyMinutes: val });
  };

  const toggleNotifications = async () => {
    // If currently enabled, just turn off
    if (localSettings.notificationsEnabled) {
      setLocalSettings({ ...localSettings, notificationsEnabled: false });
      return;
    }

    if (typeof Notification === 'undefined') {
      alert("This browser does not support desktop notifications.");
      return;
    }

    // Refresh status before checking
    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);

    // If currently disabled, we need to ensure we have permission before enabling
    if (currentPermission === 'granted') {
      setLocalSettings({ ...localSettings, notificationsEnabled: true });
    } else if (currentPermission !== 'denied') {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        setLocalSettings({ ...localSettings, notificationsEnabled: true });
      } else {
        // User denied or closed dialog, keep disabled
        setLocalSettings({ ...localSettings, notificationsEnabled: false });
      }
    } else {
      // Permission previously denied
      alert('The browser is currently reporting that notifications are blocked.\n\nIf you have just manually allowed them in your browser settings (via the lock icon), please REFRESH the page for the change to take effect.');
    }
  };

  const toggleSound = () => {
    const newState = !localSettings.soundEnabled;
    setLocalSettings({ ...localSettings, soundEnabled: newState });
    if (newState) {
      playMeditationBell(); // Preview sound
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onNavigate(ViewState.HOME);
  };

  return (
    <div className="max-w-md mx-auto p-8 animate-in slide-in-from-bottom-4 duration-500 pt-24">
      <h2 className="text-3xl serif-font text-stone-200 mb-8 text-center">Mindfulness Settings</h2>
      
      <div className="bg-stone-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-stone-800 space-y-8">
        
        {/* Frequency Slider */}
        <div className="space-y-4">
          <label className="block text-stone-300 font-medium">
            Remind me every <span className="text-2xl font-bold text-stone-100 mx-1">{localSettings.frequencyMinutes}</span> minutes
          </label>
          <input
            type="range"
            min={MIN_FREQUENCY}
            max={MAX_FREQUENCY}
            value={localSettings.frequencyMinutes}
            onChange={handleFrequencyChange}
            className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-200"
          />
          <div className="flex justify-between text-xs text-stone-500">
            <span>{MIN_FREQUENCY}m</span>
            <span>{MAX_FREQUENCY}m</span>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Preferences</h3>
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-stone-300 font-medium">Meditation Bell</span>
            <button 
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-stone-500 ${localSettings.soundEnabled ? 'bg-stone-200' : 'bg-stone-700'}`}
              aria-label="Toggle sound"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-stone-900 transition-transform ${localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Notification Permission Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-stone-300 font-medium">Browser Popups</span>
               <div className="flex flex-col">
                 <span className="text-xs text-stone-500">For reminders when backgrounded</span>
                 <span className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${
                   permissionStatus === 'granted' ? 'text-green-500/70' : 
                   permissionStatus === 'denied' ? 'text-red-500/70' : 'text-stone-500/70'
                 }`}>
                   Status: {permissionStatus}
                 </span>
               </div>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-stone-500 ${localSettings.notificationsEnabled ? 'bg-stone-200' : 'bg-stone-700'}`}
              aria-label="Toggle notifications"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-stone-900 transition-transform ${localSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 flex flex-col gap-3">
          <Button onClick={handleSave} className="w-full py-3 text-lg">
            Start Mindfulness Session
          </Button>
          <Button variant="ghost" onClick={() => onNavigate(ViewState.QUOTES)} className="w-full">
            Manage Quotes
          </Button>
        </div>
      </div>
    </div>
  );
};
