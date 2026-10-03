import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Skeleton,
  TextField,
  Rating,
} from "@mui/material";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

/* Same tokens as AdminAnalytics.jsx / Coupons.jsx */
const tokens = {
  glass: "rgba(255,255,255,0.72)",
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  primaryDim: "#0d9488",
  purple: "#8b7cf6",
  amber: "#f5a623",
  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
};

const API_BASE = "http://localhost:5000/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("shopsphereToken")}`,
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/all`, { headers: headers() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
      setReviews(data.reviews);
    } catch (err) {
      setError(`Could not load reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleStatus = async (review) => {
    const next = review.status === "approved" ? "hidden" : "approved";
    setBusyId(review._id);
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${review._id}/status`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      setReviews((prev) => prev.map((r) => (r._id === review._id ? { ...r, status: next } : r)));
    } catch (err) {
      setError(`Could not update review: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return [r.product?.name, r.user?.name, r.vendor?.name, r.comment]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [reviews, filter, query]);

  const hiddenCount = reviews.filter((r) => r.status === "hidden").length;

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Reviews
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            {reviews.length} total, {hiddenCount} hidden. Hidden reviews don't count toward product ratings.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search product, customer, vendor or comment"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 300, bgcolor: tokens.glass, borderRadius: 2 }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            onClick={() => setFilter(f.key)}
            sx={{
              fontWeight: 700,
              color: filter === f.key ? "#fff" : tokens.textMuted,
              background:
                filter === f.key
                  ? `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`
                  : tokens.glass,
              border: `1px solid ${tokens.hairline}`,
            }}
          />
        ))}
      </Box>

      {error && (
        <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{error}</Typography>
      )}

      <Box
        sx={{
          bgcolor: tokens.glassStrong,
          backdropFilter: "blur(20px)",
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: "24px",
          boxShadow: tokens.shadow,
          p: 2,
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={84} sx={{ mb: 1.25, borderRadius: "14px" }} />
          ))
        ) : visible.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <RateReviewRoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
            <Typography sx={{ color: tokens.textMuted }}>
              {reviews.length === 0
                ? "No reviews yet. They appear here once customers review delivered orders."
                : "No reviews match these filters."}
            </Typography>
          </Box>
        ) : (
          visible.map((r) => {
            const isHidden = r.status === "hidden";
            return (
              <Box
                key={r._id}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 2,
                  mb: 1.25,
                  borderRadius: "14px",
                  bgcolor: tokens.glass,
                  border: `1px solid ${tokens.hairline}`,
                  opacity: isHidden ? 0.65 : 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }} noWrap>
                      {r.product?.name || "Deleted product"}
                    </Typography>
                    <Rating value={r.rating} readOnly size="small" />
                    <Chip
                      size="small"
                      label={isHidden ? "Hidden" : "Visible"}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: isHidden ? tokens.dangerSoft : tokens.successSoft,
                        color: isHidden ? tokens.danger : tokens.success,
                      }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted, mt: 0.3 }}>
                    By {r.user?.name || "Unknown"} for vendor {r.vendor?.name || "Unknown"} on{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </Typography>

                  {r.comment && (
                    <Typography sx={{ fontSize: "0.85rem", mt: 1, wordBreak: "break-word" }}>
                      {r.comment}
                    </Typography>
                  )}

                  {r.vendorReply && (
                    <Box sx={{ mt: 1, pl: 1.5, borderLeft: `3px solid ${tokens.primary}` }}>
                      <Typography sx={{ fontSize: "0.72rem", color: tokens.primaryDim, fontWeight: 700 }}>
                        Vendor reply
                      </Typography>
                      <Typography sx={{ fontSize: "0.82rem", wordBreak: "break-word" }}>
                        {r.vendorReply}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  size="small"
                  disabled={busyId === r._id}
                  onClick={() => toggleStatus(r)}
                  startIcon={isHidden ? <VisibilityRoundedIcon /> : <VisibilityOffRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "10px",
                    whiteSpace: "nowrap",
                    color: isHidden ? tokens.primaryDim : tokens.danger,
                    bgcolor: isHidden ? "rgba(20,184,166,0.12)" : tokens.dangerSoft,
                  }}
                >
                  {isHidden ? "Show review" : "Hide review"}
                </Button>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}