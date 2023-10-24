'use client';

import { Box, BoxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { forwardRef } from 'react';

type Props = BoxProps;

export const CustomCard = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, sx, ...attr } = props;

  return (
    <Box
      ref={ref}
      sx={{
        border: 'solid 2px',
        borderColor: grey[300],
        borderRadius: '10px',
        p: '30px',
        bgcolor: 'white',
        width: '100%',
        ...sx,
      }}
      {...attr}
    >
      {children}
    </Box>
  );
});
