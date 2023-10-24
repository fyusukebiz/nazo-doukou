import Chip, { ChipProps } from '@mui/material/Chip';
import { memo } from 'react';

export const ContainedChip = memo((props: ChipProps) => {
  const { sx, label, ...attr } = props;
  return (
    <Chip
      label={label}
      sx={{
        ...sx,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        '& .MuiChip-deleteIcon': {
          color: '#ffffff',
          '&:hover': {
            color: '#e5e5e5',
          },
        },
      }}
      {...attr}
    />
  );
});
