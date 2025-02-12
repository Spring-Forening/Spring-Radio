import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  return (
    <div className="admin-welcome">
      <h1>Welcome to Spring Radio Admin</h1>
      
      <div className="admin-guide">
        <section>
          <h2>Quick Guide</h2>
          <div className="guide-section">
            <h3><Link to="/admin/schedule">Schedule</Link></h3>
            <p>Manage radio programming and events:</p>
            <ul>
              <li>Create and edit scheduled broadcasts</li>
              <li>Set up recurring events</li>
              <li>View upcoming schedule</li>
            </ul>
          </div>

          <div className="guide-section">
            <h3><Link to="/admin/upload">Upload</Link></h3>
            <p>Upload new audio content:</p>
            <ul>
              <li>Upload audio files (supported formats: MP3, WAV)</li>
              <li>Add metadata to tracks</li>
              <li>Organize content into folders</li>
            </ul>
          </div>

          <div className="guide-section">
            <h3><Link to="/admin/storage">Storage Manager</Link></h3>
            <p>Manage uploaded content:</p>
            <ul>
              <li>Browse all uploaded files</li>
              <li>Organize files into folders</li>
              <li>Delete unused content</li>
            </ul>
          </div>

          <div className="guide-section">
            <h3><Link to="/admin/livestream">Livestream Settings</Link></h3>
            <p>Configure live streaming:</p>
            <ul>
              <li>Enable/disable livestream</li>
              <li>Set stream details (title, description)</li>
              <li>Configure stream URL and format</li>
            </ul>
          </div>

          <div className="guide-section">
            <h3><Link to="/admin/explore">Explore Content</Link></h3>
            <p>Manage explore page content:</p>
            <ul>
              <li>Create featured content</li>
              <li>Add images and descriptions</li>
              <li>Organize content by moods and genres</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Welcome;
