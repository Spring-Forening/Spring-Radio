import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from '@mui/material';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Schedule() {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedule`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      
      // Transform LibreTime schedule data to calendar events
      // Ensure data is an array before mapping
      const calendarEvents = Array.isArray(data) 
        ? data.map(item => ({
            id: item.id,
            title: item.title,
            start: new Date(item.starts),
            end: new Date(item.ends),
            description: item.description
          }))
        : [];
      
      setEvents(calendarEvents);
      if (!Array.isArray(data)) {
        setError('Invalid schedule data received');
      }
    } catch (error) {
      setError('Failed to fetch schedule');
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({
      start,
      end,
      title: '',
      description: ''
    });
    setOpenDialog(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedule/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchSchedule();
      setOpenDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      setError('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title: selectedEvent.title,
          starts: selectedEvent.start.toISOString(),
          ends: selectedEvent.end.toISOString(),
          description: selectedEvent.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchSchedule();
      setOpenDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      setError('Failed to save event');
      console.error('Error saving event:', error);
    }
  };

  return (
    <Box sx={{ height: '70vh' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        defaultView="week"
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedEvent?.id ? 'Edit Event' : 'New Event'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={selectedEvent?.title || ''}
            onChange={(e) => setSelectedEvent({
              ...selectedEvent,
              title: e.target.value
            })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={selectedEvent?.description || ''}
            onChange={(e) => setSelectedEvent({
              ...selectedEvent,
              description: e.target.value
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {selectedEvent?.id && (
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          )}
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Schedule;
