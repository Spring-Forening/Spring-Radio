import React, { useState } from 'react';
import { Container, Paper, Tabs, Tab, Box } from '@mui/material';
import Schedule from './Schedule';
import LivestreamSettings from './LivestreamSettings';
import FileUpload from './FileUpload';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function Admin() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} style={{ marginTop: '2rem' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Schedule" />
          <Tab label="Livestream Settings" />
          <Tab label="File Upload" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Schedule />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <LivestreamSettings />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <FileUpload />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Admin;
