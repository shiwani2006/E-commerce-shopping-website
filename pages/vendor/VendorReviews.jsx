import { useState, useEffect, useCallback } from "react";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Rating,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";

import { Refresh, StarRate } from "@mui/icons-material";

/* =========================================================================
   BACKEND CONFIG — apne backend ke hisaab se adjust karo
   ========================================================================= */

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

// Expected backend shape:
// [{ id, customerName, rating, comment, date, product }]
function mapReviews(data) {
  return data.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    product: r.product,
  }));
}

const tokens = {
  bg: "linear-gradient(160deg,#F4FBF7 0%,#FBFAF3 50%,#F2F7FB 100%)",
  ink: "#10231C",
  sub: "#5B6B63",
  card: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(16,35,28,0.06)",
  gold: "#C9962E",
};

export default function VendorReviews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/vendor/reviews?limit=20");
      setReviews(mapReviews(data));
    } catch (err) {
      console.error(err);
      setError("Reviews load nahi ho paye. Backend check karke retry karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 }, background: tokens.bg }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 5,
          background: tokens.card,
          backdropFilter: "blur(20px)",
          border: tokens.border,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ color: tokens.ink }}>
              Customer Reviews
            </Typography>
            <Typography sx={{ color: tokens.sub, mt: 1 }}>
              Dekho customers ne tumhare products ke baare me kya kaha.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<StarRate sx={{ color: `${tokens.gold} !important` }} />}
              label={`${avgRating} average rating`}
              sx={{ bgcolor: "#FBF3E1", color: "#7A5A16", fontWeight: 700, px: 1 }}
            />
            <MuiTooltip title="Refresh">
              <IconButton
                onClick={loadReviews}
                disabled={loading}
                sx={{ border: tokens.border, borderRadius: 3 }}
              >
                <Refresh />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 4 }} />
            ))
          : reviews.length === 0
          ? (
            <Paper
              elevation={0}
              sx={{ p: 5, borderRadius: 5, textAlign: "center", background: tokens.card, border: tokens.border }}
            >
              <Typography sx={{ color: tokens.sub }}>Abhi koi review nahi mila.</Typography>
            </Paper>
          )
          : reviews.map((review) => (
              <Paper
                key={review.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: tokens.card,
                  border: tokens.border,
                  transition: "transform .2s ease",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "#0B6E4F" }}>
                    {review.customerName?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ sm: "center" }}
                      spacing={1}
                    >
                      <Typography fontWeight={700}>{review.customerName}</Typography>
                      <Typography variant="caption" sx={{ color: tokens.sub }}>
                        {review.date}
                      </Typography>
                    </Stack>
                    <Rating value={review.rating} readOnly size="small" sx={{ my: 0.5 }} />
                    {review.product && (
                      <Chip
                        label={review.product}
                        size="small"
                        sx={{ mb: 1, bgcolor: "#EAF7EF", color: "#0B6E4F" }}
                      />
                    )}
                    <Typography sx={{ color: tokens.ink }}>{review.comment}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
      </Stack>
    </Box>
  );
}