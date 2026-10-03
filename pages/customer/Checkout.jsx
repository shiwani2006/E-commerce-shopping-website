import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { useNotifications } from "../../context/NotificationContext";
import { useCart } from "../../context/CartContext";

const API_BASE = "http://localhost:5000/api";

export default function Checkout() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { cartItems, refreshCart } = useCart();

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errorMsg, setErrorMsg] = useState("");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // 🟢 Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [applying, setApplying] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const handleAddressChange = (field) => (e) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const deliveryFee = itemsTotal > 999 ? 0 : 99;
  const totalAmount = Math.max(itemsTotal - discount, 0) + deliveryFee;

  const isAddressValid =
    address.fullName.trim() &&
    address.phone.trim() &&
    address.street.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.pincode.trim();

  // 🟢 Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplying(true);
    setCouponMsg("");

    try {
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode, orderValue: itemsTotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCouponMsg(data.message || "Invalid coupon");
        setDiscount(0);
        setAppliedCode("");
        return;
      }

      setDiscount(data.discount);
      setAppliedCode(couponCode.toUpperCase());
      setCouponMsg(`Coupon applied! You saved ₹${data.discount}`);
    } catch (error) {
      setCouponMsg("Backend not connected. Please check server is running.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCode("");
    setCouponCode("");
    setCouponMsg("");
  };

  // 🟢 Final step: backend pe actual Order create karna (COD ho ya Online, dono ke liye)
  const finalizeOrder = async (paymentDetails = {}) => {
    const token = localStorage.getItem("shopsphereToken");

    const res = await fetch(`${API_BASE}/orders/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shippingAddress: address,
        paymentMethod, // "COD" or "Online"
        couponCode: appliedCode || undefined, // 🟢 backend order record ke liye
        discount, // 🟢 kitna discount mila
        totalAmount, // 🟢 final discounted amount
        ...paymentDetails, // Online ke case mein razorpay ids yahan aayengi
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to place order");
    }

    addNotification({
      title: "Order Placed Successfully",
      message: "Your order has been confirmed",
      type: "order",
    });

    await refreshCart();

    navigate("/customer/order-success", {
      state: { order: data.order },
    });
  };

  // 🟢 Razorpay payment flow
  const handleRazorpayPayment = async () => {
    const token = localStorage.getItem("shopsphereToken");

    // Step 1: backend se Razorpay order create karwao (discounted amount ke saath)
    // 🔴 FIX: app.js mein Razorpay wali payment.routes.js file "/api/payments"
    // (with "s") par mounted hai — pehle yahan "/api/payment" (no "s") tha,
    // jo "paymentDashboardRoutes" (alag file) ko hit karta tha aur 404 deta tha.
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(orderData.message || "Could not initiate payment");
    }

    // Step 2: Razorpay checkout popup kholna
    return new Promise((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShopSphere",
        description: "Order Payment",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Step 3: payment ko backend se verify karwao
            // 🔴 FIX: same "/api/payments" (with "s") path
            const verifyRes = await fetch(`${API_BASE}/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error("Payment verification failed");
            }

            resolve({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled"));
          },
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        // 🟢 UPI / Google Pay / QR code ko prominently dikhane ke liye config
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["qr", "collect", "intent"],
                  },
                ],
              },
              other: {
                name: "Other Payment Methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        theme: { color: "#ec4899" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // 🟢 Place Order button ka main handler
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      addNotification({
        title: "Cart is Empty",
        message: "Add some items before checking out",
        type: "order",
      });
      return;
    }

    if (!isAddressValid) {
      addNotification({
        title: "Address Incomplete",
        message: "Please fill all address fields",
        type: "order",
      });
      return;
    }

    try {
      setPlacing(true);

      if (paymentMethod === "Online") {
        // Pehle Razorpay se payment complete karwao
        const paymentResult = await handleRazorpayPayment();

        // Phir order create karo payment details ke saath
        await finalizeOrder({
          razorpayOrderId: paymentResult.razorpayOrderId,
          razorpayPaymentId: paymentResult.razorpayPaymentId,
        });
      } else {
        // COD - seedha order create karo
        await finalizeOrder();
      }
    } catch (error) {
      console.error("Place order error:", error);
      const message = error.message || "Could not place your order";

      setErrorMsg(message);

      addNotification({
        title: "Order Failed",
        message,
        type: "order",
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 2,
          borderRadius: 6,
          background: "linear-gradient(135deg,#8b5cf6,#ec4899,#fb7185)",
          color: "white",
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Checkout
        </Typography>

        <Typography sx={{ mt: 1 }}>Complete your order securely</Typography>
      </Paper>

      {cartItems.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 5, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={800} color="#6b647a">
            Your cart is empty. Add items before checkout. 🛍️
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {/* ADDRESS */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Delivery Address
              </Typography>

              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  value={address.fullName}
                  onChange={handleAddressChange("fullName")}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={address.phone}
                  onChange={handleAddressChange("phone")}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Street Address"
                  value={address.street}
                  onChange={handleAddressChange("street")}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={address.city}
                  onChange={handleAddressChange("city")}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  value={address.state}
                  onChange={handleAddressChange("state")}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Pincode"
                  value={address.pincode}
                  onChange={handleAddressChange("pincode")}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* PAYMENT */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Payment Method
              </Typography>

              {[
                {
                  id: "COD",
                  label: "Cash On Delivery",
                  icon: <LocalShippingIcon />,
                },
                {
                  id: "Online",
                  label: "Pay Online (UPI / Card)",
                  icon: <PaymentsIcon />,
                },
              ].map((item) => (
                <Paper
                  key={item.id}
                  onClick={() => setPaymentMethod(item.id)}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 4,
                    cursor: "pointer",
                    border:
                      paymentMethod === item.id
                        ? "2px solid #ec4899"
                        : "1px solid #eee",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Radio checked={paymentMethod === item.id} />
                    {item.icon}
                    <Typography fontWeight={800}>{item.label}</Typography>
                  </Stack>
                </Paper>
              ))}

              {paymentMethod === "Online" && (
                <Typography sx={{ mt: 1, fontSize: 13, color: "#9333ea" }}>
                  You'll be redirected to Razorpay's secure payment screen.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* SUMMARY */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight={900}>
                Order Summary
              </Typography>

              <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
                {cartItems.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography sx={{ fontSize: 14, color: "#6b647a" }}>
                      {item.name} × {item.qty}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      ₹{item.price * item.qty}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* 🟢 APPLY COUPON BOX */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCode}
                  />

                  {appliedCode ? (
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveCoupon}
                      sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleApplyCoupon}
                      disabled={applying}
                      sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                    >
                      {applying ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Apply"}
                    </Button>
                  )}
                </Stack>

                {couponMsg && (
                  <Typography
                    sx={{ mt: 1, fontSize: 13, fontWeight: 700 }}
                    color={appliedCode ? "success.main" : "error.main"}
                  >
                    {couponMsg}
                  </Typography>
                )}

                {appliedCode && (
                  <Chip
                    icon={<LocalOfferIcon />}
                    label={appliedCode}
                    color="success"
                    size="small"
                    sx={{ mt: 1, fontWeight: 800 }}
                  />
                )}
              </Box>

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography>Items Total</Typography>
                <Typography>₹{itemsTotal}</Typography>
              </Stack>

              {discount > 0 && (
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography color="success.main">Coupon Discount</Typography>
                  <Typography color="success.main">− ₹{discount}</Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography>Delivery Fee</Typography>
                <Typography color={deliveryFee === 0 ? "green" : "inherit"}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography variant="h6" fontWeight={900}>
                  Total
                </Typography>
                <Typography variant="h5" color="#ec4899" fontWeight={900}>
                  ₹{totalAmount}
                </Typography>
              </Stack>

              <Chip
                icon={<LocationOnIcon />}
                label="Delivery in 3-5 days"
                sx={{ mt: 2, bgcolor: "#eef7ff" }}
              />

              <Button
                fullWidth
                onClick={placeOrder}
                disabled={placing}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 99,
                  color: "white",
                  fontWeight: 900,
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                }}
              >
                {placing ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Place Order"
                )}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={Boolean(errorMsg)}
        autoHideDuration={4000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMsg("")}
          severity="error"
          sx={{ fontWeight: 700, borderRadius: 3 }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}