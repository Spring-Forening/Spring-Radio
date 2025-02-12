require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Helper function to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Handle preflight requests
app.options('*', cors());

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
  // Skip authentication for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const userRef = firestore.collection('users').doc('admin');
    const userDoc = await userRef.get();
    
    if (!userDoc.exists || userDoc.data().token !== token) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Initialize admin user if it doesn't exist
const initializeAdmin = async () => {
  try {
    const adminRef = firestore.collection('users').doc('admin');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists) {
      await adminRef.set({
        username: 'admin',
        passwordHash: hashPassword('1234qwer'),
        token: crypto.randomBytes(32).toString('hex')
      });
      console.log('Admin user initialized');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  // In App Engine, we don't specify keyFilename as it uses default credentials
});

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://spring-radio.lm.r.appspot.com', 'https://spring-radio.com', 'https://api-dot-spring-radio.lm.r.appspot.com']
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// File Upload middleware
app.use(fileUpload({
  createParentPath: true,
  parseNested: true,
  safeFileNames: true,
  preserveExtension: true,
  debug: false, // Disable debug messages
  useTempFiles: true,
  tempFileDir: '/tmp/',
  uploadTimeout: 0, // No timeout
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB max file size
  abortOnLimit: false // Don't return 413 when file size is exceeded, handle it in the route
}));

// Configure express for large payloads
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ limit: '2gb', extended: true }));

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  // In App Engine, we don't specify keyFilename as it uses default credentials
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username !== 'admin') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const adminRef = firestore.collection('users').doc('admin');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists || adminDoc.data().passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ token: adminDoc.data().token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected routes

// Get schedule
app.get('/api/schedule', authenticateAdmin, async (req, res) => {
  try {
    const scheduleSnapshot = await firestore.collection('schedule')
      .where('ends', '>=', new Date()) // Only get current and future events
      .orderBy('ends', 'asc')
      .get();
    
    const events = [];
    scheduleSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data(),
        starts: doc.data().starts.toDate(),
        ends: doc.data().ends.toDate()
      });
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update schedule
app.post('/api/schedule', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, starts, ends, fileId, isLive, repeat } = req.body;
    
    // Create event data object with required fields
    const eventData = {
      title,
      description,
      starts: new Date(starts),
      ends: new Date(ends),
      createdAt: new Date()
    };

    // Add optional fields only if they are defined
    if (fileId !== undefined) eventData.fileId = fileId;
    if (isLive !== undefined) eventData.isLive = isLive;
    if (repeat !== undefined) eventData.repeat = repeat;

    const docRef = await firestore.collection('schedule').add(eventData);
    
    const doc = await docRef.get();
    res.json({
      id: doc.id,
      ...doc.data(),
      starts: doc.data().starts.toDate(),
      ends: doc.data().ends.toDate()
    });
  } catch (error) {
    console.error('Error creating schedule event:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    console.error('Request body:', req.body);
    res.status(500).json({ error: `Failed to create schedule event: ${error.message}` });
  }
});

