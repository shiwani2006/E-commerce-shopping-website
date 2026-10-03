import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CelebrationIcon from "@mui/icons-material/Celebration";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { useNotifications } from "../../context/NotificationContext";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  // Checkout.jsx se navigate karte waqt order data state mein bheja gaya tha
  const order = location.state?.order;

  useEffect(() => {
    addNotification({
      title: "Order Confirmed",
      message: "Your order has been placed successfully",
      type: "order",
    });
  }, []);

  // Agar koi order data nahi mila (jaise direct URL pe aaye / refresh kiya),
  // toh Orders page pe bhej do, kyunki dikhane ke liye kuch nahi hai
  if (!order) {
    return (
      <Box>
        <Paper
          elevation={0}
          sx={{ p: 5, borderRadius: 5, textAlign: "center" }}
        >
          <Typography variant="h6" fontWeight={800} color="#6b647a">
            No recent order found.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/customer/orders")}
            sx={{
              mt: 2,
              borderRadius: 99,
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
            }}
          >
            View My Orders
          </Button>
        </Paper>
      </Box>
    );
  }

  const deliveryDate = new Date(
    new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 6,
          textAlign: "center",
          background: "linear-gradient(135deg,#8b5cf6,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 30px 80px rgba(236,72,153,.25)",
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            mx: "auto",
            mb: 2,
            bgcolor: "rgba(255,255,255,.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>

        <Typography variant="h3" fontWeight={900}>
          Order Confirmed 🎉
        </Typography>

        <Typography sx={{ mt: 1.5, opacity: 0.95, fontSize: 17 }}>
          Thank you for shopping with ShopSphere
        </Typography>

        <Typography sx={{ mt: 1, opacity: 0.85 }}>
          Your order has been placed successfully
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.10)",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                <ShoppingBagIcon />
              </Avatar>

              <Typography variant="h5" fontWeight={900}>
                Order Details
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: "#faf7ff" }}>
                  <Typography color="#6b647a" fontSize={13}>
                    Order ID
                  </Typography>
                  <Typography fontWeight={900} mt={0.5} sx={{ fontSize: 14 }}>
                    {order._id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: "#faf7ff" }}>
                  <Typography color="#6b647a" fontSize={13}>
                    Payment Status
                  </Typography>
                  <Typography
                    fontWeight={900}
                    color={order.paymentStatus === "Paid" ? "#16a34a" : "#ea580c"}
                    mt={0.5}
                  >
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentStatus}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: "#faf7ff" }}>
                  <Typography color="#6b647a" fontSize={13}>
                    Expected Delivery
                  </Typography>
                  <Typography fontWeight={900} mt={0.5}>
                    {deliveryDate}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, bgcolor: "#faf7ff" }}>
                  <Typography color="#6b647a" fontSize={13}>
                    Total Amount
                  </Typography>
                  <Typography fontWeight={900} color="#7c3aed" mt={0.5}>
                    ₹{order.totalAmount}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Order Items List */}
            <Stack spacing={1.2} sx={{ mt: 3 }}>
              {order.items.map((item) => (
                <Stack
                  key={item._id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1.5, borderRadius: 3, bgcolor: "#faf7ff" }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {item.name} × {item.quantity}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#ec4899" }}>
                    ₹{item.price * item.quantity}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.92)",
                boxShadow: "0 16px 45px rgba(124,58,237,.10)",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: "#eef7ff", color: "#2563eb" }}>
                  <LocalShippingIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={900}>Delivery Status</Typography>
                  <Typography color="#6b647a">{order.orderStatus}</Typography>
                </Box>
              </Stack>

              <Chip
                label={`Expected ${deliveryDate}`}
                sx={{
                  mt: 2,
                  bgcolor: "#dcfce7",
                  color: "#15803d",
                  fontWeight: 800,
                }}
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.92)",
                boxShadow: "0 16px 45px rgba(124,58,237,.10)",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "#fff7ed", color: "#ea580c" }}>
                  <WorkspacePremiumIcon />
                </Avatar>

                <Typography fontWeight={900}>Order Benefits</Typography>
              </Stack>

              <Typography sx={{ color: "#6b647a", mb: 1 }}>
                ✓ Free Delivery
              </Typography>
              <Typography sx={{ color: "#6b647a", mb: 1 }}>
                ✓ Easy Returns
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                ✓ Priority Support
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                background: "linear-gradient(135deg,#fff7ed,#fff1f7)",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: "#7c3aed" }}>
                  <CelebrationIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={900}>Shipping To</Typography>
                  <Typography color="#6b647a" sx={{ fontSize: 13 }}>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 3, justifyContent: "center" }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/customer/orders")}
          endIcon={<ArrowForwardIcon />}
          sx={{
            borderRadius: 99,
            px: 4,
            py: 1.3,
            textTransform: "none",
            fontWeight: 900,
            background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
          }}
        >
          Track Order
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/customer/products")}
          sx={{
            borderRadius: 99,
            px: 4,
            py: 1.3,
            textTransform: "none",
            fontWeight: 900,
          }}
        >
          Continue Shopping
        </Button>
      </Stack>
    </Box>
  );
}