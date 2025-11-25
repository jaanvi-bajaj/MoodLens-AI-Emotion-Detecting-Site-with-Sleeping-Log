import { Button } from "@/components/ui/button";

const DownloadCTA = () => {
  return (
    <section id="download" className="py-16 bg-gradient-to-r from-primary to-secondary-500 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Start Your Mental Wellness Journey Today</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Download MoodMind now and take the first step toward better understanding your emotions and improving your wellbeing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Button 
            variant="secondary" 
            className="bg-white text-primary-700 rounded-full font-medium text-lg hover:bg-neutral-100 shadow-lg w-full sm:w-auto flex items-center"
            size="lg"
          >
            <i className="fab fa-apple text-2xl mr-3"></i>
            <div className="text-left">
              <span className="text-xs block">Download on the</span>
              <span className="font-semibold">App Store</span>
            </div>
          </Button>
          
          <Button 
            variant="secondary"
            className="bg-white text-primary-700 rounded-full font-medium text-lg hover:bg-neutral-100 shadow-lg w-full sm:w-auto flex items-center"
            size="lg"
          >
            <i className="fab fa-google-play text-2xl mr-3"></i>
            <div className="text-left">
              <span className="text-xs block">Get it on</span>
              <span className="font-semibold">Google Play</span>
            </div>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center">
          <div className="mb-6 sm:mb-0 sm:mr-8">
            <div className="flex items-center">
              <div className="flex">
                <i className="fas fa-star text-yellow-300"></i>
                <i className="fas fa-star text-yellow-300"></i>
                <i className="fas fa-star text-yellow-300"></i>
                <i className="fas fa-star text-yellow-300"></i>
                <i className="fas fa-star-half-alt text-yellow-300"></i>
              </div>
              <span className="ml-2 font-medium">4.8/5 (2,500+ reviews)</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <i className="fas fa-shield-alt mr-2"></i>
            <span>Secure & Privacy-Focused</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadCTA;
