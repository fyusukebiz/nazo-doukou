import { useDisclosure } from '@/hooks/useDisclosure';
import { Box, Dialog, BoxProps } from '@mui/material';
import { grey } from '@mui/material/colors';

type Props = BoxProps & {
  url?: string;
  imageHeight?: string;
};

export const ImageWithModal = ({ url, imageHeight, sx, ...attr }: Props) => {
  const { isOpen: isDialogOpen, onOpen: onOpenDialog, onClose: onCloseDialog } = useDisclosure();

  return (
    <>
      <Box
        sx={{
          height: imageHeight ?? '220x',
          background: grey[300],
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
        onClick={() => {
          onOpenDialog();
        }}
        {...attr}
      >
        <img src={url} style={{ objectFit: 'cover', maxHeight: imageHeight ?? '220x', width: '100%' }} alt='image' />
      </Box>

      <Dialog open={isDialogOpen} onClose={onCloseDialog}>
        <img src={url} style={{ objectFit: 'cover', maxHeight: '220x', width: '100%' }} alt='image' />
      </Dialog>
    </>
  );
};
