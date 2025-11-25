import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  LineChart, 
  ClipboardCheck, 
  Flower, 
  BookOpen, 
  Bot,
  ArrowRight,
  Moon
} from "lucide-react";

type FeatureCardProps = {
  icon: JSX.Element;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
};

const FeatureCard = ({ icon, title, description, linkText, linkHref }: FeatureCardProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <Card className="feature-card bg-white transition duration-300 h-full">
      <CardContent className="p-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary-500 flex items-center justify-center mb-5">
          <div className="text-white text-2xl">
            {icon}
          </div>
        </div>
        <h3 className="font-heading font-semibold text-xl mb-3">{title}</h3>
        <p className="text-neutral-600 mb-5">
          {description}
        </p>
        <a 
          href={`#${linkHref}`} 
          onClick={(e) => { e.preventDefault(); scrollToSection(linkHref); }}
          className="text-primary font-medium inline-flex items-center"
        >
          {linkText} <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Facial Emotion Recognition",
      description: "AI detects emotions by analyzing your facial expressions in real-time, helping you understand your emotions without manual input.",
      linkText: "Learn more",
      linkHref: "how-it-works"
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Mood Tracking & History",
      description: "Visual dashboard to track mood patterns over time, allowing you to monitor emotional trends and identify triggers.",
      linkText: "See demo",
      linkHref: "mood-tracking-demo"
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: "Sleep Analysis & Improvement",
      description: "Track your sleep patterns and receive personalized recommendations to improve sleep quality and enhance mental wellbeing.",
      linkText: "Explore sleep insights",
      linkHref: "how-it-works"
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "Personalized Mental Health Tests",
      description: "Short, research-backed quizzes assess anxiety, depression, and stress levels, providing personalized insights.",
      linkText: "Try a sample",
      linkHref: "how-it-works"
    },
    {
      icon: <Flower className="w-6 h-6" />,
      title: "Therapeutic Recommendations",
      description: "Personalized exercises like mindfulness and breathing techniques based on your mood data to improve wellbeing.",
      linkText: "Explore exercises",
      linkHref: "how-it-works"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Daily Mood Journal",
      description: "Log daily feelings and track emotional patterns to promote self-awareness and emotional growth.",
      linkText: "View journal",
      linkHref: "how-it-works"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Chatbot Support",
      description: "Get instant emotional support, self-care tips, and motivational content whenever you need it.",
      linkText: "Chat with demo",
      linkHref: "chatbot-demo"
    }
  ];

  return (
    <section id="features" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Powerful AI Features</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            MoodMind combines cutting-edge AI technology with evidence-based mental health practices to help you thrive.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              linkText={feature.linkText}
              linkHref={feature.linkHref}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
