import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import MoodTrackingDemo from "@/components/home/MoodTrackingDemo";
import FacialRecognitionDemo from "@/components/home/FacialRecognitionDemo";
import HowItWorks from "@/components/home/HowItWorks";
import ChatbotDemo from "@/components/home/ChatbotDemo";
import PrivacySection from "@/components/home/PrivacySection";
import FAQ from "@/components/home/FAQ";
import DownloadCTA from "@/components/home/DownloadCTA";
import ContactSection from "@/components/home/ContactSection";
import Newsletter from "@/components/home/Newsletter";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <MoodTrackingDemo />
        <FacialRecognitionDemo />
        <HowItWorks />
        <ChatbotDemo />
        <PrivacySection />
        <FAQ />
        <DownloadCTA />
        <ContactSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
