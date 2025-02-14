import React, { useRef, useState } from "react";
import "./Player.css";

const Player = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const streamUrl = "https://uk2.streamingpulse.com/ssl/vcr1";

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="player-container">
      <button 
        className={`play-btn ${isPlaying ? 'playing' : ''}`} 
        onClick={togglePlay} 
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <svg viewBox="-50 -50 300 300" className="play-icon">
          {[...Array(3)].map((_, i) => (
            <path
              key={i}
              className="morph-path"
              d={isPlaying 
                ? "M100,100 m-55,0 a55,55 0 1,0 110,0 a55,55 0 1,0 -110,0"
                : "M100,100 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0"
              }
              style={{
                animationDelay: `${i * 0.75}s`,
                opacity: isPlaying ? `${0.9 - i * 0.25}` : `${1 - i * 0.3}`,
                transform: isPlaying 
                  ? `scale(${1 + i * 0.02})`
                  : `scale(1)`,
                transformOrigin: 'center',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </svg>
      </button>
      <div className="text-content">
        <div className="schedule">
          spring radio 
          <span className="live-indicator">
            live <span className="live-dot"></span>
          </span>
        </div>
      </div>

      <audio ref={audioRef}>
        <source src={streamUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

    </div>
  );
};

export default Player;
