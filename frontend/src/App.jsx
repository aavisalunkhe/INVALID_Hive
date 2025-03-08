import React, { useState, useEffect, useCallback } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Cookies from 'js-cookie';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';

import LoginPage from './pages/Login';
import DeepWorkZone from './pages/DeepWork';
import Feed from './pages/Feed';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('deepwork');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });

  //any existing session active?
  useEffect(() => {
    const savedUsername = Cookies.get('cleanTxtSession');
    if (savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    Cookies.remove('cleanTxtSession');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  //save content to blockchain
  const saveToBlockchain = useCallback(async (content, type = 'completed_session') => {
    if (!window.hive_keychain || !isLoggedIn) {
      console.error('Hive Keychain not found or user not logged in');
      return false;
    }

    try {
      return new Promise((resolve, reject) => {
        window.hive_keychain.requestCustomJson(
          username,
          'cleanTxt',
          'Posting',
          JSON.stringify({
            type: type,
            content: content,
            timestamp: Date.now(),
            app: 'cleanTxt'
          }),
          'Save Completed Session',
          (response) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.message));
            }
          }
        );
      });
    } catch (error) {
      console.error('Error saving to blockchain:', error);
      return false;
    }
  }, [username, isLoggedIn]);

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">
          cleanTxt
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem 
          disablePadding 
          onClick={() => {setCurrentPage('deepwork'); setDrawerOpen(false);}}
        >
          <ListItemButton>
            <ListItemIcon>
              <TimerIcon />
            </ListItemIcon>
            <ListItemText primary="Deep Work Zone" />
          </ListItemButton>
        </ListItem>
        
        <ListItem 
          disablePadding 
          onClick={() => {setCurrentPage('dashboard'); setDrawerOpen(false);}}
        >
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem 
          disablePadding 
          onClick={() => {setCurrentPage('collaborate'); setDrawerOpen(false);}}
        >
          <ListItemButton>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Collaborate" />
          </ListItemButton>
        </ListItem>
        
        <ListItem 
          disablePadding 
          onClick={() => {setCurrentPage('feed'); setDrawerOpen(false);}}
        >
          <ListItemButton>
            <ListItemIcon>
              <DynamicFeedIcon />
            </ListItemIcon>
            <ListItemText primary="Feed" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding onClick={handleLogout}>
          <ListItemButton>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  //function for deepworkzone
  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />;
    }
    
    switch (currentPage) {
      case 'deepwork':
        return <DeepWorkZone saveToBlockchain={saveToBlockchain} username={username} />;
      case 'feed':
        return <Feed saveToBlockchain={saveToBlockchain} username={username} />;
      default:
        return <DeepWorkZone saveToBlockchain={saveToBlockchain} username={username} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isLoggedIn && (
          <AppBar position="static">
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                cleanTxt
              </Typography>
              <IconButton color="inherit" onClick={toggleTheme}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    Signed in as <strong>{username}</strong>
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        )}

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
        >
          {drawer}
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1 }}>
          {renderContent()}
        </Box>

        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              cleanTxt
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