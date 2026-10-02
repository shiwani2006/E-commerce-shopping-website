import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Paper,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";

import logo from "../../assets/storelogo.png";

const menuData = {
  Men: {
    "Topwear": ["T-Shirts", "Casual Shirts", "Hoodies", "Jackets"],
    "Bottomwear": ["Jeans", "Joggers", "Shorts", "Trousers"],
    "Footwear": ["Sneakers", "Sports Shoes", "Sandals"],
  },
  Women: {
    "Indian Wear": ["Kurtas", "Sarees", "Lehengas", "Dupattas"],
    "Western Wear": ["Dresses", "Tops", "Jeans", "Jackets"],
    "Beauty": ["Makeup", "Skincare", "Perfume"],
  },
  Beauty: {
    "Makeup": ["Lipstick", "Foundation", "Eyeliner", "Mascara"],
    "Skincare": ["Face Wash", "Moisturizer", "Sunscreen"],
    "Haircare": ["Shampoo", "Serum", "Hair Mask"],
  },
  Electronics: {
    "Gadgets": ["Smart Watches", "Headphones", "Speakers"],
    "Mobile": ["Phone Cases", "Chargers", "Power Banks"],
    "Laptop": ["Mouse", "Keyboard", "Laptop Bags"],
  },
  Home: {
    "Decor": ["Wall Art", "Lamps", "Candles"],
    "Kitchen": ["Storage", "Dinner Set", "Bottles"],
    "Living": ["Bedsheets", "Cushions", "Curtains"],
  },
};

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(5,150,105,0.18)",
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 2, md: 6 },
          py: 1,
        }}
      >
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="ShopSphere Logo"
            sx={{ width: 46, height: 46, objectFit: "contain" }}
          />

          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              background: "linear-gradient(90deg,#059669,#d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ShopSphere
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {Object.keys(menuData).map((item) => (
            <Box
              key={item}
              sx={{
                position: "relative",
                py: 2,
                "&:hover .megaMenu": {
                  opacity: 1,
                  visibility: "visible",
                  transform: "translateY(0)",
                },
              }}
            >
              <Typography
                component={Link}
                to={`/products?category=${item.toLowerCase()}`}
                fontWeight={900}
                sx={{
                  textDecoration: "none",
                  color: "#065f46",
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { color: "#d4af37" },
                }}
              >
                {item}
              </Typography>

              <Paper
                className="megaMenu"
                elevation={0}
                sx={{
                  position: "absolute",
                  top: "58px",
                  left: "50%",
                  transform: "translate(-50%, 14px)",
                  width: 620,
                  p: 3,
                  borderRadius: 6,
                  opacity: 0,
                  visibility: "hidden",
                  transition: "0.25s",
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 25px 70px rgba(5,150,105,0.18)",
                }}
              >
                <Grid container spacing={3}>
                  {Object.entries(menuData[item]).map(([heading, links]) => (
                    <Grid item xs={4} key={heading}>
                      <Typography
                        fontWeight={900}
                        sx={{
                          mb: 1.5,
                          color: "#0f766e",
                          fontSize: 15,
                        }}
                      >
                        {heading}
                      </Typography>

                      {links.map((link) => (
                        <Typography
                          key={link}
                          component={Link}
                          to={`/products?category=${item.toLowerCase()}&type=${link.toLowerCase()}`}
                          sx={{
                            display: "block",
                            textDecoration: "none",
                            color: "#5b5470",
                            py: 0.7,
                            fontSize: 14,
                            transition: "0.2s",
                            "&:hover": {
                              color: "#059669",
                              transform: "translateX(5px)",
                              fontWeight: 800,
                            },
                          }}
                        >
                          {link}
                        </Typography>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton component={Link} to="/products">
            <SearchIcon />
          </IconButton>

          <IconButton component={Link} to="/login">
            <AccountCircleIcon />
          </IconButton>

          <IconButton>
            <FavoriteBorderIcon />
          </IconButton>

          <IconButton component={Link} to="/customer/cart">
            <Badge badgeContent={0} color="secondary">
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>

          <Button
            component={Link}
            to="/register"
            variant="contained"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              borderRadius: 99,
              px: 3,
              background: "linear-gradient(90deg,#059669,#d4af37)",
              boxShadow: "0 12px 30px rgba(212,175,55,0.25)",
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Join
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}