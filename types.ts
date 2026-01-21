
export enum ResourceType {
  MONEY = 'money',
  HEALTH = 'health',
  SANITY = 'sanity',
  KPI = 'kpi',
  ENERGY = 'energy',
  STRESS = 'stress',
  REPUTATION = 'reputation'
}

export interface ResourceDelta {
  [key: string]: number | ((s: GameState) => number) | undefined;
}

export interface GameCard {
  id: string;
  name: string;
  desc: string;
  cost: Partial<Record<ResourceType, number>>;
  gain: ResourceDelta;
}

export interface GameEvent {
  id: string;
  title: string;
  desc: string;
  effect: (s: GameState) => void;
  tone: 'pos' | 'neg' | 'neutral';
}

export interface Talent {
  id: string;
  name: string;
  desc: string;
  req?: string;
}

export interface LogEntry {
  id: string;
  text: string;
  tone: 'pos' | 'neg' | 'neutral' | 'system';
  timestamp: number;
}

export interface GameState {
  day: number;
  money: number;
  health: number;
  sanity: number;
  kpi: number;
  energy: number;
  stress: number;
  reputation: number;
  talentPath: string | null;
  logs: LogEntry[];
  isDefeated: boolean;
  defeatReason: string;
  currentHand: GameCard[];
  nightActions: GameCard[];
}
