# MoodLens - Emotion Detecting Mental Health Platform

MoodLens is an AI-powered mental health platform that uses facial emotion detection to provide personalized support, including adaptive cognitive behavioral therapy exercises, mood tracking, and interactive mindfulness tools.

![MoodLens Screenshot](generated-icon.png)

## Key Features

- **Real-time Facial Emotion Detection**: Analyzes facial expressions directly in your browser to detect emotions like happiness, sadness, anger, fear, and more
- **Adaptive CBT Exercises**: Provides cognitive behavioral therapy exercises that adapt based on your detected emotional state
- **Privacy-First Design**: All facial analysis happens directly in your browser - no images are sent to any server
- **Thought Journal**: Save reframed thoughts and track your progress over time
- **Interactive Demo**: Try the features without creating an account
- **Mental Health Quiz**: Comprehensive assessment to better understand your mental wellbeing

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Emotion Detection**: face-api.js (TensorFlow.js-based facial detection)
- **UI Components**: Shadcn/UI component library
- **Routing**: Wouter (lightweight routing)
- **State Management**: React Query & React Context

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/moodlens.git
   cd moodlens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Pages and Features

- **Home Page**: Overview of MoodLens features and benefits
- **Interactive Demo**: Try facial emotion detection and chatbot features
- **Emotion Detection**: Full-featured facial landmark and emotion detection
- **CBT Exercises**: Adaptive cognitive behavioral therapy exercises based on detected emotion
- **Mental Health Quiz**: Comprehensive mental health assessment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Face-api.js for the facial detection technology
- Shadcn/UI for the beautiful component library
- All the contributors and supporters of the project 