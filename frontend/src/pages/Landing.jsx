import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      title: 'Deep Work Zones',
      description: 'Distraction-free writing environment with AI-free writing sprints and optional prompts.',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      route: '/deepwork',
      primary: true
    },
    {
      title: 'Collaborative Writing',
      description: 'Real-time co-writing arenas where writers collaborate to create amazing stories.',
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      route: '/collab'
    },
    {
      title: 'Community Feed',
      description: 'Share your work, discover stories, and engage with fellow writers.',
      icon: <AutoStoriesIcon sx={{ fontSize: 40 }} />,
      route: '/feed'
    },
    {
      title: 'Skill Tracking',
      description: 'Visualize your writing progress and growth over time.',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      route: '/dashboard'
    },
    {
      title: 'Writing Prompts',
      description: 'Human-curated prompts to spark your creativity.',
      icon: <EditIcon sx={{ fontSize: 40 }} />,
      route: '/deepwork'
    },
    {
      title: 'AI-Free Environment',
      description: 'Focus on authentic human creativity without AI interference.',
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      route: '/deepwork'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: 8
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Fade in={true} timeout={1000}>
              <Box textAlign="center" sx={{ mb: 8 }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #4dabf5 30%, #f06292 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  cleanTxt
                </Typography>
                <Typography 
                  variant="h5" 
                  color="textSecondary" 
                  sx={{ mb: 4 }}
                >
                  A sanctuary for writers to reclaim their creativity
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/deepwork')}
                  startIcon={<EditIcon />}
                  className="animated-gradient"
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.2rem',
                    borderRadius: '50px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 25px rgba(77, 171, 245, 0.4)'
                    }
                  }}
                >
                  Start Writing
                </Button>
              </Box>
            </Fade>
          </Grid>

          {/* Features Grid */}
          <Grid item xs={12}>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Zoom in={true} timeout={1000 + (index * 200)}>
                    <Card 
                      onClick={() => navigate(feature.route)}
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: feature.primary ? 
                            '0 12px 30px rgba(77, 171, 245, 0.3)' : 
                            '0 12px 30px rgba(0, 0, 0, 0.2)'
                        },
                        ...(feature.primary && {
                          border: `2px solid ${theme.palette.primary.main}`,
                        })
                      }}
                    >
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{ 
                          mb: 3, 
                          color: feature.primary ? 
                            theme.palette.primary.main : 
                            theme.palette.secondary.main 
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;