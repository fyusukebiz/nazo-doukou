import { Box } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { CustomCard } from "@/components/cards/CustomCard";
import { grey } from "@mui/material/colors";
import { useFirebaseAuthContext } from "@/components/providers/FirebaseAuthProvider";
import { SignupFormProvider } from "./SignupFormProvider";
import { SignupForm } from "./SignupForm";

export const Signup = () => {
  const router = useRouter();
  const { currentFbUser } = useFirebaseAuthContext();

  useEffect(() => {
    if (!!currentFbUser && currentFbUser.emailVerified) {
      router.push("/recruits");
    }
  }, [currentFbUser, router]);

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
