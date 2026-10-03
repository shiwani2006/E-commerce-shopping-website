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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

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
  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
};

const API_BASE = "http://localhost:5000";

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending Approval" },
  { key: "approved", label: "Approved" },
];

function VendorRow({ vendor, onApprove, onReject, onToggleBlock, onViewProducts }) {
  const [updating, setUpdating] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setUpdating(true);
    await onToggleBlock(vendor._id, !vendor.isBlocked);
    setUpdating(false);
  };

  return (
    <Box
      onClick={() => onViewProducts(vendor)}
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
        <StorefrontRoundedIcon />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}
        >
          {vendor.name}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
          {vendor.email}
          {vendor.city ? ` • ${vendor.city}, ${vendor.state}` : ""}
        </Typography>
      </Box>

      <Box sx={{ minWidth: 80, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
          {vendor.totalProducts}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>products</Typography>
      </Box>

      <Box sx={{ minWidth: 80, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
          {vendor.totalOrders}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>orders</Typography>
      </Box>

      <Box sx={{ minWidth: 110, textAlign: "right" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
          {inr(vendor.revenue)}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>revenue</Typography>
      </Box>

      {!vendor.isApproved ? (
        <Box sx={{ display: "flex", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Approve vendor">
            <IconButton
              size="small"
              onClick={() => onApprove(vendor._id)}
              sx={{ color: tokens.success }}
            >
              <CheckCircleRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject vendor">
            <IconButton
              size="small"
              onClick={() => onReject(vendor._id)}
              sx={{ color: tokens.danger }}
            >
              <CancelRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Chip
          label={vendor.isBlocked ? "Blocked" : "Active"}
          size="small"
          sx={{
            color: vendor.isBlocked ? tokens.danger : tokens.success,
            bgcolor: vendor.isBlocked ? tokens.dangerSoft : tokens.successSoft,
            fontWeight: 700,
            fontSize: "0.7rem",
          }}
        />
      )}

      {vendor.isApproved && (
        <Tooltip title={vendor.isBlocked ? "Unblock vendor" : "Block vendor"}>
          <span>
            <Switch
              checked={!vendor.isBlocked}
              onChange={handleToggle}
              disabled={updating}
              color="success"
              onClick={(e) => e.stopPropagation()}
            />
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

/* =========================
   Vendor Products Dialog
========================= */
function VendorProductsDialog({ vendor, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem("shopsphereToken");

  useEffect(() => {
    if (!vendor) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/products?vendor=${vendor._id}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) setProducts(json.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [vendor]);

  return (
    <Dialog open={Boolean(vendor)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>
            {vendor?.name}'s Products
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted }}>
            {vendor?.email}
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
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Inventory2RoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
            <Typography sx={{ color: tokens.textMuted }}>
              This vendor hasn't added any products yet.
            </Typography>
          </Box>
        ) : (
          products.map((product) => {
            const thumb = product.images?.[0] ? `${API_BASE}${product.images[0]}` : null;
            return (
              <Box
                key={product._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  bgcolor: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${tokens.hairline}`,
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <Avatar
                  src={thumb}
                  variant="rounded"
                  sx={{ width: 48, height: 48, borderRadius: "10px" }}
                >
                  {!thumb && <Inventory2RoundedIcon />}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
                    {product.category} • Stock: {product.stock}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {inr(product.sellingPrice)}
                </Typography>

                <Chip
                  label={product.status}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    bgcolor:
                      product.status === "Active"
                        ? tokens.successSoft
                        : product.status === "Rejected"
                        ? tokens.dangerSoft
                        : tokens.amberSoft,
                    color:
                      product.status === "Active"
                        ? tokens.success
                        : product.status === "Rejected"
                        ? tokens.danger
                        : tokens.amber,
                  }}
                />
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
export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`${API_BASE}/api/admin/vendors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load vendors");
        return;
      }
      setVendors(json.vendors);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchVendors(), 300);
    return () => clearTimeout(debounce);
  }, [fetchVendors]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/vendors/${id}/approval`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });
      const json = await res.json();
      if (json.success) {
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isApproved: true } : v))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this vendor? Their account will remain unapproved.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/vendors/${id}/approval`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ isApproved: false }),
      });
      const json = await res.json();
      if (json.success) {
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isApproved: false } : v))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async (id, isBlocked) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/vendors/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ isBlocked }),
      });
      const json = await res.json();
      if (json.success) {
        setVendors((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isBlocked } : v))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = vendors.filter((v) => !v.isApproved).length;

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Vendors
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            Approve new vendors, manage accounts, view their catalogue.
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

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key || "all"}
            label={
              f.key === "pending" && pendingCount > 0
                ? `${f.label} (${pendingCount})`
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
        ) : vendors.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 4 }}>
            No vendors found.
          </Typography>
        ) : (
          vendors.map((vendor) => (
            <VendorRow
              key={vendor._id}
              vendor={vendor}
              onApprove={handleApprove}
              onReject={handleReject}
              onToggleBlock={handleToggleBlock}
              onViewProducts={setSelectedVendor}
            />
          ))
        )}
      </Box>

      <VendorProductsDialog
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
      />
    </Box>
  );
}