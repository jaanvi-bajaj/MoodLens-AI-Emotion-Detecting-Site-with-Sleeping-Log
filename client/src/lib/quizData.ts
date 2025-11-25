import type { QuizQuestion, QuizAnswer, QuizResult } from './types';

// Mental health quiz questions covering multiple categories
export const quizQuestions: QuizQuestion[] = [
  // Anxiety questions
  {
    id: 1,
    text: "How often do you feel nervous, anxious, or on edge?",
    category: "anxiety",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  {
    id: 2,
    text: "How often do you find yourself worrying too much about different things?",
    category: "anxiety",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  {
    id: 3,
    text: "How difficult is it for you to relax?",
    category: "anxiety",
    options: [
      { value: 0, text: "Not difficult at all" },
      { value: 1, text: "Somewhat difficult" },
      { value: 2, text: "Very difficult" },
      { value: 3, text: "Extremely difficult" }
    ]
  },
  
  // Depression questions
  {
    id: 4,
    text: "How often do you feel down, depressed, or hopeless?",
    category: "depression",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  {
    id: 5,
    text: "How often do you have little interest or pleasure in doing things you usually enjoy?",
    category: "depression",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  {
    id: 6,
    text: "How often do you feel tired or have little energy?",
    category: "depression",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  
  // Stress questions
  {
    id: 7,
    text: "How often do you feel unable to control the important things in your life?",
    category: "stress",
    options: [
      { value: 0, text: "Never" },
      { value: 1, text: "Sometimes" },
      { value: 2, text: "Often" },
      { value: 3, text: "Very often" }
    ]
  },
  {
    id: 8,
    text: "How often do you feel that difficulties are piling up so high that you cannot overcome them?",
    category: "stress",
    options: [
      { value: 0, text: "Never" },
      { value: 1, text: "Sometimes" },
      { value: 2, text: "Often" },
      { value: 3, text: "Very often" }
    ]
  },
  {
    id: 9,
    text: "How often do you feel stressed or overwhelmed?",
    category: "stress",
    options: [
      { value: 0, text: "Never" },
      { value: 1, text: "Sometimes" },
      { value: 2, text: "Often" },
      { value: 3, text: "Very often" }
    ]
  },
  
  // Wellbeing questions
  {
    id: 10,
    text: "How often do you feel optimistic about the future?",
    category: "wellbeing",
    options: [
      { value: 3, text: "Not at all" },
      { value: 2, text: "Several days" },
      { value: 1, text: "More than half the days" },
      { value: 0, text: "Nearly every day" }
    ]
  },
  {
    id: 11,
    text: "How often do you feel good about yourself?",
    category: "wellbeing",
    options: [
      { value: 3, text: "Not at all" },
      { value: 2, text: "Several days" },
      { value: 1, text: "More than half the days" },
      { value: 0, text: "Nearly every day" }
    ]
  },
  {
    id: 12,
    text: "How often do you feel loved?",
    category: "wellbeing",
    options: [
      { value: 3, text: "Not at all" },
      { value: 2, text: "Several days" },
      { value: 1, text: "More than half the days" },
      { value: 0, text: "Nearly every day" }
    ]
  },
  
  // Sleep questions
  {
    id: 13,
    text: "How often do you have trouble falling or staying asleep?",
    category: "sleep",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  },
  {
    id: 14,
    text: "How often do you wake up feeling rested?",
    category: "sleep",
    options: [
      { value: 3, text: "Not at all" },
      { value: 2, text: "Several days" },
      { value: 1, text: "More than half the days" },
      { value: 0, text: "Nearly every day" }
    ]
  },
  {
    id: 15,
    text: "How often do you have trouble concentrating on things due to poor sleep?",
    category: "sleep",
    options: [
      { value: 0, text: "Not at all" },
      { value: 1, text: "Several days" },
      { value: 2, text: "More than half the days" },
      { value: 3, text: "Nearly every day" }
    ]
  }
];

// Generate a dynamic quiz based on initial responses
export function generateDynamicQuiz(initialAnswers: QuizAnswer[]): QuizQuestion[] {
  // If no initial answers, return the first 5 questions
  if (initialAnswers.length === 0) {
    return quizQuestions.slice(0, 5);
  }
  
  // Analyze initial answers to determine which categories to focus on
  const categoryScores: Record<string, number> = {
    anxiety: 0,
    depression: 0,
    stress: 0,
    wellbeing: 0,
    sleep: 0
  };
  
  // Calculate scores for each category
  initialAnswers.forEach(answer => {
    categoryScores[answer.category] += answer.selectedValue;
  });
  
  // Find the top 2 categories with highest scores (potential issues)
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Get questions for the top categories that haven't been answered yet
  const answeredQuestionIds = initialAnswers.map(a => a.questionId);
  
  const remainingQuestions = quizQuestions.filter(q => 
    !answeredQuestionIds.includes(q.id) && 
    sortedCategories.includes(q.category)
  );
  
  // Return up to 10 additional questions
  return remainingQuestions.slice(0, 10);
}

// Calculate quiz results based on all answers
export function calculateQuizResults(answers: QuizAnswer[]): QuizResult {
  // Initialize category scores
  const categoryScores: Record<string, {total: number, count: number}> = {
    anxiety: {total: 0, count: 0},
    depression: {total: 0, count: 0},
    stress: {total: 0, count: 0},
    wellbeing: {total: 0, count: 0},
    sleep: {total: 0, count: 0}
  };
  
  // Sum up scores for each category
  answers.forEach(answer => {
    categoryScores[answer.category].total += answer.selectedValue;
    categoryScores[answer.category].count += 1;
  });
  
  // Calculate normalized scores (0-100 scale where 0 is best and 100 is worst)
  const normalizedScores: Record<string, number> = {};
  
  Object.entries(categoryScores).forEach(([category, {total, count}]) => {
    if (count === 0) {
      normalizedScores[category] = 0;
    } else {
      // Maximum possible score would be 3 * count
      normalizedScores[category] = Math.round((total / (3 * count)) * 100);
    }
  });
  
  // Calculate overall score (weight all categories equally)
  const overallScore = Object.values(normalizedScores).reduce((sum, score) => sum + score, 0) / 
    Object.keys(normalizedScores).length;
  
  // Determine mental state based on overall score
  let mentalState: string;
  if (overallScore < 25) {
    mentalState = "Excellent";
  } else if (overallScore < 50) {
    mentalState = "Good";
  } else if (overallScore < 75) {
    mentalState = "Fair";
  } else {
    mentalState = "Poor";
  }
  
  // Generate personalized recommendations
  const recommendations: string[] = [];
  
  // Add general recommendation
  recommendations.push("Maintain a regular sleep schedule and aim for 7-9 hours of sleep each night.");
  
  // Category-specific recommendations
  if (normalizedScores.anxiety > 50) {
    recommendations.push("Practice deep breathing exercises daily to help manage anxiety symptoms.");
    recommendations.push("Consider limiting caffeine intake, which can exacerbate anxiety.");
  }
  
  if (normalizedScores.depression > 50) {
    recommendations.push("Try to engage in physical activity for at least 30 minutes daily.");
    recommendations.push("Schedule activities that bring you joy and satisfaction.");
  }
  
  if (normalizedScores.stress > 50) {
    recommendations.push("Practice mindfulness meditation to help reduce stress levels.");
    recommendations.push("Set realistic goals and prioritize your tasks to avoid feeling overwhelmed.");
  }
  
  if (normalizedScores.wellbeing < 50) {
    recommendations.push("Connect with supportive friends or family members regularly.");
    recommendations.push("Engage in activities that give you a sense of meaning and purpose.");
  }
  
  if (normalizedScores.sleep > 50) {
    recommendations.push("Create a relaxing bedtime routine that helps signal your body it's time to sleep.");
    recommendations.push("Limit screen time at least one hour before bed.");
  }
  
  // If overall mental health is poor, add recommendation for professional help
  if (overallScore > 70) {
    recommendations.push("Consider speaking with a mental health professional for personalized support and guidance.");
  }
  
  return {
    anxiety: normalizedScores.anxiety,
    depression: normalizedScores.depression,
    stress: normalizedScores.stress,
    wellbeing: normalizedScores.wellbeing,
    sleep: normalizedScores.sleep,
    overallScore: Math.round(overallScore),
    mentalState,
    recommendations
  };
}