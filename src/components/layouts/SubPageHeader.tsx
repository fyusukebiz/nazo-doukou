import { IconButton, Popover, SxProps } from '@mui/material';
import { Box, BoxProps } from '@mui/system';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { PiCaretLeftBold } from 'react-icons/pi';

type Props = Omit<BoxProps, 'title'> & {
  title: ReactNode;
  rightItem?: ReactNode;
  enablePopover?: boolean;
  popoverLinkPath?: string;
};

export const SubPageHeader = (props: Props) => {
  const { sx, title, rightItem, enablePopover = false, popoverLinkPath, ...attr } = props;
  const router = useRouter();

  const titleSx: SxProps = rightItem
    ? {
        marginRight: 'auto',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateY(-50%) translateX(-50%)',
        webkitTransform: 'translateY(-50%) translateX(-50%)',
        margin: 'auto',
      };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const isPopOverOpen = Boolean(anchorEl);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #DDDDDD',
        background: 'white',
        position: 'relative',
        height: '64px',
        flexShrink: 0,
        ...sx,
      }}
      {...attr}
    >
      <IconButton onClick={() => router.back()} sx={{ marginLeft: '10px' }}>
        <PiCaretLeftBold size={24} />
      </IconButton>
      <Box
        component='h1'
        className='ellipsis'
        sx={{
          ...titleSx,
          fontWeight: 'bold',
          marginRight: '5px',
          fontSize: '16px',
          maxWidth: '70%',
        }}
        onClick={handlePopoverOpen}
      >
        {title}
      </Box>
      {enablePopover && (
        <Popover
          open={isPopOverOpen}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handlePopoverClose}
        >
          <Box sx={{ p: 1 }} className='testtest'>
            {popoverLinkPath ? <Link href={popoverLinkPath}>{title}</Link> : <Box>{title}</Box>}
          </Box>
        </Popover>
      )}
      {rightItem ? rightItem : null}
    </Box>
  );
};
