import React from "react";
import logo from "./assets/logo.jpg";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Player from "./components/Player";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="nav-bar">
          <div className="logo">
            <img src={logo} alt="Spring Radio" className="logo-image" />
          </div>
          <div className="nav-links">
            <Link to="/">Live Radio</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/playlists">Playlists</Link>
            <Link to="/articles">Articles</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Player />} />
        </Routes>
      </div>
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
