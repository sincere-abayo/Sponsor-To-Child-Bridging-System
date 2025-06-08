import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const MotionBox = motion(Box);

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          height: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://media.sciencephoto.com/image/p9100076/800wm")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(51, 49, 49, 0.5)',
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2,
                  }}
                >
                  Connecting Sponsors with Those in Need
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  SponsorBridge helps connect generous sponsors with individuals in need of support for education, healthcare, and more.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isAuthenticated ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                5,000+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sponsors
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                12,000+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Recipients
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                $2.5M+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Funds Raised
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                30+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Countries
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              A better way to give and receive support
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto' }}
            >
              Our platform makes it easy to connect sponsors with those who need support through a simple, transparent process.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <GroupsIcon sx={{ fontSize: 40 }} />,
                title: 'Create an Account',
                description: 'Sign up as a sponsor or as someone seeking support. Complete your profile with relevant information to get started.',
              },
              {
                icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
                title: 'Connect',
                description: 'Sponsors can browse through profiles of individuals seeking support. Recipients can showcase their needs and goals.',
              },
              {
                icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
                title: 'Support & Track',
                description: 'Establish sponsorships, track progress, and communicate directly through our secure platform.',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 2,
                          color: 'primary.main',
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {step.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              Features
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700 }}
            >
              Everything you need to make a difference
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              {[
                {
                  icon: <SchoolIcon />,
                  title: 'Educational Support',
                  description: 'Support students with tuition, books, supplies, and mentorship to help them achieve their educational goals.',
                },
                {
                  icon: <MessageIcon />,
                  title: 'Direct Communication',
                  description: 'Our platform enables secure, direct communication between sponsors and recipients to build meaningful relationships.',
                },
                {
                  icon: <SecurityIcon />,
                  title: 'Secure & Transparent',
                  description: 'All transactions and communications are secure, with full transparency on how funds are being used.',
                },
              ].map((feature, index) => (
                <Box key={index} sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 1,
                        borderRadius: 1,
                        mr: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ ml: 7 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -24,
                    right: -24,
                    width: 256,
                    height: 256,
                    bgcolor: 'primary.50',
                    borderRadius: '50%',
                    zIndex: -1,
                  },
                }}
              >
                <Box
                  component="img"
                  src="https://globaladvocacyafrica.org/wp-content/uploads/2018/12/AFRICAN-CHILD-2.jpg"
                  alt="Students studying"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 8, md: 12 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'primary.dark',
            opacity: 0.8,
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Ready to make a difference?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Join our community today and start making a positive impact in someone's life.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 