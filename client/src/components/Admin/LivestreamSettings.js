import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

function LivestreamSettings() {
  const [settings, setSettings] = useState({
    enabled: false,
    name: '',
    description: '',
    genre: '',
    url: '',
    bitrate: '',
    format: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  const fetchStreamSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/livestream/status`);
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        setSettings({
          enabled: Boolean(data.enabled),
          name: data.name || '',
          description: data.description || '',
          genre: data.genre || '',
          url: data.url || '',
          bitrate: data.bitrate || '',
          format: data.format || ''
        });
      } else {
        throw new Error('Invalid livestream data received');
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch stream settings');
      setLoading(false);
      console.error('Error fetching stream settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/livestream/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update settings');
      console.error('Error updating settings:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = field === 'enabled' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Livestream Settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={handleChange('enabled')}
                color="primary"
              />
            }
            label="Enable Livestream"
          />

          <TextField
            label="Stream Name"
            value={settings.name}
            onChange={handleChange('name')}
            fullWidth
          />

          <TextField
            label="Description"
            value={settings.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Genre"
            value={settings.genre}
            onChange={handleChange('genre')}
            fullWidth
          />

          <TextField
            label="Stream URL"
            value={settings.url}
            onChange={handleChange('url')}
            fullWidth
          />

          <TextField
            label="Bitrate"
            value={settings.bitrate}
            onChange={handleChange('bitrate')}
            type="number"
            fullWidth
          />

          <TextField
            label="Format"
            value={settings.format}
            onChange={handleChange('format')}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default LivestreamSettings;
