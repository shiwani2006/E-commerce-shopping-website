import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Rating,
} from "@mui/material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";

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

const API_BASE = "http://localhost:5000/api";

const PERIODS = [
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "1Y", label: "1Y" },
];

const STATUS_DOT = {
  Placed: tokens.amber,
  Confirmed: "#3b82f6",
  Shipped: "#06b6d4",
  Delivered: tokens.success,
  Cancelled: tokens.danger,
};

function formatINR(value) {
  if (value === null || value === undefined) return "₹0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function StatCard({ icon, label, value, growth, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 190,
        p: 2.5,
        borderRadius: "18px",
        bgcolor: tokens.glassStrong,
        backdropFilter: "blur(20px)",
        border: `1px solid ${tokens.glassBorder}`,
        boxShadow: tokens.shadowSoft,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Avatar sx={{ bgcolor: `${color}18`, color, width: 40, height: 40 }}>{icon}</Avatar>
        {growth !== null && growth !== undefined && (
          <Chip
            label={`${growth >= 0 ? "+" : ""}${growth}%`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 22,
              bgcolor: growth >= 0 ? tokens.successSoft : tokens.dangerSoft,
              color: growth >= 0 ? tokens.success : tokens.danger,
            }}
          />
        )}
      </Box>
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted, fontWeight: 600, mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

