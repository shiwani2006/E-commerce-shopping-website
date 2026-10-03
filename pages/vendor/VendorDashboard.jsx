import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Inventory2,
  ShoppingBag,
  CurrencyRupee,
  PendingActions,
  TrendingUp,
  AutoAwesome,
  Add,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

/* ─────────────────────────────────────────
   GOLD THEME
───────────────────────────────────────── */

const GOLD = "#B58A4A";
const DARK_GOLD = "#9A702F";
const LIGHT_GOLD = "#F6EBD7";
const PALE_GOLD = "#FCF8F0";
const BORDER_GOLD = "rgba(181, 138, 74, 0.22)";

/* ─────────────────────────────────────────
   ORDER STATUS COLORS
───────────────────────────────────────── */

const getStatusColor = (status) => {
  switch (status) {
    case "Delivered":
      return "success";

    case "Processing":
    case "Confirmed":
    case "Shipped":
      return "info";

    case "Placed":
    case "Pending":
      return "warning";

    case "Cancelled":
      return "error";

    default:
      return "default";
  }
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    productsListed: 0,
    ordersReceived: 0,
    revenueEarned: 0,
    pendingDeliveries: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  /* ─────────────────────────────────────────
     FETCH DASHBOARD DATA
  ───────────────────────────────────────── */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("shopsphereToken");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [productsRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE}/products/my-products`, {
            headers,
          }),

          axios.get(`${API_BASE}/orders/vendor/my-orders`, {
            headers,
          }),
        ]);

        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];

        const revenueEarned = orders.reduce(
          (sum, order) => sum + (order.myItemsTotal || 0),
          0
        );

        const pendingDeliveries = orders.filter((order) =>
          ["Placed", "Confirmed", "Shipped"].includes(
            order.orderStatus
          )
        ).length;

        setStats({
          productsListed: products.length,
          ordersReceived: orders.length,
          revenueEarned,
          pendingDeliveries,
        });

        setRecentOrders(orders.slice(0, 4));
      } catch (error) {
        console.error(
          "Failed to load vendor dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ─────────────────────────────────────────
     STAT CARDS
  ───────────────────────────────────────── */

  const statCards = [
    {
      title: "Products Listed",
      value: stats.productsListed,
      icon: <Inventory2 />,
    },

    {
      title: "Orders Received",
      value: stats.ordersReceived,
      icon: <ShoppingBag />,
    },

    {
      title: "Revenue Earned",
      value: `₹${stats.revenueEarned.toLocaleString("en-IN")}`,
      icon: <CurrencyRupee />,
    },

    {
      title: "Pending Deliveries",
      value: stats.pendingDeliveries,
      icon: <PendingActions />,
    },
  ];

  /* ─────────────────────────────────────────
     LOADING
  ───────────────────────────────────────── */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBFAF7",
        }}
      >
        <CircularProgress
          sx={{
            color: GOLD,
          }}
        />
      </Box>
    );
  }

  /* ─────────────────────────────────────────
     MAIN UI
  ───────────────────────────────────────── */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          md: 4,
        },

        position: "relative",
        overflow: "hidden",

        background:
          "linear-gradient(135deg, #FBFAF7 0%, #F8F4EC 50%, #FDFBF7 100%)",
      }}
    >
      {/* ───────────────────────────────
          SUBTLE BACKGROUND BLOBS
      ─────────────────────────────── */}

      <Box
        sx={{
          position: "absolute",
          top: -160,
          right: -130,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "#E9D6B5",
          filter: "blur(140px)",
          opacity: 0.22,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -180,
          left: -140,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "#F0E3CC",
          filter: "blur(150px)",
          opacity: 0.25,
          zIndex: 0,
        }}
      />

      {/* ───────────────────────────────
          CONTENT
      ─────────────────────────────── */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ═══════════════════════════════
            HERO BANNER
        ═══════════════════════════════ */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              md: 4,
            },

            mb: 4,

            borderRadius: 5,

            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(250,246,238,0.9))",

            border: `1px solid ${BORDER_GOLD}`,

            boxShadow:
              "0 12px 35px rgba(126, 92, 40, 0.08)",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
          >
            {/* USER INFO */}

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,

                  background:
                    "linear-gradient(135deg, #C9A15B, #9A702F)",

                  color: "#fff",

                  fontSize: "1.6rem",

                  fontWeight: 800,

                  boxShadow:
                    "0 8px 20px rgba(154,112,47,0.22)",
                }}
              >
                S
              </Avatar>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    color: "#29251F",
                  }}
                >
                  Welcome Back 👋
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#766F64",
                  }}
                >
                  Manage your store, track orders and grow your revenue.
                </Typography>
              </Box>
            </Stack>

            {/* ADD PRODUCT BUTTON */}

            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() =>
                navigate("/vendor/add-product")
              }
              sx={{
                borderRadius: 3,

                px: 3,

                py: 1.4,

                fontWeight: 700,

                textTransform: "none",

                background:
                  "linear-gradient(135deg, #B58A4A, #9A702F)",

                boxShadow:
                  "0 8px 18px rgba(154,112,47,0.22)",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #A77C3D, #8C6429)",

                  transform: "translateY(-2px)",

                  boxShadow:
                    "0 12px 25px rgba(154,112,47,0.28)",
                },
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Paper>

        {/* ═══════════════════════════════
            STATS
        ═══════════════════════════════ */}

        <Grid
          container
          spacing={3}
        >
          {statCards.map((item) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={item.title}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,

                  borderRadius: 4,

                  background:
                    "rgba(255,255,255,0.86)",

                  border:
                    `1px solid ${BORDER_GOLD}`,

                  boxShadow:
                    "0 8px 24px rgba(126, 92, 40, 0.06)",

                  transition:
                    "all .25s ease",

                  "&:hover": {
                    transform:
                      "translateY(-5px)",

                    boxShadow:
                      "0 16px 32px rgba(126, 92, 40, 0.1)",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Avatar
                    sx={{
                      width: 54,
                      height: 54,

                      background:
                        LIGHT_GOLD,

                      color: DARK_GOLD,

                      border:
                        `1px solid ${BORDER_GOLD}`,
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Typography
                    color="#766F64"
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      color: "#29251F",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ═══════════════════════════════
            REVENUE + AI INSIGHT
        ═══════════════════════════════ */}

        <Grid
          container
          spacing={3}
          sx={{
            mt: 1,
          }}
        >
          {/* REVENUE */}

          <Grid
            item
            xs={12}
            md={8}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,

                borderRadius: 4,

                background:
                  "rgba(255,255,255,0.88)",

                border:
                  `1px solid ${BORDER_GOLD}`,

                minHeight: 250,

                boxShadow:
                  "0 8px 24px rgba(126, 92, 40, 0.06)",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#29251F",
                  }}
                >
                  Revenue Overview
                </Typography>

                <Chip
                  icon={<TrendingUp />}
                  label="Live Data"
                  sx={{
                    color: DARK_GOLD,

                    background:
                      LIGHT_GOLD,

                    border:
                      `1px solid ${BORDER_GOLD}`,

                    fontWeight: 600,
                  }}
                />
              </Stack>

              <Box
                sx={{
                  mt: 4,

                  height: 140,

                  borderRadius: 3,

                  background:
                    "linear-gradient(135deg, #F8F0E2, #F2E5CD)",

                  border:
                    `1px solid ${BORDER_GOLD}`,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Typography
                  fontWeight={700}
                  color="#8B7A61"
                >
                  Revenue Chart Coming Soon 📈
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* AI INSIGHT */}

          <Grid
            item
            xs={12}
            md={4}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,

                minHeight: 250,

                borderRadius: 4,

                background:
                  "linear-gradient(135deg, #FBF6EC, #F3E8D3)",

                border:
                  `1px solid ${BORDER_GOLD}`,

                boxShadow:
                  "0 10px 25px rgba(126, 92, 40, 0.08)",
              }}
            >
              <Stack spacing={2}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,

                    background:
                      "linear-gradient(135deg, #C9A15B, #9A702F)",

                    color: "#fff",
                  }}
                >
                  <AutoAwesome />
                </Avatar>

                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    color: "#29251F",
                  }}
                >
                  AI Business Insight
                </Typography>

                <Typography
                  sx={{
                    color: "#665D50",
                  }}
                >
                  Your beauty products are performing
                  23% better this week.
                </Typography>

                <Typography
                  fontWeight={700}
                  sx={{
                    color: DARK_GOLD,
                  }}
                >
                  Recommendation:
                </Typography>

                <Typography
                  sx={{
                    color: "#665D50",
                  }}
                >
                  Add more skincare bundles and festive
                  combo packs to boost conversions.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* ═══════════════════════════════
            RECENT ORDERS + QUICK ACTIONS
        ═══════════════════════════════ */}

        <Grid
          container
          spacing={3}
          sx={{
            mt: 1,
          }}
        >
          {/* RECENT ORDERS */}

          <Grid
            item
            xs={12}
            md={8}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,

                borderRadius: 4,

                background:
                  "rgba(255,255,255,0.88)",

                border:
                  `1px solid ${BORDER_GOLD}`,

                boxShadow:
                  "0 8px 24px rgba(126, 92, 40, 0.06)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                mb={3}
                sx={{
                  color: "#29251F",
                }}
              >
                Recent Orders
              </Typography>

              {recentOrders.length === 0 ? (
                <Typography
                  color="#766F64"
                >
                  No orders yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {recentOrders.map((order) => (
                    <Paper
                      key={order._id}
                      elevation={0}
                      sx={{
                        p: 2,

                        borderRadius: 3,

                        background:
                          "#FCFAF6",

                        border:
                          `1px solid ${BORDER_GOLD}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: "#29251F",
                            }}
                          >
                            {order.customerName}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="#766F64"
                          >
                            ₹
                            {(
                              order.myItemsTotal || 0
                            ).toLocaleString("en-IN")}
                          </Typography>
                        </Box>

                        <Chip
                          label={order.orderStatus}
                          color={getStatusColor(
                            order.orderStatus
                          )}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          {/* QUICK ACTIONS */}

          <Grid
            item
            xs={12}
            md={4}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,

                borderRadius: 4,

                background:
                  "rgba(255,255,255,0.88)",

                border:
                  `1px solid ${BORDER_GOLD}`,

                boxShadow:
                  "0 8px 24px rgba(126, 92, 40, 0.06)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                mb={3}
                sx={{
                  color: "#29251F",
                }}
              >
                Quick Actions
              </Typography>

              <Stack spacing={2}>
                {/* ADD PRODUCT */}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() =>
                    navigate("/vendor/add-product")
                  }
                  sx={{
                    borderRadius: 3,

                    textTransform: "none",

                    fontWeight: 700,

                    background:
                      "linear-gradient(135deg, #B58A4A, #9A702F)",

                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #A77C3D, #8C6429)",
                    },
                  }}
                >
                  Add Product
                </Button>

                {/* MANAGE PRODUCTS */}

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    navigate("/vendor/products")
                  }
                  sx={{
                    borderRadius: 3,

                    textTransform: "none",

                    color: DARK_GOLD,

                    borderColor:
                      "rgba(181,138,74,0.45)",

                    "&:hover": {
                      borderColor: GOLD,

                      background:
                        "rgba(181,138,74,0.06)",
                    },
                  }}
                >
                  Manage Products
                </Button>

                {/* EARNINGS */}

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    navigate("/vendor/earnings")
                  }
                  sx={{
                    borderRadius: 3,

                    textTransform: "none",

                    color: DARK_GOLD,

                    borderColor:
                      "rgba(181,138,74,0.45)",

                    "&:hover": {
                      borderColor: GOLD,

                      background:
                        "rgba(181,138,74,0.06)",
                    },
                  }}
                >
                  View Earnings
                </Button>

                {/* MY SHOP */}

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    navigate("/vendor/shop")
                  }
                  sx={{
                    borderRadius: 3,

                    textTransform: "none",

                    color: DARK_GOLD,

                    borderColor:
                      "rgba(181,138,74,0.45)",

                    "&:hover": {
                      borderColor: GOLD,

                      background:
                        "rgba(181,138,74,0.06)",
                    },
                  }}
                >
                  My Shop
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}