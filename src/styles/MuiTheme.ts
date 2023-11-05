import { grey, teal } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const MuiTheme = createTheme({
  typography: {
    // fontSize: 16,
    allVariants: {
      color: "#111111",
    },
    button: {
      textTransform: "none",
    },
  },
  palette: {
    teal: {
      light: teal[500],
      main: teal[800],
      dark: teal[900],
      contrastText: "#fff",
    },
    secondary: grey,
    deepBlueGrey: {
      light: "#546e7a",
      main: "#2B4247",
      dark: "#263238",
      contrastText: "#fff",
    },
    deepGrey: {
      light: grey[700],
      main: grey[900],
      dark: grey[900],
      contrastText: "#fff",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      variants: [
        {
          props: { size: "xlarge" },
          style: { fontSize: 18, height: "50px" },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label": {
            background: "white",
            color: grey[500],
          },
        },
      },
      defaultProps: {
        InputProps: { sx: { padding: 0 } },
        inputProps: {
          style: { padding: "12.5px 14px" },
        },
      },
    },
    MuiDialogActions: {
      defaultProps: {
        disableSpacing: true,
      },
      styleOverrides: {
        root: {
          justifyContent: "center",
          gap: "50px",
        },
      },
    },
  },
});

declare module "@mui/material/styles" {
  interface PaletteOptions {
    teal: PaletteOptions["primary"];
    deepGrey: PaletteOptions["primary"];
    deepBlueGrey: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    xlarge: true;
  }
  interface ButtonPropsColorOverrides {
    teal: true;
    deepGrey: true;
    deepBlueGrey: true;
  }
}

declare module "@mui/material/styles/createPalette" {
  interface PaletteOptions {
    deepGrey: PaletteColorOptions;
    deepBlueGrey: PaletteColorOptions;
    teal: PaletteColorOptions;
  }
}
