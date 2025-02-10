import React, { useRef, useState } from "react";
import "./Player.css";
import violinPlayer from "../assets/violin-player.jpg";

const Player = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const showTitle = "Jazz Radio";
  const showDescription = "Who needs a morning coffee when you have jazz? Cure your early morning blues with smooth beats and extroverted improvisation.";
  
  const streamUrl = "https://uk2.streamingpulse.com/ssl/vcr1";

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d={isPlaying ? "M6 4h4v16H6V4zm8 0h4v16h-4V4z" : "M8 5v14l11-7z"} />
    </svg>
  );

  return (
    <div className="player-container" style={{ backgroundImage: `url(${violinPlayer})` }}>
      <div className="player-overlay"></div>
      
      <div className="on-air-indicator">
        <div className="on-air-dot"></div>
        <span className="on-air-text">ON AIR</span>
      </div>
      
      <div className="show-tags">
        <span className="show-tag">Jazz</span>
        <span className="show-tag">On Rotation</span>
      </div>
      <div className="track-info">
        <h1 className="track-title">{showTitle}</h1>
        <p className="track-description">{showDescription}</p>
      </div>
      <button className="play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
        <PlayIcon />
      </button>

      <audio ref={audioRef}>
        <source src={streamUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Player;
