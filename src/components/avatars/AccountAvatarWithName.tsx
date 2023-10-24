import { Box, SxProps } from '@mui/material';
import { memo } from 'react';
import { AccountCompanyAvatar } from './AccountAvatar';
import { Account } from '@/types/account';

type Props = {
  sx?: SxProps;
  account?: Account;
  size?: number;
  unknownAccountCompanyName?: string;
};

export const AccountCompanyAvatarWithName = memo(
  ({ sx, account, size = 36, unknownAccountCompanyName = '退会済み' }: Props) => {
    return (
      <>
        {account ? (
          <Box component='span' sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountCompanyAvatar sx={{ mr: 1, ...sx }} account={account} size={size} />
            <Box component='span'>{account ? `${account.lastName} ${account.firstName}` : ''} </Box>
          </Box>
        ) : (
          unknownAccountCompanyName
        )}
      </>
    );
  },
);
