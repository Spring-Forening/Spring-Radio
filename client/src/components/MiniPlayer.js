import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import './MiniPlayer.css';

function MiniPlayer({ currentTrack, isPlaying, onPlayPause }) {
  if (!currentTrack) return null;

  return (
    <Card className="mini-player">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60 }}
          image={currentTrack.imageUrl || '/default-cover.jpg'}
          alt={currentTrack.title}
        />
        <CardContent sx={{ flex: '1 0 auto', py: 1 }}>
          <Typography variant="subtitle1" component="div" noWrap>
            {currentTrack.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {currentTrack.description}
          </Typography>
        </CardContent>
        <Box sx={{ pl: 1, pr: 2 }}>
          <IconButton onClick={onPlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}

export default MiniPlayer;
