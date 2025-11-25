import React from 'react';
import FaceDetection from '../components/face-detection/FaceDetection';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FaceDetectionPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Facial Expression Analysis</h1>
        <p className="text-center mb-8 text-gray-600">
          Real-time facial landmark tracking and emotion detection using your webcam
        </p>
        
        <FaceDetection />
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your webcam feed is processed entirely in your browser</li>
            <li>The system detects 68 facial landmarks to track your expressions</li>
            <li>Machine learning models analyze these landmarks to identify emotions</li>
            <li>Real-time visualization shows detailed facial tracking</li>
            <li>No data is sent to any server - your privacy is protected</li>
          </ul>
          
          <div className="mt-6 p-4 bg-white rounded-lg">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                Facial landmark detection
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>
                Emotion recognition
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Confidence scoring
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                Performance metrics
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Customizable visualization
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Browser-based processing
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FaceDetectionPage; 