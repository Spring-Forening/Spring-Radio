import React from "react";
import logo from "./assets/logo.jpg";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Player from "./components/Player";
import Explore from "./components/Explore";
import AdminLayout from "./components/Admin/AdminLayout";
import Welcome from "./components/Admin/Welcome";
import Schedule from "./components/Admin/Schedule";
import FileUpload from "./components/Admin/FileUpload";
import LivestreamSettings from "./components/Admin/LivestreamSettings";
import StorageManager from "./components/Admin/StorageManager";
import ExploreContent from "./components/Admin/ExploreContent";
import "./App.css";

function MainContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Update document title based on route
  React.useEffect(() => {
    const path = location.pathname;
    let title = 'Spring Radio';

    if (path.startsWith('/admin')) {
      if (path === '/admin') title = 'Spring Radio Admin - Welcome';
      else if (path === '/admin/schedule') title = 'Spring Radio Admin - Schedule';
      else if (path === '/admin/upload') title = 'Spring Radio Admin - Upload';
      else if (path === '/admin/storage') title = 'Spring Radio Admin - Storage';
      else if (path === '/admin/livestream') title = 'Spring Radio Admin - Livestream';
      else if (path === '/admin/explore') title = 'Spring Radio Admin - Explore';
      else title = 'Spring Radio Admin';
    } else if (path === '/explore') {
      title = 'Spring Radio - Explore';
    }

    document.title = title;
  }, [location]);

  return (
    <div className="App">
      {!isAdmin && (
        <nav className="nav-bar">
          <div className="logo">
            <img src={logo} alt="Spring Radio" className="logo-image" />
          </div>
          <div className="nav-links">
            <Link to="/">Live Radio</Link>
            <Link to="/explore">Explore</Link>
          </div>
        </nav>
      )}

      <Routes>
          <Route path="/" element={<Player />} />
          <Route path="/explore" element={<Explore />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Welcome />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="upload" element={<FileUpload />} />
            <Route path="storage" element={<StorageManager />} />
            <Route path="livestream" element={<LivestreamSettings />} />
            <Route path="explore" element={<ExploreContent />} />
          </Route>

          <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

// 404 Not Found Page Component
const NotFound = () => (
  <div className="not-found">
    <h2>Page Not Found</h2>
    <p>The requested page could not be found.</p>
  </div>
);

export default App;
