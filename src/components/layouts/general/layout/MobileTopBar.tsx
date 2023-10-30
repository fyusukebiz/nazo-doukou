import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

export const MobileTopBar = () => {
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
