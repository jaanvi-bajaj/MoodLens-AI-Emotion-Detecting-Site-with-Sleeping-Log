export type EmotionType = 'happy' | 'sad' | 'stressed' | 'calm' | 'neutral';

export interface Emotion {
  type: EmotionType;
  value: number; // 0.0 to 1.0
  color: string;
}

export interface MoodData {
  day: string;
  emotion: Emotion;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export type MentalHealthCategory = 'anxiety' | 'depression' | 'stress' | 'wellbeing' | 'sleep';

export interface QuizQuestion {
  id: number;
  text: string;
  category: MentalHealthCategory;
  options: {
    value: number;
    text: string;
  }[];
}

export interface QuizAnswer {
  questionId: number;
  selectedValue: number;
  category: MentalHealthCategory;
}

export interface QuizResult {
  anxiety: number;
  depression: number;
  stress: number;
  wellbeing: number;
  sleep: number;
  overallScore: number;
  mentalState: string;
  recommendations: string[];
}
