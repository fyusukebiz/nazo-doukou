import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { MobileFooterBar } from './MobileFooterBar';
import { PcSideBar } from './PcSideBar';
import { SelectedPageProvider } from './SelectedPageProvider';
import { useIsMobileContext } from '@/features/common/IsMobileProvider';

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  const { isMobile } = useIsMobileContext();

  return (
    <SelectedPageProvider>
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box component='main' sx={{ flexGrow: 1, minHeight: 0 }}>
            {children}
          </Box>
          <Box sx={{ height: '60px', flexShrink: 0, zIndex: 1, background: 'white' }}>
            <MobileFooterBar />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '100%' }}>
          <Box sx={{ width: '100px', flexShrink: 0 }}>
            <PcSideBar />
          </Box>
          <Box component='main' sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      )}
    </SelectedPageProvider>
  );
};
