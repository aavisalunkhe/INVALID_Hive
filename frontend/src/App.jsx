import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Container,
  Typography
} from '@mui/material';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import TimerIcon from '@mui/icons-material/Timer';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import { getHiveClient } from './config/hive';
import LoginPage from './pages/Login';
import DeepWorkZone from './pages/DeepWork';
import Feed from './pages/Feed';
import Collab from './pages/Collab';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Navbar from './components/navbar/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const navigate = useNavigate();

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  useEffect(() => {
    const savedUsername = Cookies.get('cleanTxtSession');
    if (savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    const fetchFollowCounts = async () => {
      try {
        if (username) {
          const client = getHiveClient();
          const result = await client.database.call('condenser_api.get_follow_count', [username]);
          if (result) {
            setFollowers(result.follower_count);
            setFollowing(result.following_count);
          }
        }
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      }
    };
    fetchFollowCounts();
  }, [username]);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    navigate('/deepwork');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    Cookies.remove('cleanTxtSession');
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isLoggedIn && (
          <Navbar
            username={username}
            onLogout={handleLogout}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            followers={followers}
            following={following}
            onDrawerToggle={handleDrawerToggle}
          />
        )}

        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
          <Box sx={{ width: 250 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">CleanTxt</Typography>
            </Box>
            <Divider />
            <List>
              <ListItem component={Link} to="/deepwork" disablePadding>
                <ListItemIcon>
                  <TimerIcon />
                </ListItemIcon>
                <ListItemText primary="Deep Work Zone" />
              </ListItem>
              <ListItem component={Link} to="/dashboard" disablePadding>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem component={Link} to="/collab" disablePadding>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Collaborate" />
              </ListItem>
              <ListItem component={Link} to="/feed" disablePadding>
                <ListItemIcon>
                  <DynamicFeedIcon />
                </ListItemIcon>
                <ListItemText primary="Feed" />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem disablePadding onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Landing isLoggedIn={isLoggedIn} />} />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />}
            />
            <Route path="/deepwork" element={<DeepWorkZone username={username} />} />
            <Route path="/feed" element={<Feed username={username} />} />
            <Route path="/collab" element={<Collab username={username} />} />
            <Route path="/dashboard" element={<Dashboard username={username} />} />
          </Routes>
        </Box>

        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              CleanTxt
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Team [INVALID]
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
