import { Box, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/router';
import { CustomCard } from '@/components/cards/CustomCard';

export default function ErrorPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: grey[50],
        height: '100%',
        px: '10px',
      }}
    >
      <CustomCard sx={{ maxWidth: '350px' }}>
        <Typography sx={{ textAlign: 'center' }}>ページが見つかりません</Typography>
      </CustomCard>
    </Box>
  );
}
