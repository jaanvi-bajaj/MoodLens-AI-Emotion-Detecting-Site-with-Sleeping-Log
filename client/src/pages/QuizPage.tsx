import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowRight, Activity, ThumbsUp, AlertCircle, Clipboard, Moon, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { QuizQuestion, QuizAnswer, QuizResult } from "@/lib/types";
import { quizQuestions, generateDynamicQuiz, calculateQuizResults } from "@/lib/quizData";

const QuizPage = () => {
  // State to track quiz progress
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [quizStage, setQuizStage] = useState<'intro' | 'questions' | 'results'>('intro');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize the quiz with the first 5 questions
  useEffect(() => {
    const initialQuestions = quizQuestions.filter(q => q.id <= 5);
    setCurrentQuestions(initialQuestions);
  }, []);
  
  // Handle answer selection
  const handleSelectAnswer = (value: number) => {
    const currentQuestion = currentQuestions[activeQuestionIndex];
    
    // Store the answer
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedValue: value,
      category: currentQuestion.category
    };
    
    setAnswers([...answers, answer]);
    
    // Animate transition to next question
    setIsTransitioning(true);
    setTimeout(() => {
      // If we're at the 5th question, generate more focused questions
      if (activeQuestionIndex === 4) {
        const additionalQuestions = generateDynamicQuiz(answers);
        setCurrentQuestions([...currentQuestions, ...additionalQuestions]);
      }
      
      // Move to the next question or show results
      if (activeQuestionIndex < currentQuestions.length - 1) {
        setActiveQuestionIndex(activeQuestionIndex + 1);
      } else {
        // Quiz completed, calculate results
        const quizResults = calculateQuizResults([...answers, answer]);
        setResults(quizResults);
        setQuizStage('results');
      }
      
      setIsTransitioning(false);
    }, 500);
  };
  
  // Start the quiz
  const startQuiz = () => {
    setQuizStage('questions');
    // Ensure questions are reset when starting a new quiz
    const initialQuestions = quizQuestions.filter(q => q.id <= 5);
    setCurrentQuestions(initialQuestions);
    setActiveQuestionIndex(0);
    setAnswers([]);
    setResults(null);
  };
  
  // Restart the quiz
  const restartQuiz = () => {
    setQuizStage('intro');
    setActiveQuestionIndex(0);
    setAnswers([]);
    setResults(null);
  };
  
  // Calculate progress percentage
  const progress = currentQuestions.length > 0
    ? ((activeQuestionIndex) / currentQuestions.length) * 100
    : 0;
  
  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'anxiety': return <AlertCircle className="h-5 w-5" />;
      case 'depression': return <Brain className="h-5 w-5" />;
      case 'stress': return <Activity className="h-5 w-5" />;
      case 'wellbeing': return <ThumbsUp className="h-5 w-5" />;
      case 'sleep': return <Moon className="h-5 w-5" />;
      default: return <Clipboard className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {quizStage === 'intro' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="text-primary w-10 h-10" />
            </div>
            
            <h1 className="font-heading font-bold text-4xl mb-4">Mental Health Assessment</h1>
            
            <p className="text-lg text-neutral-600 mb-8">
              Take our comprehensive mental health quiz to gain insights into your mental wellbeing. 
              This assessment evaluates anxiety, depression, stress, general wellbeing, and sleep quality.
            </p>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>This assessment adapts to your responses</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clipboard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Initial Assessment</h4>
                    <p className="text-sm text-neutral-500">
                      You'll answer 5 brief questions about different aspects of mental health.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Smart Question Selection</h4>
                    <p className="text-sm text-neutral-500">
                      Based on your answers, the quiz will focus on areas that need more attention.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">Personalized Results</h4>
                    <p className="text-sm text-neutral-500">
                      You'll receive a detailed assessment with personalized recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-neutral-500">
                  Note: This assessment is not a substitute for professional diagnosis. If you're experiencing severe symptoms, please consult a healthcare provider.
                </p>
              </CardFooter>
            </Card>
            
            <Button size="lg" onClick={startQuiz}>
              Start Assessment
            </Button>
          </div>
        )}
        
        {quizStage === 'questions' && currentQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Question {activeQuestionIndex + 1} of {currentQuestions.length}</span>
                <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <Card className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(currentQuestions[activeQuestionIndex].category)}
                  <span className="text-sm font-medium capitalize">
                    {currentQuestions[activeQuestionIndex].category}
                  </span>
                </div>
                <CardTitle className="text-xl">{currentQuestions[activeQuestionIndex].text}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup className="space-y-3">
                  {currentQuestions[activeQuestionIndex].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                      <RadioGroupItem 
                        value={option.value.toString()} 
                        id={`option-${index}`} 
                        onClick={() => handleSelectAnswer(option.value)}
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-neutral-500">
                  Choose the option that best matches your experience.
                </p>
                <Button 
                  variant="outline"
                  disabled={answers.length < activeQuestionIndex} 
                  onClick={() => {
                    if (activeQuestionIndex < currentQuestions.length - 1) {
                      setActiveQuestionIndex(activeQuestionIndex + 1);
                    }
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {quizStage === 'results' && results && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-heading font-bold text-4xl mb-4">Your Mental Health Assessment</h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Based on your responses, we've generated a personalized assessment of your mental wellbeing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Overall Mental Wellbeing
                  </CardTitle>
                  <CardDescription>
                    Your overall assessment indicates {results.mentalState.toLowerCase()} mental health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className="text-sm font-medium">{results.overallScore}/100</span>
                      </div>
                      <Progress 
                        value={results.overallScore} 
                        className="h-3" 
                        indicatorClassName={`${
                          results.overallScore < 25 ? "bg-green-500" :
                          results.overallScore < 50 ? "bg-yellow-500" :
                          results.overallScore < 75 ? "bg-orange-500" :
                          "bg-red-500"
                        }`}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-green-500">Excellent</span>
                        <span className="text-xs text-yellow-500">Good</span>
                        <span className="text-xs text-orange-500">Fair</span>
                        <span className="text-xs text-red-500">Poor</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> Anxiety
                          </span>
                          <span className="text-xs">{results.anxiety}%</span>
                        </div>
                        <Progress 
                          value={results.anxiety} 
                          className="h-2" 
                          indicatorClassName={results.anxiety > 50 ? "bg-red-500" : "bg-green-500"}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Brain className="h-4 w-4" /> Depression
                          </span>
                          <span className="text-xs">{results.depression}%</span>
                        </div>
                        <Progress 
                          value={results.depression} 
                          className="h-2" 
                          indicatorClassName={results.depression > 50 ? "bg-red-500" : "bg-green-500"}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Activity className="h-4 w-4" /> Stress
                          </span>
                          <span className="text-xs">{results.stress}%</span>
                        </div>
                        <Progress 
                          value={results.stress} 
                          className="h-2" 
                          indicatorClassName={results.stress > 50 ? "bg-red-500" : "bg-green-500"}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" /> Wellbeing
                          </span>
                          <span className="text-xs">{results.wellbeing}%</span>
                        </div>
                        <Progress 
                          value={results.wellbeing} 
                          className="h-2" 
                          indicatorClassName={results.wellbeing > 50 ? "bg-red-500" : "bg-green-500"}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Moon className="h-4 w-4" /> Sleep
                          </span>
                          <span className="text-xs">{results.sleep}%</span>
                        </div>
                        <Progress 
                          value={results.sleep} 
                          className="h-2" 
                          indicatorClassName={results.sleep > 50 ? "bg-red-500" : "bg-green-500"}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-6 w-6 text-primary" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="bg-primary/10 p-1 rounded-full mt-1">
                          <ArrowRight className="h-3 w-3 text-primary" />
                        </div>
                        <p>{recommendation}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4 mt-8">
              <p className="text-center text-neutral-600 max-w-lg">
                Remember that mental health is a journey, not a destination. Regular self-assessment and 
                implementing healthy habits can lead to significant improvements over time.
              </p>
              <Button onClick={restartQuiz} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Take Assessment Again
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizPage;