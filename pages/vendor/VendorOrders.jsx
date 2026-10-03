import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  TextField,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import {
  ShoppingBag,
  CurrencyRupee,
  LocalShipping,
  CheckCircle,
  Search as SearchIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

/* =========================
   GOLD THEME (same as VendorLayout.jsx)
========================= */
const GOLD = "#B28A4A";
const DARK_GOLD = "#9A7438";
const LIGHT_GOLD = "#F6EEDC";
const SOFT_GOLD = "#FBF8F1";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#64748B";

const API_BASE = "http://localhost:5000";

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// 🟢 Vendor sirf ye statuses set kar sakta hai (Placed backend se hi aata hai)
const VENDOR_SETTABLE_STATUSES = ["Confirmed", "Shipped", "Delivered", "Cancelled"];
const STATUS_FILTERS = ["All", "Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLOR = {
  Placed: "warning",
  Confirmed: "info",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "error",
};

/* =========================
   Order Card
========================= */
function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.06)",
        background: "#fff",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={2.5}>
          <Typography fontWeight={700} sx={{ fontSize: "0.85rem" }}>
            #{order._id.slice(-8).toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: TEXT_MUTED }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>
        </Grid>

        <Grid item xs={12} md={2.5}>
          <Typography sx={{ fontSize: "0.85rem" }}>{order.customerName}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: TEXT_MUTED }}>
            {order.items.length} item(s)
          </Typography>
        </Grid>

        <Grid item xs={6} md={2}>
          <Typography fontWeight={700} sx={{ fontSize: "0.9rem" }}>
            {inr(order.myItemsTotal)}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: TEXT_MUTED }}>
            Payment: {order.paymentStatus}
          </Typography>
        </Grid>

        <Grid item xs={6} md={2}>
          <Chip
            label={order.orderStatus}
            size="small"
            color={STATUS_COLOR[order.orderStatus] || "default"}
          />
        </Grid>

        <Grid item xs={12} md={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={order.orderStatus}
                onChange={handleChange}
                disabled={updating || order.orderStatus === "Cancelled"}
                sx={{ borderRadius: "10px", fontSize: "0.8rem" }}
              >
                <MenuItem value={order.orderStatus} sx={{ display: "none" }}>
                  {order.orderStatus}
                </MenuItem>
                {VENDOR_SETTABLE_STATUSES.map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton size="small" onClick={() => setExpanded((e) => !e)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {order.items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                borderBottom:
                  idx !== order.items.length - 1
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
              }}
            >
              {item.image && (
                <Box
                  component="img"
                  src={`${API_BASE}${item.image}`}
                  sx={{ width: 42, height: 42, borderRadius: "8px", objectFit: "cover" }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: TEXT_MUTED }}>
                  Qty: {item.quantity} × {inr(item.price)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                {inr(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}

          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: "0.8rem", color: TEXT_MUTED }}>
              📍 {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: TEXT_MUTED, mt: 0.5 }}>
              📞 {order.customerPhone} • Payment: {order.paymentMethod}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

/* =========================
   Main Component
========================= */
export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/vendor/my-orders`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load orders");
        return;
      }
      setOrders(json.orders);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/vendor/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, orderStatus: status } : o))
        );
      } else {
        alert(json.message || "Status update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not connected");
    }
  };

  // 🟢 Filter + search (client-side, live data pe)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 🟢 Stat cards — real data se calculate
  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + o.myItemsTotal, 0);
  const shippedCount = orders.filter((o) => o.orderStatus === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "Delivered").length;

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag />,
      gradient: "linear-gradient(135deg,#C8A15A,#A98243)",
    },
    {
      title: "Revenue",
      value: inr(revenue),
      icon: <CurrencyRupee />,
      gradient: "linear-gradient(135deg,#B28A4A,#8b6a34)",
    },
    {
      title: "Shipped",
      value: shippedCount,
      icon: <LocalShipping />,
      gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    },
    {
      title: "Delivered",
      value: deliveredCount,
      icon: <CheckCircle />,
      gradient: "linear-gradient(135deg,#10b981,#22c55e)",
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 5,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid #EDE8DE",
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ color: TEXT_DARK }}>
          Orders Management
        </Typography>
        <Typography sx={{ color: TEXT_MUTED }}>
          Manage orders containing your products.
        </Typography>
      </Paper>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 5, color: "#fff", background: item.gradient }}
            >
              <Stack spacing={1}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)" }}>{item.icon}</Avatar>
                <Typography>{item.title}</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 5,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid #EDE8DE",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={2}
          mb={3}
        >
          <Typography variant="h6" fontWeight={700}>
            Recent Orders
          </Typography>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search by customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: TEXT_MUTED }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            >
              {STATUS_FILTERS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: GOLD }} />
          </Box>
        ) : error ? (
          <Typography sx={{ color: "#dc2626", textAlign: "center", py: 4 }}>
            {error}
          </Typography>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <LocalShipping sx={{ fontSize: 40, color: TEXT_MUTED, mb: 1 }} />
            <Typography sx={{ color: TEXT_MUTED }}>No orders found.</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}