import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface EmotionData {
  emotion: string;
  probability: number;
}

const FaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [showLocalModelOption, setShowLocalModelOption] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading face detection models...');
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showFaceMesh, setShowFaceMesh] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showFps, setShowFps] = useState(true);
  const [showEmotions, setShowEmotions] = useState(true);
  const [detectionsPerSecond, setDetectionsPerSecond] = useState(0);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);

  // Function to manually download and install models
  const downloadAndInstallModels = () => {
    // Direct download links to the models
    const modelUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    const modelFiles = [
      { name: 'Tiny Face Detector', files: [
        `${modelUrl}/tiny_face_detector_model-shard1`,
        `${modelUrl}/tiny_face_detector_model-weights_manifest.json`
      ]},
      { name: 'Face Landmark', files: [
        `${modelUrl}/face_landmark_68_model-shard1`,
        `${modelUrl}/face_landmark_68_model-weights_manifest.json`
      ]},
      { name: 'Face Expression', files: [
        `${modelUrl}/face_expression_model-shard1`,
        `${modelUrl}/face_expression_model-weights_manifest.json`
      ]}
    ];
    
    // Open direct download links
    modelFiles.forEach(model => {
      model.files.forEach(file => {
        window.open(file, '_blank');
      });
    });
    
    setLoadingMessage(`
      Model files could not be loaded automatically.
      Please save each file that was opened in a new tab.
      Create a folder called 'models' in your project's public directory and place all downloaded files there.
      Then refresh this page to try again.
    `);
  };

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      // Define multiple potential sources for model files
      const MODEL_URLS = [
        'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
        'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
        '/models' // Try local models as last resort
      ];
      
      let modelsLoaded = false;
      
      // Try each source until one works
      for (const MODEL_URL of MODEL_URLS) {
        if (modelsLoaded) break;
        
        try {
          setLoadingMessage(`Trying to load models from: ${MODEL_URL}`);
          
          // Start loading models - show progress in UI
          setLoadingMessage('Loading face detector...');
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          
          setLoadingMessage('Loading facial landmarks model...');
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          
          setLoadingMessage('Loading emotion detection model...');
          await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
          
          // If we get here, all models loaded successfully
          setLoadingMessage('Models loaded! Starting camera...');
          setIsModelLoaded(true);
          console.log(`All face-api.js models loaded successfully from ${MODEL_URL}`);
          modelsLoaded = true;
          startVideo();
        } catch (error) {
          console.error(`Error loading models from ${MODEL_URL}:`, error);
          // Continue to the next source
        }
      }
      
      // If no sources worked, show manual installation option
      if (!modelsLoaded) {
        const errorMessage = 'Failed to load models from all sources. You may need to download them manually.';
        console.error(errorMessage);
        setLoadingMessage(errorMessage);
        setShowLocalModelOption(true);
      }
    };
    
    // Load models when component mounts
    loadModels();
    
    // Cleanup function to handle component unmount
    return () => {
      // Stop webcam when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const mediaStream = videoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Function to start the webcam video stream
  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accessing webcam:', err);
          setLoadingMessage(`Camera error: ${err.message}`);
        });
    } else {
      setLoadingMessage('Your browser does not support webcam access');
    }
  };

  // Returns a color based on the emotion
  const getEmotionColor = (emotion: string): string => {
    const colorMap: {[key: string]: string} = {
      neutral: '#aaaaaa',
      happy: '#ffd700',
      sad: '#1e90ff',
      angry: '#ff0000',
      fearful: '#800080',
      disgusted: '#008000',
      surprised: '#ff69b4'
    };
    
    return colorMap[emotion.toLowerCase()] || '#ffffff';
  };

  // Format emotion probability for display
  const formatProbability = (prob: number): string => {
    return `${Math.round(prob * 100)}%`;
  };

  // Get dominant emotion from expressions
  const getDominantEmotion = (expressions: faceapi.FaceExpressions): { emotion: string, probability: number } => {
    let dominantEmotion = '';
    let highestProbability = 0;
    
    Object.entries(expressions).forEach(([emotion, probability]) => {
      if (probability > highestProbability) {
        dominantEmotion = emotion;
        highestProbability = probability;
      }
    });
    
    return { 
      emotion: dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1), 
      probability: highestProbability 
    };
  };

  // Handle landmark and emotion detection
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    // Wait for video to be ready
    const checkVideoReady = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        startLandmarkDetection();
      } else {
        // Keep checking until video is ready
        setTimeout(checkVideoReady, 100);
      }
    };

    checkVideoReady();

    function startLandmarkDetection() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;
      
      // Set up FPS counter
      let frameCount = 0;
      let lastFpsUpdate = Date.now();
      
      // Continuous detection and drawing at max frame rate
      let animationFrame: number;
      const detectAndDraw = async () => {
        if (!video || video.paused || video.ended || !canvas) {
          requestAnimationFrame(detectAndDraw);
          return;
        }
        
        try {
          // Match canvas to video size
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
            faceapi.matchDimensions(canvas, displaySize);
          }
          
          // Detect faces with landmarks and expressions
          const detections = await faceapi.detectAllFaces(
            video, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
          )
            .withFaceLandmarks()
            .withFaceExpressions();
          
          // Clear the canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            requestAnimationFrame(detectAndDraw);
            return;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Update detection count for UI
          setDetectionCount(detections.length);
          
          // Update emotion data for UI display
          const newEmotionData = detections.map(detection => {
            const dominant = getDominantEmotion(detection.expressions);
            return {
              emotion: dominant.emotion,
              probability: dominant.probability
            };
          });
          
          setEmotionData(newEmotionData);
          
          // Emit custom event with emotion data if available
          if (newEmotionData.length > 0) {
            const dominantEmotion = newEmotionData[0];
            const emotionEvent = new CustomEvent('emotionDetected', {
              detail: {
                emotion: dominantEmotion.emotion,
                probability: dominantEmotion.probability
              }
            });
            window.dispatchEvent(emotionEvent);
          }
          
          // Draw each detection
          detections.forEach((detection, index) => {
            const box = detection.detection.box;
            const dominantEmotion = getDominantEmotion(detection.expressions);
            const emotionColor = getEmotionColor(dominantEmotion.emotion.toLowerCase());
            
            // Draw face box if enabled with emotion color
            if (showBoxes) {
              ctx.strokeStyle = emotionColor;
              ctx.lineWidth = 2;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
            
            // Draw face landmarks if enabled
            if (showLandmarks) {
              // Get landmarks
              const landmarks = detection.landmarks;
              const positions = landmarks.positions;
              
              // Draw all landmark points
              ctx.fillStyle = '#ffffff';
              positions.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
              });
              
              // Draw face mesh if enabled
              if (showFaceMesh) {
                // Draw jawline
                ctx.strokeStyle = '#0000ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                landmarks.getJawOutline().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                
                // Draw left eyebrow
                ctx.strokeStyle = '#ff00ff';
                ctx.beginPath();
                landmarks.getLeftEyeBrow().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                
                // Draw right eyebrow
                ctx.beginPath();
                landmarks.getRightEyeBrow().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                
                // Draw nose
                ctx.strokeStyle = '#ffff00';
                ctx.beginPath();
                landmarks.getNose().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                
                // Draw left eye
                ctx.strokeStyle = '#00ffff';
                ctx.beginPath();
                landmarks.getLeftEye().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.closePath();
                ctx.stroke();
                
                // Draw right eye
                ctx.beginPath();
                landmarks.getRightEye().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.closePath();
                ctx.stroke();
                
                // Draw mouth
                ctx.strokeStyle = '#ff0000';
                ctx.beginPath();
                landmarks.getMouth().forEach((point, i) => {
                  if (i === 0) ctx.moveTo(point.x, point.y);
                  else ctx.lineTo(point.x, point.y);
                });
                ctx.closePath();
                ctx.stroke();
              }
            }
            
            // Draw emotion label if enabled
            if (showEmotions) {
              // Background for emotion label
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.fillRect(box.x, box.y - 30, box.width, 30);
              
              // Emotion text
              ctx.fillStyle = emotionColor;
              ctx.font = '16px Arial';
              ctx.fillText(
                `${dominantEmotion.emotion} (${formatProbability(dominantEmotion.probability)})`, 
                box.x + 5, 
                box.y - 10
              );
            }
          });
          
          // Calculate and display FPS if enabled
          if (showFps) {
            frameCount++;
            const now = Date.now();
            const elapsed = now - lastFpsUpdate;
            
            // Update FPS every second
            if (elapsed > 1000) {
              const fps = frameCount / (elapsed / 1000);
              setDetectionsPerSecond(Math.round(fps));
              frameCount = 0;
              lastFpsUpdate = now;
            }
            
            // Draw FPS counter
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(10, 10, 200, 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText(`FPS: ${detectionsPerSecond} | Faces: ${detections.length}`, 20, 30);
          }
          
          // Show error message if any
          if (detectionError) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(10, 50, canvas.width - 20, 30);
            
            ctx.fillStyle = '#ff6666';
            ctx.font = '16px Arial';
            ctx.fillText(detectionError, 20, 70);
          }
        } catch (error) {
          console.error('Detection error:', error);
          setDetectionError(`Detection error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Continue the loop
        animationFrame = requestAnimationFrame(detectAndDraw);
      };
      
      // Start the detection loop
      detectAndDraw();
      
      // Cleanup function
      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isModelLoaded, showLandmarks, showFaceMesh, showBoxes, showFps, showEmotions, detectionsPerSecond, detectionError]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          onPlay={() => console.log('Video is playing')}
        />
        
        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Loading indicator */}
        {!isModelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <div className="text-lg text-center max-w-md">{loadingMessage}</div>
            
            {showLocalModelOption && (
              <div className="flex flex-col items-center mt-4">
                <p className="text-sm text-center mb-2">
                  Unable to load models from CDN. You can download them manually:
                </p>
                <button
                  onClick={downloadAndInstallModels}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download Model Files
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Controls */}
      {isModelLoaded && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Facial Analysis</h3>
          <p className="text-sm text-gray-600 mb-2">
            Detected faces: {detectionCount}
            {showFps && ` | FPS: ${detectionsPerSecond}`}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLandmarks"
                checked={showLandmarks}
                onChange={() => setShowLandmarks(!showLandmarks)}
                className="mr-2"
              />
              <label htmlFor="showLandmarks" className="text-sm">Points</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showFaceMesh" 
                checked={showFaceMesh}
                onChange={() => setShowFaceMesh(!showFaceMesh)}
                className="mr-2"
              />
              <label htmlFor="showFaceMesh" className="text-sm">Mesh</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showBoxes"
                checked={showBoxes}
                onChange={() => setShowBoxes(!showBoxes)}
                className="mr-2"
              />
              <label htmlFor="showBoxes" className="text-sm">Boxes</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showEmotions"
                checked={showEmotions}
                onChange={() => setShowEmotions(!showEmotions)}
                className="mr-2"
              />
              <label htmlFor="showEmotions" className="text-sm">Emotions</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showFps"
                checked={showFps}
                onChange={() => setShowFps(!showFps)}
                className="mr-2"
              />
              <label htmlFor="showFps" className="text-sm">FPS</label>
            </div>
          </div>
          
          {/* Emotion Results */}
          {emotionData.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Detected Emotions:</h4>
              <div className="space-y-2">
                {emotionData.map((data, index) => (
                  <div 
                    key={index} 
                    className="p-2 bg-gray-100 rounded flex justify-between items-center"
                    style={{ borderLeft: `4px solid ${getEmotionColor(data.emotion.toLowerCase())}` }}
                  >
                    <div>
                      <span className="font-medium">Person {index + 1}:</span> {data.emotion}
                    </div>
                    <div className="text-gray-600">
                      Confidence: {formatProbability(data.probability)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm">
            <p className="text-gray-600">
              This facial analysis detects both 68 facial landmarks and emotions in real-time.
              The box color indicates the detected emotion.
            </p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {detectionError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Detection Issue:</h3>
          <p>{detectionError}</p>
          <p className="mt-2 text-sm">
            Try adjusting your lighting, position, or camera angle.
          </p>
        </div>
      )}
    </div>
  );
};

export default FaceDetection; 