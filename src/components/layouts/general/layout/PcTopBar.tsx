import { Box, Button, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { IconType } from "react-icons";
import { BsFillChatDotsFill } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import {
  LiaCalendarSolid,
  LiaClipboardListSolid,
  LiaCogSolid,
} from "react-icons/lia";
import { Page, useSelectedPageContext } from "./SelectedPageProvider";

export const PcTopBar = () => {
  return (
    <Box
      sx={{
        height: "100%",
        borderBottom: "1px solid",
        borderColor: grey[400],
        display: "flex",
        alignItems: "center",
        paddingX: "20px",
      }}
    >
      <Box component="h1" sx={{ fontSize: "20px" }}>
        {process.env.NEXT_PUBLIC_SERVICE_NAME}
      </Box>
      {/* <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
      </Box> */}
    </Box>
  );
};

const ItemButton = ({
  page,
  title,
  icon,
}: {
  page: Page;
  title: string;
  icon: IconType;
}) => {
  const Icon = icon;
  const { selectedPage, setSelectedPage } = useSelectedPageContext();
  const router = useRouter();

  const handleClick = useCallback(() => {
    setSelectedPage(page);
    router.push(`/${page}`);
  }, [page, router, setSelectedPage]);

  return (
    <Button
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80px",
      }}
      onClick={handleClick}
    >
      <Icon size={25} color={selectedPage === page ? "black" : grey[400]} />
      <Typography
        sx={{
          fontSize: 14,
          mt: "2px",
          color: selectedPage === page ? "black" : grey[400],
        }}
      >
        {title}
      </Typography>
    </Button>
  );
};
