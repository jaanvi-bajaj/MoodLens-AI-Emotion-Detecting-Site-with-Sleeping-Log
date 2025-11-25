import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/authContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DemoPage from "@/pages/DemoPage";
import QuizPage from "./pages/QuizPage";
import FaceDetectionPage from "./pages/FaceDetectionPage";
import CBTPage from "./pages/CBTPage";
import SleepTrackerPage from "./pages/SleepTrackerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/mental-health-quiz" component={QuizPage} />   
      <Route path="/emotion-detection" component={FaceDetectionPage} />
      <Route path="/cbt-exercises" component={CBTPage} />
      <Route path="/sleep-tracker" component={SleepTrackerPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
