import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Divider,
  Paper,
  useMediaQuery,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon as MuiListItemIcon,
} from "@mui/material";

import {
  Dashboard,
  Inventory2,
  AddBox,
  ShoppingCart,
  AccountBalanceWallet,
  Store,
  Analytics,
  LocalOffer,
  Settings,
  Search,
  Notifications,
  Menu,
  Logout,
} from "@mui/icons-material";

import { useState, useEffect } from "react";

const drawerWidth = 290;

const STORAGE_KEY = "shopsphere-settings-v2";

/* =========================
   GOLD THEME COLORS
========================= */

const GOLD = "#B28A4A";
const DARK_GOLD = "#9A7438";
const LIGHT_GOLD = "#F6EEDC";
const SOFT_GOLD = "#FBF8F1";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#64748B";

/* =========================
   MENU ITEMS
   🔧 CLEANUP:
   - "Marketing" hata diya (placeholder tha, koi real page connected nahi tha)
   - "Coupons" add kiya PRODUCTS section mein (VendorCoupons.jsx already
     backend se connected hai, lekin sidebar mein link missing tha)
========================= */

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        text: "Dashboard",
        icon: <Dashboard />,
        path: "/vendor/dashboard",
      },
    ],
  },

  {
    section: "PRODUCTS",
    items: [
      {
        text: "Products",
        icon: <Inventory2 />,
        path: "/vendor/products",
      },
      {
        text: "Add Product",
        icon: <AddBox />,
        path: "/vendor/add-product",
      },
      {
        text: "Coupons",
        icon: <LocalOffer />,
        path: "/vendor/coupons",
      },
    ],
  },

  {
    section: "ORDERS",
    items: [
      {
        text: "Orders",
        icon: <ShoppingCart />,
        path: "/vendor/orders",
      },
    ],
  },

  {
    section: "STORE",
    items: [
      {
        text: "My Shop",
        icon: <Store />,
        path: "/vendor/shop",
      },
    ],
  },

  {
    section: "GROWTH",
    items: [
      {
        text: "Earnings",
        icon: <AccountBalanceWallet />,
        path: "/vendor/earnings",
      },
      {
        text: "Analytics",
        icon: <Analytics />,
        path: "/vendor/analytics",
      },
    ],
  },

  {
    section: "SETTINGS",
    items: [
      {
        text: "Settings",
        icon: <Settings />,
        path: "/vendor/settings",
      },
    ],
  },
];

/* =========================
   COMPONENT
========================= */

