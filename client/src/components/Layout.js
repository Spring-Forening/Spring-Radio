import React, { useState, useRef, useEffect } from 'react';
import './Layout.css';
import { Search, MessageSquare, User, MoreHorizontal, ChevronLeft, ChevronRight, Pause, Play, Menu, X } from 'lucide-react';
import violinPlayer from '../assets/violin-player.jpg';
import radioProgram from '../assets/moving-content-radio-program.gif';
import cassette from '../assets/cassette.jpg';
import logo from '../assets/cool-png-logo-metal.png';

const heroContent = [
  {
    image: radioProgram,
    title: "FEATURED PERFORMANCE",
    subtitle: "LIVE · VIDEO",
    description: "Live performance featuring tracks from the latest release",
    buttonText: "WATCH NOW"
  },
  {
    image: violinPlayer,
    title: "CLASSICAL EVENING",
    subtitle: "UPCOMING · LIVE",
    description: "Join us for an evening of classical masterpieces",
    buttonText: "SET REMINDER"
  },
  { 
    image: cassette,
    title: "NEW RELEASE",
    subtitle: "ALBUM · STREAMING",
    description: "Latest compositions from emerging artists",
    buttonText: "LISTEN NOW"
  }
];

const Layout = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState("VIENNA CLASSICAL MUSIC W/ A SPECIAL GUEST");
  const [touchStart, setTouchStart] = useState(null);
  const [mouseStart, setMouseStart] = useState(null);
  const [isSwipeDebounced, setIsSwipeDebounced] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Toggle body class when mobile menu opens/closes
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  const startSlideTimer = () => {
    clearInterval(timerRef.current);
    setProgress(0);
    
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((current) => (current + 1) % heroContent.length);
          return 0;
        }
        return prev + 2; // Increment by 2 every 100ms to reach 100 in 5 seconds
      });
    }, 100);
  };

  const handleSlideChange = (direction) => {
    setCurrentSlide((prev) => {
      if (direction === 'next') {
        return (prev + 1) % heroContent.length;
      } else {
        return prev === 0 ? heroContent.length - 1 : prev - 1;
      }
    });
    startSlideTimer();
  };

  useEffect(() => {
    startSlideTimer();

    // Add non-passive wheel event listener to prevent browser back/forward
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    return () => {
      clearInterval(timerRef.current);
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.removeEventListener('wheel', () => {});
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen relative">
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full bg-image"></div>
      </div>
      {/* Controls Bar */}
      <div className="bg-white h-[100px] border-b border-black/10">
        <div className="w-full h-full px-6 flex items-center">
          {/* Live Now Indicator */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-red-700 font-medium text-sm tracking-wide uppercase">LIVE NOW</span>
            <div className="on-air-dot" />
          </div>
          <button 
            className="bg-black/90 text-white w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors rounded-sm shrink-0 mx-4"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
          <div className="marquee-container">
            <div className="marquee-content">
              <span>{currentTrack}</span>
              <span>{currentTrack}</span>
              <span>{currentTrack}</span>
              <span>{currentTrack}</span>
              <span>{currentTrack}</span>
              <span>{currentTrack}</span>
            </div>
          </div>
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src="https://uk2.streamingpulse.com/ssl/vcr1"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      </div>

      {/* Schedule Row */}
      <div className="bg-white h-[50px] flex items-center justify-between border-b border-black/10">
        <div className="flex items-center">
          <div className="bg-black/10 h-[50px] flex items-center px-6">
            <span className="text-xs uppercase tracking-[0.2em] font-black flex items-center">
              NEXT
              <svg className="ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className="px-6 flex items-center space-x-4">
            <span className="text-sm text-black/60">19:00 - 21:00</span>
            <span className="text-sm font-bold uppercase tracking-wide">IRAN TALKS W/POUYA </span>
          </div>
        </div>
        <button className="h-[50px] px-6 items-center space-x-2 hover:bg-black/5 transition-colors hidden md:flex">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs uppercase tracking-[0.2em] font-medium">Schedule</span>
        </button>
      </div>

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden h-[calc(100vh-250px)] border-b border-black/10 hero-section"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => {
          if (!touchStart) return;
          
          const currentTouch = e.touches[0].clientX;
          const diff = touchStart - currentTouch;

          // Minimum swipe distance of 50px
          if (Math.abs(diff) > 50) {
            if (diff > 0) {
              // Swiped left
              handleSlideChange('next');
            } else {
              // Swiped right
              handleSlideChange('prev');
            }
            setTouchStart(null);
          }
        }}
        onTouchEnd={() => setTouchStart(null)}
        onMouseDown={(e) => {
          setMouseStart(e.clientX);
          // Prevent text selection during swipe
          e.preventDefault();
        }}
        onMouseMove={(e) => {
          if (!mouseStart) return;
          
          const currentMouse = e.clientX;
          const diff = mouseStart - currentMouse;

          // Minimum swipe distance of 50px
          if (Math.abs(diff) > 50) {
            if (diff > 0) {
              // Swiped left
              handleSlideChange('next');
            } else {
              // Swiped right
              handleSlideChange('prev');
            }
            setMouseStart(null);
          }
        }}
        onMouseUp={() => setMouseStart(null)}
        onMouseLeave={() => setMouseStart(null)}
        onWheel={(e) => {
          // Don't process swipe if debounced
          if (isSwipeDebounced) return;

          // Detect horizontal scroll (two-finger swipe on trackpad)
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            // Threshold to prevent accidental swipes
            if (Math.abs(e.deltaX) > 30) {
              setIsSwipeDebounced(true);
              
              if (e.deltaX > 0) {
                // Swiped left
                handleSlideChange('next');
              } else {
                // Swiped right
                handleSlideChange('prev');
              }

              // Reset debounce after 500ms
              setTimeout(() => {
                setIsSwipeDebounced(false);
              }, 500);
            }
          }
        }}
      >
        {/* Background Image */}
        <img
          src={heroContent[currentSlide].image}
          alt={heroContent[currentSlide].title}
          className={`w-full h-[calc(100vh-250px)] object-cover hero-image active`}
        />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="w-full">
            {/* Session Info */}
            <div className={`mb-4 hero-content active`}>
              <h2 className="text-white text-2xl font-bold mb-1">{heroContent[currentSlide].title}</h2>
              <div className="text-white/80 text-xs mb-1">{heroContent[currentSlide].subtitle}</div>
              <p className="text-white text-base mb-3">
                {heroContent[currentSlide].description}
              </p>
              <button className="bg-black text-white px-4 py-1.5 text-sm font-medium hover:bg-black/90 transition-colors">
                {heroContent[currentSlide].buttonText}
              </button>
            </div>
            
            {/* Slide Navigation and Progress */}
            <div className="hero-controls">
              <div className="hero-controls-left">
                <span className="text-xs">{currentSlide + 1} / {heroContent.length}</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleSlideChange('prev')}
                    className="transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => handleSlideChange('next')}
                    className="transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="hero-controls-right">
                <div className="w-full h-1 bg-white/20 overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white h-[100px]">
        <nav className="w-full h-full px-6 flex items-center justify-between relative">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <img src={logo} alt="Spring Radio" className="h-12 w-auto" />
              <div className="hidden lg:flex items-center space-x-6 ml-8">
                <a href="#radio" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">RADIO</a>
                <a href="#archive" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ARCHIVE</a>
                <a href="#articles" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ARTICLES</a>
                <a href="#organization" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ORGANIZATION</a>
                <a href="#contact" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">CONTACT</a>
                <a href="#about" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ABOUT</a>
              </div>
            </div>
          
          {/* Right Utility Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-black/10 text-black">
              <Search size={20} />
            </button>
            <button className="p-2 hover:bg-black/10 text-black lg:block hidden">
              <MessageSquare size={20} />
            </button>
            <button className="p-2 hover:bg-black/10 text-black hidden lg:block">
              <User size={20} />
            </button>
            <button 
              className="p-2 hover:bg-black/10 text-black lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-t border-black/10 py-4 lg:hidden">
              <div className="flex flex-col space-y-4 px-6">
                <a href="#radio" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">RADIO</a>
                <a href="#archive" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ARCHIVE</a>
                <a href="#articles" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ARTICLES</a>
                <a href="#organization" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ORGANIZATION</a>
                <a href="#contact" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">CONTACT</a>
                <a href="#about" className="text-black hover:text-black/80 transition-colors uppercase text-sm tracking-wide">ABOUT</a>
                <div className="flex items-center space-x-2 text-black pt-4 border-t border-black/10">
                  <User size={20} />
                  <span className="text-sm font-medium uppercase tracking-wide">MY SPRING</span>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
