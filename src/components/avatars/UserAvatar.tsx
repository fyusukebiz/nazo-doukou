import { Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { memo } from "react";
import { UserDetail } from "@/types/user";
import { grey } from "@mui/material/colors";

type Props = {
  sx?: object;
  user?: UserDetail;
  size?: number;
};

export const UserAvatar = memo(({ sx, user, size = 36 }: Props) => {
  const AvatarComponent = styled(Avatar)({
    width: size,
    height: size,
    align: "center",
    margin: 0,
  });

  return (
    <>
      {!user ? null : (
        <Tooltip title="name" placement="top">
          {user?.iconImageUrl ? (
            <AvatarComponent
              sx={{ ...sx }}
              alt={user.name}
              src={user.iconImageUrl}
            />
          ) : (
            <AvatarComponent sx={{ ...sx, bgcolor: grey }} alt={user.name} />
          )}
        </Tooltip>
      )}
    </>
  );
});
