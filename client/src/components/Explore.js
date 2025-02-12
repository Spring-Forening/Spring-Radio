import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  ExpandLess,
  ExpandMore,
  Check as CheckIcon
} from '@mui/icons-material';
import MiniPlayer from './MiniPlayer';
import './Explore.css';

const MOODS = [
  'Classical',
  'Contemporary',
  'Orchestral',
  'Chamber Music',
  'Solo Performance',
  'Experimental'
];

const GENRES = [
  'Symphony',
  'Concerto',
  'Opera',
  'String Quartet',
  'Piano Solo',
  'Choral'
];

function Explore() {
  const [content, setContent] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodAnchorEl, setMoodAnchorEl] = useState(null);
  const [genreAnchorEl, setGenreAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchContent();
  }, [selectedMoods, selectedGenres]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
    };
  }, []);

  const fetchContent = async () => {
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/explore`;
      const params = [];
      
      if (selectedMoods.length > 0) {
        params.push(`moods=${selectedMoods.join(',')}`);
      }
      if (selectedGenres.length > 0) {
        params.push(`genres=${selectedGenres.join(',')}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        setContent([]); // Set empty array on error
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data);
        setContent([]); // Set empty array if response is not an array
        return;
      }
      setContent(data);
    } catch (error) {
      console.error('Error fetching explore content:', error);
    }
  };

  const handleMoodToggle = (mood) => {
    setSelectedMoods(prev => 
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handlePlayPause = async (item) => {
    try {
      if (currentTrack?.id === item.id) {
        // Toggle play/pause for current track
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        // Start playing new track
        if (currentTrack) {
          audioRef.current.pause();
        }
        
        // Construct the audio URL using the fileId
        const audioUrl = item.fileId ? `https://storage.googleapis.com/spring_radio_storage/${encodeURIComponent(item.fileId)}` : null;
        if (!audioUrl) {
          console.error('No fileId found for item:', item);
          return;
        }

        console.log('Playing audio from URL:', audioUrl);

        audioRef.current.src = audioUrl;
        try {
          await audioRef.current.play();
          setCurrentTrack(item);
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
          // Reset state on error
          audioRef.current.src = '';
          setCurrentTrack(null);
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
    }
  };

  // Handle audio errors
  useEffect(() => {
    const audio = audioRef.current;
    const handleError = (error) => {
      if (audio.src) { // Only handle errors if we have a source
        console.error('Audio error:', error);
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    };

    if (currentTrack) { // Only add listener if we have a track
      audio.addEventListener('error', handleError);
      return () => audio.removeEventListener('error', handleError);
    }
  }, [currentTrack]); // Re-run when currentTrack changes

  return (
    <Container maxWidth="xl" className="explore-container">
      {/* Filter Section */}
      <Box className="explore-header">
        <Typography variant="h2" className="explore-title">
          EXPLORE
        </Typography>
        
        <Box className="filter-container">
          <Box className="filter-group">
            <Button
              className="filter-button"
              onClick={(e) => setMoodAnchorEl(e.currentTarget)}
              endIcon={moodAnchorEl ? <ExpandLess /> : <ExpandMore />}
            >
              MOODS {selectedMoods.length > 0 && `(${selectedMoods.length})`}
            </Button>
            <Menu
              anchorEl={moodAnchorEl}
              open={Boolean(moodAnchorEl)}
              onClose={() => setMoodAnchorEl(null)}
              className="filter-menu"
              PaperProps={{
                className: "filter-menu-paper"
              }}
            >
              {MOODS.map((mood) => (
                <MenuItem
                  key={mood}
                  onClick={() => handleMoodToggle(mood)}
                  className={selectedMoods.includes(mood) ? 'selected' : ''}
                >
                  {mood}
                  {selectedMoods.includes(mood) && (
                    <CheckIcon className="check-icon" />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box className="filter-group">
            <Button
              className="filter-button"
              onClick={(e) => setGenreAnchorEl(e.currentTarget)}
              endIcon={genreAnchorEl ? <ExpandLess /> : <ExpandMore />}
            >
              GENRES {selectedGenres.length > 0 && `(${selectedGenres.length})`}
            </Button>
            <Menu
              anchorEl={genreAnchorEl}
              open={Boolean(genreAnchorEl)}
              onClose={() => setGenreAnchorEl(null)}
              className="filter-menu"
              PaperProps={{
                className: "filter-menu-paper"
              }}
            >
              {GENRES.map((genre) => (
                <MenuItem
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={selectedGenres.includes(genre) ? 'selected' : ''}
                >
                  {genre}
                  {selectedGenres.includes(genre) && (
                    <CheckIcon className="check-icon" />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {content.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card className="content-card">
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl || '/default-cover.jpg'}
                  alt={item.title}
                  className="content-image"
                />
                <IconButton
                  className="play-button"
                  onClick={() => handlePlayPause(item)}
                >
                  {currentTrack?.id === item.id && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Box>
              <CardContent>
                <Typography variant="subtitle1" className="content-title">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="content-description">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mini Player */}
      <MiniPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => {
          if (currentTrack) {
            handlePlayPause(currentTrack);
          }
        }}
      />
    </Container>
  );
}

export default Explore;
