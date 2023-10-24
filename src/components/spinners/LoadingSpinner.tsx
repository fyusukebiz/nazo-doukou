import { Box, CircularProgress, CircularProgressProps } from '@mui/material';
import React from 'react';

export const LoadingSpinner = (props: CircularProgressProps) => {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={50} sx={{ height: '100%' }} {...props} />
    </Box>
  );
};
