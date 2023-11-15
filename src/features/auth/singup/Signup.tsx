import { Box } from "@mui/material";
import { CustomCard } from "@/components/cards/CustomCard";
import { grey } from "@mui/material/colors";
import { SignupFormProvider } from "./SignupFormProvider";
import { SignupForm } from "./SignupForm";

export const Signup = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: grey[50],
        height: "100%",
        px: "10px",
        backgroundImage: "url(/auth_background.png)",
      }}
    >
      <CustomCard sx={{ maxWidth: "350px", opacity: 0.8 }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <img
            src="/service_logo.png"
            alt="service_logo"
            style={{ height: "100px", objectFit: "contain", marginTop: "10px" }}
          />
          <Box
            sx={{
              fontSize: "28px",
              textAlign: "center",
              fontWeight: "bold",
              marginTop: "30px",
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
