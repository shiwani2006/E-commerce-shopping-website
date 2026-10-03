import { useState, useEffect, useCallback } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Avatar,
  LinearProgress,
  Button,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";

import {
  CurrencyRupee,
  ShoppingBag,
  TrendingUp,
  People,
  Download,
  Refresh,
  Insights,
  EmojiEvents,
  Groups,
  ListAlt,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

/* =========================================================================
   BACKEND CONFIG — same pattern as VendorOrders.jsx / MyShop.jsx / VendorEarnings.jsx
   ========================================================================= */
const API_BASE_URL = "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("shopsphereToken");
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

function formatINR(value) {
  if (value === null || value === undefined) return "₹0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/* =========================================================================
   GOLD THEME — same tokens as VendorEarnings.jsx / VendorOrders.jsx / MyShop.jsx
   ========================================================================= */
const tokens = {
  bg: "linear-gradient(160deg,#FDFBF6 0%,#FBF7EE 45%,#FAF4E9 100%)",
  ink: "#241608",
  sub: "#7A6A57",
  card: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(36,22,8,0.07)",
  gold: "#C9962E",
  goldDeep: "#8A6414",
  lightGold: "#F6EEDC",
  accents: {
    primary: "linear-gradient(135deg,#8A6414,#C9962E)",
    success: "linear-gradient(135deg,#0F766E,#22C55E)",
    info: "linear-gradient(135deg,#3B2A18,#6B4A22)",
    warning: "linear-gradient(135deg,#B45309,#D97706)",
  },
  shadow: "0 4px 24px rgba(36,22,8,0.06)",
};

// Order status ke dots ke liye semantic colors (status ka meaning batate hain,
// theme decoration nahi) — VendorOrders.jsx ke STATUS_COLOR se match karte hain
const STATUS_DOT = {
  Placed: "#f59e0b",
  Confirmed: "#3b82f6",
  Shipped: "#06b6d4",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

export default function VendorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({ revenue: 0, orders: 0, growthPct: 0, customers: 0 });
  const [revenueChart, setRevenueChart] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerStats, setCustomerStats] = useState({ newCustomers: 0, returningPct: 0, avgOrderValue: 0 });
  const [orderStatus, setOrderStatus] = useState([]);
  const [goal, setGoal] = useState({ goalAmount: 0, currentRevenue: 0, percent: 0 });
  const [insight, setInsight] = useState({ bestProduct: null, bestProductRevenue: 0, growthPct: null });

  const stats = [
    {
      key: "revenue",
      title: "Revenue",
      value: formatINR(summary.revenue),
      icon: <CurrencyRupee />,
      accent: "primary",
    },
    {
      key: "orders",
      title: "Orders",
      value: summary.orders.toLocaleString("en-IN"),
      icon: <ShoppingBag />,
      accent: "info",
    },
    {
      key: "growth",
      title: "Growth",
      value:
        summary.growthPct === null || summary.growthPct === undefined
          ? "No orders yet"
          : `${summary.growthPct >= 0 ? "+" : ""}${summary.growthPct}%`,
      icon: <TrendingUp />,
      accent: "success",
    },
    {
      key: "customers",
      title: "Customers",
      value: summary.customers.toLocaleString("en-IN"),
      icon: <People />,
      accent: "warning",
    },
  ];

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Har endpoint apna independent try/catch — ek fail ho to baaki na tootein
    const results = await Promise.allSettled([
      apiGet("/vendor/analytics/summary"),
      apiGet("/vendor/earnings/chart?range=6m"),
      apiGet("/vendor/analytics/product-sales"),
      apiGet("/vendor/analytics/top-products"),
      apiGet("/vendor/analytics/customer-stats"),
      apiGet("/vendor/analytics/order-status"),
      apiGet("/vendor/analytics/goal"),
      apiGet("/vendor/analytics/insight"),
    ]);

    const [
      summaryRes,
      chartRes,
      productSalesRes,
      topProductsRes,
      customerStatsRes,
      orderStatusRes,
      goalRes,
      insightRes,
    ] = results;

    if (summaryRes.status === "fulfilled") {
      setSummary({
        revenue: summaryRes.value.revenue ?? 0,
        orders: summaryRes.value.orders ?? 0,
        growthPct: summaryRes.value.growthPct,
        customers: summaryRes.value.customers ?? 0,
      });
    } else {
      setError("Backend se connect nahi ho paya. Server chal raha hai check kar lo.");
    }

    if (chartRes.status === "fulfilled" && Array.isArray(chartRes.value)) {
      setRevenueChart(chartRes.value);
    }
    if (productSalesRes.status === "fulfilled" && Array.isArray(productSalesRes.value)) {
      setProductSales(productSalesRes.value);
    }
    if (topProductsRes.status === "fulfilled" && Array.isArray(topProductsRes.value)) {
      setTopProducts(topProductsRes.value);
    }
    if (customerStatsRes.status === "fulfilled") {
      setCustomerStats({
        newCustomers: customerStatsRes.value.newCustomers ?? 0,
        returningPct: customerStatsRes.value.returningPct ?? 0,
        avgOrderValue: customerStatsRes.value.avgOrderValue ?? 0,
      });
    }
    if (orderStatusRes.status === "fulfilled" && Array.isArray(orderStatusRes.value)) {
      setOrderStatus(orderStatusRes.value);
    }
    if (goalRes.status === "fulfilled") {
      setGoal({
        goalAmount: goalRes.value.goalAmount ?? 0,
        currentRevenue: goalRes.value.currentRevenue ?? 0,
        percent: goalRes.value.percent ?? 0,
      });
    }
    if (insightRes.status === "fulfilled") {
      setInsight({
        bestProduct: insightRes.value.bestProduct ?? null,
        bestProductRevenue: insightRes.value.bestProductRevenue ?? 0,
        growthPct: insightRes.value.growthPct,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = () => {
    // Vendor Earnings page pe already CSV export ban chuka hai — usi ko reuse karte hain
    window.open(`${API_BASE_URL}/vendor/earnings/export`, "_blank");
  };

  const insightSentence = insight.bestProduct
    ? `${insight.bestProduct} tera sabse zyada revenue laane wala product hai (${formatINR(
        insight.bestProductRevenue
      )} tak). ${
        insight.growthPct === null || insight.growthPct === undefined
          ? "Is mahine abhi koi naya order nahi aaya."
          : insight.growthPct >= 0
          ? `Revenue is mahine ${insight.growthPct}% badha hai — isi momentum ko banaye rakho.`
          : `Revenue is mahine ${Math.abs(insight.growthPct)}% gira hai — stock aur pricing dobara check kar lo.`
      }`
    : "Abhi tak koi order nahi mila — jaise hi orders aayenge, yahan real insights dikhne lagenge.";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        background: tokens.bg,
      }}
    >
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 5,
          background: tokens.card,
          backdropFilter: "blur(20px)",
          border: tokens.border,
          boxShadow: tokens.shadow,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -90,
            right: -90,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "#E9C878",
            filter: "blur(110px)",
            opacity: 0.5,
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ color: tokens.ink, letterSpacing: "-0.02em" }}>
              Analytics Dashboard
            </Typography>
            <Typography sx={{ color: tokens.sub, mt: 1 }}>
              Sales, growth aur business performance ek jagah track karo.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <MuiTooltip title="Refresh data">
              <IconButton
                onClick={loadAnalytics}
                disabled={loading}
                sx={{ border: tokens.border, borderRadius: 3, flexShrink: 0 }}
              >
                <Refresh />
              </IconButton>
            </MuiTooltip>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: tokens.accents.primary,
                boxShadow: "0 8px 20px rgba(138,100,20,0.25)",
                "&:hover": { background: tokens.accents.primary, opacity: 0.92 },
              }}
            >
              Export Report
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={168} sx={{ borderRadius: 5 }} />
              </Grid>
            ))
          : stats.map((item, idx) => (
              <Grid key={item.key} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 5,
                    color: "#fff",
                    background: tokens.accents[item.accent],
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 10px 26px rgba(36,22,8,0.14)",
                    transition: "transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease",
                    animation: `fadeUp .5s ease ${idx * 0.06}s both`,
                    "@keyframes fadeUp": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 22px 44px rgba(36,22,8,0.22)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -30,
                      right: -30,
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                  <Stack spacing={2} sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "rgba(255,255,255,.2)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Typography sx={{ opacity: 0.92, fontWeight: 500 }}>{item.title}</Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: "-0.01em" }}>
                      {item.value}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
      </Grid>

      {/* Revenue chart + Business Insight */}
      <Grid container spacing={3} sx={{ mt: 0.5, mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              height: 420,
              borderRadius: 5,
              background: tokens.card,
              backdropFilter: "blur(18px)",
              boxShadow: tokens.shadow,
              border: tokens.border,
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={3} sx={{ color: tokens.ink }}>
              Revenue Growth
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height="85%" sx={{ borderRadius: 3 }} />
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tokens.gold} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={tokens.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,22,8,0.08)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke={tokens.goldDeep}
                    fillOpacity={1}
                    fill="url(#analyticsRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              height: 420,
              borderRadius: 5,
              background: tokens.card,
              backdropFilter: "blur(18px)",
              boxShadow: tokens.shadow,
              border: tokens.border,
              overflowY: "auto",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <Insights sx={{ color: tokens.goldDeep }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.ink }}>
                Business Insight
              </Typography>
            </Stack>

            {loading ? (
              <Stack spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 3 }} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Typography sx={{ color: tokens.sub, lineHeight: 1.8 }}>{insightSentence}</Typography>

                {insight.bestProduct && (
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 4, background: tokens.lightGold }}>
                    <Typography fontWeight={700} sx={{ color: "#334155" }}>
                      Best Product
                    </Typography>
                    <Typography sx={{ color: tokens.goldDeep, fontWeight: 800 }}>
                      {insight.bestProduct}
                    </Typography>
                  </Paper>
                )}

                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, background: tokens.lightGold }}>
                  <Typography fontWeight={700} sx={{ color: "#334155" }}>
                    Monthly Growth
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{
                      color:
                        insight.growthPct === null || insight.growthPct === undefined
                          ? tokens.sub
                          : insight.growthPct >= 0
                          ? "#0F766E"
                          : "#B45309",
                    }}
                  >
                    {insight.growthPct === null || insight.growthPct === undefined
                      ? "No orders yet"
                      : `${insight.growthPct >= 0 ? "+" : ""}${insight.growthPct}%`}
                  </Typography>
                </Paper>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Product Sales + Top Products */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              height: 420,
              borderRadius: 5,
              background: tokens.card,
              backdropFilter: "blur(18px)",
              boxShadow: tokens.shadow,
              border: tokens.border,
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={3} sx={{ color: tokens.ink }}>
              Product Sales (units)
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height="85%" sx={{ borderRadius: 3 }} />
            ) : productSales.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <ShoppingBag sx={{ fontSize: 40, color: "rgba(201,150,46,0.35)", mb: 1 }} />
                <Typography sx={{ color: tokens.sub }}>Abhi koi sales data nahi hai</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={productSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,22,8,0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill={tokens.gold} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              height: 420,
              borderRadius: 5,
              background: tokens.card,
              backdropFilter: "blur(18px)",
              boxShadow: tokens.shadow,
              border: tokens.border,
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={3} sx={{ color: tokens.ink }}>
              Top Performing Products
            </Typography>

            {loading ? (
              <Stack spacing={3}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 3 }} />
                ))}
              </Stack>
            ) : topProducts.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ color: tokens.sub }}>Abhi koi product revenue nahi hai</Typography>
              </Box>
            ) : (
              <Stack spacing={4}>
                {topProducts.map((product) => (
                  <Box key={product.name}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={600} sx={{ color: tokens.ink }}>
                        {product.name}
                      </Typography>
                      <Typography fontWeight={800} sx={{ color: tokens.ink }}>
                        {formatINR(product.revenue)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={product.progress}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 10,
                        bgcolor: "rgba(201,150,46,0.12)",
                        "& .MuiLinearProgress-bar": { bgcolor: tokens.gold, borderRadius: 10 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: tokens.sub }}>
                      {product.progress}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Goal Tracker / Customer Analytics / Order Status */}
      <Grid container spacing={3}>
        {/* Goal Tracker — real, vendor MyShop mein set karta hai */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              background: "linear-gradient(135deg,#FBF3E1,#FDF8EE)",
              border: tokens.border,
            }}
          >
            <Stack spacing={2}>
              <EmojiEvents sx={{ fontSize: 50, color: tokens.gold }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: tokens.ink }}>
                Monthly Goal
              </Typography>

              {loading ? (
                <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3 }} />
              ) : goal.goalAmount > 0 ? (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={goal.percent}
                    sx={{
                      height: 12,
                      borderRadius: 10,
                      bgcolor: "rgba(201,150,46,0.15)",
                      "& .MuiLinearProgress-bar": { bgcolor: tokens.goldDeep, borderRadius: 10 },
                    }}
                  />
                  <Typography sx={{ color: tokens.ink, fontWeight: 700 }}>
                    {formatINR(goal.currentRevenue)} / {formatINR(goal.goalAmount)} ({goal.percent}%)
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: tokens.sub }}>
                  Koi goal set nahi hai. My Shop → Edit Shop Profile mein "Monthly Revenue Goal" set kar do.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Customer Analytics — real */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              background: "linear-gradient(135deg,#F6EEDC,#FBF8F1)",
              border: tokens.border,
            }}
          >
            <Groups sx={{ fontSize: 50, color: tokens.goldDeep }} />
            <Typography variant="h6" fontWeight={800} mt={2} sx={{ color: tokens.ink }}>
              Customer Analytics
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3, mt: 1 }} />
            ) : (
              <Stack spacing={0.5} mt={1}>
                <Typography sx={{ color: tokens.sub }}>
                  New Customers (this month): <b style={{ color: tokens.ink }}>{customerStats.newCustomers}</b>
                </Typography>
                <Typography sx={{ color: tokens.sub }}>
                  Returning: <b style={{ color: tokens.ink }}>{customerStats.returningPct}%</b>
                </Typography>
                <Typography sx={{ color: tokens.sub }}>
                  Avg Order Value: <b style={{ color: tokens.ink }}>{formatINR(customerStats.avgOrderValue)}</b>
                </Typography>
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Order Status Breakdown — real (replaces un-trackable "Traffic Sources") */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              background: "linear-gradient(135deg,#FDF8EE,#FBF3E1)",
              border: tokens.border,
            }}
          >
            <ListAlt sx={{ fontSize: 50, color: tokens.goldDeep }} />
            <Typography variant="h6" fontWeight={800} mt={2} mb={1} sx={{ color: tokens.ink }}>
              Order Status Breakdown
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            ) : orderStatus.length === 0 ? (
              <Typography sx={{ color: tokens.sub }}>Abhi koi order nahi hai</Typography>
            ) : (
              <Stack spacing={1}>
                {orderStatus.map((s) => (
                  <Stack key={s.status} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: STATUS_DOT[s.status] || "#94a3b8",
                        }}
                      />
                      <Typography fontSize={14} sx={{ color: tokens.ink }}>
                        {s.status}
                      </Typography>
                    </Stack>
                    <Typography fontSize={14} fontWeight={800} sx={{ color: tokens.ink }}>
                      {s.percent}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}