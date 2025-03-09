import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const Navbar = ({
  username,
  onLogout,
  darkMode,
  toggleTheme,
  followers,
  following,
  onDrawerToggle
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    onLogout();
    navigate('/');
  };

  const handleDashboard = () => {
    handleCloseMenu();
    navigate('/dashboard');
  };

  const handleProfile = () => {
    handleCloseMenu();
    navigate('/profile');
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: darkMode ? '#121212' : '#ffffff',
        color: darkMode ? '#fff' : '#000',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'background-color 0.3s ease',
        borderBottom: darkMode ? '1px solid #333' : '1px solid #eee'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }}/>
        </IconButton>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            fontWeight: 700,
            letterSpacing: 1.2,
            background: 'linear-gradient(45deg, #f093fb, #f5576c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transition: 'opacity 0.3s ease',
            '&:hover': { opacity: 0.8 }
          }}
        >
          CleanTxt
        </Typography>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          sx={{
            mr: 2,
            transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.1)' }
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {username ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenu}
              sx={{
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            >
              <UserCircle size={28} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  backgroundColor: darkMode ? '#1e1e1e' : '#fafafa',
                  color: darkMode ? '#fff' : '#000',
                  mt: 1,
                  borderRadius: 1,
                  boxShadow: darkMode ? '0 2px 4px rgba(255,255,255,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.3s ease'
                }
              }}
            >
              <MenuItem disabled sx={{ opacity: 0.8, fontSize: '0.9rem' }}>
                {username} | {followers} Followers | {following} Following
              </MenuItem>
              <MenuItem
                onClick={handleProfile}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: darkMode ? '#333' : '#eee' }
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={handleDashboard}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: darkMode ? '#333' : '#eee' }
                }}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: darkMode ? '#333' : '#eee' }
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            color="inherit"
            sx={{
              textTransform: 'none',
              transition: 'background-color 0.3s, transform 0.3s',
              '&:hover': {
                backgroundColor: darkMode ? '#333' : '#ddd',
                transform: 'scale(1.05)'
              }
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
