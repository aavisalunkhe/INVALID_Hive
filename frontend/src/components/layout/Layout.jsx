import React from 'react';
import { Container, Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        py: 3,
        minHeight: 'calc(100vh - 64px)', // Account for navbar height
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
    </Container>
  );
};

export default Layout; 