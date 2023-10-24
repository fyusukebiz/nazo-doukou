import { Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import { Account } from '@/types/account';

type Props = {
  sx?: object;
  account?: Account;
  size?: number;
};

export const AccountCompanyAvatar = memo(({ sx, account, size = 36 }: Props) => {
  const AvatarComponent = styled(Avatar)({
    width: size,
    height: size,
    align: 'center',
    margin: 0,
  });

  const name = account ? `${account.lastName} ${account.firstName}` : '';

  return (
    <>
      {!account ? (
        ''
      ) : (
        <Tooltip title={`${account.lastName} ${account.firstName}`} placement='top'>
          {account.avatarUrl ? (
            <AvatarComponent sx={{ ...sx }} alt={name} src={account.avatarUrl} />
          ) : (
            <AvatarComponent sx={{ ...sx, bgcolor: account.profileColor }} alt={name} />
          )}
        </Tooltip>
      )}
    </>
  );
});
