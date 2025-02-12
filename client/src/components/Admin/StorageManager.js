import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  CreateNewFolder as CreateNewFolderIcon
} from '@mui/icons-material';

function StorageManager() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [editForm, setEditForm] = useState({
    name: ''
  });

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/storage${currentPath}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      console.log('Files:', data);
      
      // If we're at the root directory, ensure we show the main folders
      if (!currentPath) {
        const rootFolders = [
          {
            id: 'audio',
            name: 'audio',
            type: 'folder',
            size: null,
            uploadedAt: null
          },
          {
            id: 'explore_img',
            name: 'explore_img',
            type: 'folder',
            size: null,
            uploadedAt: null
          }
        ];
        setFiles(rootFolders);
      } else {
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleEditClick = (file) => {
    setSelectedFile(file);
    setEditForm({
      name: file.name
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/storage/${selectedFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editForm)
      });
      setEditDialogOpen(false);
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/storage/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        fetchFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/storage/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          path: currentPath,
          name: folderName
        })
      });
      setNewFolderDialogOpen(false);
      fetchFiles();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '--';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString() : '--';
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs>
          <Link 
            component="button"
            variant="body1"
            onClick={() => setCurrentPath('')}
            sx={{ cursor: 'pointer' }}
          >
            Root
          </Link>
          {pathParts.map((part, index) => (
            <Link
              key={part}
              component="button"
              variant="body1"
              onClick={() => setCurrentPath('/' + pathParts.slice(0, index + 1).join('/'))}
              sx={{ cursor: 'pointer' }}
            >
              {part}
            </Link>
          ))}
        </Breadcrumbs>
        <Button
          startIcon={<CreateNewFolderIcon />}
          onClick={() => setNewFolderDialogOpen(true)}
        >
          New Folder
        </Button>
      </Box>

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
            {files.map((file) => (
              <TableRow key={file.id || file.name}>
                <TableCell>
                  <Box 
                    component="span" 
                    onClick={() => file.type === 'folder' && setCurrentPath(`${currentPath}/${file.name}`)}
                    sx={{ 
                      cursor: file.type === 'folder' ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {file.type === 'folder' ? '📁' : '📄'} {file.name}
                  </Box>
                </TableCell>
                <TableCell>{file.size ? formatSize(file.size) : '--'}</TableCell>
                <TableCell>{file.type || (file.isFolder ? 'folder' : '--')}</TableCell>
                <TableCell>{file.uploadedAt ? formatDate(file.uploadedAt) : '--'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(file)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(file.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleCreateFolder(editForm.name)}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StorageManager;
