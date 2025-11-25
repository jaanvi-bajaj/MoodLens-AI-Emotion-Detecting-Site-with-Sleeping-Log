import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import ProfileDropdown from "@/components/ProfileDropdown";

const Navbar = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center">
                  <Brain className="text-white w-5 h-5" />
                </div>
                <span className="font-heading font-bold text-xl">MoodLens</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <div className={`text-sm font-medium cursor-pointer ${location === '/' ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
                Home
              </div>
            </Link>
            <Link href="/demo">
              <div className={`text-sm font-medium cursor-pointer ${location === '/demo' ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
                Interactive Demo
              </div>
            </Link>
            <Link href="/mental-health-quiz">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/mental-health-quiz' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Mental Health Quiz
              </div>
            </Link>
            <Link href="/emotion-detection">
              <div className={`text-sm font-medium cursor-pointer ${location === '/emotion-detection' ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
                Emotion Detection
              </div>
            </Link>
            <Link href="/cbt-exercises">
              <div className={`text-sm font-medium cursor-pointer ${location === '/cbt-exercises' ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
                CBT Exercises
              </div>
            </Link>
            <Link href="/sleep-tracker">
              <div className={`text-sm font-medium cursor-pointer ${location === '/sleep-tracker' ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
                Sleep Tracker
              </div>
            </Link>
            <Link href="/#features">
              <div className="text-sm font-medium text-neutral-700 hover:text-primary cursor-pointer">
                Features
              </div>
            </Link>
            <Link href="/#how-it-works">
              <div className="text-sm font-medium text-neutral-700 hover:text-primary cursor-pointer">
                How It Works
              </div>
            </Link>
            <Link href="/#faq">
              <div className="text-sm font-medium text-neutral-700 hover:text-primary cursor-pointer">
                FAQ
              </div>
            </Link>
            <Link href="/#contact">
              <div className="text-sm font-medium text-neutral-700 hover:text-primary cursor-pointer">
                Contact
              </div>
            </Link>
            
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-neutral-700 hover:bg-neutral-100"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link href="/">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Home
              </div>
            </Link>
            <Link href="/demo">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/demo' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Interactive Demo
              </div>
            </Link>
            <Link href="/mental-health-quiz">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/mental-health-quiz' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Mental Health Quiz
              </div>
            </Link>
            <Link href="/emotion-detection">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/emotion-detection' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Emotion Detection
              </div>
            </Link>
            <Link href="/cbt-exercises">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/cbt-exercises' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                CBT Exercises
              </div>
            </Link>
            <Link href="/sleep-tracker">
              <div className={`block py-2 text-base font-medium cursor-pointer ${location === '/sleep-tracker' ? 'text-primary' : 'text-neutral-700'}`} onClick={toggleMenu}>
                Sleep Tracker
              </div>
            </Link>
            <Link href="/#features">
              <div className="block py-2 text-base font-medium text-neutral-700 cursor-pointer" onClick={toggleMenu}>
                Features
              </div>
            </Link>
            <Link href="/#how-it-works">
              <div className="block py-2 text-base font-medium text-neutral-700 cursor-pointer" onClick={toggleMenu}>
                How It Works
              </div>
            </Link>
            <Link href="/#faq">
              <div className="block py-2 text-base font-medium text-neutral-700 cursor-pointer" onClick={toggleMenu}>
                FAQ
              </div>
            </Link>
            <Link href="/#contact">
              <div className="block py-2 text-base font-medium text-neutral-700 cursor-pointer" onClick={toggleMenu}>
                Contact
              </div>
            </Link>
            
            {isAuthenticated ? (
              <div className="py-2">
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;