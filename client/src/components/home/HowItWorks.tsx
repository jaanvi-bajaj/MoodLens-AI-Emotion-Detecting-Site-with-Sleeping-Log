import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">How MoodMind Works</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Using MoodMind is simple, secure, and designed to fit seamlessly into your daily life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary-500 flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Download & Setup</h3>
            <p className="text-neutral-600">
              Download MoodMind from your app store, create an account, and set your privacy preferences.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary-500 flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Daily Check-ins</h3>
            <p className="text-neutral-600">
              Use the app for quick mood check-ins, journal entries, or take assessment tests as needed.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary-500 flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">Get Personalized Support</h3>
            <p className="text-neutral-600">
              Receive tailored recommendations, insights, and access AI support when you need it.
            </p>
          </div>
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto bg-neutral-50 rounded-xl p-6 md:p-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0">
              <h3 className="font-heading font-semibold text-2xl mb-4">Watch MoodMind in Action</h3>
              <p className="text-neutral-600 mb-6">
                See how easy it is to incorporate MoodMind into your daily routine and start your mental wellness journey.
              </p>
              <Button className="rounded-full flex items-center">
                <Play className="mr-2 h-5 w-5" /> Watch Demo Video
              </Button>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="aspect-w-16 aspect-h-9 bg-neutral-200 rounded-lg overflow-hidden shadow-md">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                    <Play className="text-primary h-10 w-10" />
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="MoodMind demo video" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
