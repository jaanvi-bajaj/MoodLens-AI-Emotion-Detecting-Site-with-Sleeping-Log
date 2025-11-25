import React, { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FaceDetection from '@/components/face-detection/FaceDetection';
import CBTExercises from '@/components/face-detection/CBTExercises';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Camera, Lightbulb, ArrowRight, Award, TimerIcon, LockIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Emotion detector interface that will listen to the FaceDetection component
interface EmotionEvent extends CustomEvent {
  detail: {
    emotion: string;
    probability: number;
  };
}

const CBTPage: React.FC = () => {
  // Emotion Detection & Mood States
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [lockedEmotion, setLockedEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [moodScore, setMoodScore] = useState<number>(50);
  const [showDetectionAlert, setShowDetectionAlert] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<number>(0);
  
  // Mood Detection Timer States
  const [isDetecting, setIsDetecting] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [emotionsDetectedDuringInitialPeriod, setEmotionsDetectedDuringInitialPeriod] = useState<
    Array<{emotion: string, probability: number}>
  >([]);
  
  // Reset mood detection function
  const resetMoodDetection = () => {
    setIsDetecting(true);
    setCountdown(5);
    setLockedEmotion(null);
    setEmotionsDetectedDuringInitialPeriod([]);
  };
  
  // Determine most common emotion during detection period
  const determineLockedEmotion = () => {
    if (emotionsDetectedDuringInitialPeriod.length === 0) {
      return 'neutral'; // Default if no emotions detected
    }
    
    // Count occurrences of each emotion
    const emotionCounts: {[key: string]: {count: number, totalProbability: number}} = {};
    
    emotionsDetectedDuringInitialPeriod.forEach(item => {
      const emotion = item.emotion.toLowerCase();
      if (!emotionCounts[emotion]) {
        emotionCounts[emotion] = { count: 0, totalProbability: 0 };
      }
      emotionCounts[emotion].count += 1;
      emotionCounts[emotion].totalProbability += item.probability;
    });
    
    // Find the most frequent emotion
    let mostFrequentEmotion = 'neutral';
    let highestCount = 0;
    let highestAvgProbability = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, data]) => {
      const avgProbability = data.totalProbability / data.count;
      
      // If this emotion occurred more times, or occurred the same number of times but with higher average probability
      if (data.count > highestCount || (data.count === highestCount && avgProbability > highestAvgProbability)) {
        mostFrequentEmotion = emotion;
        highestCount = data.count;
        highestAvgProbability = avgProbability;
      }
    });
    
    return mostFrequentEmotion;
  };
  
  // Listen for emotion events and handle the initial 5-second detection period
  useEffect(() => {
    const handleEmotionDetected = (event: EmotionEvent) => {
      const { emotion, probability } = event.detail;
      console.log(`Emotion detected: ${emotion} with confidence ${probability}`);
      setDetectedEmotion(emotion);
      setEmotionConfidence(probability);
      
      // If we're still in the detection period, collect emotions
      if (isDetecting) {
        setEmotionsDetectedDuringInitialPeriod(prev => [
          ...prev, 
          { emotion, probability }
        ]);
      }
    };

    // Listen for custom event
    window.addEventListener('emotionDetected' as any, handleEmotionDetected as any);
    
    // Cleanup
    return () => {
      window.removeEventListener('emotionDetected' as any, handleEmotionDetected as any);
    };
  }, [isDetecting]);
  
  // Handle the countdown and locking of emotion
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isDetecting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isDetecting && countdown === 0) {
      // When countdown reaches 0, lock in the most frequent emotion
      const dominantEmotion = determineLockedEmotion();
      setLockedEmotion(dominantEmotion);
      setIsDetecting(false);
      console.log(`Mood locked: ${dominantEmotion}`);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isDetecting, countdown]);
  
  // Handle exercise completion
  const handleExerciseComplete = (moodBoost: number) => {
    setMoodScore(prevScore => Math.min(100, prevScore + moodBoost));
    setCompletedExercises(prev => prev + 1);
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Emotion-Adaptive CBT Exercises</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Personalized cognitive behavioral therapy exercises based on your emotional state
              detected during the first 5 seconds of analysis.
            </p>
          </div>

          {showDetectionAlert && (
            <Alert className="mb-6">
              <Brain className="h-4 w-4" />
              <AlertTitle>Emotion Detection Active</AlertTitle>
              <AlertDescription>
                Look at the camera for 5 seconds to detect your emotional state. This will be used to provide relevant CBT exercises.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={() => setShowDetectionAlert(false)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Mood Detection
                </CardTitle>
                <CardDescription>
                  {isDetecting 
                    ? "Looking for your emotional state..." 
                    : "Your mood has been analyzed and locked in"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Detection timer/status */}
                {isDetecting ? (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <TimerIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Analyzing your mood...</span>
                    </div>
                    <span className="font-bold text-lg">{countdown}s</span>
                  </div>
                ) : lockedEmotion && (
                  <div className="mb-4 p-3 bg-green-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <LockIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span>Mood locked: <span className="capitalize font-medium">{lockedEmotion}</span></span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={resetMoodDetection}
                      className="flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                )}
                
                <div className="mb-6">
                  <FaceDetection />
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Current Mood Score</span>
                    <span className="text-sm font-medium">{moodScore}/100</span>
                  </div>
                  <Progress 
                    value={moodScore} 
                    className="h-2.5" 
                    style={{
                      background: moodScore < 40 ? '#fee2e2' : '#f3f4f6',
                      '--progress-background': moodScore < 40 ? '#ef4444' : 
                                             moodScore < 70 ? '#facc15' : '#22c55e'
                    } as React.CSSProperties}
                  />
                  
                  {/* Current detected emotion (not the locked one) */}
                  {detectedEmotion && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Current Emotion:</span>
                        <span className="capitalize">{detectedEmotion}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <span className="text-sm">{Math.round(emotionConfidence * 100)}%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1 mb-1">
                      <Award className="h-4 w-4" />
                      <span>{completedExercises} exercises completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2">
              <Tabs defaultValue="adaptive" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="adaptive">
                    <Brain className="h-4 w-4 mr-2" />
                    Adaptive Exercises
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    About CBT
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="adaptive" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {lockedEmotion ? (
                          <div className="flex items-center">
                            <span className="capitalize">{lockedEmotion}</span>
                            <ArrowRight className="h-4 w-4 mx-2" />
                            <span>Recommended Exercises</span>
                          </div>
                        ) : 'Waiting for mood analysis...'}
                      </CardTitle>
                      <CardDescription>
                        {lockedEmotion 
                          ? `These exercises are tailored for your detected mood: ${lockedEmotion}`
                          : 'Please wait while we analyze your mood for 5 seconds'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isDetecting && lockedEmotion ? (
                        <CBTExercises 
                          detectedEmotion={lockedEmotion} 
                          onExerciseComplete={handleExerciseComplete}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                          <p>Analyzing your mood for {countdown} seconds...</p>
                          <p className="text-sm text-gray-500 mt-2">Please look at the camera and express your natural emotion</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="info" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>What is Cognitive Behavioral Therapy?</CardTitle>
                      <CardDescription>
                        Understanding the science behind these exercises
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        <strong>Cognitive Behavioral Therapy (CBT)</strong> is a psychological treatment approach that has been demonstrated to be effective for a range of problems including depression, anxiety disorders, and general stress.
                      </p>
                      <p>
                        CBT is based on several core principles:
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Psychological problems are partly based on unhelpful ways of thinking.</strong> CBT helps you identify and challenge distorted thoughts.
                        </li>
                        <li>
                          <strong>Psychological problems are partly based on learned patterns of unhelpful behavior.</strong> CBT helps you develop more constructive behavioral patterns.
                        </li>
                        <li>
                          <strong>People can learn better ways of coping with difficulties.</strong> CBT provides practical strategies for solving problems and changing patterns.
                        </li>
                      </ul>
                      
                      <div className="bg-blue-50 p-4 rounded-md mt-6">
                        <h3 className="font-medium mb-2">How our Emotion-Adaptive CBT works:</h3>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Your facial expressions are analyzed for 5 seconds to detect your emotional state</li>
                          <li>Your mood is "locked in" based on this initial analysis</li>
                          <li>The system selects CBT exercises specifically designed for that emotional state</li>
                          <li>As you complete exercises, your mood score increases</li>
                          <li>Your thought patterns and reframes are saved in your journal for future reference</li>
                        </ol>
                      </div>
                      
                      <p className="mt-4 text-sm text-gray-500">
                        Note: While these exercises are based on established CBT principles, this tool is not a replacement for professional mental health care. If you're experiencing significant distress, please consult with a qualified mental health professional.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CBTPage; 