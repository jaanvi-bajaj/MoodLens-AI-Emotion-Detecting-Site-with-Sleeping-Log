import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  Lock, 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Headphones,
  MessageSquare,
  Square, 
  StopCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  isPlaying?: boolean;
};

// Define preset questions
const presetQuestions = [
  "How can I improve my mood today?",
  "What are some quick stress relief techniques?",
  "Can you suggest a mindfulness exercise?",
  "How can I sleep better tonight?"
];

const GEMINI_API_KEY = "XXXXXXXX"; // Your API key

const ChatbotDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your MoodMind assistant. How are you feeling today?",
      sender: "bot",
      isPlaying: false
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [talkModeEnabled, setTalkModeEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setSpeechEnabled(true);
      
      // Get and store available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          
          // Priority list of known good female voices by name patterns
          const femaleVoicePriorities = [
            'Google UK English Female',
            'Microsoft Zira',
            'Samantha',
            'Victoria',
            'Google US English Female',
            'Female',
            'English (Female)',
            'female'
          ];
          
          // Try to find a voice from our priority list
          let selectedFemaleVoice = null;
          
          // First try exact matches from our priority list
          for (const voiceName of femaleVoicePriorities) {
            const exactMatch = voices.find(voice => voice.name === voiceName);
            if (exactMatch) {
              selectedFemaleVoice = exactMatch;
              break;
            }
          }
          
          // If no exact match, try partial matches with our priority terms
          if (!selectedFemaleVoice) {
            for (const voiceName of femaleVoicePriorities) {
              const partialMatch = voices.find(voice => 
                voice.name.toLowerCase().includes(voiceName.toLowerCase()) && 
                voice.lang.includes('en')
              );
              if (partialMatch) {
                selectedFemaleVoice = partialMatch;
                break;
              }
            }
          }
          
          // If still no match, fall back to any voice with 'female' or similar in the name
          if (!selectedFemaleVoice) {
            selectedFemaleVoice = voices.find(voice => 
              (voice.name.toLowerCase().includes('female') || 
               voice.name.toLowerCase().includes('woman') || 
               voice.name.toLowerCase().includes('girl')) && 
              voice.lang.includes('en')
            );
          }
          
          // Last resort: just find any English voice
          if (!selectedFemaleVoice) {
            selectedFemaleVoice = voices.find(voice => voice.lang.includes('en'));
          }
          
          if (selectedFemaleVoice) {
            console.log("Selected voice:", selectedFemaleVoice.name);
            setSelectedVoice(selectedFemaleVoice);
          }
        }
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
    } else {
      setSpeechEnabled(false);
    }

    // Cleanup speech synthesis when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Also clean up any ongoing recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Update the effect to properly handle async function
  useEffect(() => {
    // Stop any current speech when switching modes
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Stop any current listening session
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Automatically start listening in talk mode
    if (talkModeEnabled) {
      const startListening = async () => {
        try {
          await startContinuousListening();
        } catch (error) {
          console.error("Error starting listening:", error);
        }
        
        // Play a welcome message in talk mode
        const lastBotMessage = [...messages].reverse().find(msg => msg.sender === 'bot');
        if (lastBotMessage) {
          setTimeout(() => {
            speakMessage(lastBotMessage.text, lastBotMessage.id, true);
          }, 500);
        }
      };
      
      startListening();
    }
  }, [talkModeEnabled]);

  const handleSendMessage = async (messageText: string) => {
    // Prevent empty messages or sending while already loading
    if (!messageText.trim() || isLoading) return;
  
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user" as const
    };

    // Clear inputs before API call to prevent duplicate submissions
    setInput("");
    setInterimTranscript("");
  
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
  
    try {
      // Send to Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a mental health assistant chatbot called MoodMind. ${
                    talkModeEnabled 
                      ? "You're having a voice conversation with the user, so keep responses conversational, warm and use natural language. Speak as if you are having a verbal conversation." 
                      : "Provide helpful, empathetic responses about mental health and wellbeing."
                  } 
                  ${!talkModeEnabled ? "Format your responses with proper markdown for readability. Include bullet points and headings where appropriate." : ""}
                  Keep responses concise (under 150 words) and focused on the user's question: ${messageText}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.8,
            topK: 40
          }
        })
      });
  
      const data = await response.json();
      
      // Error handling
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }
      
      // Extract response text safely
      let botResponseText = "I'm having trouble responding right now.";
      
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        botResponseText = data.candidates[0].content.parts[0].text;
      }
  
      // Add bot message
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: "bot",
        isPlaying: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // In talk mode, automatically speak the response
      if (talkModeEnabled && speechEnabled) {
        setTimeout(() => {
          speakMessage(botResponseText, botMessage.id, true);
        }, 300);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      
      // Auto-restart listening even on error
      if (talkModeEnabled) {
        setTimeout(() => {
          startContinuousListening();
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInputMessage = () => {
    handleSendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && input.trim()) {
      handleSendInputMessage();
    }
  };

  const handleQuestionButtonClick = (question: string) => {
    if (!isLoading) {
      handleSendMessage(question);
    }
  };

  // Text-to-speech functions
  const speakMessage = (text: string, messageId: number, autoResumeTalkMode = false) => {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // If in talk mode, temporarily stop listening to avoid feedback
    if (talkModeEnabled && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set the selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      // Get available voices and try to find a good female voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Victoria') || 
        voice.name.includes('Zira')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    // Set properties for a more subtle, cute female voice
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.2; // Higher pitch for more feminine sound
    utterance.volume = 0.9; // Slightly softer
    
    // Add a slight pause between sentences for more natural speaking
    text = text.replace(/\./g, '. ');
    text = text.replace(/\!/g, '! ');
    text = text.replace(/\?/g, '? ');
    utterance.text = text;
    
    // Set up event handlers
    utterance.onstart = () => {
      setMessages(messages.map(msg => 
        msg.id === messageId ? {...msg, isPlaying: true} : msg
      ));
    };
    
    utterance.onend = () => {
      setMessages(messages.map(msg => 
        msg.id === messageId ? {...msg, isPlaying: false} : msg
      ));
      speechSynthesisRef.current = null;
      
      // Always restart listening after speaking in talk mode
      if (talkModeEnabled) {
        setTimeout(() => {
          startContinuousListening();
        }, 300);
      }
    };
    
    // Store the utterance for pause/resume functionality
    speechSynthesisRef.current = utterance;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };
  
  const pauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  };
  
  const resumeSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };
  
  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;
      
      // Update all messages to not playing
      setMessages(messages.map(msg => ({...msg, isPlaying: false})));
      
      // If in talk mode, resume listening after stopping speech
      if (talkModeEnabled) {
        setTimeout(() => {
          startContinuousListening();
        }, 300);
      }
    }
  };

  // Voice input implementation
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice recognition.",
      });
      return;
    }

    setIsListening(true);
    
    // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      
      // In talk mode, automatically send the message
      if (talkModeEnabled) {
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 300);
      }
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    toast({
        title: "Voice Input Error",
        description: "There was a problem with voice recognition.",
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  // Add a function to check and request microphone permissions before starting voice recognition
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update the startContinuousListening function to be more stable
  const startContinuousListening = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Conversation Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      setTalkModeEnabled(false);
      return;
    }
    
    // Check microphone permissions first
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      setTalkModeEnabled(false);
      return;
    }
    
    // Don't start if already listening
    if (isListening) return;
    
    setIsListening(true);
    
    // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
    const recognition = new window.webkitSpeechRecognition();
    
    // Use longer continuous sessions with interim results
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Improve recognition accuracy
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3; // Get more alternatives for better accuracy
    
    // Set longer speech detection parameters
    // @ts-ignore - Custom property
    recognition.speechRecognitionList = ['the', 'a', 'an', 'I', 'you', 'we', 'they', 'my', 'your'];
    // @ts-ignore - Custom property
    recognition.speechRecognitionMinimumSpeechLength = 1; // Detect even short phrases
    
    // Track if we have collected any valid speech
    let hasCollectedSpeech = false;
    let lastSpeechTimestamp = Date.now();
    let currentSessionTranscript = "";
    
    recognition.onresult = (event: any) => {
      // Get the current transcript
      const results = Array.from(event.results);
      const currentTranscript = results
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      // Update that we've collected speech and timestamp
      hasCollectedSpeech = true;
      lastSpeechTimestamp = Date.now();
      currentSessionTranscript = currentTranscript;
      
      // Update the UI with interim results
      setInterimTranscript(currentTranscript);
      
      // Only process final results if we have a complete sentence and final result
      if (event.results[event.results.length - 1].isFinal) {
        // Make sure the transcript is meaningful and not just noise
        if (currentTranscript.trim().length > 3 && !isLoading) {
          // Submit the transcript after a short delay to allow for final adjustments
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }
          
          const timeout = setTimeout(() => {
            // Stop the current recognition to prevent duplicates
            recognition.stop();
            setIsListening(false);
            handleSendMessage(currentTranscript);
          }, 800); // Short delay to ensure we got the full sentence
          
          setTypingTimeout(timeout);
        }
      }
    };

    // Set up a separate timeout to detect silence
    const silenceTimeout = setTimeout(() => {
      // If we collected speech and then had silence, process it
      if (hasCollectedSpeech && currentSessionTranscript.trim().length > 3) {
        // Stop the current recognition session
        recognition.stop();
        
        // Process what we have
        handleSendMessage(currentSessionTranscript);
      } else if (isListening) {
        // If we didn't collect any useful speech after 8 seconds, just restart
        recognition.stop();
        // Don't immediately restart to prevent flickering
        setTimeout(() => {
          if (talkModeEnabled && !isLoading && !speechSynthesisRef.current) {
            startContinuousListening();
          }
        }, 500);
      }
    }, 5000); // 5 seconds of silence detection
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      
      // Only show toast for significant errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          title: "Voice Recognition Issue",
          description: "Having trouble hearing you. Please try again or check your microphone.",
          variant: "default"
        });
      }
      
      setIsListening(false);
      
      // Clear the silence timeout to prevent multiple submissions
      clearTimeout(silenceTimeout);
      
      // Don't automatically restart on error, let the user tap again
      // to prevent frustrating cycles of errors
    };
    
    recognition.onend = () => {
      // Clear the silence timeout
      clearTimeout(silenceTimeout);
      
      setIsListening(false);
      
      // Don't automatically restart listening to prevent flickering
      // Only restart if explicitly asked (by button press)
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      console.error("Recognition failed to start:", err);
      setIsListening(false);
    }
  };
  
  // Modify the forceStop function to prevent unintended submissions
  const forceStop = () => {
    // Clear typing timeout if it exists
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    
    // Stop speech if it's playing
    if (speechSynthesisRef.current) {
      stopSpeech();
    }
    
    // Stop listening if active
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  // Also update the toggle function to handle the async nature
  const toggleTalkMode = () => {
    setTalkModeEnabled(prev => !prev);
  };

  // Generate contextual question suggestions based on conversation
  const generateContextualQuestions = () => {
    // By default, show preset questions
    if (messages.length <= 2) {
      return presetQuestions;
    }
    
    // For demo purposes, return different questions based on message count
    // In a real app, you might use more sophisticated logic based on conversation content
    const messageCount = messages.length;
    
    if (messageCount % 3 === 0) {
      return [
        "Tell me more about that feeling",
        "How long have you felt this way?",
        "What helps when you feel like this?",
        "Would you like some coping strategies?"
      ];
    } else {
      return [
        "What's on your mind today?",  
        "How can I help you right now?",
        "Would you like to try a breathing exercise?",
        "Should we explore this further?"
      ];
    }
  };

  const currentQuestions = generateContextualQuestions();

  return (
    <section id="chatbot-demo" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">AI Support, Anytime You Need It</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our AI chatbot provides personalized support, tips, and guidance based on your mood and needs.
          </p>
        </div>
        
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium">MoodMind Assistant</h3>
              <p className="text-xs text-primary-100">Online • Always here to help</p>
            </div>
          </div>
            <div className="flex items-center space-x-2">
              {/* Mode toggle */}
              <div className="flex items-center mr-2">
                <div 
                  className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-full text-xs ${talkModeEnabled ? 'bg-white/20' : 'bg-transparent'}`}
                  onClick={toggleTalkMode}
                >
                  {talkModeEnabled ? (
                    <>
                      <Headphones className="h-3 w-3" />
                      <span>Talk Mode</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat Mode</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Speech toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className="text-white hover:bg-white/20"
              >
                {speechEnabled ? 
                  <Volume2 className="h-4 w-4" /> : 
                  <VolumeX className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
          
          {/* Talk mode badge & controls */}
          {talkModeEnabled && (
            <div className="bg-primary-50 p-3 text-center">
              <div className="flex justify-center mb-2">
                <Badge 
                  variant={isListening ? "destructive" : speechSynthesisRef.current ? "outline" : "secondary"}
                  className="text-md px-3 py-1"
                >
                  {isListening ? (
                    <><Mic className="h-4 w-4 mr-2 animate-pulse" /> Listening...</>
                  ) : speechSynthesisRef.current ? (
                    <><Volume2 className="h-4 w-4 mr-2 animate-pulse" /> Speaking...</>
                  ) : (
                    <><Headphones className="h-4 w-4 mr-2" /> Voice Conversation Mode</>
                  )}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600">
                {isListening ? "I'm listening to you..." : 
                 speechSynthesisRef.current ? "I'm responding to you..." : 
                 "Tap the button below to start talking"}
              </p>
            </div>
          )}
          
          {/* Chat display area */}
          <div 
            ref={chatContainerRef}
            className="h-80 p-4 overflow-y-auto bg-neutral-50"
          >
            {/* Always show all messages to maintain chat history */}
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : ''} mb-4`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="text-primary h-4 w-4" />
                  </div>
                )}
                
                <div className={`${
                  message.sender === 'user' 
                    ? 'bg-neutral-200' 
                    : 'bg-primary-100'
                  } rounded-lg p-3 max-w-xs`}
                >
                  {message.sender === 'user' ? (
                  <p className="text-sm">{message.text}</p>
                  ) : (
                    <div>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                      
                      {speechEnabled && message.sender === 'bot' && !talkModeEnabled && (
                        <div className="flex mt-2 pt-2 border-t border-primary-200/40 justify-end gap-1">
                          {message.isPlaying ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => pauseSpeech()}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => stopSpeech()}
                              >
                                <Square className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => speakMessage(message.text, message.id)}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="text-primary h-4 w-4" />
                </div>
                <div className="bg-primary-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick question buttons - hide in talk mode */}
          {!talkModeEnabled && (
          <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex flex-wrap gap-2">
            {currentQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuestionButtonClick(question)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-neutral-100 text-neutral-700"
              >
                {question}
              </Button>
            ))}
          </div>
          )}
          
          <div className="p-4 border-t">
            {/* Show input field in chat mode, talk button in talk mode */}
            {talkModeEnabled ? (
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={async () => {
                    // If already listening, stop and process what we have
                    if (isListening) {
                      forceStop();
                      
                      // If we have collected speech, process it
                      if (interimTranscript.trim().length > 3) {
                        handleSendMessage(interimTranscript);
                      }
                    } 
                    // If speaking, just stop speaking
                    else if (speechSynthesisRef.current) {
                      stopSpeech();
                    } 
                    // Start a new listening session
                    else {
                      setInterimTranscript("");
                      await startContinuousListening();
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full py-8 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : speechSynthesisRef.current 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-primary'
                  }`}
                >
                  {isListening ? (
                    <div className="flex flex-col items-center">
                      <Mic className="h-10 w-10 mb-2 animate-pulse" />
                      <div className="text-lg font-medium">I'm listening...</div>
                      {interimTranscript && (
                        <div className="text-sm mt-2 text-white/90 max-w-md overflow-hidden text-center">
                          "{interimTranscript}"
                        </div>
                      )}
                    </div>
                  ) : speechSynthesisRef.current ? (
                    <div className="flex flex-col items-center">
                      <Volume2 className="h-10 w-10 mb-2 animate-pulse" />
                      <div className="text-lg font-medium">Speaking...</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Mic className="h-10 w-10 mb-2" />
                      <div className="text-lg font-medium">Tap to start voice chat</div>
                    </div>
                  )}
                </Button>
              </div>
            ) : (
            <div className="flex">
              <Input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="rounded-l-full focus:ring-primary"
              />
              <Button 
                onClick={handleSendInputMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-r-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            )}
            
            <div className="flex mt-2 text-xs text-neutral-500 justify-between">
              <span className="flex items-center"><Lock className="h-3 w-3 mr-1" /> End-to-end encrypted</span>
              {!talkModeEnabled ? (
                <button 
                  onClick={isListening ? () => {} : startListening}
                  className={`hover:text-primary transition flex items-center ${isListening ? 'text-red-500 animate-pulse' : ''}`}
                  disabled={isLoading}
                >
                  {isListening ? 'Listening...' : 'Try voice input'} <Mic className="h-3 w-3 ml-1" />
                </button>
              ) : (
              <button 
                  onClick={toggleTalkMode}
                className="hover:text-primary transition flex items-center"
                  disabled={isLoading}
              >
                  Switch to text <MessageSquare className="h-3 w-3 ml-1" />
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotDemo;
