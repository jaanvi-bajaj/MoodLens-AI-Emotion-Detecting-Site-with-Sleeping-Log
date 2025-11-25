import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Server as SocketServer } from "socket.io"; // Add this import
import { 
  insertContactSubmissionSchema, 
  insertNewsletterSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import MentalHealthCheck from "@/pages/QuizPage";



// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      const submission = insertContactSubmissionSchema.parse(req.body);
      const result = await storage.createContactSubmission(submission);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ success: false, message: "Failed to submit contact form" });
      }
    }
  });

  
  // Newsletter subscriptions
  app.post("/api/newsletter", async (req, res) => {
    try {
      const subscription = insertNewsletterSchema.parse(req.body);
      const result = await storage.subscribeToNewsletter(subscription);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else if (error instanceof Error && error.message === "Email already subscribed") {
        res.status(409).json({ success: false, message: "Email is already subscribed to the newsletter" });
      } else {
        console.error("Newsletter subscription error:", error);
        res.status(500).json({ success: false, message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // AI chatbot demo responses
  app.post("/api/chatbot", (req, res) => {
    const responses = [
      "I understand how you're feeling. Would you like to try a quick mindfulness exercise?",
      "Thanks for sharing. Based on your mood patterns, I recommend taking a short break and practicing deep breathing.",
      "I'm here to support you. Would you like me to suggest some personalized coping strategies?",
      "I've noticed a pattern in your mood entries. Would you like to explore what might be triggering these feelings?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate processing time
    setTimeout(() => {
      res.json({ message: randomResponse });
    }, 500);
  });
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

    // New route for emotion detection status
    app.get("/api/emotion-detection/status", (req, res) => {
      res.json({ available: true });
    });
    const httpServer = createServer(app);
    const io = new SocketServer(httpServer);
  
  io.on("connection", (socket) => {
    console.log("Client connected");
    let pythonProcess = null;
    
    socket.on("start-emotion-detection", () => {
      if (pythonProcess) return;
      
      console.log("Starting emotion detection process");
      pythonProcess = spawn("python", [
        path.join(__dirname, "./python/emotion_detection.py")
      ]);
      
      pythonProcess.stdout.on("data", (data) => {
        try {
          const results = JSON.parse(data.toString());
          socket.emit("emotion-results", results);
        } catch (e) {
          console.error("Error parsing Python output:", e);
        }
      });
      
      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python error: ${data}`);
      });
    });
    
    socket.on("frame", (frameData) => {
      if (pythonProcess && pythonProcess.stdin) {
        pythonProcess.stdin.write(frameData + "\n");
      }
    });
    
    socket.on("stop-emotion-detection", () => {
      if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
        console.log("Stopped emotion detection process");
      }
    });
    
    socket.on("disconnect", () => {
      if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
      }
      console.log("Client disconnected");
    });
  });

  // const httpServer = createServer(app);
  return httpServer;
}
