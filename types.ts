export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  attachment?: Attachment;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum SuggestionType {
  EXAM = 'Exame de Consciência',
  PRAYER = 'Oração Contextual',
  CATECHESIS = 'Dúvida de Fé',
}

export type LiturgicalSeason = 'Advent' | 'Christmas' | 'Ordinary Time' | 'Lent' | 'Easter';
export type LiturgicalColor = 'purple' | 'white' | 'green' | 'red' | 'rose';

export interface LiturgicalInfo {
  season: LiturgicalSeason;
  dayName?: string;
  color: LiturgicalColor;
  description: string;
}
