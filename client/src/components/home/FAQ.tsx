import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItemType = {
  question: string;
  answer: string;
};

const FAQ = () => {
  const faqItems: FAQItemType[] = [
    {
      question: "Is MoodMind a replacement for professional therapy?",
      answer: "No, MoodMind is not a replacement for professional mental health services. While our app provides tools for tracking emotions and offering coping strategies, it's designed to complement professional care, not replace it. If you're experiencing serious mental health concerns, please consult a licensed healthcare provider."
    },
    {
      question: "How accurate is the facial emotion recognition technology?",
      answer: "Our facial emotion recognition technology has been trained on diverse datasets and can detect the seven basic emotions with an accuracy rate of approximately 85-90%. However, accuracy may vary based on lighting conditions, camera quality, and individual differences in expressing emotions. The technology is continually improving with updates."
    },
    {
      question: "What happens to my data if I cancel my subscription?",
      answer: "If you cancel your subscription, you'll still have access to your data for 30 days, during which you can export it. After this period, all your personal data is permanently deleted from our servers. We don't retain any user data after account termination."
    },
    {
      question: "Does the app work offline?",
      answer: "Yes, many of MoodMind's core features work offline. You can journal, track your mood, and access previously downloaded resources without an internet connection. The app will sync your data when you're back online. However, the AI chatbot and some personalized recommendations require an internet connection."
    },
    {
      question: "Is MoodMind available in languages other than English?",
      answer: "Currently, MoodMind is available in English, Spanish, French, German, and Japanese. We're actively working on adding support for more languages. The facial emotion recognition feature works across all cultures and languages."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Find answers to common questions about MoodMind's features, privacy, and more.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-neutral-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
