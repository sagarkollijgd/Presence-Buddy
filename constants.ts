import { Quote } from './types';

export const DEFAULT_QUOTES: Quote[] = [
  { id: '1', text: "Realize deeply that the present moment is all you have.", author: "Eckhart Tolle" },
  { id: '2', text: "Be happy in the moment, that's enough. Each moment is all we need, not more.", author: "Mother Teresa" },
  { id: '3', text: "Life is a dance. Mindfulness is witnessing that dance.", author: "Amit Ray" },
  { id: '4', text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
  { id: '5', text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { id: '6', text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
];

export const DEFAULT_FREQUENCY = 30; // minutes
export const MIN_FREQUENCY = 1;
export const MAX_FREQUENCY = 240;
