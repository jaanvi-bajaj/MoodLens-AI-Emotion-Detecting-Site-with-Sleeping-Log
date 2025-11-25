import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Camera, Smile, Frown, Meh, ThumbsUp, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, EmotionType } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FaceDetection from "@/components/face-detection/FaceDetection";
import ChatbotDemo from "@/components/home/ChatbotDemo";



const DemoPage = () => {
  // Webcam state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi there! I'm your MoodMind assistant. How are you feeling today?",
      sender: "bot"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Toggle webcam
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoRef.current!.srcObject = null;
      }
      setIsCameraOn(false);
      setCurrentEmotion(null);
      return;
    }

    try {
      // Turn on camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        // Start emotion detection
        startEmotionDetection();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Simulate emotion detection (in a real app, this would use a facial recognition API)
  const startEmotionDetection = () => {
    const emotions: EmotionType[] = ['happy', 'sad', 'stressed', 'calm', 'neutral'];
    
    // Simulate periodic emotion detection
    const detectionInterval = setInterval(() => {
      if (!isCameraOn) {
        clearInterval(detectionInterval);
        return;
      }
      
      // Capture frame for analysis (for visual feedback)
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw face detection rectangle (for visual feedback)
          const centerX = canvasRef.current.width / 2;
          const centerY = canvasRef.current.height / 2;
          const size = Math.min(canvasRef.current.width, canvasRef.current.height) * 0.5;
          
          context.strokeStyle = '#4CAF50';
          context.lineWidth = 3;
          context.strokeRect(centerX - size/2, centerY - size/2, size, size);
        }
      }
      
      // Simulate detection result
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = Math.random() * 0.5 + 0.5; // Between 0.5 and 1.0
      
      setCurrentEmotion(randomEmotion);
      setConfidenceScore(randomConfidence);
      
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(detectionInterval);
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: input,
      sender: "user"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Send to backend API (in a real app)
      // const response = await apiRequest("POST", "/api/chatbot", { 
      //   message: input,
      //   currentEmotion: currentEmotion 
      // });
      // const data = await response.json();
      
      // Simulate bot response for demo
      setTimeout(() => {
        let botResponse = "I understand. Tell me more about how you're feeling.";
        
        // Customize response based on emotion if detected
        if (currentEmotion) {
          switch(currentEmotion) {
            case 'happy':
              botResponse = "It's great to see you're feeling happy! What's been going well for you?";
              break;
            case 'sad':
              botResponse = "I notice you seem sad. Would you like to talk about what's troubling you?";
              break;
            case 'stressed':
              botResponse = "You appear stressed. Let's talk about what's causing that and explore some relaxation techniques.";
              break;
            case 'calm':
              botResponse = "You seem calm and collected. That's wonderful! How can I help maintain this peaceful state?";
              break;
            case 'neutral':
              botResponse = "How are you feeling today? I'm here to listen and support you.";
              break;
          }
        }
        
        // Add bot message
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: "bot"
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  const getEmotionIcon = () => {
    switch(currentEmotion) {
      case 'happy': return <Smile className="h-8 w-8 text-green-500" />;
      case 'sad': return <Frown className="h-8 w-8 text-blue-500" />;
      case 'stressed': return <Frown className="h-8 w-8 text-red-500" />;
      case 'calm': return <ThumbsUp className="h-8 w-8 text-teal-500" />;
      case 'neutral': return <Meh className="h-8 w-8 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-4xl mb-4">Interactive Demo</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Experience the power of MoodMind's mood detection and AI chatbot. Allow camera access to test facial expression analysis.
          </p>
        </div>

        <Tabs defaultValue="combined" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="combined">Combined Experience</TabsTrigger>
            <TabsTrigger value="camera">Facial Recognition</TabsTrigger>
            <TabsTrigger value="chatbot">AI Chatbot</TabsTrigger>
          </TabsList>
          
          {/* Combined Experience Tab */}
          <TabsContent value="combined" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Webcam Section */}
              <div className="rounded-lg overflow-hidden">
                <FaceDetection />
              </div>
              
              {/* Chatbot Section */}
              <ChatbotDemo/>
            </div>
            
            <div className="mt-8 bg-neutral-50 p-6 rounded-lg border border-neutral-200">
              <h3 className="font-medium text-lg flex items-center mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                How it works
              </h3>
              <div className="text-neutral-700">
                <p className="mb-3">
                  In this demo, we use your device's camera to analyze facial expressions and determine your emotional state in real-time. The AI chatbot can then tailor its responses based on your detected mood.
                </p>
                <p className="mb-3">
                  <strong>Note:</strong> This is a simplified demo. The full MoodMind app includes:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>More advanced emotion detection</li>
                  <li>Personalized mood tracking over time</li>
                  <li>AI-driven insights and recommendations</li>
                  <li>And much more...</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Facial Recognition Tab */}
          <TabsContent value="camera" className="mt-6">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Camera className="h-6 w-6 mr-2 text-primary" />
                Facial Expression Analysis
              </h2>
              
              <div className="mt-4">
                <FaceDetection />
              </div>
              
              <div className="mt-6 bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">How It Works</h3>
                <p className="text-sm text-neutral-600">
                  Our facial expression analysis uses advanced machine learning models to detect and analyze your facial features in real-time. 
                  The system identifies key facial landmarks and recognizes emotional expressions with high accuracy.
                  All processing happens directly in your browser - no images are sent to any server.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Chatbot Tab */}
          <TabsContent value="chatbot" className="mt-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto">
              <div className="bg-primary text-white p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">MoodMind Assistant</h3>
                  <p className="text-xs text-primary-100">AI-powered mental health support</p>
                </div>
              </div>
              
       <ChatbotDemo/>
            </div>
            
            <div className="mt-8 bg-neutral-50 p-6 rounded-lg border border-neutral-200 max-w-lg mx-auto">
              <h3 className="font-medium text-lg mb-4">About Our AI Chatbot</h3>
              <p className="mb-3">
                The MoodMind AI assistant is designed to provide mental health support through natural conversation. It can:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Offer coping strategies for stress and anxiety</li>
                <li>Guide you through mindfulness exercises</li>
                <li>Provide evidence-based mental health information</li>
                <li>Help track your mood patterns over time</li>
              </ul>
              <p className="text-sm text-neutral-500">
                Note: While our AI is designed to support mental wellbeing, it is not a replacement for professional mental health treatment.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DemoPage;