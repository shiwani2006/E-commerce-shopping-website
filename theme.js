import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#9b7cf4" },
    secondary: { main: "#f472b6" },
    background: { default: "#fbf7ff" },
  },
  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
  },
  shape: {
    borderRadius: 18,
  },
});

export default theme;