/**
 * Face-API.js Model Download Instructions
 * 
 * You need to manually download the following model files from the face-api.js GitHub repository
 * and place them in this directory (public/models/).
 * 
 * Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 * 
 * Required models:
 * 
 * 1. Tiny Face Detector:
 *    - tiny_face_detector_model-shard1
 *    - tiny_face_detector_model-weights_manifest.json
 * 
 * 2. Face Landmark Model:
 *    - face_landmark_68_model-shard1
 *    - face_landmark_68_model-weights_manifest.json
 * 
 * 3. Face Recognition Model:
 *    - face_recognition_model-shard1
 *    - face_recognition_model-shard2
 *    - face_recognition_model-weights_manifest.json
 * 
 * 4. Face Expression Model:
 *    - face_expression_model-shard1
 *    - face_expression_model-weights_manifest.json
 * 
 * 5. Age and Gender Model:
 *    - age_gender_model-shard1
 *    - age_gender_model-weights_manifest.json
 * 
 * Instructions to download:
 * 1. Visit the GitHub URL mentioned above
 * 2. Navigate to each model directory
 * 3. Download each file individually
 * 4. Place all files in this directory (public/models/)
 * 
 * Alternative method:
 * Use a model loading CDN instead by modifying the MODEL_URL in the FaceDetection component:
 * 
 * const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
 * 
 * This will load the models from the official face-api.js CDN instead of local files.
 */ 