import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Stack,
  Divider,
  AppBar,
  InputBase,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";

import {
  Menu as MenuIcon,
  DashboardRounded,
  Inventory2Rounded,
  ShoppingCartRounded,
  PeopleRounded,
  StoreRounded,
  LocalOfferRounded,
  InsightsRounded,
  ReviewsRounded,
  NotificationsRounded,
  SettingsRounded,
  AccountCircleRounded,
  LogoutRounded,
  SearchRounded,
  CategoryRounded,
  PercentRounded,
} from "@mui/icons-material";

const drawerWidth = 280;

/* =========================
   SOFT AURORA DESIGN TOKENS
========================= */
const tokens = {
  bg1: "#eafaf4",
  bg2: "#eef0fb",
  bg3: "#e8f2fb",
  glass: "rgba(255,255,255,0.72)",
  glassStrong: "rgba(255,255,255,0.92)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textSecondary: "#5b6472",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  primaryDim: "#0d9488",
  primarySoft: "rgba(20,184,166,0.14)",
  purple: "#8b7cf6",
  purpleSoft: "rgba(139,124,246,0.14)",
  pink: "#f472b6",
  pinkSoft: "rgba(244,114,182,0.14)",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.16)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
  shadowSm: "0 4px 14px rgba(31,41,55,0.06)",
};

