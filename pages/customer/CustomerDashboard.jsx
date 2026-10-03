import { useState, useEffect, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentsIcon from "@mui/icons-material/Payments";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReplayIcon from "@mui/icons-material/Replay";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DiamondIcon from "@mui/icons-material/Diamond";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";

import { getMyOrders } from "../../api/ordersApi";

const API_BASE_URL = "http://localhost:5000";

// Resolves a product image path the same way Products.jsx / Home.jsx do
function resolveImg(path) {
  if (!path) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

// Maps backend orderStatus -> a 0-100 progress value for the progress bar
function statusToProgress(status) {
  switch (status) {
    case "Placed":
      return 20;
    case "Confirmed":
      return 45;
    case "Shipped":
      return 70;
    case "Delivered":
      return 100;
    case "Cancelled":
      return 100;
    default:
      return 10;
  }
}

// Reads + merges the two localStorage sources for profile info.
// shopsphere_profile (richer, has city/state) takes priority,
// shopsphereUser (set at login) is the fallback.
function loadProfile() {
  let user = {};
  let profile = {};

  try {
    user = JSON.parse(localStorage.getItem("shopsphereUser")) || {};
  } catch {
    user = {};
  }

  try {
    profile = JSON.parse(localStorage.getItem("shopsphere_profile")) || {};
  } catch {
    profile = {};
  }

  return {
    name: profile.name || user.name || "Customer",
    email: profile.email || user.email || "",
    city: profile.city || "",
    state: profile.state || "",
  };
}

export default function CustomerDashboard() {
  const [edit, setEdit] = useState(false);
  const [profile, setProfile] = useState(loadProfile);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await getMyOrders();
        const list = data?.orders && Array.isArray(data.orders) ? data.orders : [];
        if (isMounted) setOrders(list);
      } catch (err) {
        console.error("Failed to load orders on dashboard:", err);
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real stats derived from actual order data instead of hardcoded numbers
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inTransit = orders.filter(
      (o) => o.orderStatus === "Shipped" || o.orderStatus === "Confirmed"
    ).length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return [
      ["Orders", String(totalOrders), <ShoppingBagIcon />, "#8b5cf6"],
      ["Wishlist", "—", <FavoriteIcon />, "#ec4899"], // no backend yet
      ["Transit", String(inTransit).padStart(2, "0"), <LocalShippingIcon />, "#2563eb"],
      [
        "Spent",
        totalSpent >= 1000 ? `₹${(totalSpent / 1000).toFixed(1)}K` : `₹${totalSpent}`,
        <PaymentsIcon />,
        "#16a34a",
      ],
    ];
  }, [orders]);

  // Most recent 3 orders for the "Recent Orders" panel
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const hasAddress = profile.city || profile.state;

  return (
    <Grid container spacing={1.5} alignItems="stretch">
      {/* CENTER COLUMN */}
      <Grid item xs={12} xl={8.2} lg={8}>
        <Stack spacing={1.5}>
          {/* HERO */}
          <Paper
            elevation={0}
            sx={{
              minHeight: 250,
              p: { xs: 3, md: 3.5 },
              borderRadius: 6,
              background: "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
              color: "white",
              boxShadow: "0 28px 75px rgba(236,72,153,.28)",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: -90,
                top: -90,
                width: 320,
                height: 320,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,.14)",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Chip
                icon={<DiamondIcon />}
                label="Elite Myntra-style Dashboard"
                sx={{
                  bgcolor: "rgba(255,255,255,.22)",
                  color: "white",
                  fontWeight: 900,
                  mb: 2,
                }}
              />

              <Typography variant="h3" fontWeight={900}>
                Welcome back, {profile.name.split(" ")[0]} ✨
              </Typography>

              <Typography sx={{ mt: 1, opacity: 0.92, maxWidth: 780 }}>
                Track orders, rewards, wishlist and delivery updates in one premium dashboard.
              </Typography>

              <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
                {["Free Delivery", "Premium Support", "Fast Returns"].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      bgcolor: "rgba(255,255,255,.2)",
                      color: "white",
                      fontWeight: 900,
                    }}
                  />
                ))}
              </Stack>

              <Button
                component={Link}
                to="/products"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 3,
                  bgcolor: "white",
                  color: "#7c3aed",
                  borderRadius: 99,
                  px: 4,
                  py: 1.1,
                  textTransform: "none",
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#fff7fb" },
                }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Paper>

          {/* STATS */}
          <Grid container spacing={1.5}>
            {stats.map(([title, value, icon, color]) => (
              <Grid item xs={6} md={3} key={title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    minHeight: 112,
                    borderRadius: 5,
                    bgcolor: "rgba(255,255,255,.9)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,.95)",
                    boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                    transition: ".3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 24px 60px rgba(236,72,153,.16)",
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ color: "#6b647a", fontWeight: 800, fontSize: 14 }}>
                        {title}
                      </Typography>
                      <Typography variant="h5" fontWeight={900}>
                        {value}
                      </Typography>
                    </Box>

                    <Avatar sx={{ bgcolor: `${color}18`, color, width: 46, height: 46 }}>
                      {icon}
                    </Avatar>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* ORDERS */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Recent Orders
                </Typography>
                <Typography sx={{ color: "#6b647a" }}>
                  Live tracking and delivery progress.
                </Typography>
              </Box>

              <Button component={Link} to="/customer/orders" sx={{ color: "#7c3aed", fontWeight: 900 }}>
                View All
              </Button>
            </Stack>

            {ordersLoading ? (
              <LinearProgress sx={{ borderRadius: 99 }} />
            ) : recentOrders.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  textAlign: "center",
                  bgcolor: "#fff7fb",
                  border: "1px dashed",
                  borderColor: "#f3e8ff",
                }}
              >
                <Typography sx={{ color: "#6b647a" }}>
                  No orders yet — go on, treat yourself 🛍️
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.4}>
                {recentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const extraCount = (order.items?.length || 1) - 1;

                  return (
                    <Paper
                      key={order._id}
                      elevation={0}
                      sx={{
                        p: 1.4,
                        borderRadius: 4,
                        bgcolor: "#fff7fb",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        transition: ".3s",
                        "&:hover": { transform: "translateX(5px)", bgcolor: "#fdf2ff" },
                      }}
                    >
                      <Box
                        component="img"
                        src={resolveImg(firstItem?.image)}
                        sx={{ width: 78, height: 78, borderRadius: 4, objectFit: "cover" }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={900}>
                          {firstItem?.name || "Order"}
                          {extraCount > 0 ? ` +${extraCount} more` : ""}
                        </Typography>
                        <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                          {order.orderStatus}
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={statusToProgress(order.orderStatus)}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 99,
                            bgcolor: "#f3e8ff",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 99,
                              background:
                                order.orderStatus === "Cancelled"
                                  ? "linear-gradient(90deg,#f87171,#ef4444)"
                                  : "linear-gradient(90deg,#8b5cf6,#ec4899)",
                            },
                          }}
                        />
                      </Box>

                      <Typography fontWeight={900} color="#ec4899">
                        ₹{order.totalAmount}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* WISHLIST — backend not built yet, shown as a friendly placeholder */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Typography variant="h5" fontWeight={900}>
              Wishlist Picks
            </Typography>
            <Typography sx={{ color: "#6b647a", mb: 2 }}>Saved items you may like.</Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                textAlign: "center",
                bgcolor: "#fff7fb",
                border: "1px dashed",
                borderColor: "#f3e8ff",
              }}
            >
              <FavoriteIcon sx={{ color: "#ec4899", opacity: 0.5, fontSize: 28, mb: 0.5 }} />
              <Typography sx={{ color: "#6b647a" }}>
                Wishlist is coming soon — saved items will show up here.
              </Typography>
            </Paper>
          </Paper>
        </Stack>
      </Grid>

      {/* RIGHT COLUMN */}
      <Grid item xs={12} xl={3.8} lg={4}>
        <Stack spacing={1.5} sx={{ position: { lg: "sticky" }, top: 96 }}>
          {/* PROFILE */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight={900}>
                Profile
              </Typography>

              <Button
                startIcon={edit ? <SaveIcon /> : <EditIcon />}
                onClick={() => setEdit(!edit)}
                sx={{
                  borderRadius: 99,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#7c3aed",
                  bgcolor: "#f3e8ff",
                }}
              >
                {edit ? "Save" : "Edit"}
              </Button>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 62,
                  height: 62,
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                  fontWeight: 900,
                  fontSize: 26,
                }}
              >
                {profile.name?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Box>
                <Typography fontWeight={900}>{profile.name}</Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 13 }}>{profile.email}</Typography>
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified"
                  size="small"
                  sx={{
                    mt: 0.6,
                    bgcolor: "#f3e8ff",
                    color: "#7c3aed",
                    fontWeight: 900,
                  }}
                />
              </Box>
            </Stack>

            <Stack spacing={1.2}>
              <TextField
                label="NAME"
                value={profile.name}
                disabled={!edit}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: edit ? "#fff7fb" : "rgba(255,255,255,.62)",
                  },
                }}
              />
              <TextField
                label="EMAIL"
                value={profile.email}
                disabled
                fullWidth
                size="small"
                helperText="Email can't be changed here"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,.62)",
                  },
                }}
              />
              {/* NOTE: Save currently only updates local state. Wire this up to
                  PUT /api/users/profile once that backend route exists. */}
            </Stack>
          </Paper>

          {/* REWARDS — purely decorative, no backend needed */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              color: "white",
              boxShadow: "0 24px 65px rgba(236,72,153,.22)",
            }}
          >
            <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", mb: 1.5 }}>
              <CardGiftcardIcon />
            </Avatar>

            <Typography variant="h6" fontWeight={900}>
              Reward Points
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>720 points available</Typography>

            <LinearProgress
              variant="determinate"
              value={72}
              sx={{
                mt: 2,
                height: 10,
                borderRadius: 99,
                bgcolor: "rgba(255,255,255,.25)",
                "& .MuiLinearProgress-bar": { borderRadius: 99, bgcolor: "white" },
              }}
            />

            <Typography sx={{ mt: 2, fontSize: 14, opacity: 0.92 }}>
              Shop for ₹1,200 more to unlock voucher.
            </Typography>
          </Paper>

          {/* ADDRESS — reads from shopsphere_profile if available */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              boxShadow: "0 16px 45px rgba(124,58,237,.10)",
            }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                <LocationOnIcon />
              </Avatar>
              <Box>
                <Typography fontWeight={900}>Default Delivery</Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                  {hasAddress
                    ? [profile.city, profile.state].filter(Boolean).join(", ")
                    : "No address saved yet"}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* UPDATES — decorative status feed, no backend needed */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
              Updates
            </Typography>

            {[
              [<NotificationsIcon />, "Order out for delivery"],
              [<ReplayIcon />, "Return window active"],
              [<SupportAgentIcon />, "Support in 10 mins"],
              [<SecurityIcon />, "Secure payments active"],
            ].map(([icon, text]) => (
              <Stack key={text} direction="row" spacing={1.1} alignItems="center" sx={{ mb: 1.35 }}>
                <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899", width: 32, height: 32 }}>
                  {icon}
                </Avatar>
                <Typography fontWeight={800} color="#5b5470" fontSize={13.5}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Paper>

          {/* OFFER */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "#fff7fb",
              boxShadow: "0 16px 45px rgba(124,58,237,.10)",
            }}
          >
            <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899", mb: 1.5 }}>
              <LocalOfferIcon />
            </Avatar>

            <Typography fontWeight={900} color="#7c3aed">
              Premium Tip
            </Typography>
            <Typography sx={{ color: "#6b647a", mt: 0.7 }}>
              Use <b>SHOPS10</b> and get ₹200 off.
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}