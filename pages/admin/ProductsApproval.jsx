import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PauseCircleRoundedIcon from "@mui/icons-material/PauseCircleRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

/* =========================
   SAME AURORA DESIGN TOKENS
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
  purpleSoft: "rgba(139,124,246,0.14)",
  pink: "#f472b6",
  pinkSoft: "rgba(244,114,182,0.14)",
  amber: "#f5a623",
  amberSoft: "rgba(245,166,35,0.16)",
  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
  shadowSoft: "0 4px 14px rgba(31,41,55,0.06)",
};

const API_BASE = "http://localhost:5000";

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_STYLES = {
  Pending: { color: tokens.amber, bg: tokens.amberSoft },
  Active: { color: tokens.success, bg: tokens.successSoft },
  Inactive: { color: tokens.textMuted, bg: "rgba(31,36,48,0.06)" },
  Rejected: { color: tokens.danger, bg: tokens.dangerSoft },
};

const FILTERS = [
  { key: "", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Active", label: "Active" },
  { key: "Inactive", label: "Inactive" },
  { key: "Rejected", label: "Rejected" },
];

/* =========================
   Status chip
========================= */
function StatusChip({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
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
   Product Row
========================= */
function ProductRow({ product, onApprove, onRejectClick, onToggleActive, onDeleteClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const thumb = product.images?.[0]
    ? `${API_BASE}${product.images[0]}`
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: "16px",
        bgcolor: tokens.glass,
        border: `1px solid ${tokens.hairline}`,
        mb: 1.5,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": { boxShadow: tokens.shadowSoft, transform: "translateY(-2px)" },
      }}
    >
      <Avatar
        src={thumb}
        variant="rounded"
        sx={{
          width: 52,
          height: 52,
          borderRadius: "12px",
          bgcolor: tokens.primarySoft,
          color: tokens.primaryDim,
        }}
      >
        {!thumb && <Inventory2RoundedIcon />}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.name}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
          {product.category}
          {product.vendor?.name ? ` • ${product.vendor.name}` : ""}
        </Typography>
      </Box>

      <Box sx={{ minWidth: 90, textAlign: "right" }}>
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
          {inr(product.sellingPrice)}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>
          Stock: {product.stock}
        </Typography>
      </Box>

      <StatusChip status={product.status} />

      {/* Quick actions for Pending */}
      {product.status === "Pending" && (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Approve">
            <IconButton size="small" onClick={() => onApprove(product)} sx={{ color: tokens.success }}>
              <CheckCircleRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton size="small" onClick={() => onRejectClick(product)} sx={{ color: tokens.danger }}>
              <CancelRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Overflow menu */}
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {product.status === "Active" && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onToggleActive(product, "Inactive");
            }}
          >
            <PauseCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Deactivate
          </MenuItem>
        )}
        {product.status === "Inactive" && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onToggleActive(product, "Active");
            }}
          >
            <PlayCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Activate
          </MenuItem>
        )}
        {product.status !== "Pending" && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onApprove(product);
            }}
          >
            <CheckCircleRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Mark Active
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDeleteClick(product);
          }}
          sx={{ color: tokens.danger }}
        >
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

/* =========================
   Main Component
========================= */
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/admin/products${query}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load products");
        return;
      }
      setProducts(json.products);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateStatus = async (id, status, rejectionReason = "") => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status, rejectionReason } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = (product) => updateStatus(product._id, "Active");

  const handleToggleActive = (product, newStatus) =>
    updateStatus(product._id, newStatus);

  const handleRejectClick = (product) => {
    setRejectTarget(product);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await updateStatus(rejectTarget._id, "Rejected", rejectReason);
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleDeleteClick = (product) => setDeleteTarget(product);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = products.filter((p) => p.status === "Pending").length;

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Products
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            Review vendor submissions and manage the catalogue.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search products…"
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
            minWidth: 240,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: tokens.glass,
            },
          }}
        />
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key || "all"}
            label={
              f.key === "Pending" && pendingCount > 0
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
        ) : filteredProducts.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 4 }}>
            No products found.
          </Typography>
        ) : (
          filteredProducts.map((product) => (
            <ProductRow
              key={product._id}
              product={product}
              onApprove={handleApprove}
              onRejectClick={handleRejectClick}
              onToggleActive={handleToggleActive}
              onDeleteClick={handleDeleteClick}
            />
          ))
        )}
      </Box>

      {/* Reject dialog */}
      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
          Reject "{rejectTarget?.name}"
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            minRows={3}
            fullWidth
            placeholder="Reason for rejection (shown to vendor)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectTarget(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmReject}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              background: tokens.danger,
              "&:hover": { background: "#dc2626" },
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
          Delete "{deleteTarget?.name}"?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            This action cannot be undone. The product will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              background: tokens.danger,
              "&:hover": { background: "#dc2626" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}