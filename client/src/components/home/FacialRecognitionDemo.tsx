import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

const FacialRecognitionDemo = () => {
  return (
    <section id="facial-recognition-demo" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
              <div className="bg-white rounded-xl shadow-lg p-4 relative">
                <img 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Facial recognition demo" 
                  className="rounded-lg w-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-primary border-dashed rounded-lg animate-pulse"></div>
                </div>
                <div className="absolute right-6 bottom-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="text-yellow-400 font-medium">😊 Happy (87%)</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="font-heading font-semibold text-2xl mb-4">AI-Powered Emotion Detection</h3>
              <p className="text-neutral-600 mb-6">
                Our facial recognition technology can detect your emotions in real-time, making emotion tracking effortless.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>Detects 7 core emotions with high accuracy</span>
                </li>
                <li className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>Works in various lighting conditions</span>
                </li>
                <li className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>Privacy-focused with on-device processing</span>
                </li>
                <li className="flex items-start">
                  <div className="text-primary mt-1 mr-3">
                    <Check className="h-5 w-5" />
                  </div>
                  <span>No images stored or transmitted</span>
                </li>
              </ul>
              
              <Link href="/emotion-detection">
                <Button className="rounded-full">
                  Try With Your Camera
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FacialRecognitionDemo;
