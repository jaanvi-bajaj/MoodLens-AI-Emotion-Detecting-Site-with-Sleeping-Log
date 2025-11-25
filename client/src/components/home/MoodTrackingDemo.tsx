import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const EmotionDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center">
    <span 
      className={`w-2 h-2 rounded-full mr-2`} 
      style={{ backgroundColor: color }}
    ></span>
    <span className="text-neutral-700 font-medium">{label}</span>
  </div>
);

const MoodTrackingDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas responsive
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 250;
        drawChart();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawChart() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw chart background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const moods = [
        { value: 0.7, color: '#FFD166' },  // Happy
        { value: 0.5, color: '#A78BFA' },  // Neutral
        { value: 0.3, color: '#5E83BA' },  // Sad
        { value: 0.2, color: '#EF4444' },  // Stressed
        { value: 0.6, color: '#34D399' },  // Calm
        { value: 0.8, color: '#FFD166' },  // Happy
        { value: 0.7, color: '#34D399' }   // Calm
      ];
      
      // Chart dimensions
      const margin = 40;
      const width = canvas.width - 2 * margin;
      const height = canvas.height - 2 * margin;
      const barWidth = width / days.length * 0.6;
      const spacing = width / days.length - barWidth;
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(margin, margin);
      ctx.lineTo(margin, height + margin);
      ctx.lineTo(width + margin, height + margin);
      ctx.strokeStyle = '#E5E7EB';
      ctx.stroke();
      
      // Draw bars
      days.forEach((day, i) => {
        const x = margin + (barWidth + spacing) * i + spacing / 2;
        const barHeight = height * moods[i].value;
        const y = height + margin - barHeight;
        
        // Bar
        ctx.fillStyle = moods[i].color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Day label
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(day, x + barWidth / 2, height + margin + 20);
      });
      
      // Draw y-axis labels
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('Great', margin - 10, margin + 10);
      ctx.fillText('Good', margin - 10, margin + height * 0.25 + 5);
      ctx.fillText('Okay', margin - 10, margin + height * 0.5 + 5);
      ctx.fillText('Low', margin - 10, margin + height * 0.75 + 5);
      ctx.fillText('Bad', margin - 10, margin + height - 5);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section id="mood-tracking-demo" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Track Your Emotional Journey</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Visualize how your mood changes over time and gain insights into your emotional patterns.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
              <h3 className="font-heading font-semibold text-2xl mb-4">Your Mood History</h3>
              <p className="text-neutral-600 mb-6">
                MoodMind's analytics help you identify patterns, triggers, and progress in your emotional wellbeing journey.
              </p>
              
              <div className="space-y-4">
                <EmotionDot color="#FFD166" label="Happy moments" />
                <EmotionDot color="#5E83BA" label="Times of sadness" />
                <EmotionDot color="#EF4444" label="Stress periods" />
                <EmotionDot color="#34D399" label="Calm and relaxed" />
              </div>
              
              <Button className="mt-8 rounded-full" size="sm">
                Try Interactive Demo
              </Button>
            </div>
            
            <div className="md:w-1/2">
              <canvas 
                ref={canvasRef} 
                width="400" 
                height="250" 
                className="w-full" 
                aria-label="Mood tracking chart showing patterns over a week"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoodTrackingDemo;
