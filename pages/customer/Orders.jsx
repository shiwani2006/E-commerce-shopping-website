import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE = "http://localhost:5000/api";

// orderStatus ko progress % aur ETA text mein convert karne ke liye
const statusToProgress = {
  Placed: 25,
  Confirmed: 50,
  Shipped: 75,
  Delivered: 100,
  Cancelled: 0,
};

// 🆕 Chip colors — Cancelled ko red, baaki purple/green
const statusChipStyle = {
  Placed: { bg: "#f3e8ff", color: "#7c3aed" },
  Confirmed: { bg: "#f3e8ff", color: "#7c3aed" },
  Shipped: { bg: "#f3e8ff", color: "#7c3aed" },
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnMsg, setReturnMsg] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (order) => {
    // NOTE: Return request backend route abhi nahi bana hai.
    // Abhi ke liye sirf UI feedback dikhate hain.
    setReturnMsg(`${order.items[0]?.name} return request started ✅`);
    setTimeout(() => setReturnMsg(""), 2500);
  };

  const getImageUrl = (image) =>
    image
      ? image.startsWith("http")
        ? image
        : `http://localhost:5000${image}`
      : "https://via.placeholder.com/300";

  const totalOrders = orders.length;
  const inTransit = orders.filter(
    (o) => o.orderStatus === "Confirmed" || o.orderStatus === "Shipped"
  ).length;
  const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: 3.5,
          borderRadius: 6,
          background: "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 28px 75px rgba(236,72,153,.28)",
        }}
      >
        <Chip
          icon={<ShoppingBagIcon />}
          label="Your Orders"
          sx={{
            bgcolor: "rgba(255,255,255,.22)",
            color: "white",
            fontWeight: 900,
            mb: 2,
          }}
        />

        <Typography variant="h3" fontWeight={900}>
          Order History
        </Typography>

        <Typography sx={{ mt: 1, opacity: 0.92 }}>
          Track deliveries, view order details and manage returns.
        </Typography>
      </Paper>

      {returnMsg && (
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            p: 2,
            borderRadius: 4,
            bgcolor: "#dcfce7",
            color: "#16a34a",
            fontWeight: 900,
          }}
        >
          {returnMsg}
        </Paper>
      )}

      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 5, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={800} color="#6b647a">
            No orders yet. Go place your first order! 🛍️
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={1.5}>
              {orders.map((order) => {
                const firstItem = order.items[0];
                const extraCount = order.items.length - 1;
                const progress = statusToProgress[order.orderStatus] ?? 0;

                return (
                  <Paper
                    key={order._id}
                    elevation={0}
                    sx={{
                      p: 2,
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
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <Box
                        component="img"
                        src={getImageUrl(firstItem?.image)}
                        sx={{
                          width: { xs: "100%", sm: 145 },
                          height: { xs: 220, sm: 155 },
                          borderRadius: 4,
                          objectFit: "cover",
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          spacing={1.5}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={900}>
                              {firstItem?.name}
                              {extraCount > 0 && ` + ${extraCount} more`}
                            </Typography>
                            <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                          </Box>

                          <Chip
                            label={order.orderStatus}
                            sx={{
                              alignSelf: { xs: "flex-start", sm: "center" },
                              bgcolor: statusChipStyle[order.orderStatus]?.bg || "#f3e8ff",
                              color: statusChipStyle[order.orderStatus]?.color || "#7c3aed",
                              fontWeight: 900,
                            }}
                          />
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 1.5 }}
                        >
                          <Chip
                            icon={<PaymentIcon />}
                            label={
                              order.paymentMethod === "COD"
                                ? "Cash on Delivery"
                                : order.paymentStatus
                            }
                            sx={{
                              bgcolor: "#fff7fb",
                              color: "#ec4899",
                              fontWeight: 800,
                            }}
                          />
                          <Chip
                            label={new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                            sx={{ bgcolor: "#f3e8ff", color: "#7c3aed", fontWeight: 800 }}
                          />
                        </Stack>

                        <Box sx={{ mt: 2 }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ color: "#6b647a", fontWeight: 800 }}>
                              Delivery Progress
                            </Typography>
                            <Typography fontWeight={900} color="#ec4899">
                              {progress}%
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              mt: 1,
                              height: 9,
                              borderRadius: 99,
                              bgcolor: "#f3e8ff",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 99,
                                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                              },
                            }}
                          />
                        </Box>

                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "stretch", md: "center" }}
                          spacing={1.5}
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="h6" fontWeight={900} color="#ec4899">
                            ₹{order.totalAmount}
                          </Typography>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button
                              fullWidth
                              startIcon={<LocalShippingIcon />}
                              onClick={() => navigate(`/customer/track-order/${order._id}`)}
                              sx={{
                                borderRadius: 99,
                                px: 2.5,
                                textTransform: "none",
                                fontWeight: 900,
                                color: "#7c3aed",
                                bgcolor: "#f3e8ff",
                              }}
                            >
                              Track
                            </Button>

                            <Button
                              fullWidth
                              startIcon={<VisibilityIcon />}
                              onClick={() => setSelectedOrder(order)}
                              sx={{
                                borderRadius: 99,
                                px: 2.5,
                                textTransform: "none",
                                fontWeight: 900,
                                color: "#7c3aed",
                                bgcolor: "#f3e8ff",
                              }}
                            >
                              Details
                            </Button>

                            <Button
                              fullWidth
                              startIcon={<ReplayIcon />}
                              onClick={() => handleReturn(order)}
                              disabled={order.orderStatus !== "Delivered"}
                              sx={{
                                borderRadius: 99,
                                px: 2.5,
                                textTransform: "none",
                                fontWeight: 900,
                                color:
                                  order.orderStatus === "Delivered"
                                    ? "#ec4899"
                                    : "#9ca3af",
                                bgcolor:
                                  order.orderStatus === "Delivered"
                                    ? "#fff1f7"
                                    : "#f3f4f6",
                              }}
                            >
                              Return
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={1.5} sx={{ position: { lg: "sticky" }, top: 96 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 5,
                  bgcolor: "rgba(255,255,255,.9)",
                  boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                }}
              >
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Tracking Summary
                </Typography>

                {[
                  [<ShoppingBagIcon />, "Total Orders", totalOrders],
                  [<LocalShippingIcon />, "In Transit", inTransit],
                  [<CheckCircleIcon />, "Delivered", delivered],
                ].map(([icon, label, value]) => (
                  <Stack
                    key={label}
                    direction="row"
                    alignItems="center"
                    spacing={1.4}
                    sx={{ mb: 1.5 }}
                  >
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>{icon}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={900}>{label}</Typography>
                      <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                        {value} orders
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 5,
                  bgcolor: "#fff7fb",
                  boxShadow: "0 16px 45px rgba(124,58,237,.1)",
                }}
              >
                <Stack direction="row" spacing={1.4} alignItems="center">
                  <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                    <SupportAgentIcon />
                  </Avatar>
                  <Box>
                    <Typography fontWeight={900}>Need help?</Typography>
                    <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                      Support replies within 10 minutes.
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Button
                  component={Link}
                  to="/customer/support"
                  fullWidth
                  sx={{
                    borderRadius: 99,
                    py: 1.1,
                    bgcolor: "#f3e8ff",
                    color: "#7c3aed",
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Contact Support
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,.96)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {selectedOrder && (
          <DialogContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Order Details
                </Typography>
                <Typography sx={{ color: "#6b647a" }}>
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setSelectedOrder(null)}
                sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Box
                  component="img"
                  src={getImageUrl(selectedOrder.items[0]?.image)}
                  sx={{
                    width: "100%",
                    height: 320,
                    objectFit: "cover",
                    borderRadius: 5,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 5, bgcolor: "#fff7fb" }}>
                  {/* All items in this order */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selectedOrder.items.map((item) => (
                      <Stack
                        key={item._id}
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                          {item.name} × {item.quantity}
                        </Typography>
                        <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                          ₹{item.price * item.quantity}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.3}>
                    <Typography>
                      <b>Status:</b> {selectedOrder.orderStatus}
                    </Typography>
                    <Typography>
                      <b>Total:</b> ₹{selectedOrder.totalAmount}
                    </Typography>
                    <Typography>
                      <b>Payment:</b>{" "}
                      {selectedOrder.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : `Online (${selectedOrder.paymentStatus})`}
                    </Typography>
                    <Typography>
                      <b>Order Date:</b>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </Typography>
                    <Typography>
                      <b>Address:</b>{" "}
                      {selectedOrder.shippingAddress?.street},{" "}
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state} -{" "}
                      {selectedOrder.shippingAddress?.pincode}
                    </Typography>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography fontWeight={900} color="#7c3aed">
                      Delivery Timeline
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={statusToProgress[selectedOrder.orderStatus] ?? 0}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 99,
                        bgcolor: "#f3e8ff",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 99,
                          background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                        },
                      }}
                    />
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    sx={{ mt: 2.5 }}
                  >
                    <Button
                      fullWidth
                      onClick={() => handleReturn(selectedOrder)}
                      disabled={selectedOrder.orderStatus !== "Delivered"}
                      sx={{
                        borderRadius: 99,
                        py: 1.1,
                        textTransform: "none",
                        fontWeight: 900,
                        color:
                          selectedOrder.orderStatus === "Delivered"
                            ? "#ec4899"
                            : "#9ca3af",
                        bgcolor:
                          selectedOrder.orderStatus === "Delivered"
                            ? "#fff1f7"
                            : "#f3f4f6",
                      }}
                    >
                      Request Return
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}