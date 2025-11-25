# Face Detection Component

This component provides real-time face detection, emotion analysis, gender detection, and age estimation directly in the browser.

## Features

- **Privacy-First**: All processing happens in the browser - no data is sent to any server
- **Multi-Person Detection**: Can detect and analyze multiple faces simultaneously
- **Emotion Detection**: Identifies 7 different emotions (happy, sad, angry, etc.)
- **Gender & Age**: Estimates gender and approximate age
- **Smooth Performance**: Uses optimized methods to maintain good performance
- **Improved Accuracy**: Takes multiple snapshots and averages results for better accuracy

## How It Works

1. The component loads face-api.js models from a CDN
2. It accesses the user's webcam (with permission)
3. Every 3 seconds, it takes 5 quick snapshots of the current video frame
4. Each snapshot is analyzed for faces, emotions, gender, and age
5. The results are averaged across all snapshots for better accuracy
6. Results are displayed on the video and in a list below

## Implementation Notes

- Models are loaded from the official face-api.js CDN
- The component is designed to be responsive and works on mobile devices
- Performance is optimized by:
  - Using lightweight TinyFaceDetector model
  - Reducing resolution for analysis
  - Only doing full analysis every 3 seconds
  - Using different parameters for display vs. analysis

## Code Structure

- **FaceDetection.tsx**: The main component
- **FaceDetectionPage.tsx**: A page that uses the component

## Usage

```tsx
import FaceDetection from '../components/face-detection/FaceDetection';

const MyPage = () => {
  return (
    <div>
      <h1>Face Detection Demo</h1>
      <FaceDetection />
    </div>
  );
};
```

## Troubleshooting

If you encounter issues:

1. **Camera permissions**: Make sure to allow camera access when prompted
2. **Loading models**: If models fail to load, check your internet connection
3. **Performance issues**: Reduce other browser load or close other tabs
4. **No faces detected**: Ensure adequate lighting and that face is visible 