import React from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Container,
  Paper,
  Grid,
} from '@mui/material';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is your dashboard where you can manage your sponsorships and activities.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Active Sponsorships
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total Donations
            </Typography>
            <Typography variant="h3">$0</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 