// Upload file to Google Cloud Storage and save metadata
app.post('/api/upload', authenticateAdmin, async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    
    // Validate file type
    if (!file.mimetype.startsWith('audio/') && !file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', file.mimetype);
      return res.status(400).json({ error: 'Only audio and image files are allowed' });
    }

    // Determine folder and path
    const folder = file.mimetype.startsWith('audio/') ? 'audio/' : 'explore_img/';
    const path = req.body.path || (folder + file.name);

    console.log('Processing upload:', {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.mimetype,
      path: path,
      tempPath: file.tempFilePath
    });

    try {
      // Create write stream to Google Cloud Storage
      const blob = bucket.file(path);
      const blobStream = blob.createWriteStream({
        resumable: true,
        contentType: file.mimetype,
        metadata: {
          size: file.size,
          originalName: file.name
        }
      });

      // Handle stream events
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(file.tempFilePath);
        
        readStream.on('error', (error) => {
          console.error('Read stream error:', error);
          reject(error);
        });

        blobStream.on('error', (error) => {
          console.error('Write stream error:', error);
          reject(error);
        });

        blobStream.on('finish', () => {
          console.log('Upload stream finished');
          resolve();
        });

        // Pipe the file to GCS
        readStream.pipe(blobStream);
      });

      // Clean up temp file after successful upload
      fs.unlinkSync(file.tempFilePath);

      // Generate public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(path)}`;
      console.log('Upload successful:', publicUrl);

      res.json({
        url: publicUrl,
        name: path,
        size: file.size,
        type: file.mimetype
      });
    } catch (error) {
      console.error('Error uploading to GCS:', error);
      if (fs.existsSync(file.tempFilePath)) {
        fs.unlinkSync(file.tempFilePath);
      }
      throw error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Storage Management Routes
app.get('/api/storage/:path?', authenticateAdmin, async (req, res) => {
  try {
    const path = req.params.path || '';
    const [files] = await bucket.getFiles({ prefix: path });
    
    const formattedFiles = files.map(file => ({
      id: file.name,
      name: file.name.split('/').pop(),
      size: parseInt(file.metadata.size),
      type: file.metadata.contentType,
      uploadedAt: file.metadata.timeCreated,
      url: `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(file.name)}`
    }));
    
    res.json(formattedFiles);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.put('/api/storage/:id', authenticateAdmin, async (req, res) => {
  try {
    const file = bucket.file(req.params.id);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    await file.setMetadata({
      metadata: req.body.metadata
    });

    if (req.body.name && req.body.name !== req.params.id) {
      await file.move(req.body.name);
    }

    res.json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

app.delete('/api/storage/:id', authenticateAdmin, async (req, res) => {
  try {
    const file = bucket.file(req.params.id);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    await file.delete();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.post('/api/storage/folder', authenticateAdmin, async (req, res) => {
  try {
    const { path, name } = req.body;
    const folderPath = path ? `${path}/${name}/` : `${name}/`;
    
    // Create an empty file to represent the folder
    const folderFile = bucket.file(folderPath + '.keep');
    await folderFile.save('');
    
    res.json({ message: 'Folder created successfully' });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Public Explore Content Route
app.get('/api/explore', async (req, res) => {
  try {
    let query = firestore.collection('explore').orderBy('order');
    
    // Apply filters if provided
    const moods = req.query.moods?.split(',');
    const genres = req.query.genres?.split(',');
    
    if (moods?.length > 0) {
      // Use array-contains-any for moods
      query = query.where('moods', 'array-contains-any', moods);
    }
    if (genres?.length > 0) {
      // Use array-contains-any for genres
      query = query.where('genres', 'array-contains-any', genres);
    }
    
    const snapshot = await query.get();
    
    const content = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // Get file details if associated
      // Use direct imageUrl if available, otherwise try to get it from associated file
      if (!data.imageUrl && data.fileId) {
        const fileDoc = await firestore.collection('files').doc(data.fileId).get();
        if (fileDoc.exists) {
          data.file = fileDoc.data();
          data.imageUrl = data.file.thumbnailUrl || data.file.url;
        }
      }
      content.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching explore content:', error);
    res.status(500).json({ error: 'Failed to fetch explore content' });
  }
});

// Admin Explore Content Routes
app.get('/api/admin/explore', authenticateAdmin, async (req, res) => {
  try {
    const snapshot = await firestore.collection('explore')
      .orderBy('order')
      .get();
    
    const content = [];
    snapshot.forEach(doc => {
      content.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching explore content:', error);
    res.status(500).json({ error: 'Failed to fetch explore content' });
  }
});

app.post('/api/admin/explore', authenticateAdmin, async (req, res) => {
  try {
    const { moods, genres, ...otherData } = req.body;
    
    // Combine moods and genres into a single filters array for querying
    const filters = [...(moods || []), ...(genres || [])];
    
    const snapshot = await firestore.collection('explore')
      .orderBy('order', 'desc')
      .limit(1)
      .get();
    
    const lastOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
    
    console.log('Creating explore content:', {
      ...otherData,
      moods,
      genres,
      filters
    });
    
    const docRef = await firestore.collection('explore').add({
      ...otherData,
      moods: moods || [],
      genres: genres || [],
      filters, // Combined array for efficient querying
      order: lastOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const doc = await docRef.get();
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error creating explore content:', error);
    res.status(500).json({ error: 'Failed to create explore content' });
  }
});

app.put('/api/admin/explore/:id', authenticateAdmin, async (req, res) => {
  try {
    const { moods, genres, ...otherData } = req.body;
    
    // Combine moods and genres into a single filters array for querying
    const filters = [...(moods || []), ...(genres || [])];
    
    const docRef = firestore.collection('explore').doc(req.params.id);
    console.log('Updating explore content:', {
      id: req.params.id,
      ...otherData,
      moods,
      genres,
      filters
    });
    
    await docRef.update({
      ...otherData,
      moods: moods || [],
      genres: genres || [],
      filters, // Combined array for efficient querying
      updatedAt: new Date(),
      imageUrl: otherData.imageUrl || null // Ensure imageUrl is explicitly set
    });
    
    const doc = await docRef.get();
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error updating explore content:', error);
    res.status(500).json({ error: 'Failed to update explore content' });
  }
});

app.delete('/api/admin/explore/:id', authenticateAdmin, async (req, res) => {
  try {
    await firestore.collection('explore').doc(req.params.id).delete();
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting explore content:', error);
    res.status(500).json({ error: 'Failed to delete explore content' });
  }
});

app.put('/api/admin/explore/reorder', authenticateAdmin, async (req, res) => {
  try {
    const batch = firestore.batch();
    req.body.items.forEach((id, index) => {
      const docRef = firestore.collection('explore').doc(id);
      batch.update(docRef, { order: index });
    });
    
    await batch.commit();
    res.json({ message: 'Content reordered successfully' });
  } catch (error) {
    console.error('Error reordering explore content:', error);
    res.status(500).json({ error: 'Failed to reorder explore content' });
  }
});

// Get livestream status
app.get('/api/livestream/status', authenticateAdmin, async (req, res) => {
  try {
    const settingsDoc = await firestore.collection('livestream').doc('settings').get();
    if (!settingsDoc.exists) {
      // Create default settings if they don't exist
      await firestore.collection('livestream').doc('settings').set({
        enabled: false,
        name: '',
        description: '',
        genre: '',
        url: '',
        bitrate: '',
        format: ''
      });
      res.json({
        enabled: false,
        name: '',
        description: '',
        genre: '',
        url: '',
        bitrate: '',
        format: ''
      });
    } else {
      res.json(settingsDoc.data());
    }
  } catch (error) {
    console.error('Error fetching livestream status:', error);
    res.status(500).json({ error: 'Failed to fetch livestream status' });
  }
});

// Delete schedule event
app.delete('/api/schedule/:id', authenticateAdmin, async (req, res) => {
  try {
    const docRef = firestore.collection('schedule').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await docRef.delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    res.status(500).json({ error: 'Failed to delete schedule event' });
  }
});

// Update livestream settings
app.put('/api/livestream/settings', authenticateAdmin, async (req, res) => {
  try {
    await firestore.collection('livestream').doc('settings').set(req.body, { merge: true });
    const updatedDoc = await firestore.collection('livestream').doc('settings').get();
    res.json(updatedDoc.data());
  } catch (error) {
    console.error('Error updating livestream settings:', error);
    res.status(500).json({ error: 'Failed to update livestream settings' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initializeAdmin(); // Initialize admin user on startup
});
