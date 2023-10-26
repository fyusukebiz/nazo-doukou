import { CustomCard } from '@/components/cards/CustomCard';
import { Box, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';

export default function VerifyPage() {
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
        <Typography sx={{ textAlign: 'center' }}>
          メールに認証用リンクを送信しました。
          <br />
          迷惑メールボックスもご確認ください。
        </Typography>
      </CustomCard>
    </Box>
  );
}