// Rotate through the palette so the nav reads as colourful, not monochrome
const NAV_COLORS = [
  { c: tokens.primary, s: tokens.primarySoft },
  { c: tokens.purple, s: tokens.purpleSoft },
  { c: tokens.amber, s: tokens.amberSoft },
  { c: tokens.pink, s: tokens.pinkSoft },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  // Notifications, Users and Reports removed from the sidebar
  const menuItems = [
    { title: "Dashboard", icon: <DashboardRounded />, path: "/admin/dashboard" },
    { title: "ProductsApproval", icon: <Inventory2Rounded />, path: "/admin/products-approval" },
    { title: "Orders", icon: <ShoppingCartRounded />, path: "/admin/orders" },
    { title: "Customers", icon: <PeopleRounded />, path: "/admin/customers" },
    { title: "Vendors", icon: <StoreRounded />, path: "/admin/vendors" },
    { title: "Coupons", icon: <LocalOfferRounded />, path: "/admin/coupons" },
    { title: "Analytics", icon: <InsightsRounded />, path: "/admin/analytics" },
    { title: "Reviews", icon: <ReviewsRounded />, path: "/admin/reviews" },
    { title: "Categories", icon: <CategoryRounded />, path: "/admin/categories" },
    { title: "Commission", icon: <PercentRounded />, path: "/admin/commission" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("shopsphereToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const chipSx = {
    width: 32,
    height: 32,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
    "& svg": { fontSize: 18 },
  };

  const bottomItemSx = (soft, color, activeTo) => ({
    borderRadius: "16px",
    mb: 0.5,
    color: tokens.textSecondary,
    transition: "all 0.18s ease",
    "& .nav-icon-chip": { bgcolor: soft, color },
    "&.active": {
      bgcolor: tokens.glassStrong,
      color: tokens.textPrimary,
      boxShadow: tokens.shadowSm,
      "& .nav-icon-chip": {
        background: `linear-gradient(135deg, ${color}, ${activeTo})`,
        color: "#fff",
      },
    },
    "&:hover": { bgcolor: "rgba(31,36,48,0.04)" },
  });

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
      }}
    >
      <Box
        sx={{
          flex: 1,
          background: tokens.glassStrong,
          backdropFilter: "blur(20px)",
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: "28px",
          boxShadow: tokens.shadow,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",

          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(31,36,48,0.15)",
            borderRadius: "10px",
          },
        }}
      >
        {/* Logo */}
        <Toolbar sx={{ py: 3, px: 3, flexShrink: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
              mr: 1.5,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: tokens.textPrimary, letterSpacing: "-0.01em" }}
          >
            ShopSphere
          </Typography>
        </Toolbar>

        {/* Menu */}
        <List sx={{ px: 2 }}>
          {menuItems.map((item, i) => {
            const palette = NAV_COLORS[i % NAV_COLORS.length];
            return (
              <ListItemButton
                key={item.title}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: "16px",
                  mb: 0.75,
                  py: 1,
                  color: tokens.textSecondary,
                  transition: "all 0.18s ease",

                  "& .nav-icon-chip": {
                    bgcolor: palette.s,
                    color: palette.c,
                  },

                  "&.active": {
                    bgcolor: tokens.glassStrong,
                    color: tokens.textPrimary,
                    boxShadow: tokens.shadowSm,
                    "& .nav-icon-chip": {
                      background: `linear-gradient(135deg, ${palette.c}, ${tokens.purple})`,
                      color: "#fff",
                    },
                  },

                  "&:hover": {
                    bgcolor: "rgba(31,36,48,0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box className="nav-icon-chip" sx={chipSx}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Bottom Section */}
        <Divider sx={{ borderColor: tokens.hairline, mx: 2 }} />

        <List sx={{ p: 2, flexShrink: 0 }}>
          <ListItemButton
            component={NavLink}
            to="/admin/settings"
            sx={bottomItemSx(tokens.primarySoft, tokens.primary, tokens.purple)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Box className="nav-icon-chip" sx={chipSx}>
                <SettingsRounded fontSize="small" />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/admin/profile"
            sx={bottomItemSx(tokens.purpleSoft, tokens.purple, tokens.pink)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Box className="nav-icon-chip" sx={chipSx}>
                <AccountCircleRounded fontSize="small" />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }} />
          </ListItemButton>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "16px",
              color: tokens.danger,
              "&:hover": { bgcolor: tokens.dangerSoft },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Box
                sx={{
                  ...chipSx,
                  bgcolor: tokens.dangerSoft,
                  color: tokens.danger,
                }}
              >
                <LogoutRounded fontSize="small" />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 600 }} />
          </ListItemButton>
        </List>

        {/* User Card */}
        <Box p={2} pt={0} sx={{ flexShrink: 0 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "18px",
              background: `linear-gradient(135deg, ${tokens.primarySoft}, ${tokens.purpleSoft})`,
              border: `1px solid ${tokens.glassBorder}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
                  fontWeight: 700,
                }}
              >
                S
              </Avatar>
              <Box>
                <Typography fontWeight={700} fontSize="0.9rem" color={tokens.textPrimary}>
                  Admin
                </Typography>
                <Typography variant="body2" fontSize="0.78rem" color={tokens.textMuted}>
                  Super Admin
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${tokens.bg1} 0%, ${tokens.bg2} 50%, ${tokens.bg3} 100%)`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* TopBar */}
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "transparent",
          boxShadow: "none",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ px: { xs: 1, md: 2 }, pt: 1.5 }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: tokens.glass,
              backdropFilter: "blur(20px)",
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: "22px",
              boxShadow: tokens.shadowSm,
              px: 1.5,
              py: 1,
            }}
          >
            <IconButton
              sx={{ display: { md: "none" }, mr: 1, color: tokens.textPrimary }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>

            {/* Search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255,255,255,0.6)",
                border: `1px solid ${tokens.hairline}`,
                px: 2,
                py: 0.75,
                borderRadius: "14px",
                width: 340,
                maxWidth: "100%",
                color: tokens.textMuted,
              }}
            >
              <SearchRounded sx={{ color: tokens.textMuted, fontSize: 20 }} />
              <InputBase
                placeholder="Search..."
                sx={{ ml: 1, width: "100%", color: tokens.textPrimary, fontSize: "0.88rem" }}
              />
            </Box>

            <Box flex={1} />

            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                color: tokens.textPrimary,
                bgcolor: "rgba(255,255,255,0.6)",
                mr: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsRounded sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              A
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: "16px",
                  mt: 1,
                  boxShadow: tokens.shadow,
                },
              }}
            >
              <MenuItem onClick={() => navigate("/admin/profile")}>Profile</MenuItem>
              <MenuItem onClick={() => navigate("/admin/settings")}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: "none",
            bgcolor: "transparent",
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, border: "none", bgcolor: "transparent" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          p: 4,
        }}
      >
        <Toolbar sx={{ mb: 1 }} />
        <Outlet />
      </Box>
    </Box>
  );
}