import React, { useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Bed, Clock, Calendar, Star, Info, Eye, PieChart, BadgeAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Define type for sleep entry
interface SleepEntry {
  id: number;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: number; // 1-10 rating
  notes: string;
  sleepScore: number; // calculated score
}

// Mock data for demonstration
const mockSleepData: SleepEntry[] = [
  { 
    id: 1, 
    date: '2023-06-01', 
    bedTime: '23:00', 
    wakeTime: '07:00', 
    duration: 8, 
    quality: 8, 
    notes: 'Read before bed, felt refreshed',
    sleepScore: 85
  },
  { 
    id: 2, 
    date: '2023-06-02', 
    bedTime: '23:30', 
    wakeTime: '06:30', 
    duration: 7, 
    quality: 6, 
    notes: 'Woke up once during night',
    sleepScore: 70
  },
  { 
    id: 3, 
    date: '2023-06-03', 
    bedTime: '00:15', 
    wakeTime: '07:15', 
    duration: 7, 
    quality: 5, 
    notes: 'Used phone before bed',
    sleepScore: 65
  },
  { 
    id: 4, 
    date: '2023-06-04', 
    bedTime: '22:45', 
    wakeTime: '06:45', 
    duration: 8, 
    quality: 9, 
    notes: 'Meditated before sleep',
    sleepScore: 90
  },
  { 
    id: 5, 
    date: '2023-06-05', 
    bedTime: '23:15', 
    wakeTime: '07:30', 
    duration: 8.25, 
    quality: 7, 
    notes: 'Normal night',
    sleepScore: 75
  },
  { 
    id: 6, 
    date: '2023-06-06', 
    bedTime: '22:30', 
    wakeTime: '06:15', 
    duration: 7.75, 
    quality: 8, 
    notes: 'Used sleep mask',
    sleepScore: 82
  },
  { 
    id: 7, 
    date: '2023-06-07', 
    bedTime: '23:45', 
    wakeTime: '07:45', 
    duration: 8, 
    quality: 7, 
    notes: 'Slightly restless',
    sleepScore: 78
  }
];

// Calculate sleep duration in hours:minutes format
const calculateDuration = (bedTime: string, wakeTime: string): string => {
  const [bedHour, bedMinute] = bedTime.split(':').map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
  
  let durationHours = wakeHour - bedHour;
  let durationMinutes = wakeMinute - bedMinute;
  
  // Adjust for next day
  if (durationHours < 0) {
    durationHours += 24;
  }
  
  // Adjust minutes
  if (durationMinutes < 0) {
    durationHours -= 1;
    durationMinutes += 60;
  }
  
  return `${durationHours}h ${durationMinutes}m`;
};

// Function to generate sleep recommendations based on data
const generateRecommendations = (entries: SleepEntry[]): string[] => {
  if (entries.length === 0) return ["Start tracking your sleep to get personalized recommendations"];
  
  const recommendations: string[] = [];
  
  // Calculate averages
  const avgDuration = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
  const avgQuality = entries.reduce((sum, entry) => sum + entry.quality, 0) / entries.length;
  
  // Check duration
  if (avgDuration < 7) {
    recommendations.push("Try to increase your sleep duration. Aim for 7-9 hours of sleep each night.");
  } else if (avgDuration > 9) {
    recommendations.push("You may be oversleeping. Try to maintain a more consistent sleep schedule.");
  }
  
  // Check quality
  if (avgQuality < 6) {
    recommendations.push("Your sleep quality could be improved. Consider creating a relaxing bedtime routine.");
    recommendations.push("Limit screen time 1-2 hours before bed to improve sleep quality.");
    recommendations.push("Make sure your bedroom is dark, quiet, and at a comfortable temperature.");
  }
  
  // Check consistency
  const bedTimes = entries.map(entry => {
    const [hours, minutes] = entry.bedTime.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  const maxBedTime = Math.max(...bedTimes);
  const minBedTime = Math.min(...bedTimes);
  
  if (maxBedTime - minBedTime > 90) {
    recommendations.push("Your bedtime varies considerably. Try to maintain a more consistent sleep schedule.");
  }
  
  // Add general recommendations if we don't have many specific ones
  if (recommendations.length < 3) {
    recommendations.push("Practice relaxation techniques like deep breathing before bed.");
    recommendations.push("Exercise regularly, but avoid intense workouts close to bedtime.");
    recommendations.push("Create a comfortable sleep environment with minimal light and noise.");
    recommendations.push("Avoid caffeine and large meals in the evening.");
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

const SleepTrackerPage: React.FC = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(mockSleepData);
  const [newEntry, setNewEntry] = useState<Omit<SleepEntry, 'id' | 'duration' | 'sleepScore'>>({
    date: new Date().toISOString().split('T')[0],
    bedTime: '23:00',
    wakeTime: '07:00',
    quality: 7,
    notes: ''
  });
  
  // Calculate average sleep score
  const avgSleepScore = sleepEntries.length > 0 
    ? Math.round(sleepEntries.reduce((sum, entry) => sum + entry.sleepScore, 0) / sleepEntries.length) 
    : 0;
  
  // Get sleep recommendations
  const recommendations = generateRecommendations(sleepEntries);

  // Calculate duration for new entry
  const calculateNewEntryDuration = (): number => {
    const [bedHour, bedMinute] = newEntry.bedTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = newEntry.wakeTime.split(':').map(Number);
    
    let durationHours = wakeHour - bedHour;
    let durationMinutes = wakeMinute - bedMinute;
    
    // Adjust for next day
    if (durationHours < 0) {
      durationHours += 24;
    }
    
    // Adjust minutes
    if (durationMinutes < 0) {
      durationHours -= 1;
      durationMinutes += 60;
    }
    
    return parseFloat((durationHours + durationMinutes / 60).toFixed(2));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = calculateNewEntryDuration();
    
    // Calculate sleep score - simple algorithm for demo
    // 40% duration + 60% quality
    const durationScore = Math.min(100, Math.max(0, ((duration - 4) / 6) * 100));
    const qualityScore = (newEntry.quality / 10) * 100;
    const sleepScore = Math.round(durationScore * 0.4 + qualityScore * 0.6);
    
    const newSleepEntry: SleepEntry = {
      id: Date.now(),
      ...newEntry,
      duration,
      sleepScore
    };
    
    setSleepEntries([...sleepEntries, newSleepEntry]);
    
    // Reset form
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      bedTime: '23:00',
      wakeTime: '07:00',
      quality: 7,
      notes: ''
    });
  };
  
  // Format data for charts
  const chartData = sleepEntries.map(entry => ({
    date: entry.date.substring(5), // Remove year for cleaner display
    duration: entry.duration,
    quality: entry.quality,
    score: entry.sleepScore
  }));
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Sleep Tracker & Analysis</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track your sleep patterns, visualize trends, and get personalized recommendations to improve your sleep quality.
            </p>
          </div>
          
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="log-sleep">Log Sleep</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sleep Score Card */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Sleep Score
                    </CardTitle>
                    <CardDescription>
                      Your overall sleep health score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-5xl font-bold">{avgSleepScore}</div>
                        </div>
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={
                              avgSleepScore >= 80 ? "#22c55e" :
                              avgSleepScore >= 60 ? "#facc15" : "#ef4444"
                            }
                            strokeWidth="10"
                            strokeDasharray={`${avgSleepScore * 2.83} 283`}
                          />
                        </svg>
                      </div>
                      <div className="mt-2 text-sm text-center">
                        {avgSleepScore >= 80 ? "Excellent Sleep Quality" :
                         avgSleepScore >= 60 ? "Average Sleep Quality" : "Poor Sleep Quality"}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-100 p-3 rounded-lg">
                          <div className="flex items-center text-sm text-neutral-600 mb-1">
                            <Clock className="h-4 w-4 mr-1" /> 
                            Avg. Duration
                          </div>
                          <div className="text-xl font-medium">
                            {(sleepEntries.reduce((sum, entry) => sum + entry.duration, 0) / sleepEntries.length).toFixed(1)}h
                          </div>
                        </div>
                        <div className="bg-neutral-100 p-3 rounded-lg">
                          <div className="flex items-center text-sm text-neutral-600 mb-1">
                            <Star className="h-4 w-4 mr-1" /> 
                            Avg. Quality
                          </div>
                          <div className="text-xl font-medium">
                            {(sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length).toFixed(1)}/10
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-1 text-blue-500" />
                        Sleep Health Tip
                      </h4>
                      <p className="text-sm text-neutral-600">
                        Consistency is key. Going to bed and waking up at the same time—even on weekends—helps regulate your body's internal clock.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sleep Charts */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Sleep Trends
                    </CardTitle>
                    <CardDescription>
                      Your sleep patterns over the past 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 mb-6">
                      <h4 className="text-sm font-medium mb-2">Sleep Duration & Quality</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" domain={[0, 10]} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="duration" stroke="#3b82f6" name="Duration (hours)" activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#ec4899" name="Quality (1-10)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="h-64">
                      <h4 className="text-sm font-medium mb-2">Sleep Score</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#8884d8" name="Sleep Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Sleep Logs */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Recent Sleep Logs
                  </CardTitle>
                  <CardDescription>
                    Your most recent sleep entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right">
                      <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">Bed Time</th>
                          <th scope="col" className="px-6 py-3">Wake Time</th>
                          <th scope="col" className="px-6 py-3">Duration</th>
                          <th scope="col" className="px-6 py-3">Quality</th>
                          <th scope="col" className="px-6 py-3">Score</th>
                          <th scope="col" className="px-6 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sleepEntries.slice().reverse().slice(0, 5).map((entry) => (
                          <tr key={entry.id} className="bg-white border-b">
                            <td className="px-6 py-4">{entry.date}</td>
                            <td className="px-6 py-4">{entry.bedTime}</td>
                            <td className="px-6 py-4">{entry.wakeTime}</td>
                            <td className="px-6 py-4">{entry.duration.toFixed(1)}h</td>
                            <td className="px-6 py-4">{entry.quality}/10</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`mr-2 ${
                                  entry.sleepScore >= 80 ? "text-green-500" :
                                  entry.sleepScore >= 60 ? "text-yellow-500" : "text-red-500"
                                }`}>
                                  {entry.sleepScore}
                                </span>
                                <div className="w-16 bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      entry.sleepScore >= 80 ? "bg-green-500" :
                                      entry.sleepScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${entry.sleepScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{entry.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Log Sleep Tab */}
            <TabsContent value="log-sleep" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-indigo-500" />
                    Log Your Sleep
                  </CardTitle>
                  <CardDescription>
                    Record details about your sleep for better tracking and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <Input
                          type="date"
                          value={newEntry.date}
                          onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Bed Time</label>
                          <Input
                            type="time"
                            value={newEntry.bedTime}
                            onChange={(e) => setNewEntry({...newEntry, bedTime: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Wake Time</label>
                          <Input
                            type="time"
                            value={newEntry.wakeTime}
                            onChange={(e) => setNewEntry({...newEntry, wakeTime: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sleep Duration: {calculateDuration(newEntry.bedTime, newEntry.wakeTime)}
                      </label>
                      <div className="h-4 bg-neutral-100 rounded-full mt-2 relative">
                        <div 
                          className="h-4 bg-blue-500 rounded-full absolute"
                          style={{ 
                            width: `${Math.min(100, (calculateNewEntryDuration() / 12) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-neutral-500">
                        <span>4h</span>
                        <span>8h</span>
                        <span>12h</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-4">
                        Sleep Quality: {newEntry.quality}/10
                      </label>
                      <Slider
                        defaultValue={[7]}
                        min={1}
                        max={10}
                        step={1}
                        value={[newEntry.quality]}
                        onValueChange={([value]) => setNewEntry({...newEntry, quality: value})}
                      />
                      <div className="flex justify-between mt-2 text-xs text-neutral-500">
                        <span>Poor</span>
                        <span>Average</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <textarea
                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Any factors that affected your sleep: stress, exercise, caffeine, etc."
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Save Sleep Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgeAlert className="h-5 w-5 text-amber-500" />
                    Personalized Sleep Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your sleep patterns, here are personalized recommendations to improve your sleep
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Moon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-neutral-800">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-5 border border-amber-200 bg-amber-50 rounded-lg mt-6">
                      <h3 className="flex items-center text-lg font-medium text-amber-800 mb-2">
                        <Info className="h-5 w-5 mr-2" />
                        Sleep and Mental Health
                      </h3>
                      <p className="text-amber-700 mb-3">
                        Sleep and mental health are closely connected. Poor sleep can contribute to mental health issues, while good sleep can improve emotional resilience and cognitive function.
                      </p>
                      <ul className="space-y-2 text-amber-700">
                        <li className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2"></span>
                          <span>Consistently poor sleep is linked to depression, anxiety, and stress</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2"></span>
                          <span>REM sleep helps process emotional information and supports emotional regulation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2"></span>
                          <span>Improving sleep quality can lead to significant improvements in mental wellbeing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SleepTrackerPage; 