import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloudUpload, ContentCopy } from '@mui/icons-material';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [folders, setFolders] = useState(['audio', 'explore_img']);
  const [selectedFolder, setSelectedFolder] = useState('audio');
  const fileInputRef = useRef();

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/storage/${selectedFolder}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file list');
      }

      const files = await response.json();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch file list');
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, [selectedFolder]);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (const file of files) {
        const formData = new FormData();
        
        // Create a file with the folder prefix
        const fileName = `${selectedFolder}/${file.name}`;
        formData.append('file', file);
        formData.append('path', fileName);
        
        // Also add it to the file name to ensure it's used
        const renamedFile = new File([file], fileName, {
          type: file.type
        });
        formData.set('file', renamedFile);

        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to upload ${file.name}`);
          }

          await response.json();
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      }

      setFiles([]);
      fetchUploadedFiles();
      setSuccess('Files uploaded successfully');
    } catch (error) {
      setError('Failed to upload files: ' + error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setSuccess('URL copied to clipboard');
        setTimeout(() => setSuccess(''), 3000);
      },
      (err) => {
        setError('Failed to copy URL');
        console.error('Copy error:', err);
      }
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return '--';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          File Upload
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Upload to Folder</InputLabel>
            <Select
              value={selectedFolder}
              label="Upload to Folder"
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              {folders.map((folder) => (
                <MenuItem key={folder} value={folder}>
                  {folder}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
            accept={selectedFolder === 'audio' ? 'audio/*' : 'image/*'}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            Select Files
          </Button>

          {/* Selected Files */}
          {files.length > 0 && (
            <>
              <List>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={file.name}
                      secondary={formatSize(file.size)}
                    />
                  </ListItem>
                ))}
              </List>

              {uploading ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={files.length === 0}
                >
                  Upload Files
                </Button>
              )}
            </>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Files in {selectedFolder}
              </Typography>
              <List>
                {uploadedFiles.map((file, index) => (
                  <ListItem key={file.id || index}>
                    <ListItemText 
                      primary={file.name}
                      secondary={`${file.type || '--'} • ${formatSize(file.size)}`}
                    />
                    {file.url && (
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => copyToClipboard(file.url)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default FileUpload;
