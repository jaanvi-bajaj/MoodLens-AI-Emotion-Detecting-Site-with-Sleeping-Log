import React, { useEffect, useRef, useState } from 'react';
import { Camera, Smile, Frown, Meh, Clock, Users, Calendar, Timer, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmotionData {
  emotion: string;
  confidence: number;
  gender: string;
  age: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AnalysisSummary {
  mostFrequentEmotion: string;
  emotionDistribution: { [key: string]: number };
  averageConfidence: number;
  totalFacesDetected: number;
}

export function EmotionDetection() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [is5SecondMode, setIs5SecondMode] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [currentGender, setCurrentGender] = useState<string | null>(null);
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<EmotionData[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [liveStats, setLiveStats] = useState<{
    totalFrames: number;
    detectionRate: number;
    lastUpdate: Date;
  }>({
    totalFrames: 0,
    detectionRate: 0,
    lastUpdate: new Date()
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedTime = useRef(Date.now());
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection to our Python server
    const ws = new WebSocket('ws://localhost:5001/ws');
    websocketRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionError(null);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionError("Connection to server closed");
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionError("Could not connect to server. Please make sure the server is running.");
    };
    
    ws.onmessage = (event) => {
      try {
        console.log("WebSocket message received:", event.data);

        const data = JSON.parse(event.data);
        if (data.type === 'emotion-results') {
          console.log("Parsed results:", data.results);

          const predictions = data.results;
          const hasDetections = predictions && predictions.length > 0;
          updateLiveStats(hasDetections);
          
          if (predictions && predictions.length > 0) {
            // Take the first face detected
            const face = predictions[0];
            setCurrentEmotion(face.emotion);
            setConfidenceScore(face.confidence || 0);
            setCurrentGender(face.gender);
            setCurrentAge(face.age);
            setDetectedFaces(predictions);
            
            // If the server returns a processed frame with drawings
            if (data.processed_frame) {
              setProcessedImageSrc(`data:image/jpeg;base64,${data.processed_frame}`);
            }
          } else {
            setCurrentEmotion(null);
            setConfidenceScore(0);
            setCurrentGender(null);
            setCurrentAge(null);
            setDetectedFaces([]);
          }
        } else if (data.type === 'error') {
          console.error("Server error:", data.message);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ type: 'stop-emotion-detection' }));
        websocketRef.current.close();
      }
      setIsCameraOn(false);
      resetAnalysisState();
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Reinitialize WebSocket connection
        const ws = new WebSocket('ws://localhost:5001/ws');
        websocketRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connection re-established');
          setConnectionError(null);
          ws.send(JSON.stringify({ type: 'start-emotion-detection' }));
          startCapturing();
          setIsCameraOn(true);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          setConnectionError("Connection to server closed");
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionError("Could not connect to server. Please make sure the server is running.");
        };

        ws.onmessage = (event) => {
          try {
            console.log("WebSocket message received:", event.data);

            const data = JSON.parse(event.data);
            if (data.type === 'emotion-results') {
              console.log("Parsed results:", data.results);

              const predictions = data.results;
              if (predictions && predictions.length > 0) {
                const face = predictions[0];
                setCurrentEmotion(face.emotion);
                setConfidenceScore(face.confidence || 0);
                setCurrentGender(face.gender);
                setCurrentAge(face.age);
                setDetectedFaces(predictions);
                
                if (data.processed_frame) {
                  setProcessedImageSrc(`data:image/jpeg;base64,${data.processed_frame}`);
                }
              } else {
                setCurrentEmotion(null);
                setConfidenceScore(0);
                setCurrentGender(null);
                setCurrentAge(null);
                setDetectedFaces([]);
              }
            } else if (data.type === 'error') {
              console.error("Server error:", data.message);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please ensure you have granted permission.');
      }
    }
  };
  
  const startCapturing = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const captureFrame = async () => {
      if (!videoRef.current || !canvasRef.current || 
          !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;
      
      // Limit frame rate to 5 FPS to avoid overwhelming the server
      const now = Date.now();
      if (now - lastProcessedTime.current < 200) { // 200ms = 5 FPS
        animationRef.current = requestAnimationFrame(captureFrame);
        return;
      }
      
      if (isProcessing) {
        animationRef.current = requestAnimationFrame(captureFrame);
        return;
      }
      
      try {
        setIsProcessing(true);
        lastProcessedTime.current = now;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        const base64Frame = imageData.split(',')[1];
        
        console.log('Sending frame to server...');
        websocketRef.current.send(JSON.stringify({
          type: 'frame',
          data: base64Frame,
          timestamp: now
        }));
        
      } catch (error) {
        console.error('Error capturing/sending frame:', error);
      } finally {
        setIsProcessing(false);
        animationRef.current = requestAnimationFrame(captureFrame);
      }
    };
    
    animationRef.current = requestAnimationFrame(captureFrame);
  };

  const resetAnalysisState = () => {
    setCurrentEmotion(null);
    setConfidenceScore(0);
    setCurrentGender(null);
    setCurrentAge(null);
    setProcessedImageSrc(null);
    setDetectedFaces([]);
    setAnalysisProgress(0);
    setIs5SecondMode(false);
    setAnalysisSummary(null);
  };

  // New method to process analysis results
  const processAnalysisResults = (faces: EmotionData[]): AnalysisSummary => {
    if (faces.length === 0) {
      return {
        mostFrequentEmotion: 'No faces detected',
        emotionDistribution: {},
        averageConfidence: 0,
        totalFacesDetected: 0
      };
    }

    const emotionCounts: { [key: string]: number } = {};
    let totalConfidence = 0;

    faces.forEach(face => {
      const emotion = face.emotion.toLowerCase();
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalConfidence += face.confidence;
    });

    const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    return {
      mostFrequentEmotion,
      emotionDistribution: emotionCounts,
      averageConfidence: totalConfidence / faces.length,
      totalFacesDetected: faces.length
    };
  };

  const start5SecondAnalysis = async () => {
    if (is5SecondMode) return;

    // Reset previous analysis data
    setAnalysisSummary(null);

    // If camera is not on, turn it on first
    if (!isCameraOn) {
      await toggleCamera();
    }

    setIs5SecondMode(true);
    setAnalysisProgress(0);

    // Temporary array to collect faces during analysis
    const collectedFaces: EmotionData[] = [];

    // Start a timer to track 5-second progress
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // convert to seconds
      const progress = Math.min((elapsedTime / 5) * 100, 100);
      setAnalysisProgress(progress);

      // Collect faces during analysis
      if (detectedFaces.length > 0) {
        collectedFaces.push(...detectedFaces);
      }

      if (elapsedTime >= 5) {
        // Process analysis results
        const analysisSummary = processAnalysisResults(collectedFaces);
        setAnalysisSummary(analysisSummary);
        
        stop5SecondAnalysis();
      }
    }, 100);
  };

  const stop5SecondAnalysis = () => {
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Send stop signal to the server
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ type: 'stop-emotion-detection' }));
    }

    // Reset 5-second mode
    setIs5SecondMode(false);
    setAnalysisProgress(0);

    // Always turn off camera after 5-second analysis
    toggleCamera();
  };

  // Add this function to update live stats
  const updateLiveStats = (hasDetection: boolean) => {
    setLiveStats(prev => ({
      totalFrames: prev.totalFrames + 1,
      detectionRate: ((prev.detectionRate * prev.totalFrames) + (hasDetection ? 1 : 0)) / (prev.totalFrames + 1),
      lastUpdate: new Date()
    }));
  };

  // Add this function to render live stats
  const renderLiveStats = () => {
    if (!isCameraOn) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Live Detection Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Total Frames</p>
            <p className="text-xl font-bold">{liveStats.totalFrames}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Detection Rate</p>
            <p className="text-xl font-bold">{(liveStats.detectionRate * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Last Update</p>
            <p className="text-sm">{liveStats.lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    );
  };

  // Modify the 5-second analysis display
  const renderAnalysisSummary = () => {
    if (!analysisSummary) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          5-Second Analysis Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-lg mb-2">Primary Emotion</h4>
            <div className="flex items-center space-x-2">
              {getEmotionIcon()}
              <span className="text-2xl font-bold capitalize">
                {analysisSummary.mostFrequentEmotion}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-lg mb-2">Detection Quality</h4>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span>Confidence:</span>
                <span className="font-bold">
                  {(analysisSummary.averageConfidence * 100).toFixed(1)}%
                </span>
              </p>
              <p className="flex justify-between">
                <span>Total Detections:</span>
                <span className="font-bold">{analysisSummary.totalFacesDetected}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm col-span-2">
            <h4 className="font-medium text-lg mb-2">Emotion Distribution</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysisSummary.emotionDistribution).map(([emotion, count]) => (
                <div key={emotion} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="capitalize">{emotion}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getEmotionIcon = () => {
    if (!currentEmotion) return <Clock className="h-5 w-5 text-neutral-400" />;
    
    switch (currentEmotion.toLowerCase()) {
      case 'happy':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'sad':
      case 'angry':
      case 'fear':
      case 'disgust':
        return <Frown className="h-5 w-5 text-red-500" />;
      case 'neutral':
      case 'surprise':
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary text-white p-4">
        <h2 className="font-medium flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Facial Expression Analysis
        </h2>
      </div>
      
      <div className="p-4">
        <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden relative">
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <Camera className="h-12 w-12 text-neutral-400 mb-3" />
              <p className="text-neutral-500">Camera is turned off</p>
              {connectionError && (
                <p className="text-red-500 text-sm mt-2 text-center px-4">{connectionError}</p>
              )}
            </div>
          )}
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn || processedImageSrc ? 'hidden' : ''}`}
          />
          {processedImageSrc && (
            <img 
              src={processedImageSrc} 
              alt="Processed video feed" 
              className="w-full h-full object-cover"
            />
          )}
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full opacity-0"
          />
          
          {is5SecondMode && (
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-2">
              <div 
                className="h-1 bg-blue-500" 
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between">
          <div className="flex gap-2 w-full">
            <Button 
              onClick={toggleCamera}
              variant={isCameraOn ? "destructive" : "default"}
              className="flex-1"
            >
              {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            </Button>
            
            <Button 
              onClick={start5SecondAnalysis}
              variant="secondary"
              className="flex-1 flex items-center"
              disabled={is5SecondMode}
            >
              <Timer className="h-4 w-4 mr-2" />
              5-Second Analysis
            </Button>
          </div>
          
          {currentEmotion && (
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-blue-50 p-2 rounded-lg w-full">
                {getEmotionIcon()}
                <div className="ml-2">
                  <div className="flex items-center">
                    <p className="font-medium capitalize">{currentEmotion}</p>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 ml-2">
                      {Math.round(confidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {currentGender && (
                <div className="flex items-center bg-purple-50 p-2 rounded-lg w-full">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div className="ml-2">
                    <p className="font-medium">{currentGender}</p>
                  </div>
                </div>
              )}
              
              {currentAge !== null && (
                <div className="flex items-center bg-amber-50 p-2 rounded-lg w-full">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  <div className="ml-2">
                    <p className="font-medium">Age: {currentAge}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Add live stats */}
        {renderLiveStats()}
        
        {/* Render enhanced analysis summary */}
        {renderAnalysisSummary()}
      </div>
    </div>
  );
}