function Panel({ title, children, sx }) {
  return (
    <Box
      sx={{
        bgcolor: tokens.glassStrong,
        backdropFilter: "blur(20px)",
        border: `1px solid ${tokens.glassBorder}`,
        borderRadius: "24px",
        boxShadow: tokens.shadow,
        p: 3,
        ...sx,
      }}
    >
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.05rem", mb: 2.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("3M");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [salesOverview, setSalesOverview] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);
  const [reviewStats, setReviewStats] = useState(null); // 🆕

  const token = () => localStorage.getItem("shopsphereToken");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    const headers = { Authorization: `Bearer ${token()}` };

    const results = await Promise.allSettled([
      fetch(`${API_BASE}/admin/dashboard?period=${period}`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/admin/analytics/top-vendors?period=${period}`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/admin/analytics/top-products?period=${period}`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/admin/analytics/order-status`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/admin/analytics/customer-growth`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/reviews/admin/analytics`, { headers }).then((r) => r.json()), // 🆕
    ]);

    const [dashboardRes, vendorsRes, productsRes, statusRes, growthRes, reviewsRes] = results;

    if (dashboardRes.status === "fulfilled" && dashboardRes.value?.success) {
      setStats(dashboardRes.value.stats);
      setSalesOverview(dashboardRes.value.salesOverview || []);
      setCategoryBreakdown(dashboardRes.value.categoryBreakdown || []);
    } else {
      setError("Backend se connect nahi ho paya. Server chal raha hai check kar lo.");
    }

    if (vendorsRes.status === "fulfilled" && Array.isArray(vendorsRes.value)) {
      setTopVendors(vendorsRes.value);
    }
    if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
      setTopProducts(productsRes.value);
    }
    if (statusRes.status === "fulfilled" && Array.isArray(statusRes.value)) {
      setOrderStatus(statusRes.value);
    }
    if (growthRes.status === "fulfilled" && Array.isArray(growthRes.value)) {
      setCustomerGrowth(growthRes.value);
    }
    if (reviewsRes.status === "fulfilled" && reviewsRes.value?.success) {
      setReviewStats(reviewsRes.value.stats);
    }

    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const maxCategoryRevenue = Math.max(1, ...categoryBreakdown.map((c) => c.revenue));
  const maxProductRevenue = Math.max(1, ...topProducts.map((p) => p.revenue));

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Analytics
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            Platform-wide performance across all vendors and customers.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {PERIODS.map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              onClick={() => setPeriod(p.key)}
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: period === p.key ? "#fff" : tokens.textMuted,
                background:
                  period === p.key
                    ? `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`
                    : tokens.glass,
                border: `1px solid ${tokens.hairline}`,
              }}
            />
          ))}
        </Box>
      </Box>

      {error && (
        <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{error}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={104} sx={{ flex: 1, minWidth: 190, borderRadius: "18px" }} />
          ))
        ) : (
          <>
            <StatCard icon={<PaidRoundedIcon />} label="Total Revenue" value={formatINR(stats.totalRevenue)} growth={stats.revenueGrowth} color={tokens.primary} />
            <StatCard icon={<ShoppingCartRoundedIcon />} label="Total Orders" value={stats.totalOrders.toLocaleString("en-IN")} growth={stats.ordersGrowth} color={tokens.purple} />
            <StatCard icon={<PeopleAltRoundedIcon />} label="Active Users" value={stats.activeUsers.toLocaleString("en-IN")} growth={stats.usersGrowth} color={tokens.pink} />
            <StatCard icon={<Inventory2RoundedIcon />} label="Total Products" value={stats.totalProducts.toLocaleString("en-IN")} growth={stats.productsGrowth} color={tokens.amber} />
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Panel title="Revenue Trend" sx={{ flex: 2, minWidth: 320, height: 380 }}>
          {loading ? (
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
          ) : salesOverview.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <TrendingUpRoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
              <Typography sx={{ color: tokens.textMuted }}>No sales data for this period</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesOverview}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={tokens.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,36,48,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke={tokens.primaryDim} fillOpacity={1} fill="url(#adminRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Category Breakdown" sx={{ flex: 1, minWidth: 260, height: 380, overflowY: "auto" }}>
          {loading ? (
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
          ) : categoryBreakdown.length === 0 ? (
            <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 6 }}>No category data yet</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
              {categoryBreakdown.map((c) => (
                <Box key={c.category}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>{c.category}</Typography>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>{formatINR(c.revenue)}</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 10, bgcolor: "rgba(31,36,48,0.06)", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${(c.revenue / maxCategoryRevenue) * 100}%`, borderRadius: 10, background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.purple})` }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Panel>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Panel title="Top Vendors" sx={{ flex: 1, minWidth: 300 }}>
          {loading ? (
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          ) : topVendors.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <StorefrontRoundedIcon sx={{ fontSize: 36, color: tokens.textMuted, mb: 1 }} />
              <Typography sx={{ color: tokens.textMuted }}>No vendor sales in this period</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {topVendors.map((v, i) => (
                <Box key={v.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "14px", bgcolor: tokens.glass, border: `1px solid ${tokens.hairline}` }}>
                  <Avatar sx={{ bgcolor: tokens.primarySoft, color: tokens.primary, fontWeight: 800, fontSize: "0.85rem" }}>{i + 1}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }} noWrap>{v.name}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: tokens.textMuted }}>
                      {v.totalOrders} order{v.totalOrders > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: tokens.primaryDim }}>{formatINR(v.revenue)}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Panel>

        <Panel title="Top Products" sx={{ flex: 1, minWidth: 300 }}>
          {loading ? (
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          ) : topProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <LocalOfferRoundedIcon sx={{ fontSize: 36, color: tokens.textMuted, mb: 1 }} />
              <Typography sx={{ color: tokens.textMuted }}>No product sales in this period</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {topProducts.map((p) => (
                <Box key={p.name}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }} noWrap>{p.name}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: tokens.textMuted }}>
                        {p.category} · {p.unitsSold} sold
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap" }}>{formatINR(p.revenue)}</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 10, bgcolor: "rgba(31,36,48,0.06)", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${(p.revenue / maxProductRevenue) * 100}%`, borderRadius: 10, background: `linear-gradient(90deg, ${tokens.pink}, ${tokens.purple})` }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Panel>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Panel title="Order Status Breakdown" sx={{ flex: 1, minWidth: 280 }}>
          {loading ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
          ) : orderStatus.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <ChecklistRoundedIcon sx={{ fontSize: 36, color: tokens.textMuted, mb: 1 }} />
              <Typography sx={{ color: tokens.textMuted }}>No orders yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {orderStatus.map((s) => (
                <Box key={s.status} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: STATUS_DOT[s.status] || tokens.textMuted, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.85rem", flex: 1 }}>{s.status}</Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted }}>{s.count}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, minWidth: 40, textAlign: "right" }}>{s.percent}%</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Panel>

        <Panel title="New Customer Growth" sx={{ flex: 1, minWidth: 280, height: 280 }}>
          {loading ? (
            <Skeleton variant="rounded" height={190} sx={{ borderRadius: 3 }} />
          ) : customerGrowth.every((c) => c.newCustomers === 0) ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <GroupAddRoundedIcon sx={{ fontSize: 36, color: tokens.textMuted, mb: 1 }} />
              <Typography sx={{ color: tokens.textMuted }}>No new customer signups yet</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,36,48,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="newCustomers" fill={tokens.pink} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </Box>

      {/* 🆕 Review analytics */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Panel title="Customer Ratings" sx={{ flex: 1, minWidth: 300 }}>
          {loading || !reviewStats ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
          ) : reviewStats.totalReviews === 0 ? (
            <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 4 }}>
              No reviews yet
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.8rem" }}>
                  {reviewStats.avgRating}
                </Typography>
                <Rating value={reviewStats.avgRating} precision={0.1} readOnly />
                <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted }}>
                  {reviewStats.totalReviews} reviews, {reviewStats.hiddenReviews} hidden
                </Typography>
              </Box>
              {reviewStats.distribution.map((d) => (
                <Box key={d.star} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.78rem", width: 24 }}>{d.star}★</Typography>
                  <Box sx={{ flex: 1, height: 8, borderRadius: 10, bgcolor: "rgba(31,36,48,0.06)", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${(d.count / reviewStats.totalReviews) * 100}%`, bgcolor: tokens.amber, borderRadius: 10 }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted, width: 28, textAlign: "right" }}>{d.count}</Typography>
                </Box>
              ))}
            </>
          )}
        </Panel>

        <Panel title="Lowest Rated Products" sx={{ flex: 1, minWidth: 300 }}>
          {loading || !reviewStats ? (
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
          ) : reviewStats.lowestRatedProducts.length === 0 ? (
            <Typography sx={{ color: tokens.textMuted, textAlign: "center", py: 4 }}>
              Nothing to flag yet
            </Typography>
          ) : (
            reviewStats.lowestRatedProducts.map((p) => (
              <Box key={p._id} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1, borderBottom: `1px solid ${tokens.hairline}` }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }} noWrap>{p.name}</Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap", color: p.avgRating < 3 ? tokens.danger : tokens.textPrimary }}>
                  {p.avgRating} ({p.numReviews})
                </Typography>
              </Box>
            ))
          )}
        </Panel>
      </Box>
    </Box>
  );
}