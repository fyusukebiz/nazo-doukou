import { Box, Button, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { IconType } from 'react-icons';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { LiaCalendarSolid, LiaCogSolid, LiaClipboardListSolid } from 'react-icons/lia';
import { Page, useSelectedPageContext } from './SelectedPageProvider';
import { useHasPlan } from '@/hooks/useHasPlan';

export const MobileFooterBar = () => {
  const hasPlan = useHasPlan();

  return (
    <Box sx={{ height: '100%', borderTop: '1px solid', borderColor: grey[300], display: 'flex' }}>
      {hasPlan && <ItemButton page='companies' title='さがす' icon={FiSearch} />}
      {hasPlan && <ItemButton page='jobs' title='募集' icon={LiaClipboardListSolid} />}
      <ItemButton page='rooms' title='トーク' icon={BsFillChatDotsFill} />
      <ItemButton page='orders' title='受注案件' icon={LiaCalendarSolid} />
      <ItemButton page='settings' title='設定' icon={LiaCogSolid} />
    </Box>
  );
};

const ItemButton = ({ page, title, icon }: { page: Page; title: string; icon: IconType }) => {
  const Icon = icon;
  const { selectedPage, setSelectedPage } = useSelectedPageContext();
  const router = useRouter();

  const handleClick = useCallback(() => {
    setSelectedPage(page);
    router.push(`/${page}`);
  }, [page, router, setSelectedPage]);

  return (
    <Button
      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleClick}
    >
      <Icon size={24} color={selectedPage === page ? 'black' : grey[400]} />
      <Typography sx={{ fontSize: 14, mt: '2px', mb: '5px', color: selectedPage === page ? 'black' : grey[400] }}>
        {title}
      </Typography>
    </Button>
  );
};
