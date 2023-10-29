import { Box } from "@mui/material";
import { ReactNode } from "react";
import { PcTopBar } from "./PcTopBar";
import { SelectedPageProvider } from "./SelectedPageProvider";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  const { isMobile } = useIsMobileContext();

  return (
    <SelectedPageProvider>
      {isMobile ? (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
            {children}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ height: "50px", flexShrink: 0 }}>
            <PcTopBar />
          </Box>
          <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      )}
    </SelectedPageProvider>
  );
};
