import { Box } from "@mui/material";
import { CustomCard } from "@/components/cards/CustomCard";
import { grey } from "@mui/material/colors";
import { SignupFormProvider } from "./SignupFormProvider";
import { SignupForm } from "./SignupForm";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";

export const Signup = () => {
  const { isMobile } = useIsMobileContext();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingX: "10px",
        bgcolor: grey[50],
        height: isMobile ? "auto" : "100%",
        backgroundImage: "url(/auth_background.png)",
        overflowY: "scroll",
      }}
    >
      <CustomCard sx={{ maxWidth: "350px", opacity: 0.8, margin: "10px 0px" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <img
            src="/nazo-neko.png"
            alt="謎ねこ"
            style={{
              height: "130px",
              objectFit: "contain",
            }}
          />
          <Box
            sx={{
              fontSize: "28px",
              textAlign: "center",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            新規登録
          </Box>

          <SignupFormProvider>
            <SignupForm />
          </SignupFormProvider>
        </Box>
      </CustomCard>
    </Box>
  );
};
