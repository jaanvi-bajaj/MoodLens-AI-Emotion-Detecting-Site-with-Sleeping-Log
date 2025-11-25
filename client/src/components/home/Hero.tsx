import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for fixed header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Your Personal <span className="text-primary">AI Companion</span> for Mental Wellbeing
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            MoodMind uses AI to help you track emotions, improve wellbeing, and provide personalized support - all while keeping your data private and secure.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => scrollToSection('download')}
              className="bg-gradient-to-r from-primary to-secondary-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" /> Download Now
            </Button>
            <Button 
              onClick={() => scrollToSection('how-it-works')}
              variant="outline" 
              className="border border-primary-300 text-primary-700 rounded-full font-medium text-lg hover:bg-primary-50 w-full sm:w-auto justify-center"
              size="lg"
            >
              <Info className="mr-2 h-5 w-5" /> Learn More
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <img 
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80" 
            alt="MoodMind app on smartphone" 
            className="rounded-2xl shadow-2xl mx-auto max-w-full"
          />
          <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg">
            <span className="text-yellow-400 text-2xl"><i className="fas fa-smile"></i></span>
          </div>
          <div className="absolute top-1/4 -left-4 bg-white p-3 rounded-full shadow-lg">
            <span className="text-green-400 text-2xl"><i className="fas fa-heart"></i></span>
          </div>
          <div className="absolute bottom-1/4 -right-4 bg-white p-3 rounded-full shadow-lg">
            <span className="text-purple-400 text-2xl"><i className="fas fa-brain"></i></span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-neutral-100 to-transparent"></div>
    </section>
  );
};

export default Hero;
