import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HomeIcon from "@mui/icons-material/Home";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getOrderById } from "../../api/ordersApi";

const STEPS = [
  { key: "Placed", label: "Order Placed", icon: <ShoppingBagIcon /> },
  { key: "Confirmed", label: "Confirmed", icon: <AssignmentTurnedInIcon /> },
  { key: "Shipped", label: "Shipped", icon: <LocalShippingIcon /> },
  { key: "Delivered", label: "Delivered", icon: <HomeIcon /> },
];

export default function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
    // 🆕 Har 15 seconds me refresh karo taaki admin ka status update turant dikhe
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      if (!data.order) {
        setError("Order not found");
      } else {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Track order error:", err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) =>
    image
      ? image.startsWith("http")
        ? image
        : `http://localhost:5000${image}`
      : "https://via.placeholder.com/300";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 5, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={800} color="#6b647a">
            {error || "Order not found"}
          </Typography>
          <Button
            component={Link}
            to="/customer/orders"
            sx={{
              mt: 2,
              borderRadius: 99,
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
              color: "white",
              px: 3,
              py: 1,
            }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Box>
    );
  }

  const isCancelled = order.orderStatus === "Cancelled";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 3.5,
          borderRadius: 6,
          background: isCancelled
            ? "linear-gradient(135deg,#ef4444,#f87171)"
            : "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 28px 75px rgba(236,72,153,.22)",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/customer/orders")}
          sx={{
            color: "white",
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "rgba(255,255,255,.15)",
            borderRadius: 99,
            px: 2,
          }}
        >
          Back to Orders
        </Button>

        <Typography variant="h4" fontWeight={900}>
          {isCancelled ? "Order Cancelled" : "Track Your Order"}
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          Order #{order._id.slice(-8).toUpperCase()}
        </Typography>
      </Paper>

      {/* Stepper / Cancelled banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 5,
          mb: 2,
          bgcolor: "rgba(255,255,255,.92)",
          boxShadow: "0 16px 45px rgba(124,58,237,.10)",
        }}
      >
        {isCancelled ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: "#fee2e2" }}>
              <CancelIcon sx={{ fontSize: 40, color: "#dc2626" }} />
            </Avatar>
            <Typography variant="h6" fontWeight={900} color="#dc2626">
              This order has been cancelled
            </Typography>
            <Typography sx={{ color: "#6b647a", textAlign: "center" }}>
              If you were charged online, your refund will be processed within
              5-7 business days.
            </Typography>
          </Stack>
        ) : (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ position: "relative" }}
          >
            {STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <Box
                  key={step.key}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    alignItems: "center",
                    gap: { xs: 1.5, sm: 0 },
                    position: "relative",
                    width: "100%",
                    pb: { xs: idx !== STEPS.length - 1 ? 3 : 0, sm: 0 },
                  }}
                >
                  {/* Connector line */}
                  {idx !== STEPS.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bgcolor: idx < currentStepIndex ? "#ec4899" : "#f3e8ff",
                        zIndex: 0,
                        // horizontal on desktop, vertical on mobile
                        top: { xs: 20, sm: 20 },
                        left: { xs: 20, sm: "50%" },
                        width: { xs: 3, sm: "100%" },
                        height: { xs: "100%", sm: 3 },
                        transform: { sm: "translateX(50%)" },
                      }}
                    />
                  )}

                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      zIndex: 1,
                      bgcolor: isDone ? "#ec4899" : "#f3e8ff",
                      color: isDone ? "white" : "#9ca3af",
                      border: isCurrent ? "3px solid #7c3aed" : "none",
                    }}
                  >
                    {isDone ? <CheckCircleIcon /> : step.icon}
                  </Avatar>

                  <Typography
                    sx={{
                      mt: { xs: 0, sm: 1.2 },
                      fontWeight: isCurrent ? 900 : 700,
                      fontSize: 14,
                      color: isDone ? "#1f2430" : "#9ca3af",
                      textAlign: { xs: "left", sm: "center" },
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Order Items + Address */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 5,
          bgcolor: "rgba(255,255,255,.92)",
          boxShadow: "0 16px 45px rgba(124,58,237,.10)",
        }}
      >
        <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
          Items in this order
        </Typography>

        <Stack spacing={1.5}>
          {order.items.map((item) => (
            <Stack
              key={item._id}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 3, bgcolor: "#faf7ff" }}
            >
              <Box
                component="img"
                src={getImageUrl(item.image)}
                sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover" }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={800} fontSize={14}>
                  {item.name}
                </Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                  Qty: {item.quantity} × ₹{item.price}
                </Typography>
              </Box>
              <Typography fontWeight={900} color="#ec4899">
                ₹{item.price * item.quantity}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{ color: "#6b647a", fontSize: 13 }}>Delivery Address</Typography>
            <Typography fontWeight={700} sx={{ mt: 0.5 }}>
              {order.shippingAddress?.fullName}
            </Typography>
            <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
              {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </Typography>
            <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
              📞 {order.shippingAddress?.phone}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography sx={{ color: "#6b647a", fontSize: 13 }}>Total Amount</Typography>
            <Typography variant="h5" fontWeight={900} color="#ec4899">
              ₹{order.totalAmount}
            </Typography>
            <Chip
              label={
                order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentStatus
              }
              sx={{ mt: 1, bgcolor: "#f3e8ff", color: "#7c3aed", fontWeight: 800 }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}