#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json
import base64
import cv2
import numpy as np
import time
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.image import img_to_array
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='emotion_detection.log'
)
logger = logging.getLogger('emotion_detection')

# Optimize TensorFlow performance
try:
    # Check for GPU
    physical_devices = tf.config.list_physical_devices('GPU')
    if physical_devices:
        tf.config.experimental.set_memory_growth(physical_devices[0], True)
        logger.info(f"Using GPU: {physical_devices}")
    else:
        # Optimize CPU threading
        tf.config.threading.set_intra_op_parallelism_threads(4)
        tf.config.threading.set_inter_op_parallelism_threads(1)
        logger.info("No GPU available, optimized for CPU")
except Exception as e:
    logger.error(f"Error configuring TensorFlow: {str(e)}")

# Performance parameters
FACE_SCALE_FACTOR = 1.4
FACE_MIN_NEIGHBORS = 5
MIN_FACE_SIZE = (30, 30)
FRAME_RESIZE_PERCENT = 75  # Resize input frames to this percentage

# Path to the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Function to find the model files
def find_model_files():
    # Check in the current directory first
    model_locations = [
        # Check in the script directory
        current_dir,
        # Check in parent directories
        os.path.join(current_dir, '..'),
        os.path.join(current_dir, '../..'),
        # Check in the Live_Face_Detection directory
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), 'Live_Face_Detection')
    ]
    
    for location in model_locations:
        haarcascade_path = os.path.join(location, 'haarcascade_frontalface_default.xml')
        emotion_model_path = os.path.join(location, 'emotion_detection_model_50epochs.h5')
        gender_model_path = os.path.join(location, 'gender_model_3epochs.h5')
        age_model_path = os.path.join(location, 'age_model_3epochs.h5')
        
        if (os.path.exists(haarcascade_path) and 
            os.path.exists(emotion_model_path) and 
            os.path.exists(gender_model_path) and 
            os.path.exists(age_model_path)):
            return {
                'haarcascade': haarcascade_path,
                'emotion': emotion_model_path,
                'gender': gender_model_path,
                'age': age_model_path
            }
    
    # If not found in any expected location, return None
    return None

# Find and load models
try:
    model_paths = find_model_files()
    
    if model_paths:
        logger.info(f"Found models at: {model_paths['haarcascade']}")
        face_classifier = cv2.CascadeClassifier(model_paths['haarcascade'])
        emotion_model = load_model(model_paths['emotion'])
        gender_model = load_model(model_paths['gender'])
        age_model = load_model(model_paths['age'])
    else:
        logger.error("Could not find model files!")
        print(json.dumps({"error": "Model files not found"}))
        sys.exit(1)
        
    class_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
    gender_labels = ['Male', 'Female']
    
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    print(json.dumps({"error": f"Failed to load models: {str(e)}"}))
    sys.exit(1)

# The main processing function
def process_frame(base64_data):
    try:
        if not base64_data:
            return {"error": "No frame data received"}

        # Decode base64 image
        img_data = base64.b64decode(base64_data.split(',')[1] if ',' in base64_data else base64_data)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Failed to decode image"}

        # Resize frame to reduce processing time
        if frame.shape[0] > 0 and frame.shape[1] > 0:  # Ensure frame has valid dimensions
            width = int(frame.shape[1] * FRAME_RESIZE_PERCENT / 100)
            height = int(frame.shape[0] * FRAME_RESIZE_PERCENT / 100)
            frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Use optimized parameters for face detection
        faces = face_classifier.detectMultiScale(
            gray, 
            scaleFactor=FACE_SCALE_FACTOR, 
            minNeighbors=FACE_MIN_NEIGHBORS,
            minSize=MIN_FACE_SIZE
        )

        # Batch processing preparations
        emotion_inputs = []
        gender_age_inputs = []
        face_positions = []
        predictions = []
        
        # Prepare all ROIs first
        for (x, y, w, h) in faces:
            # Process for emotion detection
            roi_gray = cv2.resize(gray[y:y+h, x:x+w], (48, 48))
            roi = img_to_array(roi_gray.astype('float') / 255.0)
            emotion_inputs.append(roi)
            
            # Process for gender and age detection
            roi_color = cv2.resize(frame[y:y+h, x:x+w], (200, 200))
            gender_age_inputs.append(roi_color)
            
            # Save face position for later use
            face_positions.append((x, y, w, h))
        
        # If we have faces to process, do batch predictions
        if len(emotion_inputs) > 0:
            # Batch predict emotions
            emotion_batch = np.array(emotion_inputs)
            emotion_preds = emotion_model.predict(emotion_batch)
            
            # Batch predict gender and age
            gender_age_batch = np.array(gender_age_inputs)
            gender_preds = gender_model.predict(gender_age_batch)
            age_preds = age_model.predict(gender_age_batch)
            
            # Process results for each face
            for i, (x, y, w, h) in enumerate(face_positions):
                emotion_label = class_labels[np.argmax(emotion_preds[i])]
                confidence = round(float(np.max(emotion_preds[i])), 2)
                
                gender_label = gender_labels[int(gender_preds[i][0] >= 0.5)]
                age = int(round(age_preds[i][0]))
                
                # Draw rectangle on frame
                cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                
                # Draw text on frame
                cv2.putText(frame, f"{emotion_label} ({confidence})", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Gender: {gender_label}", (x, y + h + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Age: {age}", (x, y + h + 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                predictions.append({
                    "emotion": emotion_label,
                    "confidence": confidence,
                    "gender": gender_label,
                    "age": age,
                    "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                })

        # Encode the modified frame back to base64
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        encoded_frame = base64.b64encode(buffer).decode('utf-8')

        return {
            "predictions": predictions,
            "processed_frame": encoded_frame,
            "frame_info": {
                "width": frame.shape[1],
                "height": frame.shape[0],
                "faces_detected": len(predictions)
            }
        }

    except Exception as e:
        logger.error(f"Frame processing error: {str(e)}")
        return {"error": str(e)}

# Main loop to read from stdin and process frames
if __name__ == "__main__":
    try:
        logger.info("Emotion detection script started")
        for line in sys.stdin:
            if not line.strip():
                continue
                
            start_time = time.time()
            result = process_frame(line.strip())
            process_time = time.time() - start_time
            
            if "error" in result:
                logger.error(f"Error: {result['error']}")
            else:
                logger.debug(f"Processed frame with {len(result['predictions'])} faces in {process_time:.3f}s")
                # Don't include the processed frame in debug logs to avoid huge logs
                result_for_log = result.copy()
                result_for_log.pop("processed_frame", None)
                logger.debug(f"Result: {json.dumps(result_for_log)}")
            
            # Send result back to Node.js
            print(json.dumps(result), flush=True)
            
    except KeyboardInterrupt:
        logger.info("Emotion detection script stopped")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}), flush=True)
        sys.exit(1)