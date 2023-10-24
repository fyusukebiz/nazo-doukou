import { Box, BoxProps } from '@mui/system';

export const PageHeader = (props: BoxProps) => {
  const { sx, children, ...attr } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #DDDDDD',
        background: 'white',
        flexShrink: 0,
        zIndex: 2,
        paddingX: '24px',
        ...sx,
      }}
      {...attr}
    >
      {children}
    </Box>
  );
};
