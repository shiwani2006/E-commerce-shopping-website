import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DiscountIcon from "@mui/icons-material/Discount";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useNotifications } from "../../context/NotificationContext";

const API_BASE = "http://localhost:5000/api";

export default function Cart() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");

  // Backend se cart fetch karo jab component load ho
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      // Backend se aaya hua data UI ke shape mein convert karo
      const items = (data.cart?.items || []).map((item) => ({
        id: item.product._id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.sellingPrice,
        old: item.product.mrp,
        size: item.product.sizes?.[0] || "Standard",
        color: item.product.colors?.[0] || "-",
        qty: item.quantity,
        img: item.product.images?.[0]
          ? `http://localhost:5000${item.product.images[0]}`
          : "https://via.placeholder.com/300",
      }));

      setCartItems(items);
    } catch (error) {
      console.error("Fetch cart error:", error);
      addNotification({
        title: "Error",
        message: "Could not load your cart",
        type: "order",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (id, type) => {
    const product = cartItems.find((item) => item.id === id);
    if (!product) return;

    const newQty =
      type === "inc"
        ? product.qty + 1
        : product.qty > 1
        ? product.qty - 1
        : 1;

    // Agar dec pe already 1 hai toh kuch nahi karna
    if (type === "dec" && product.qty <= 1) return;

    try {
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update cart");
      }

      addNotification({
        title: "Cart Updated",
        message:
          type === "inc"
            ? `${product.name} quantity increased`
            : `${product.name} quantity decreased`,
        type: "order",
      });

      // Local state ko bhi update kar do (backend confirm hone ke baad)
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, qty: newQty } : item
        )
      );
    } catch (error) {
      console.error("Update qty error:", error);
      addNotification({
        title: "Error",
        message: "Could not update quantity",
        type: "order",
      });
    }
  };

  const removeItem = async (id) => {
    const product = cartItems.find((item) => item.id === id);
    if (!product) return;

    try {
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE}/cart/remove/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      addNotification({
        title: "Removed From Cart",
        message: `${product.name} removed successfully`,
        type: "order",
      });

      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Remove item error:", error);
      addNotification({
        title: "Error",
        message: "Could not remove item",
        type: "order",
      });
    }
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SHOPS10") {
      addNotification({
        title: "Coupon Applied",
        message: "₹200 discount unlocked with SHOPS10",
        type: "offer",
      });
    } else {
      addNotification({
        title: "Coupon Invalid",
        message: "This coupon is not valid. Try SHOPS10",
        type: "offer",
      });
    }
  };

  // 🟢 YE FUNCTION FIX HUA HAI — ab checkout page pe navigate karega
  const checkout = () => {
    if (cartItems.length === 0) {
      addNotification({
        title: "Cart is Empty",
        message: "Add some items before checking out",
        type: "order",
      });
      return;
    }
    navigate("/customer/checkout");
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const mrpTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.old * item.qty, 0),
    [cartItems]
  );

  const discount = mrpTotal - subtotal;
  const couponDiscount = coupon.trim().toUpperCase() === "SHOPS10" ? 200 : 0;
  const delivery = subtotal > 999 ? 0 : 99;
  const total = subtotal - couponDiscount + delivery;

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
          p: { xs: 3, md: 4 },
          borderRadius: 6,
          background: "linear-gradient(135deg,#8b5cf6,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 26px 70px rgba(236,72,153,.25)",
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Shopping Bag
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          Review items, apply coupon and checkout securely.
        </Typography>
      </Paper>

      {cartItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 5,
            textAlign: "center",
            bgcolor: "rgba(255,255,255,.9)",
          }}
        >
          <Typography variant="h6" fontWeight={800} color="#6b647a">
            Your cart is empty. Go add something nice! 🛍️
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 5,
                    bgcolor: "rgba(255,255,255,.9)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,.95)",
                    boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Box
                      component="img"
                      src={item.img}
                      sx={{
                        width: { xs: "100%", sm: 150 },
                        height: 170,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />

                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" fontWeight={900}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ color: "#6b647a" }}>
                            {item.brand}
                          </Typography>
                        </Box>

                        <IconButton
                          onClick={() => removeItem(item.id)}
                          sx={{
                            color: "#ec4899",
                            bgcolor: "#fff1f7",
                            "&:hover": { bgcolor: "#ffe4f0" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1.5 }}
                      >
                        <Chip
                          label={`Size: ${item.size}`}
                          sx={{
                            bgcolor: "#f3e8ff",
                            color: "#7c3aed",
                            fontWeight: 800,
                          }}
                        />
                        <Chip
                          label={item.color}
                          sx={{
                            bgcolor: "#fff7fb",
                            color: "#ec4899",
                            fontWeight: 800,
                          }}
                        />
                        <Chip
                          icon={<LocalShippingIcon />}
                          label="Free delivery eligible"
                          sx={{
                            bgcolor: "#eef7ff",
                            color: "#2563eb",
                            fontWeight: 800,
                          }}
                        />
                      </Stack>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{ mt: 2 }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <IconButton
                            onClick={() => updateQty(item.id, "dec")}
                            sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
                          >
                            <RemoveIcon />
                          </IconButton>

                          <Typography fontWeight={900}>{item.qty}</Typography>

                          <IconButton
                            onClick={() => updateQty(item.id, "inc")}
                            sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Typography fontWeight={900} color="#ec4899" sx={{ fontSize: 22 }}>
                            ₹{item.price * item.qty}
                          </Typography>
                          <Typography sx={{ color: "#9ca3af", textDecoration: "line-through" }}>
                            ₹{item.old * item.qty}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ position: { md: "sticky" }, top: 92 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  bgcolor: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,.95)",
                  boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <DiscountIcon sx={{ color: "#ec4899" }} />
                  <Typography variant="h6" fontWeight={900}>
                    Apply Coupon
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Try SHOPS10"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 99,
                        bgcolor: "#fff7fb",
                      },
                    }}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="contained"
                    sx={{
                      borderRadius: 99,
                      px: 2.5,
                      textTransform: "none",
                      fontWeight: 900,
                      background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  bgcolor: "rgba(255,255,255,.9)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,.95)",
                  boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                }}
              >
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                  Price Summary
                </Typography>

                {[
                  ["Total MRP", `₹${mrpTotal}`],
                  ["Discount", `- ₹${discount}`],
                  ["Coupon Discount", `- ₹${couponDiscount}`],
                  ["Delivery Fee", delivery === 0 ? "FREE" : `₹${delivery}`],
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1.2 }}>
                    <Typography sx={{ color: "#6b647a" }}>{label}</Typography>
                    <Typography fontWeight={900} color={value === "FREE" ? "#16a34a" : "#24143f"}>
                      {value}
                    </Typography>
                  </Stack>
                ))}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={900}>
                    Total Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#ec4899">
                    ₹{total}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={checkout}
                  sx={{
                    mt: 3,
                    py: 1.4,
                    borderRadius: 99,
                    textTransform: "none",
                    fontWeight: 900,
                    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                    boxShadow: "0 18px 45px rgba(236,72,153,.25)",
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Paper>

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
                {[
                  [<SecurityIcon />, "100% secure checkout"],
                  [<CheckCircleIcon />, "Easy returns available"],
                  [<LocalShippingIcon />, "Fast delivery"],
                ].map(([icon, text]) => (
                  <Stack key={text} direction="row" spacing={1.3} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed", width: 34, height: 34 }}>
                      {icon}
                    </Avatar>
                    <Typography fontWeight={800} color="#5b5470">
                      {text}
                    </Typography>
                  </Stack>
                ))}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}