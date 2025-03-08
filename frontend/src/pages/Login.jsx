import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import LoginComp from '../components/login/Login';


const LoginPage = ({ onLoginSuccess, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                cleanTxt
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                A sanctuary for writers
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                Reclaim your creativity from AI-driven content mills :) 
                CleanTxt prioritizes organic collaboration, skill refinement, and the irreplaceable 
                value of human storytelling.
              </Typography>
            </Box>

            <Card elevation={3} sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Why Join cleanTxt?
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EditIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Human-Centered Writing" 
                      secondary="Create authentic content without AI interference" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Deep Work Zones" 
                      secondary="Distraction-free environments for focused creativity" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ShieldIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Skill Preservation" 
                      secondary="Tools to enhance your natural writing abilities" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PeopleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Supportive Community" 
                      secondary="Connect with like-minded writers on the Hive blockchain" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            {isMobile && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Login to Get Started
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>
            )}
          </Grid>

          {/* Right Side - Login Component */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(145deg, #2d3748 0%, #1a202c 100%)' 
                  : 'linear-gradient(145deg, #f7fafc 0%, #edf2f7 100%)'
              }}
            >
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Writer Sanctuary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in using your Hive account to access all features
                </Typography>
              </Box>
              
              <LoginComp
                onLoginSuccess={onLoginSuccess}
                onLogout={onLogout}
              />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Don't have a Hive account yet?
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth
                  component="a"
                  href="https://signup.hive.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a Hive Account
                </Button>
              </Box>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>What is Hive?</strong> Hive is a decentralized blockchain and ecosystem 
                  for Web 3.0 content creators. By using Hive with cleanTxt, your writing journey is 
                  secured on the blockchain, giving you true ownership of your creative work.
                </Typography>
              </Box>
            </Paper>
            
            <Card sx={{ mt: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  <strong>Privacy Note:</strong> We value your creative privacy. cleanTxt 
                  only requests the minimum permissions needed through Hive Keychain to authenticate you.
                  Your content is yours and always remains under your control.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LoginPage;