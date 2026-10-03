import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

/* =========================
   SAME AURORA DESIGN TOKENS (as AdminProducts.jsx)
========================= */
const tokens = {
  glass: "rgba(255,255,255,0.72)",
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textSecondary: "#5b6472",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  primaryDim: "#0d9488",
  primarySoft: "rgba(20,184,166,0.14)",
  purple: "#8b7cf6",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.16)",
  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  blue: "#3b82f6",
  blueSoft: "rgba(59,130,246,0.12)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
  shadowSoft: "0 4px 14px rgba(31,41,55,0.06)",
};

const API_BASE = "http://localhost:5000";

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const ORDER_STATUS_STYLES = {
  Placed: { color: tokens.amber, bg: tokens.amberSoft },
  Confirmed: { color: tokens.blue, bg: tokens.blueSoft },
  Shipped: { color: tokens.purple, bg: "rgba(139,124,246,0.14)" },
  Delivered: { color: tokens.success, bg: tokens.successSoft },
  Cancelled: { color: tokens.danger, bg: tokens.dangerSoft },
};

const PAYMENT_STYLES = {
  Paid: { color: tokens.success, bg: tokens.successSoft },
  Pending: { color: tokens.amber, bg: tokens.amberSoft },
  Failed: { color: tokens.danger, bg: tokens.dangerSoft },
};

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "Placed", label: "Placed" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled", label: "Cancelled" },
];

const ALL_STATUSES = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

function StatusChip({ status, styleMap }) {
  const s = styleMap[status] || styleMap.Placed || styleMap.Pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        color: s.color,
        bgcolor: s.bg,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.7rem",
        fontWeight: 700,
        height: 24,
      }}
    />
  );
}

/* =========================
   Order Row
========================= */
function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <Box
      sx={{
        borderRadius: "16px",
        bgcolor: tokens.glass,
        border: `1px solid ${tokens.hairline}`,
        mb: 1.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          cursor: "pointer",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {order.shippingAddress?.fullName || "Customer"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
            #{order._id.slice(-8).toUpperCase()} •{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {order.user?.email ? ` • ${order.user.email}` : ""}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 90, textAlign: "right" }}>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
            {inr(order.totalAmount)}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>
            {order.items?.length || 0} item(s)
          </Typography>
        </Box>

        <StatusChip status={order.paymentStatus} styleMap={PAYMENT_STYLES} />
        <StatusChip status={order.orderStatus} styleMap={ORDER_STATUS_STYLES} />

        {/* Status update dropdown */}
        <FormControl
          size="small"
          onClick={(e) => e.stopPropagation()}
          sx={{ minWidth: 140 }}
        >
          <Select
            value={order.orderStatus}
            onChange={handleStatusChange}
            disabled={updating}
            sx={{
              borderRadius: "10px",
              fontSize: "0.8rem",
              bgcolor: tokens.glassStrong,
            }}
          >
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: "0.85rem" }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton size="small">
          {expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${tokens.hairline}`, pt: 2 }}>
          {order.items?.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                borderBottom:
                  idx !== order.items.length - 1 ? `1px solid ${tokens.hairline}` : "none",
              }}
            >
              {item.image && (
                <Box
                  component="img"
                  src={`${API_BASE}${item.image}`}
                  sx={{ width: 40, height: 40, borderRadius: "8px", objectFit: "cover" }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.name}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
                  Qty: {item.quantity} × {inr(item.price)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                {inr(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}

          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${tokens.hairline}` }}>
            <Typography sx={{ fontSize: "0.8rem", color: tokens.textSecondary }}>
              📍 {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: tokens.textSecondary, mt: 0.5 }}>
              📞 {order.shippingAddress?.phone} • Payment: {order.paymentMethod}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

/* =========================
   Main Component
========================= */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`${API_BASE}/api/admin/orders?${params.toString()}`, {
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
  }, [statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const placedCount = orders.filter((o) => o.orderStatus === "Placed").length;

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Orders
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            Track and update order fulfillment status.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search by customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: tokens.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 260,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: tokens.glass,
            },
          }}
        />
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.key || "all"}
            label={
              f.key === "Placed" && placedCount > 0
                ? `${f.label} (${placedCount})`
                : f.label
            }
            onClick={() => setStatusFilter(f.key)}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: statusFilter === f.key ? "#fff" : tokens.textMuted,
              background:
                statusFilter === f.key
                  ? `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`
                  : tokens.glass,
              border: `1px solid ${tokens.hairline}`,
            }}
          />
        ))}
      </Box>

      {/* Content */}
      <Box
        sx={{
          bgcolor: tokens.glassStrong,
          backdropFilter: "blur(20px)",
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: "24px",
          boxShadow: tokens.shadow,
          p: 3,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: tokens.primary }} />
          </Box>
        ) : error ? (
          <Typography sx={{ color: tokens.danger, textAlign: "center", py: 4 }}>
            {error}
          </Typography>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <LocalShippingRoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
            <Typography sx={{ color: tokens.textMuted }}>No orders found.</Typography>
          </Box>
        ) : (
          orders.map((order) => (
            <OrderRow key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))
        )}
      </Box>
    </Box>
  );
}