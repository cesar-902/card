
export interface Flashcard {
  id: string;
  frente: string;
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  verso: string;
}

export type AppView = 'home' | 'study' | 'results' | 'history';

export interface HistoryEntry {
  id: string;
  date: string;
  score: number;
  total: number;
}

export interface StudySession {
  cards: Flashcard[];
  currentIndex: number;
  score: number;
  answers: { [cardId: string]: string };
}
