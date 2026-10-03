import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  Button,
  ButtonGroup,
  Avatar,
} from "@mui/material";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import StoreIcon from "@mui/icons-material/Store";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

/* =========================
   SOFT AURORA DESIGN TOKENS
========================= */
const tokens = {
  bg1: "#eafaf4",
  bg2: "#eef0fb",
  bg3: "#e8f2fb",
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
  warning: "#f5a623",
  warningSoft: "rgba(245,166,35,0.16)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
  shadowSoft: "0 4px 14px rgba(31,41,55,0.06)",
};

const fontLinkId = "admin-console-fonts";

const injectFonts = () => {
  if (document.getElementById(fontLinkId)) return;
  const link = document.createElement("link");
  link.id = fontLinkId;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
};

const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_STYLES = {
  Placed: { color: tokens.primaryDim, bg: tokens.primarySoft },
  Confirmed: { color: tokens.purple, bg: tokens.purpleSoft },
  Shipped: { color: tokens.warning, bg: tokens.warningSoft },
  Delivered: { color: tokens.success, bg: tokens.successSoft },
  Cancelled: { color: tokens.danger, bg: tokens.dangerSoft },
};

const AVATAR_PALETTE = [
  { bg: tokens.primarySoft, color: tokens.primaryDim },
  { bg: tokens.purpleSoft, color: tokens.purple },
  { bg: tokens.pinkSoft, color: tokens.pink },
  { bg: tokens.amberSoft, color: tokens.amber },
];

const avatarStyleFor = (name = "") => {
  const idx = name.charCodeAt(0) ? name.charCodeAt(0) % AVATAR_PALETTE.length : 0;
  return AVATAR_PALETTE[idx];
};

/* =========================
   Small building blocks
========================= */

function GrowthBadge({ value }) {
  if (value === null || value === undefined) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1,
          py: 0.4,
          borderRadius: "8px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: tokens.textMuted,
          bgcolor: "rgba(31,36,48,0.05)",
        }}
      >
        New
      </Box>
    );
  }

  const isUp = value >= 0;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.4,
        borderRadius: "8px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: isUp ? tokens.success : tokens.danger,
        bgcolor: isUp ? tokens.successSoft : tokens.dangerSoft,
      }}
    >
      {isUp ? (
        <TrendingUpIcon sx={{ fontSize: 14 }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 14 }} />
      )}
      {Math.abs(value)}%
    </Box>
  );
}

