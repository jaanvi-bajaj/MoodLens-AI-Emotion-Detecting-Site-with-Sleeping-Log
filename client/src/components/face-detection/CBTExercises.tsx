import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Heart,
  Lightbulb,
  Moon,
  RefreshCw,
  Sun,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Types for emotions and exercises
interface EmotionExercises {
  [key: string]: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    exercises: Exercise[];
  };
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  steps: string[];
  type: 'thought-challenge' | 'reframing' | 'gratitude' | 'mindfulness' | 'self-compassion';
  moodBoost: number;
}

interface Props {
  detectedEmotion?: string;
  onExerciseComplete?: (moodBoost: number) => void;
}

const CBTExercises: React.FC<Props> = ({ detectedEmotion = 'neutral', onExerciseComplete }) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [thoughtsLog, setThoughtsLog] = useState<{thought: string, reframe: string}[]>([]);
  const [progress, setProgress] = useState(0);

  // Map emotions to specific exercises
  const emotionExercises: EmotionExercises = {
    happy: {
      title: 'Positive Reinforcement',
      description: 'Strengthen positive thinking patterns and maintain your uplifted mood',
      icon: <Sun className="h-8 w-8" />,
      color: 'text-yellow-500',
      exercises: [
        {
          id: 'happy-1',
          title: 'Gratitude Practice',
          description: 'Reinforce your positive mood by acknowledging what you\'re grateful for',
          steps: [
            'Take a moment to reflect on three things that went well today',
            'For each positive thing, write down why it happened and how it made you feel',
            'Consider how you can create more of these positive experiences in the future'
          ],
          type: 'gratitude',
          moodBoost: 10
        },
        {
          id: 'happy-2',
          title: 'Strengths Affirmation',
          description: 'Build on your positive mood by recognizing your personal strengths',
          steps: [
            'Identify three personal strengths that you demonstrated today',
            'Write down specific examples of how you used these strengths',
            'Create positive affirmations based on these strengths to use in the future'
          ],
          type: 'self-compassion',
          moodBoost: 15
        },
        {
          id: 'happy-3',
          title: 'Joy Amplification',
          description: 'Enhance positive emotions by mindfully savoring your experiences',
          steps: [
            'Identify a recent positive experience that brought you joy',
            'Close your eyes and vividly recall the sensory details of this experience',
            'Notice how reliving this memory affects your body and emotions',
            'Write down ways to incorporate similar positive experiences more often'
          ],
          type: 'mindfulness',
          moodBoost: 12
        },
        {
          id: 'happy-4',
          title: 'Positive Impact Journal',
          description: 'Reflect on how your positive actions affect others',
          steps: [
            'Think about one way your actions positively impacted someone else recently',
            'Write about how this made the other person feel',
            'Describe how creating this positive impact made you feel',
            'Plan one intentional act of kindness for tomorrow'
          ],
          type: 'gratitude',
          moodBoost: 18
        }
      ]
    },
    sad: {
      title: 'Mood Elevation',
      description: 'Challenge negative thoughts and find new perspectives',
      icon: <Moon className="h-8 w-8" />,
      color: 'text-blue-500',
      exercises: [
        {
          id: 'sad-1',
          title: 'Thought Challenge',
          description: 'Identify and challenge negative thoughts contributing to sadness',
          steps: [
            'Write down a specific negative thought you\'re experiencing',
            'Rate how strongly you believe this thought (0-100%)',
            'List evidence that contradicts this negative thought',
            'Create a more balanced alternative thought'
          ],
          type: 'thought-challenge',
          moodBoost: 20
        },
        {
          id: 'sad-2',
          title: 'Pleasant Activity Scheduling',
          description: 'Plan activities that bring joy and accomplishment',
          steps: [
            'List three activities that typically bring you joy or satisfaction',
            'Schedule at least one of these activities in the next 24 hours',
            'After completing the activity, note how your mood changed'
          ],
          type: 'reframing',
          moodBoost: 15
        },
        {
          id: 'sad-3',
          title: 'Behavioral Activation',
          description: 'Break the cycle of sadness through purposeful activity',
          steps: [
            'Identify one small, achievable task you can complete today',
            'Break this task down into very small steps',
            'Commit to completing just the first step, no matter how small',
            'Acknowledge your achievement and note any changes in your mood'
          ],
          type: 'reframing',
          moodBoost: 18
        },
        {
          id: 'sad-4',
          title: 'Compassionate Self-Talk',
          description: 'Replace self-criticism with self-compassion to alleviate sadness',
          steps: [
            'Write down something you\'ve been criticizing yourself for',
            'Imagine what you would say to a friend facing the same situation',
            'Create a self-compassionate response using kind, understanding language',
            'Practice saying this compassionate statement to yourself daily'
          ],
          type: 'self-compassion',
          moodBoost: 22
        }
      ]
    },
    angry: {
      title: 'Anger Management',
      description: 'Process anger constructively and find calmer perspectives',
      icon: <AlertCircle className="h-8 w-8" />,
      color: 'text-red-500',
      exercises: [
        {
          id: 'angry-1',
          title: 'STOPP Technique',
          description: 'A structured approach to managing strong emotions',
          steps: [
            'Stop: Pause and take a deep breath',
            'Take a step back: Mentally remove yourself from the situation',
            'Observe: What are you thinking and feeling? What triggered this?',
            'Perspective: Consider the bigger picture and alternative viewpoints',
            'Practice what works: Choose a response that aligns with your values'
          ],
          type: 'mindfulness',
          moodBoost: 25
        },
        {
          id: 'angry-2',
          title: 'Anger Thought Record',
          description: 'Track and reframe anger-provoking thoughts',
          steps: [
            'Describe the situation that triggered your anger',
            'Write down your automatic thoughts during this situation',
            'Identify the cognitive distortions in these thoughts',
            'Create more balanced alternative thoughts'
          ],
          type: 'thought-challenge',
          moodBoost: 20
        },
        {
          id: 'angry-3',
          title: 'Progressive Muscle Relaxation',
          description: 'Release physical tension associated with anger',
          steps: [
            'Find a comfortable position and close your eyes',
            'Tense and then release each muscle group, starting from your feet and moving upward',
            'Notice the difference between tension and relaxation in your body',
            'Take slow, deep breaths as you continue to release tension'
          ],
          type: 'mindfulness',
          moodBoost: 18
        },
        {
          id: 'angry-4',
          title: 'Empathy Development',
          description: 'Reduce anger through understanding others\' perspectives',
          steps: [
            'Identify a person or situation that triggered your anger',
            'Try to imagine the situation from the other person\'s point of view',
            'Consider what needs, fears, or pressures might be influencing their behavior',
            'Write down how this perspective shift affects your anger'
          ],
          type: 'reframing',
          moodBoost: 22
        }
      ]
    },
    neutral: {
      title: 'Mindful Awareness',
      description: 'Develop present-moment awareness and emotional intelligence',
      icon: <Brain className="h-8 w-8" />,
      color: 'text-gray-500',
      exercises: [
        {
          id: 'neutral-1',
          title: '5-4-3-2-1 Grounding Exercise',
          description: 'A sensory awareness exercise to connect with the present moment',
          steps: [
            'Notice 5 things you can see around you',
            'Become aware of 4 things you can touch or feel',
            'Listen for 3 things you can hear',
            'Notice 2 things you can smell',
            'Pay attention to 1 thing you can taste'
          ],
          type: 'mindfulness',
          moodBoost: 10
        },
        {
          id: 'neutral-2',
          title: 'Values Reflection',
          description: 'Connect with your core values to guide purposeful action',
          steps: [
            'Identify three core values that are important to you',
            'Rate how well your current actions align with each value (1-10)',
            'Plan one specific action to better align with each value'
          ],
          type: 'self-compassion',
          moodBoost: 15
        },
        {
          id: 'neutral-3',
          title: 'Emotion Awareness Scan',
          description: 'Develop emotional intelligence through mindful observation',
          steps: [
            'Take three deep breaths and center your awareness',
            'Scan your body from head to toe, noticing any physical sensations',
            'Note any emotions that arise, without judging them as good or bad',
            'Observe how these emotions shift and change as you pay attention to them'
          ],
          type: 'mindfulness',
          moodBoost: 12
        },
        {
          id: 'neutral-4',
          title: 'Habit Assessment',
          description: 'Mindfully examine your daily habits and their impact on wellbeing',
          steps: [
            'List three daily habits that significantly impact your wellbeing',
            'For each habit, rate whether its overall effect is positive or negative (1-10)',
            'Identify one small change you could make to improve a habit',
            'Create a specific implementation plan for this change'
          ],
          type: 'reframing',
          moodBoost: 14
        }
      ]
    },
    fear: {
      title: 'Anxiety Relief',
      description: 'Reduce anxiety and build confidence',
      icon: <AlertTriangle className="h-8 w-8" />,
      color: 'text-purple-500',
      exercises: [
        {
          id: 'fear-1',
          title: 'Worry Time Scheduling',
          description: 'Contain worries to a specific time to reduce their impact',
          steps: [
            'Set aside 15 minutes later today as dedicated "worry time"',
            'When worries arise outside this time, note them down and postpone thinking about them',
            'During your scheduled worry time, review and problem-solve your collected concerns',
            'After worry time ends, engage in a pleasant or absorbing activity'
          ],
          type: 'thought-challenge',
          moodBoost: 20
        },
        {
          id: 'fear-2',
          title: 'Fear Deconstruction',
          description: 'Break down fears to make them more manageable',
          steps: [
            'Identify a specific fear you\'re experiencing',
            'Rate how likely this feared outcome actually is (0-100%)',
            'List what would happen if your fear came true, and how you would cope',
            'Create a more realistic assessment of the situation'
          ],
          type: 'reframing',
          moodBoost: 25
        },
        {
          id: 'fear-3',
          title: 'Breathing Reset',
          description: 'Use controlled breathing to activate your parasympathetic system',
          steps: [
            'Find a comfortable position and place one hand on your chest, one on your stomach',
            'Breathe in slowly through your nose for 4 counts, feeling your stomach expand',
            'Hold your breath gently for 2 counts',
            'Exhale slowly through your mouth for 6 counts, feeling your stomach contract',
            'Repeat this pattern for 2 minutes, focusing only on your breath'
          ],
          type: 'mindfulness',
          moodBoost: 18
        },
        {
          id: 'fear-4',
          title: 'Safety Anchor Visualization',
          description: 'Create a mental safe place to reduce anxiety',
          steps: [
            'Close your eyes and imagine a place where you feel completely safe and calm',
            'Engage all your senses - what do you see, hear, smell, feel, and taste in this place?',
            'Create a simple gesture or word that you can use to quickly recall this safe place',
            'Practice using your anchor whenever anxiety begins to rise'
          ],
          type: 'mindfulness',
          moodBoost: 20
        }
      ]
    },
    surprised: {
      title: 'Adaptability Training',
      description: 'Process unexpected events and adapt constructively',
      icon: <Lightbulb className="h-8 w-8" />,
      color: 'text-amber-500',
      exercises: [
        {
          id: 'surprised-1',
          title: 'Change Perspective Exercise',
          description: 'Find meaning and opportunity in unexpected situations',
          steps: [
            'Describe the unexpected event or realization that surprised you',
            'List three potential positives that could come from this situation',
            'Identify what you can learn from this experience',
            'Create an action plan for adapting to this new information'
          ],
          type: 'reframing',
          moodBoost: 15
        },
        {
          id: 'surprised-2',
          title: 'Flexibility Assessment',
          description: 'Evaluate and improve your adaptability to change',
          steps: [
            'Rate your initial reaction to the surprise (1-10, from resistance to acceptance)',
            'Identify any automatic thoughts that arose when surprised',
            'Challenge any unhelpful thoughts with more flexible alternatives',
            'Practice a self-statement that promotes adaptability for future surprises'
          ],
          type: 'thought-challenge',
          moodBoost: 18
        },
        {
          id: 'surprised-3',
          title: 'Opportunity Mining',
          description: 'Transform surprises into opportunities for growth',
          steps: [
            'Describe the surprising situation in detail',
            'Identify three skills or qualities this situation calls for',
            'Reflect on how developing these skills would benefit you',
            'Create a specific plan to strengthen one of these skills'
          ],
          type: 'reframing',
          moodBoost: 16
        }
      ]
    },
    stressed: {
      title: 'Stress Reduction',
      description: 'Alleviate stress and restore balance',
      icon: <AlertCircle className="h-8 w-8" />,
      color: 'text-orange-500',
      exercises: [
        {
          id: 'stressed-1',
          title: 'Stress Inventory',
          description: 'Identify and categorize sources of stress',
          steps: [
            'List all your current sources of stress',
            'Categorize each stressor as "within my control," "partially within my control," or "outside my control"',
            'For stressors within your control, identify one specific action step',
            'For stressors outside your control, practice an acceptance statement'
          ],
          type: 'thought-challenge',
          moodBoost: 20
        },
        {
          id: 'stressed-2',
          title: 'Body Scan Relaxation',
          description: 'Release physical tension through progressive awareness',
          steps: [
            'Lie down or sit comfortably and close your eyes',
            'Bring attention to your feet and slowly move upward through your body',
            'Notice any areas of tension without trying to change them',
            'As you exhale, imagine tension flowing out of these areas',
            'Continue until you\'ve scanned your entire body'
          ],
          type: 'mindfulness',
          moodBoost: 22
        },
        {
          id: 'stressed-3',
          title: 'Priority Realignment',
          description: 'Reduce stress by clarifying what truly matters',
          steps: [
            'List all your current tasks and commitments',
            'Categorize each as "essential," "important," or "optional"',
            'Identify which items can be delegated, delayed, or dropped',
            'Create a focused plan for the truly essential items'
          ],
          type: 'reframing',
          moodBoost: 18
        },
        {
          id: 'stressed-4',
          title: 'Mindful Micro-Break',
          description: 'Interrupt stress cycles with brief mindfulness practices',
          steps: [
            'Set a timer for 2 minutes',
            'Focus completely on your breathing, counting each breath',
            'If your mind wanders, gently return to counting breaths',
            'Notice how you feel after this brief pause',
            'Schedule three micro-breaks in your day'
          ],
          type: 'mindfulness',
          moodBoost: 15
        }
      ]
    },
    disgusted: {
      title: 'Aversion Processing',
      description: 'Work through feelings of disgust and aversion constructively',
      icon: <AlertCircle className="h-8 w-8" />,
      color: 'text-green-500',
      exercises: [
        {
          id: 'disgusted-1',
          title: 'Value Clarification',
          description: 'Connect with core values when faced with moral disgust',
          steps: [
            'Identify what specifically triggered your feelings of disgust',
            'Reflect on which personal values were challenged by this trigger',
            'Write about why these values are important to you',
            'Consider constructive actions that align with your values'
          ],
          type: 'reframing',
          moodBoost: 18
        },
        {
          id: 'disgusted-2',
          title: 'Acceptance Practice',
          description: 'Develop acceptance for uncomfortable feelings',
          steps: [
            'Notice where you feel disgust in your body without judgment',
            'Acknowledge the feeling: "I notice I\'m feeling disgust right now"',
            'Remind yourself that all emotions are temporary and will pass',
            'Practice a self-compassion statement about having this feeling'
          ],
          type: 'mindfulness',
          moodBoost: 15
        },
        {
          id: 'disgusted-3',
          title: 'Cognitive Reappraisal',
          description: 'Reframe judgments to reduce feelings of disgust',
          steps: [
            'Describe the situation that triggered disgust without judgmental language',
            'Identify automatic judgments you made about the situation',
            'Consider alternative, more neutral interpretations',
            'Choose an interpretation that maintains your values while reducing extreme disgust'
          ],
          type: 'thought-challenge',
          moodBoost: 20
        },
        {
          id: 'disgusted-4',
          title: 'Compassion Cultivation',
          description: 'Develop compassion to counter harsh judgments',
          steps: [
            'Think of someone or something toward which you feel disgust',
            'Consider what factors might have contributed to this situation',
            'Practice extending understanding, even while disagreeing',
            'Send wishes for healing to yourself and others affected'
          ],
          type: 'self-compassion',
          moodBoost: 22
        }
      ]
    }
  };

  // Map standard emotions to our exercise categories
  const mapToExerciseCategory = (emotion: string): string => {
    emotion = emotion.toLowerCase();
    
    // Direct matches
    if (emotionExercises[emotion]) {
      return emotion;
    }
    
    // Map similar emotions
    if (emotion === 'happy' || emotion === 'joy') return 'happy';
    if (emotion === 'sad' || emotion === 'unhappy' || emotion === 'depressed') return 'sad';
    if (emotion === 'angry' || emotion === 'furious' || emotion === 'annoyed') return 'angry';
    if (emotion === 'fearful' || emotion === 'afraid' || emotion === 'anxious' || emotion === 'stressed') return 'fear';
    if (emotion === 'surprised' || emotion === 'shocked' || emotion === 'amazed') return 'surprised';
    if (emotion === 'disgusted' || emotion === 'contempt') return 'disgusted';
    
    // Default to neutral
    return 'neutral';
  };

  // Get appropriate exercises based on emotion
  useEffect(() => {
    setCurrentExercise(null);
    setCurrentStep(0);
    setUserInputs([]);
    setExerciseComplete(false);
  }, [detectedEmotion]);

  // Select an exercise
  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setCurrentStep(0);
    setUserInputs(new Array(exercise.steps.length).fill(''));
    setProgress(0);
    setExerciseComplete(false);
  };

  // Handle user input
  const handleInputChange = (value: string) => {
    const newInputs = [...userInputs];
    newInputs[currentStep] = value;
    setUserInputs(newInputs);
  };

  // Move to next step
  const handleNextStep = () => {
    if (!currentExercise) return;
    
    // If we're at a thought challenge or reframing step and it's the last step
    if (
      (currentExercise.type === 'thought-challenge' || currentExercise.type === 'reframing') && 
      currentStep === currentExercise.steps.length - 1 &&
      userInputs[0] && userInputs[currentStep]
    ) {
      // Save the thought and reframe
      setThoughtsLog([...thoughtsLog, {
        thought: userInputs[0],
        reframe: userInputs[currentStep]
      }]);
    }
    
    if (currentStep < currentExercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(((currentStep + 1) / currentExercise.steps.length) * 100);
    } else {
      setExerciseComplete(true);
      setProgress(100);
      if (onExerciseComplete) {
        onExerciseComplete(currentExercise.moodBoost);
      }
    }
  };

  // Restart the exercise
  const handleRestart = () => {
    if (currentExercise) {
      selectExercise(currentExercise);
    }
  };

  // Choose a new exercise
  const handleChooseNew = () => {
    setCurrentExercise(null);
    setCurrentStep(0);
    setUserInputs([]);
    setExerciseComplete(false);
    setProgress(0);
  };

  // Get emotion category
  const emotionCategory = mapToExerciseCategory(detectedEmotion);
  const emotionData = emotionExercises[emotionCategory];
  
  // Render exercise selection
  if (!currentExercise) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={`${emotionData.color}`}>
            {emotionData.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{emotionData.title}</h3>
            <p className="text-muted-foreground">{emotionData.description}</p>
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {emotionData.exercises.map((exercise) => (
            <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => selectExercise(exercise)} className="w-full">
                  Start Exercise
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {thoughtsLog.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Thought Journal
              </CardTitle>
              <CardDescription>
                Previous thoughts you've reframed during exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {thoughtsLog.map((entry, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="grid grid-cols-[20px_1fr] gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-muted-foreground italic">"{entry.thought}"</p>
                    </div>
                    <div className="grid grid-cols-[20px_1fr] gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="font-medium">"{entry.reframe}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render current exercise
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={handleChooseNew} className="mb-4">
          ← Back to exercises
        </Button>
        <h3 className="text-xl font-semibold">{currentExercise.title}</h3>
        <p className="text-muted-foreground">{currentExercise.description}</p>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {!exerciseComplete ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Step {currentStep + 1} of {currentExercise.steps.length}
            </CardTitle>
            <CardDescription>
              {currentExercise.steps[currentStep]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentExercise.type === 'thought-challenge' || 
             currentExercise.type === 'reframing' || 
             currentExercise.type === 'gratitude' ? (
              <Textarea 
                value={userInputs[currentStep]} 
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Write your response here..."
                className="min-h-[100px]"
              />
            ) : (
              <Input 
                value={userInputs[currentStep]} 
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Write your response here..."
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setProgress(((currentStep - 1) / currentExercise.steps.length) * 100);
                }}
              >
                Previous
              </Button>
            )}
            <Button 
              onClick={handleNextStep}
              disabled={!userInputs[currentStep]}
              className={currentStep === 0 ? 'ml-auto' : ''}
            >
              {currentStep < currentExercise.steps.length - 1 ? 'Next' : 'Complete'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Exercise Complete!
            </CardTitle>
            <CardDescription>
              Great job completing this exercise. You've taken an important step toward improving your emotional well-being.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6 mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <ThumbsUp className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <p className="text-center mb-4">
              You've earned a <span className="font-semibold">+{currentExercise.moodBoost} mood boost</span>!
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleRestart}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Do Again
            </Button>
            <Button onClick={handleChooseNew}>
              Try Another Exercise
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CBTExercises; 