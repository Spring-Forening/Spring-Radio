import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton
} from '@mui/material';
import {
  RadioOutlined,
  UploadFileOutlined,
  FolderOutlined,
  ExploreOutlined,
  ExpandLess,
  ExpandMore,
  StorageOutlined,
  SettingsOutlined,
  SignalCellularAltOutlined
} from '@mui/icons-material';
import Login from './Login';
import './AdminLayout.css';

const DRAWER_WIDTH = 240;

function AdminLayout() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [openMenus, setOpenMenus] = useState({
    radio: false,
    files: false
  });
  const location = useLocation();

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  // Add token to all API requests
  useEffect(() => {
    if (token) {
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        if (typeof url === 'string' && url.includes('/api/')) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
          };
        }
        return originalFetch(url, options);
      };
    }
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const handleMenuClick = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const renderNavItems = () => (
    <List>
      {/* Radio Section */}
      <ListItem component="button" onClick={() => handleMenuClick('radio')}>
        <ListItemIcon>
          <RadioOutlined />
        </ListItemIcon>
        <ListItemText primary="Radio" />
        {openMenus.radio ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openMenus.radio} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            component={RouterLink} 
            to="/admin/schedule"
            sx={{ pl: 4 }}
          >
            <ListItemIcon>
              <SettingsOutlined />
            </ListItemIcon>
            <ListItemText primary="Schedule" />
          </ListItem>
          <ListItem 
            component={RouterLink} 
            to="/admin/livestream"
            sx={{ pl: 4 }}
          >
            <ListItemIcon>
              <SignalCellularAltOutlined />
            </ListItemIcon>
            <ListItemText primary="Livestream" />
          </ListItem>
        </List>
      </Collapse>

      {/* Files Section */}
      <ListItem component="button" onClick={() => handleMenuClick('files')}>
        <ListItemIcon>
          <FolderOutlined />
        </ListItemIcon>
        <ListItemText primary="Files" />
        {openMenus.files ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openMenus.files} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem 
            component={RouterLink} 
            to="/admin/upload"
            sx={{ pl: 4 }}
          >
            <ListItemIcon>
              <UploadFileOutlined />
            </ListItemIcon>
            <ListItemText primary="Upload" />
          </ListItem>
          <ListItem 
            component={RouterLink} 
            to="/admin/storage"
            sx={{ pl: 4 }}
          >
            <ListItemIcon>
              <StorageOutlined />
            </ListItemIcon>
            <ListItemText primary="Manage Storage" />
          </ListItem>
        </List>
      </Collapse>

      {/* Explore Section */}
      <ListItem 
        component={RouterLink} 
        to="/admin/explore"
      >
        <ListItemIcon>
          <ExploreOutlined />
        </ListItemIcon>
        <ListItemText primary="Explore Content" />
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        className="admin-header"
        sx={{ 
          width: `calc(100% - ${DRAWER_WIDTH}px)`, 
          ml: `${DRAWER_WIDTH}px` 
        }}
      >
        <Toolbar>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              flexGrow: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Spring Radio Admin Site
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        className="admin-drawer"
      >
        <Toolbar className="drawer-header">
          <RouterLink to="/admin">
            <img 
              src={require('../../assets/logo.jpg')} 
              alt="Spring Radio Logo" 
              className="admin-logo"
            />
          </RouterLink>
        </Toolbar>
        {renderNavItems()}
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          mt: '64px' // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