function StatCard({ label, value, growth, sparkData, dataKey, icon, color, soft }) {
  return (
    <Box
      sx={{
        bgcolor: tokens.glassStrong,
        backdropFilter: "blur(20px)",
        border: `1px solid ${tokens.glassBorder}`,
        borderRadius: "24px",
        boxShadow: tokens.shadow,
        p: 2.75,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: soft,
            color: color,
          }}
        >
          {icon}
        </Box>
        <GrowthBadge value={growth} />
      </Box>

      <Typography
        sx={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.75rem",
          color: tokens.textMuted,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: "1.85rem",
          color: tokens.textPrimary,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      {sparkData && sparkData.length > 1 && (
        <Box sx={{ position: "absolute", right: 0, bottom: 0, width: "45%", height: 40, opacity: 0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#spark-${dataKey})`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
}

/* Horizontal Order Card — used in the new scrollable Recent Orders row */
function OrderCard({ order }) {
  const style = STATUS_STYLES[order.status] || {
    color: tokens.textMuted,
    bg: "rgba(31,36,48,0.05)",
  };
  const avatarStyle = avatarStyleFor(order.customerName);

  return (
    <Box
      sx={{
        minWidth: 220,
        maxWidth: 220,
        flex: "0 0 auto",
        scrollSnapAlign: "start",
        bgcolor: tokens.glass,
        border: `1px solid ${tokens.hairline}`,
        borderRadius: "18px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: tokens.shadowSoft,
          borderColor: tokens.glassBorder,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: avatarStyle.bg,
            color: avatarStyle.color,
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          {order.customerName?.[0]?.toUpperCase() || "?"}
        </Avatar>
        <Chip
          label={order.status}
          size="small"
          sx={{
            color: style.color,
            bgcolor: style.bg,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            fontWeight: 700,
            height: 22,
          }}
        />
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: tokens.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {order.customerName}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: tokens.textMuted,
          }}
        >
          #{String(order.id).slice(-6)}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: "1.15rem",
          color: tokens.textPrimary,
        }}
      >
        {inr(order.amount)}
      </Typography>
    </Box>
  );
}

/* =========================
   Main Component
========================= */

export default function AdminDashboard() {
  const [period, setPeriod] = useState("3M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    injectFonts();
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(
        `http://localhost:5000/api/admin/dashboard?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!json.success) {
        setError(json.message || "Failed to load dashboard");
        return;
      }

      setData(json);
    } catch (err) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: tokens.primary }} />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.danger,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {error}
      </Box>
    );
  }

  const stats = data?.stats || {};
  const salesOverview = data?.salesOverview || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <Box
      sx={{
        color: tokens.textPrimary,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ===== Status strip ===== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          bgcolor: tokens.glass,
          backdropFilter: "blur(20px)",
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: "20px",
          boxShadow: tokens.shadowSoft,
          px: 3,
          py: 1.75,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: tokens.success,
              boxShadow: `0 0 0 4px ${tokens.successSoft}`,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: tokens.textMuted,
            }}
          >
            SYSTEM STATUS: OPERATIONAL
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          <ReadoutItem label="TODAY'S SALES" value={inr(stats.todaysSales)} />
          <ReadoutItem label="ORDERS IN TRANSIT" value={stats.pendingOrders} />
          <ReadoutItem
            label="VENDOR APPROVALS"
            value={stats.pendingVendorApprovals}
            highlight={stats.pendingVendorApprovals > 0}
          />
        </Box>
      </Box>

      {/* ===== Header ===== */}
      <Typography
        sx={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: { xs: "1.6rem", md: "2rem" },
          mb: 0.5,
          letterSpacing: "-0.01em",
        }}
      >
        Welcome back, Admin 👋
      </Typography>
      <Typography sx={{ color: tokens.textMuted, mb: 3, fontSize: "0.95rem" }}>
        Marketplace-wide performance, at a glance.
      </Typography>

      {/* ===== Stat cards ===== */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Revenue"
            value={inr(stats.totalRevenue)}
            growth={stats.revenueGrowth}
            sparkData={salesOverview}
            dataKey="revenue"
            icon={<PaymentsRoundedIcon />}
            color={tokens.primaryDim}
            soft={tokens.primarySoft}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            growth={stats.ordersGrowth}
            sparkData={salesOverview}
            dataKey="orders"
            icon={<ShoppingBagRoundedIcon />}
            color={tokens.purple}
            soft={tokens.purpleSoft}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Products Listed"
            value={stats.totalProducts}
            growth={stats.productsGrowth}
            icon={<Inventory2RoundedIcon />}
            color={tokens.warning}
            soft={tokens.warningSoft}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Active Users"
            value={stats.activeUsers}
            growth={stats.usersGrowth}
            icon={<GroupRoundedIcon />}
            color={tokens.pink}
            soft={tokens.pinkSoft}
          />
        </Grid>
      </Grid>

      {/* ===== Chart + Vendor Approval row ===== */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Sales chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              bgcolor: tokens.glassStrong,
              backdropFilter: "blur(20px)",
              border: `1px solid ${tokens.glassBorder}`,
              borderRadius: "24px",
              boxShadow: tokens.shadow,
              p: 3,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                Revenue &amp; Orders
              </Typography>

              <ButtonGroup size="small">
                {["1W", "1M", "3M", "1Y"].map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPeriod(p)}
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.7rem",
                      borderRadius: "10px !important",
                      color: period === p ? "#fff" : tokens.textMuted,
                      background: period === p
                        ? `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`
                        : "transparent",
                      borderColor: tokens.hairline,
                      fontWeight: period === p ? 700 : 500,
                      "&:hover": {
                        background: period === p
                          ? `linear-gradient(135deg, ${tokens.primaryDim}, ${tokens.purple})`
                          : "rgba(31,36,48,0.04)",
                        borderColor: tokens.hairline,
                      },
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={salesOverview}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tokens.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={tokens.hairline} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: tokens.textMuted, fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: tokens.hairline }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: tokens.textMuted, fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: tokens.glassStrong,
                    border: `1px solid ${tokens.glassBorder}`,
                    borderRadius: 12,
                    fontFamily: "Inter",
                    fontSize: 12,
                    boxShadow: tokens.shadowSoft,
                    color: tokens.textPrimary,
                  }}
                  labelStyle={{ color: tokens.textPrimary }}
                  itemStyle={{ color: tokens.textSecondary }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={tokens.primary}
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={tokens.purple}
                  strokeWidth={2}
                  dot={false}
                  name="Orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

      {/* Vendor Approval Queue */}
<Grid size={{ xs: 12, md: 4 }}>
  <Box
    sx={{
      bgcolor: tokens.glassStrong,
      backdropFilter: "blur(20px)",
      border: `1px solid ${tokens.glassBorder}`,
      borderRadius: "24px",
      boxShadow: tokens.shadow,
      p: 3,
      height: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: tokens.amberSoft,
          color: tokens.warning,
          flexShrink: 0,
        }}
      >
        <PendingActionsIcon sx={{ fontSize: 20 }} />
      </Box>

      <Box>
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
          Vendor Approval Queue
        </Typography>
        <Typography sx={{ color: tokens.textMuted, fontSize: "0.78rem" }}>
          {stats.pendingVendorApprovals > 0
            ? "Vendors waiting on your review."
            : "All caught up — nothing pending."}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "2rem",
          fontWeight: 700,
          color: stats.pendingVendorApprovals > 0 ? tokens.warning : tokens.textPrimary,
          lineHeight: 1,
        }}
      >
        {stats.pendingVendorApprovals}
      </Typography>

      <Button
        startIcon={<StoreIcon />}
        sx={{
          textTransform: "none",
          borderRadius: "14px",
          px: 2.5,
          py: 1,
          whiteSpace: "nowrap",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          color: "#fff",
          background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
          "&:hover": {
            background: `linear-gradient(135deg, ${tokens.primaryDim}, ${tokens.purple})`,
          },
        }}
      >
        Review Vendors
      </Button>
    </Box>
  </Box>
</Grid> 
</Grid>

      {/* ===== Recent Orders — horizontal scroll row ===== */}
      <Box
        sx={{
          bgcolor: tokens.glassStrong,
          backdropFilter: "blur(20px)",
          border: `1px solid ${tokens.glassBorder}`,
          borderRadius: "24px",
          boxShadow: tokens.shadow,
          p: 3,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: tokens.primarySoft,
              color: tokens.primaryDim,
            }}
          >
            <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>
            Recent Orders
          </Typography>
        </Box>

        {recentOrders.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.85rem" }}>
            No orders yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 1.75,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              pb: 1,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(31,36,48,0.12)",
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            }}
          >
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Box>
        )}
      </Box>

      {/* ===== Category breakdown ===== */}
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
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, mb: 2 }}>
          Category Performance
        </Typography>

        {categoryBreakdown.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.85rem" }}>
            Not enough order data yet to break down by category.
          </Typography>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(220, categoryBreakdown.length * 56)}
          >
            <BarChart
              data={categoryBreakdown}
              layout="vertical"
              margin={{ top: 8, right: 40, bottom: 8, left: 20 }}
            >
              <CartesianGrid stroke={tokens.hairline} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: tokens.textMuted, fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: tokens.hairline }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: tokens.textSecondary, fontSize: 12, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: tokens.glassStrong,
                  border: `1px solid ${tokens.glassBorder}`,
                  borderRadius: 12,
                  fontFamily: "Inter",
                  fontSize: 12,
                  boxShadow: tokens.shadowSoft,
                  color: tokens.textPrimary,
                }}
                formatter={(value) => inr(value)}
              />
              <Bar dataKey="revenue" fill={tokens.primary} radius={[0, 8, 8, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}

function ReadoutItem({ label, value, highlight }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.08em",
          color: tokens.textMuted,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: highlight ? tokens.warning : tokens.textPrimary,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}