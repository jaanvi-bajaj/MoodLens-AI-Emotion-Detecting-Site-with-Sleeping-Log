import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Lock, UserCheck, Sliders } from "lucide-react";

type PrivacyFeatureProps = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const PrivacyFeature = ({ icon, title, description }: PrivacyFeatureProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-5">
          {icon}
        </div>
        <h3 className="font-heading font-semibold text-xl mb-3">{title}</h3>
        <p className="text-neutral-600">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const PrivacySection = () => {
  const privacyFeatures = [
    {
      icon: <ShieldAlert className="text-primary h-6 w-6" />,
      title: "On-Device Processing",
      description: "Most data processing happens directly on your device. Facial expressions, voice data, and journal entries are analyzed locally without sending raw data to our servers."
    },
    {
      icon: <Lock className="text-primary h-6 w-6" />,
      title: "End-to-End Encryption",
      description: "All communication with our servers uses end-to-end encryption. Your data is encrypted before it leaves your device and can only be decrypted by you."
    },
    {
      icon: <UserCheck className="text-primary h-6 w-6" />,
      title: "No Data Selling",
      description: "We never sell your data to third parties. MoodMind is funded by subscriptions, not by monetizing your personal information."
    },
    {
      icon: <Sliders className="text-primary h-6 w-6" />,
      title: "Granular Privacy Controls",
      description: "You have complete control over what data is collected and how it's used. Adjust privacy settings anytime to match your comfort level."
    }
  ];

  return (
    <section id="privacy" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Your Privacy is Our Priority</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            We've built MoodMind with privacy-first principles to ensure your sensitive data stays secure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {privacyFeatures.map((feature, index) => (
            <PrivacyFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition">
            Read our complete privacy policy <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
