export interface Quote {
  id: string;
  text: string;
  author?: string;
}

export interface AppSettings {
  frequencyMinutes: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  SETTINGS = 'SETTINGS',
  QUOTES = 'QUOTES'
}