export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width:900px)");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null); // 🟢 avatar dropdown ke liye

  const [vendorName, setVendorName] = useState("Vendor");
  const [vendorAvatar, setVendorAvatar] = useState("");

  /* =========================
     LOAD VENDOR PROFILE — ab backend se (localStorage nahi)
  ========================= */

  const loadVendorProfile = async () => {
    try {
      const token = localStorage.getItem("shopsphereToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [accountRes, shopRes] = await Promise.all([
        fetch("http://localhost:5000/api/vendor/settings/profile", { headers }),
        fetch("http://localhost:5000/api/vendor/profile", { headers }),
      ]);

      const accountJson = await accountRes.json().catch(() => null);
      const shopJson = await shopRes.json().catch(() => null);

      if (accountJson?.success && accountJson.name) {
        setVendorName(accountJson.name);
      }

      const logoUrl = shopJson?.vendor?.logoUrl;
      if (logoUrl) {
        setVendorAvatar(logoUrl);
      }
    } catch (error) {
      console.error("Failed to load vendor profile:", error);
    }
  };

  useEffect(() => {
    loadVendorProfile();
  }, []);

  /* =========================
     RELOAD PROFILE ON NAVIGATION
     (taaki Settings/My Shop mein naam ya photo change karne ke baad
     topbar turant update ho jaye, bina full page refresh ke)
  ========================= */

  useEffect(() => {
    loadVendorProfile();
  }, [location.pathname]);

  /* =========================
     AVATAR
  ========================= */

  const avatarLetter =
    vendorName?.charAt(0)?.toUpperCase() || "V";

  /* =========================
     NOTIFICATIONS
  ========================= */

  const notifications = [
    "🛒 New Order Received",
    "⭐ New 5-Star Review",
    "📦 Stock Running Low",
  ];

  const handleNotificationOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  /* =========================
     USER MENU / LOGOUT
  ========================= */

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("shopsphereToken");
    localStorage.removeItem(STORAGE_KEY);
    handleUserMenuClose();
    navigate("/vendor/login"); // 👈 apna actual vendor login route yaha confirm kar lena
  };

  /* =========================
     SIDEBAR
  ========================= */

  const sidebar = (
    <Box
      sx={{
        height: "100%",
        background: SOFT_GOLD,
        p: 2,
        overflowY: "auto",

        "&::-webkit-scrollbar": {
          width: "6px",
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#D5C29B",
          borderRadius: "10px",
        },
      }}
    >
      {/* LOGO */}

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 3,

          background:
            "linear-gradient(135deg, #C8A15A 0%, #A98243 100%)",

          color: "#FFFFFF",

          boxShadow:
            "0 8px 20px rgba(178, 138, 74, 0.18)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            letterSpacing: "-0.5px",
          }}
        >
          ShopSphere
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.3,
            opacity: 0.9,
          }}
        >
          Vendor Portal
        </Typography>
      </Paper>

      {/* MENU */}

      {menuItems.map((section) => (
        <Box
          key={section.section}
          sx={{
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              px: 2,
              mb: 1,

              fontSize: "11px",
              fontWeight: 800,
              color: "#9A8A6A",
              letterSpacing: "1.2px",
            }}
          >
            {section.section}
          </Typography>

          <List
            disablePadding
          >
            {section.items.map((item) => {
              const active =
                location.pathname === item.path;

              return (
                <ListItemButton
                  key={item.text}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    mb: 0.6,
                    minHeight: 48,

                    borderRadius: 2.5,

                    color: active
                      ? DARK_GOLD
                      : TEXT_DARK,

                    backgroundColor: active
                      ? LIGHT_GOLD
                      : "transparent",

                    border: active
                      ? `1px solid #E7D7B7`
                      : "1px solid transparent",

                    transition:
                      "all 0.2s ease",

                    "&:hover": {
                      backgroundColor: active
                        ? LIGHT_GOLD
                        : "#F4EDDF",

                      color: DARK_GOLD,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 44,

                      color: active
                        ? GOLD
                        : "#718096",

                      transition:
                        "color 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "15px",
                      fontWeight: active
                        ? 700
                        : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );

  /* =========================
     MAIN LAYOUT
  ========================= */

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #FCFAF6 0%, #F8F4EC 50%, #F5F1E8 100%)",
      }}
    >
      {/* DESKTOP SIDEBAR */}

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: drawerWidth,

              border: "none",

              background: SOFT_GOLD,

              boxSizing: "border-box",
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* MOBILE SIDEBAR */}

      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: SOFT_GOLD,
            },
          }}
        >
          {sidebar}
        </Drawer>
      )}

      {/* MAIN CONTENT */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          position: "relative",
        }}
      >
        {/* TOPBAR */}

        <Paper
          elevation={0}
          sx={{
            m: {
              xs: 1,
              md: 2,
            },

            p: {
              xs: 1.5,
              md: 2,
            },

            borderRadius: 3,

            background:
              "rgba(255, 255, 255, 0.88)",

            border:
              "1px solid #EDE8DE",

            boxShadow:
              "0 8px 25px rgba(80, 65, 40, 0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* MOBILE MENU */}

            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{
                  color: DARK_GOLD,
                }}
              >
                <Menu />
              </IconButton>
            )}

            {/* SEARCH */}

            <TextField
              fullWidth
              size="small"
              placeholder="Search products, orders..."
              sx={{
                maxWidth: 620,

                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,

                  backgroundColor: "#FFFFFF",

                  "& fieldset": {
                    borderColor: "#D8D3CA",
                  },

                  "&:hover fieldset": {
                    borderColor: "#C5A66A",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: GOLD,
                  },
                },

                "& input": {
                  fontSize: "15px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: "#8A8A8A",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* NOTIFICATIONS */}

            <IconButton
              onClick={handleNotificationOpen}
              sx={{
                color: "#6B7280",
              }}
            >
              <Badge
                badgeContent={notifications.length}
                color="error"
              >
                <Notifications />
              </Badge>
            </IconButton>

            <MuiMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleNotificationClose}
            >
              {notifications.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={handleNotificationClose}
                >
                  {item}
                </MenuItem>
              ))}
            </MuiMenu>

            <Divider
              orientation="vertical"
              flexItem
            />

            {/* 🟢 AVATAR + USER INFO — ab clickable hai, dropdown khulega */}

            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                borderRadius: 2,
                px: 1,
                py: 0.5,
                transition: "background 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F4EDDF",
                },
              }}
            >
              <Avatar
                src={vendorAvatar}
                sx={{
                  background:
                    "linear-gradient(135deg, #C8A15A, #A98243)",

                  color: "#FFFFFF",

                  fontWeight: 800,
                }}
              >
                {!vendorAvatar && avatarLetter}
              </Avatar>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                <Typography
                  fontWeight={700}
                  sx={{
                    color: TEXT_DARK,
                  }}
                >
                  {vendorName}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: TEXT_MUTED,
                  }}
                >
                  Vendor
                </Typography>
              </Box>
            </Box>

            {/* 🟢 USER DROPDOWN MENU */}

            <MuiMenu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={handleLogout}
                sx={{ color: "#dc2626", fontWeight: 700 }}
              >
                <MuiListItemIcon>
                  <Logout fontSize="small" sx={{ color: "#dc2626" }} />
                </MuiListItemIcon>
                Logout
              </MenuItem>
            </MuiMenu>
          </Box>
        </Paper>

        {/* PAGE CONTENT */}

        <Box
          sx={{
            px: {
              xs: 1,
              md: 2,
            },

            pb: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}