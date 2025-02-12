import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIndicatorIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function ExploreContent() {
  const [content, setContent] = useState([]);
  const [files, setFiles] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [storageFiles, setStorageFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileId: '',
    type: 'audio',
    moods: [],
    imageFile: null,
    featured: false
  });
  const [error, setError] = useState('');

  const AVAILABLE_MOODS = [
    'Classical',
    'Contemporary',
    'Orchestral',
    'Chamber Music',
    'Solo Performance',
    'Experimental'
  ];

  useEffect(() => {
    fetchContent();
    fetchFiles();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/explore`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching explore content:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      // Fetch files from both audio and explore_img folders
      const audioResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/storage/audio`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const audioData = await audioResponse.json();
      
      const imageResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/storage/explore_img`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const imageData = await imageResponse.json();
      
      // Combine and format the files
      const allFiles = [
        ...audioData.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url
        })),
        ...imageData.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url
        }))
      ];
      
      setFiles(allFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchStorageFiles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/storage${currentPath}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      console.log('Storage files:', data);
      
      // Transform the API response data to match the expected format
      const files = data.map(item => ({
        id: item.id || item.name,
        name: item.name,
        isFolder: item.type === 'folder',
        type: item.type,
        size: item.size,
        uploadedAt: item.uploadedAt,
        url: item.url
      }));
      
      setStorageFiles(files);
    } catch (error) {
      console.error('Error fetching storage files:', error);
    }
  };

  useEffect(() => {
    if (storageDialogOpen) {
      fetchStorageFiles();
    }
  }, [currentPath, storageDialogOpen]);

  const handleStorageFileSelect = (file) => {
    // Create a complete file object that matches the structure expected by the form
    const selectedFile = {
      id: file.id || file.name, // Use name as fallback if id is not available
      name: file.name,
      type: file.type,
      url: file.url || `${process.env.REACT_APP_API_URL}/api/storage${currentPath}/${file.name}`
    };
    
    setFormData({ ...formData, fileId: selectedFile.id });
    setFiles(prevFiles => {
      // Add the selected file to the files list if it's not already there
      const exists = prevFiles.some(f => f.id === selectedFile.id);
      if (!exists) {
        return [...prevFiles, selectedFile];
      }
      return prevFiles;
    });
    setStorageDialogOpen(false);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      description: '',
      fileId: '',
      type: 'audio',
      moods: [],
      featured: false,
      imageFile: null,
      imageUrl: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      fileId: item.fileId,
      type: item.type,
      moods: item.moods || [],
      featured: item.featured,
      imageFile: null,
      imageUrl: item.imageUrl // Preserve existing imageUrl
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!formData.title) {
        throw new Error('Title is required');
      }
      if (!formData.type) {
        throw new Error('Content type is required');
      }
      if (formData.type === 'audio' && !formData.fileId) {
        throw new Error('Audio file is required for audio content');
      }

      // Upload image if provided
      let imageUrl;
      if (formData.imageFile) {
        const timestamp = new Date().getTime();
        const fileName = `explore_img/${timestamp}_${formData.imageFile.name}`;
        const imageFormData = new FormData();
        
        // Append the original file first
        imageFormData.append('file', formData.imageFile);
        
        // Then append the path separately - don't try to rename the file
        imageFormData.append('path', fileName);
        
        console.log('Uploading file:', {
          name: formData.imageFile.name,
          size: formData.imageFile.size,
          type: formData.imageFile.type,
          path: fileName
        });

        console.log('Uploading file:', fileName);
        
        try {
          const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: imageFormData
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || errorData.details || 'Failed to upload image');
          }

          const uploadResult = await uploadResponse.json();
          console.log('Upload successful:', uploadResult);
          
          imageUrl = uploadResult.url;
        } catch (error) {
          console.error('Upload error:', error);
          throw new Error(`Failed to upload image: ${error.message}`);
        }
      }

      const url = editItem
        ? `${process.env.REACT_APP_API_URL}/api/admin/explore/${editItem.id}`
        : `${process.env.REACT_APP_API_URL}/api/admin/explore`;
      
      const method = editItem ? 'PUT' : 'POST';
      
      // Remove imageFile from formData and add imageUrl if available
      const { imageFile, ...dataToSend } = formData;
      if (imageUrl) {
        dataToSend.imageUrl = imageUrl;
      }
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(dataToSend)
      });

      setDialogOpen(false);
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/admin/explore/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        fetchContent();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(content);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setContent(items);

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/admin/explore/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ items: items.map(item => item.id) })
      });
    } catch (error) {
      console.error('Error reordering content:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Explore Content</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Content
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="content">
          {(provided) => (
            <Paper>
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {content.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        divider
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                            <DragIndicatorIcon />
                          </Box>
                          {item.imageUrl && (
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.title}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2
                              }}
                            />
                          )}
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {item.type}
                                </Typography>
                                {item.description && ` — ${item.description}`}
                              </React.Fragment>
                            }
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleEdit(item)} sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </Paper>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        keepMounted={false}
        disablePortal={false}
      >
        <DialogTitle>{editItem ? 'Edit Content' : 'Add Content'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Associated File</InputLabel>
                  <Select
                    value={formData.fileId}
                    onChange={(e) => setFormData({ ...formData, fileId: e.target.value })}
                    label="Associated File"
                  >
                    {files.filter(file => formData.type === 'audio' ? file.type?.startsWith('audio/') : true)
                      .map((file) => (
                        <MenuItem key={file.id} value={file.id}>
                          {file.name}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<StorageIcon />}
                  onClick={() => setStorageDialogOpen(true)}
                >
                  Browse Storage
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Content Type"
                >
                  <MenuItem value="audio">Audio</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="article">Article</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Moods</InputLabel>
                <Select
                  multiple
                  value={formData.moods}
                  onChange={(e) => setFormData({ ...formData, moods: e.target.value })}
                  label="Moods"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {AVAILABLE_MOODS.map((mood) => (
                    <MenuItem key={mood} value={mood}>
                      {mood}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box>
                {formData.imageUrl && !formData.imageFile && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Image:</Typography>
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Current"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                )}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
                />
                <label htmlFor="image-upload">
                  <Button variant="outlined" component="span" fullWidth>
                    {formData.imageFile ? 'Change Image' : formData.imageUrl ? 'Replace Image' : 'Upload Image'}
                  </Button>
                </label>
                {formData.imageFile && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Selected: {formData.imageFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Storage Browser Dialog */}
      <Dialog 
        open={storageDialogOpen} 
        onClose={() => setStorageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        keepMounted={false}
        disablePortal={false}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Select File from Storage</Typography>
            <Breadcrumbs>
              <Link 
                component="button"
                variant="body1"
                onClick={() => setCurrentPath('')}
                sx={{ cursor: 'pointer' }}
              >
                Root
              </Link>
              {currentPath.split('/').filter(Boolean).map((part, index) => (
                <Link
                  key={part}
                  component="button"
                  variant="body1"
                  onClick={() => setCurrentPath('/' + currentPath.split('/').filter(Boolean).slice(0, index + 1).join('/'))}
                  sx={{ cursor: 'pointer' }}
                >
                  {part}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentPath && (
            <Button
              onClick={() => {
                const parts = currentPath.split('/').filter(Boolean);
                parts.pop();
                setCurrentPath(parts.length ? '/' + parts.join('/') : '');
              }}
              startIcon={<Box component="span">⬆️</Box>}
              sx={{ mb: 2 }}
            >
              Up to parent directory
            </Button>
          )}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storageFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Box 
                        component="button"
                        onClick={() => {
                          if (file.isFolder) {
                            setCurrentPath(currentPath ? `${currentPath}/${file.name}` : `/${file.name}`);
                          }
                        }}
                        sx={{ 
                          cursor: file.isFolder ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          border: 'none',
                          background: 'none',
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px',
                          '&:hover': file.isFolder ? {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          } : {}
                        }}
                      >
                        {file.isFolder ? '📁' : '📄'} {file.name}
                      </Box>
                    </TableCell>
                    <TableCell>{file.size ? formatSize(file.size) : '--'}</TableCell>
                    <TableCell>{file.isFolder ? 'folder' : file.type || '--'}</TableCell>
                    <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                    <TableCell>
                      {!file.isFolder && ((formData.type === 'audio' && file.type?.startsWith('audio/')) || 
                       (formData.type === 'video' && file.type?.startsWith('video/'))) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStorageFileSelect(file);
                          }}
                        >
                          Select
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStorageDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExploreContent;
