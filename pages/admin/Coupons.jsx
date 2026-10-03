import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

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
  purple: "#8b7cf6",
  purpleSoft: "rgba(139,124,246,0.14)",
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

const STATUS_STYLES = {
  Pending: { color: tokens.amber, bg: tokens.amberSoft },
  Approved: { color: tokens.success, bg: tokens.successSoft },
  Rejected: { color: tokens.danger, bg: tokens.dangerSoft },
};

const FILTERS = [
  { key: "", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

function StatusChip({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        color: s.color,
        bgcolor: s.bg,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 24,
      }}
    />
  );
}

/* =========================
   Summary stat card
========================= */
function StatCard({ icon, label, value, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 150,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderRadius: "18px",
        bgcolor: tokens.glassStrong,
        backdropFilter: "blur(20px)",
        border: `1px solid ${tokens.glassBorder}`,
        boxShadow: tokens.shadowSoft,
      }}
    >
      <Avatar sx={{ bgcolor: `${color}18`, color: color, width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.3rem", lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: tokens.textMuted, fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/* =========================
   Coupon Card
========================= */
function CouponCard({ coupon, onApprove, onRejectClick }) {
  const vendorName = coupon.vendor?.user?.name || "Unknown Vendor";
  const vendorEmail = coupon.vendor?.user?.email || "";
  const isExpired = new Date(coupon.expiryDate) < new Date();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        p: 2.5,
        borderRadius: "18px",
        bgcolor: tokens.glass,
        border: `1px solid ${tokens.hairline}`,
        mb: 1.5,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": { boxShadow: tokens.shadowSoft, transform: "translateY(-2px)" },
      }}
    >
      {/* Discount badge */}
      <Box
        sx={{
          minWidth: 76,
          height: 76,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${tokens.purple}, ${tokens.primary})`,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(139,124,246,0.28)",
        }}
      >
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.15rem", lineHeight: 1 }}>
          {coupon.discountType === "percentage"
            ? `${coupon.discountValue}%`
            : `₹${coupon.discountValue}`}
        </Typography>
        <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.04em", mt: 0.3 }}>
          OFF
        </Typography>
      </Box>

      {/* Main info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "0.95rem",
              letterSpacing: "0.02em",
            }}
          >
            {coupon.code}
          </Typography>
          <StatusChip status={coupon.status} />
          {isExpired && (
            <Chip
              icon={<EventBusyRoundedIcon sx={{ fontSize: "14px !important" }} />}
              label="Expired"
              size="small"
              sx={{
                color: tokens.textMuted,
                bgcolor: "rgba(31,36,48,0.06)",
                fontWeight: 600,
                fontSize: "0.68rem",
                height: 22,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: tokens.textMuted }}>
          <StorefrontRoundedIcon sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: "0.78rem" }}>
            {vendorName}
            {vendorEmail ? ` · ${vendorEmail}` : ""}
          </Typography>
        </Box>
      </Box>

      {/* Min order */}
      <Box sx={{ minWidth: 100, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted, fontWeight: 600 }}>
          MIN ORDER
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
          ₹{coupon.minOrderValue || 0}
        </Typography>
      </Box>

      {/* Usage */}
      <Box sx={{ minWidth: 90, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted, fontWeight: 600 }}>
          USAGE
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
          {coupon.usedCount || 0}/{coupon.usageLimit}
        </Typography>
      </Box>

      {/* Expiry */}
      <Box sx={{ minWidth: 110, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted, fontWeight: 600 }}>
          EXPIRES
        </Typography>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
          {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ minWidth: 80, display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
        {coupon.status === "Pending" ? (
          <>
            <Tooltip title="Approve">
              <IconButton
                size="small"
                onClick={() => onApprove(coupon)}
                sx={{
                  color: tokens.success,
                  bgcolor: tokens.successSoft,
                  "&:hover": { bgcolor: "rgba(34,197,94,0.22)" },
                }}
              >
                <CheckCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                onClick={() => onRejectClick(coupon)}
                sx={{
                  color: tokens.danger,
                  bgcolor: tokens.dangerSoft,
                  "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                }}
              >
                <CancelRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Box sx={{ width: 32, height: 32 }} />
        )}
      </Box>
    </Box>
  );
}

/* =========================
   Main Component
========================= */
export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/admin/coupons${query}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Failed to load coupons");
        return;
      }
      setCoupons(json.coupons);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const updateStatus = async (id, status, rejectionReason = "") => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status, rejectionReason }),
      });
      const json = await res.json();
      if (json.success) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status, rejectionReason } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = (coupon) => updateStatus(coupon._id, "Approved");

  const handleRejectClick = (coupon) => {
    setRejectTarget(coupon);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    await updateStatus(rejectTarget._id, "Rejected", rejectReason);
    setRejectTarget(null);
    setRejectReason("");
  };

  const pendingCount = coupons.filter((c) => c.status === "Pending").length;
  const approvedCount = coupons.filter((c) => c.status === "Approved").length;
  const rejectedCount = coupons.filter((c) => c.status === "Rejected").length;

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
          Coupons
        </Typography>
        <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
          Review vendor coupons before they go live for customers.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <StatCard
          icon={<ReceiptLongRoundedIcon />}
          label="Total Coupons"
          value={coupons.length}
          color={tokens.purple}
        />
        <StatCard
          icon={<PendingActionsRoundedIcon />}
          label="Pending Review"
          value={pendingCount}
          color={tokens.amber}
        />
        <StatCard
          icon={<TaskAltRoundedIcon />}
          label="Approved"
          value={approvedCount}
          color={tokens.success}
        />
        <StatCard
          icon={<BlockRoundedIcon />}
          label="Rejected"
          value={rejectedCount}
          color={tokens.danger}
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
          <Typography sx={{ color: tokens.danger, textAlign: "center", py: 4 }}>{error}</Typography>
        ) : coupons.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <LocalOfferRoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
            <Typography sx={{ color: tokens.textMuted }}>No coupons found.</Typography>
          </Box>
        ) : (
          coupons.map((coupon) => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              onApprove={handleApprove}
              onRejectClick={handleRejectClick}
            />
          ))
        )}
      </Box>

      {/* Reject dialog */}
      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
          Reject "{rejectTarget?.code}"
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
    </Box>
  );
}