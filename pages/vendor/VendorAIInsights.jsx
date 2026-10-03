import { useState, useEffect, useCallback } from "react";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
  LinearProgress,
} from "@mui/material";

import {
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Refresh,
} from "@mui/icons-material";

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
// {
//   recommendations: [{ id, title, description, impact: "high"|"medium"|"low" }],
//   trends: [{ id, label, direction: "up"|"down", changePct, description }],
//   demandScore: 0-100
// }
function mapInsights(data) {
  return {
    recommendations: data.recommendations || [],
    trends: data.trends || [],
    demandScore: data.demandScore ?? 0,
  };
}

const tokens = {
  bg: "linear-gradient(160deg,#F4FBF7 0%,#FBFAF3 50%,#F2F7FB 100%)",
  ink: "#10231C",
  sub: "#5B6B63",
  card: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(16,35,28,0.06)",
  gold: "#C9962E",
};

const impactColor = {
  high: { bg: "#FCEFDA", color: "#B45309" },
  medium: { bg: "#E1F4EF", color: "#0F766E" },
  low: { bg: "#EAF7EF", color: "#0B6E4F" },
};

export default function VendorAIInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState({
    recommendations: [],
    trends: [],
    demandScore: 0,
  });

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet("/vendor/ai-insights");
      setInsights(mapInsights(data));
    } catch (err) {
      console.error(err);
      setError("AI insights load nahi ho paye. Backend check karke retry karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

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
          <Stack direction="row" spacing={2} alignItems="center">
            <AutoAwesome sx={{ color: tokens.gold, fontSize: 34 }} />
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: tokens.ink }}>
                AI Insights
              </Typography>
              <Typography sx={{ color: tokens.sub, mt: 0.5 }}>
                Smart recommendations business grow karne ke liye.
              </Typography>
            </Box>
          </Stack>

          <MuiTooltip title="Refresh">
            <IconButton
              onClick={loadInsights}
              disabled={loading}
              sx={{ border: tokens.border, borderRadius: 3 }}
            >
              <Refresh />
            </IconButton>
          </MuiTooltip>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Demand score */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 5, background: tokens.card, border: tokens.border, height: "100%" }}
          >
            <Typography variant="h6" fontWeight={800} mb={2} sx={{ color: tokens.ink }}>
              Demand Score
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
            ) : (
              <>
                <Typography variant="h2" fontWeight={900} sx={{ color: "#0B6E4F" }}>
                  {insights.demandScore}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={insights.demandScore}
                  sx={{
                    mt: 2,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#EAF7EF",
                    "& .MuiLinearProgress-bar": { bgcolor: "#0B6E4F" },
                  }}
                />
                <Typography variant="caption" sx={{ color: tokens.sub, mt: 1, display: "block" }}>
                  Based on recent orders, views aur market trends
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Trends */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 5, background: tokens.card, border: tokens.border, height: "100%" }}
          >
            <Typography variant="h6" fontWeight={800} mb={2} sx={{ color: tokens.ink }}>
              Market Trends
            </Typography>
            {loading ? (
              <Stack spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 3 }} />
                ))}
              </Stack>
            ) : insights.trends.length === 0 ? (
              <Typography sx={{ color: tokens.sub, py: 2 }}>Abhi koi trend data nahi hai.</Typography>
            ) : (
              <Stack spacing={2}>
                {insights.trends.map((trend) => (
                  <Stack
                    key={trend.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ p: 1.5, borderRadius: 3, border: tokens.border }}
                  >
                    {trend.direction === "up" ? (
                      <TrendingUp sx={{ color: "#0B6E4F" }} />
                    ) : (
                      <TrendingDown sx={{ color: "#B91C1C" }} />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{trend.label}</Typography>
                      <Typography variant="body2" sx={{ color: tokens.sub }}>
                        {trend.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${trend.direction === "up" ? "+" : "-"}${Math.abs(trend.changePct)}%`}
                      sx={{
                        bgcolor: trend.direction === "up" ? "#EAF7EF" : "#FEECEC",
                        color: trend.direction === "up" ? "#0B6E4F" : "#B91C1C",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 5, background: tokens.card, border: tokens.border }}
      >
        <Typography variant="h6" fontWeight={800} mb={3} sx={{ color: tokens.ink }}>
          Recommendations
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            ))}
          </Stack>
        ) : insights.recommendations.length === 0 ? (
          <Typography sx={{ color: tokens.sub, py: 2 }}>Abhi koi recommendation nahi hai.</Typography>
        ) : (
          <Stack spacing={2}>
            {insights.recommendations.map((rec) => {
              const colors = impactColor[rec.impact] || impactColor.low;
              return (
                <Stack
                  key={rec.id}
                  direction="row"
                  spacing={2}
                  sx={{ p: 2, borderRadius: 4, border: tokens.border }}
                >
                  <Lightbulb sx={{ color: tokens.gold, mt: 0.3 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography fontWeight={700}>{rec.title}</Typography>
                      <Chip
                        label={`${rec.impact} impact`}
                        size="small"
                        sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700 }}
                      />
                    </Stack>
                    <Typography sx={{ color: tokens.sub, mt: 0.5 }}>{rec.description}</Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}