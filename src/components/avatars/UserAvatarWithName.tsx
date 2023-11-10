import { Box } from "@mui/material";
import { memo } from "react";
import { UserAvatar } from "./UserAvatar";
import { UserDetail } from "@/types/user";

type Props = {
  sx?: object;
  user?: UserDetail;
  size?: number;
  unknownAccountCompanyName?: string;
};

export const UserAvatarWithName = memo(
  ({ sx, user, size = 36, unknownAccountCompanyName = "退会済み" }: Props) => {
    return (
      <>
        {user ? (
          <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
            <UserAvatar sx={{ mr: 1, ...sx }} user={user} size={size} />
            <Box component="span">{user ? user.name : ""} </Box>
          </Box>
        ) : (
          unknownAccountCompanyName
        )}
      </>
    );
  }
);
