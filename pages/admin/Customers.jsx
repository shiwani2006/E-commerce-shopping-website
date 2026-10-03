import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const tokens = {
  glass: "rgba(255,255,255,0.72)",
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textSecondary: "#5b6472",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  purple: "#8b7cf6",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.16)",
  blue: "#3b82f6",
  blueSoft: "rgba(59,130,246,0.12)",
  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
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

function CustomerRow({ customer, onToggleBlock, onViewOrders }) {
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setUpdating(true);
    await onToggleBlock(customer._id, !customer.isBlocked);
    setUpdating(false);
  };

  return (
    <Box
      onClick={() => onViewOrders(customer)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: "16px",
        bgcolor: tokens.glass,
        border: `1px solid ${tokens.hairline}`,
        mb: 1.5,
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": { boxShadow: "0 4px 14px rgba(31,41,55,0.08)", transform: "translateY(-2px)" },
      }}
    >
      <Avatar sx={{ bgcolor: tokens.purple + "22", color: tokens.purple }}>
        <PersonRoundedIcon />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}
        >
          {customer.name}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
          {customer.email}
          {customer.city ? ` • ${customer.city}, ${customer.state}` : ""}
        </Typography>
      </Box>

      <Box sx={{ minWidth: 90, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
          <ShoppingBagRoundedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
          {customer.totalOrders}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>orders</Typography>
      </Box>

      <Box sx={{ minWidth: 110, textAlign: "right" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          {inr(customer.totalSpent)}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>total spent</Typography>
      </Box>

      <Chip
        label={customer.isBlocked ? "Blocked" : "Active"}
        size="small"
        sx={{
          color: customer.isBlocked ? tokens.danger : tokens.success,
          bgcolor: customer.isBlocked ? tokens.dangerSoft : tokens.successSoft,
          fontWeight: 700,
          fontSize: "0.7rem",
        }}
      />

      <Tooltip title={customer.isBlocked ? "Unblock customer" : "Block customer"}>
        <span>
          <Switch
            checked={!customer.isBlocked}
            onChange={handleToggle}
            disabled={updating}
            color="success"
            onClick={(e) => e.stopPropagation()}
          />
        </span>
      </Tooltip>
    </Box>
  );
}

/* =========================
   Customer Orders Dialog
========================= */
function CustomerOrdersDialog({ customer, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem("shopsphereToken");

  useEffect(() => {
    if (!customer) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/orders?user=${customer._id}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) setOrders(json.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customer]);

  return (
    <Dialog open={Boolean(customer)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>
            {customer?.name}'s Orders
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted }}>
            {customer?.email}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#fafafa" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: tokens.primary }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Inventory2RoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
            <Typography sx={{ color: tokens.textMuted }}>
              This customer hasn't placed any orders yet.
            </Typography>
          </Box>
        ) : (
          orders.map((order) => {
            const orderStyle = ORDER_STATUS_STYLES[order.orderStatus] || ORDER_STATUS_STYLES.Placed;
            return (
              <Box
                key={order._id}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${tokens.hairline}`,
                  p: 2,
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {inr(order.totalAmount)}
                    </Typography>
                    <Chip
                      label={order.orderStatus}
                      size="small"
                      sx={{
                        color: orderStyle.color,
                        bgcolor: orderStyle.bg,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

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
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
                        Qty: {item.quantity} × {inr(item.price)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {inr(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })
        )}
      </DialogContent>
    </Dialog>
  );
}

/* =========================
   Main Component
========================= */
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`${API_BASE}/api/admin/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load customers");
        return;
      }
      setCustomers(json.customers);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

  const handleToggleBlock = async (id, isBlocked) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/customers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ isBlocked }),
      });
      const json = await res.json();
      if (json.success) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isBlocked } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Customers
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            View and manage all registered customers. Click a row to see their orders.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search by name or email…"
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
            "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: tokens.glass },
          }}
        />
      </Box>

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
        ) : customers.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 4 }}>
            No customers found.
          </Typography>
        ) : (
          customers.map((customer) => (
            <CustomerRow
              key={customer._id}
              customer={customer}
              onToggleBlock={handleToggleBlock}
              onViewOrders={setSelectedCustomer}
            />
          ))
        )}
      </Box>

      <CustomerOrdersDialog
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </Box>
  );
}