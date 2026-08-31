import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentsIcon from "@mui/icons-material/Payments";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import DiamondIcon from "@mui/icons-material/Diamond";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import NotificationBell from "../common/NotificationBell";
import { useCart } from "../../context/CartContext";

const menu = [
  { label: "Dashboard", path: "/customer/dashboard", icon: <DashboardIcon /> },
  { label: "Products", path: "/customer/products", icon: <DashboardIcon /> },
  { label: "Cart", path: "/customer/cart", icon: <ShoppingBagIcon /> },
  { label: "Orders", path: "/customer/orders", icon: <LocalShippingIcon /> },
  { label: "Wishlist", path: "/customer/wishlist", icon: <FavoriteIcon /> },
  { label: "Profile", path: "/customer/profile", icon: <PersonIcon /> },
  { label: "Payments", path: "/customer/payments", icon: <PaymentsIcon /> },
  { label: "Rewards", path: "/customer/rewards", icon: <CardGiftcardIcon /> },
  { label: "Support", path: "/customer/support", icon: <SupportAgentIcon /> },
  { label: "AI Assistant", path: "/customer/ai-assistant", icon: <SmartToyIcon /> },
];

// Shared sidebar content — used inside both the permanent (desktop)
// and temporary (mobile drawer) versions so we don't duplicate markup.
function SidebarContent({ location, cartCount, onNavigate }) {
  return (
    <>
      <Stack alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 82,
            height: 82,
            background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
            fontWeight: 900,
            fontSize: 34,
            mb: 1.2,
            boxShadow: "0 18px 45px rgba(236,72,153,.25)",
          }}
        >
          S
        </Avatar>

        <Typography variant="h6" fontWeight={900}>
          {location.pathname.includes("/products")
            ? "Products"
            : location.pathname.includes("/cart")
            ? "Cart"
            : location.pathname.includes("/orders")
            ? "Orders"
            : location.pathname.includes("/wishlist")
            ? "Wishlist"
            : location.pathname.includes("/profile")
            ? "Profile"
            : "Customer Dashboard"}
        </Typography>

        <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
          ShopSphere Customer Portal
        </Typography>

        <Chip
          icon={<DiamondIcon />}
          label="Elite Shopper"
          sx={{
            mt: 1,
            bgcolor: "#f3e8ff",
            color: "#7c3aed",
            fontWeight: 900,
          }}
        />
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Stack spacing={0.8}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          const isCart = item.label === "Cart";

          return (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              onClick={onNavigate}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                gap: 1.3,
                py: 1.1,
                px: 1.4,
                borderRadius: 4,
                textTransform: "none",
                fontWeight: 900,
                color: active ? "white" : "#4c1d95",
                background: active
                  ? "linear-gradient(90deg,#8b5cf6,#ec4899)"
                  : "transparent",
                boxShadow: active
                  ? "0 14px 30px rgba(236,72,153,.25)"
                  : "none",
                "&:hover": {
                  background: active
                    ? "linear-gradient(90deg,#8b5cf6,#ec4899)"
                    : "#f3e8ff",
                  transform: "translateX(4px)",
                },
              }}
            >
              <Badge
                badgeContent={isCart ? cartCount : 0}
                color="error"
                invisible={!isCart || cartCount === 0}
              >
                <Avatar
                  sx={{
                    width: 31,
                    height: 31,
                    bgcolor: active ? "rgba(255,255,255,.22)" : "#f3e8ff",
                    color: active ? "white" : "#ec4899",
                  }}
                >
                  {item.icon}
                </Avatar>
              </Badge>
              {item.label}
            </Button>
          );
        })}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          mt: 2.2,
          p: 2,
          borderRadius: 5,
          background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
          color: "white",
        }}
      >
        <Typography fontWeight={900}>Rewards</Typography>
        <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
          720 / 1000 points
        </Typography>

        <LinearProgress
          variant="determinate"
          value={72}
          sx={{
            mt: 1.5,
            height: 9,
            borderRadius: 99,
            bgcolor: "rgba(255,255,255,.25)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 99,
              bgcolor: "white",
            },
          }}
        />
      </Paper>

      <Button
        fullWidth
        startIcon={<LogoutIcon />}
        sx={{
          mt: 1.5,
          borderRadius: 99,
          py: 1.1,
          textTransform: "none",
          color: "#ec4899",
          fontWeight: 900,
          bgcolor: "#fff1f7",
          "&:hover": { bgcolor: "#ffe4f0" },
        }}
      >
        Logout
      </Button>
    </>
  );
}

export default function CustomerLayout() {
  const location = useLocation();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClose = () => setMobileOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 8% 8%, #fbcfe8 0, transparent 25%), radial-gradient(circle at 88% 6%, #ddd6fe 0, transparent 30%), linear-gradient(135deg,#fff7fb,#f7f0ff,#eef7ff)",
      }}
    >
      {/* DESKTOP: permanent sidebar, same as before */}
      <Box
        sx={{
          width: { xs: 0, md: 305 },
          display: { xs: "none", md: "block" },
          p: 1.5,
          flexShrink: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            height: "calc(100vh - 24px)",
            position: "sticky",
            top: 12,
            p: 2.2,
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,.92)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.95)",
            boxShadow: "0 24px 70px rgba(124,58,237,.14)",
            overflow: "auto",
          }}
        >
          <SidebarContent location={location} cartCount={cartCount} />
        </Paper>
      </Box>

      {/* MOBILE: slide-in drawer, opened via hamburger button in the topbar */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleClose}
        ModalProps={{ keepMounted: true }} // better mobile perf on re-open
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 290,
            boxSizing: "border-box",
            p: 2.2,
            bgcolor: "rgba(255,255,255,.97)",
            backdropFilter: "blur(24px)",
          },
        }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <IconButton onClick={handleClose} sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <SidebarContent location={location} cartCount={cartCount} onNavigate={handleClose} />
      </Drawer>

      <Box sx={{ flex: 1, p: { xs: 1.5, md: 1.5 }, minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            p: 1.6,
            borderRadius: 5,
            bgcolor: "rgba(255,255,255,.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,.95)",
            boxShadow: "0 14px 38px rgba(124,58,237,.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            {/* Hamburger only shows up below md breakpoint */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                bgcolor: "#f3e8ff",
                color: "#7c3aed",
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Customer Dashboard
              </Typography>
              <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                Premium shopping control center
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
              <SearchIcon />
            </IconButton>

            <NotificationBell />

            <Badge
              badgeContent={cartCount}
              color="error"
              invisible={cartCount === 0}
            >
              <IconButton
                component={Link}
                to="/customer/cart"
                sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
              >
                <ShoppingBagIcon />
              </IconButton>
            </Badge>

            <Avatar sx={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
              S
            </Avatar>
          </Stack>
        </Paper>

        <Outlet />
      </Box>
    </Box>
  );
}