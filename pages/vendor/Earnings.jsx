import { useState, useEffect, useCallback, useMemo } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Avatar,
  Button,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";

import {
  AccountBalanceWallet,
  CurrencyRupee,
  TrendingUp,
  Payments,
  Download,
  Refresh,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================================================================
   BACKEND CONFIG
   ========================================================================= */

const API_BASE_URL = "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("shopsphereToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* response JSON nahi tha, default message use hoga */
    }
    throw new Error(message);
  }
  return res;
}

const apiGet = async (path) => (await request(path)).json();

const apiPost = async (path, body) =>
  (
    await request(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    })
  ).json();

/* ------------------------------ formatters ------------------------------ */

function formatINR(value, compact = true) {
  if (value === null || value === undefined) return "₹0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (compact && num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------ mappers ------------------------------ */

const EMPTY_SUMMARY = {
  totalRevenue: 0,
  availableBalance: 0,
  monthlyGrowthPct: null,
  withdrawals: 0,
  thisMonthEarnings: 0,
  commissionPct: 0,
  minWithdrawal: 0,
};

function growthLabel(pct) {
  if (pct === null || pct === undefined) return "N/A";
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function mapSummary(data) {
  return [
    {
      key: "revenue",
      title: "Total Earnings",
      value: formatINR(data.totalRevenue),
      icon: <CurrencyRupee />,
      accent: "primary",
    },
    {
      key: "balance",
      title: "Available Balance",
      value: formatINR(data.availableBalance),
      icon: <AccountBalanceWallet />,
      accent: "success",
    },
    {
      key: "growth",
      title: "Monthly Growth",
      value: growthLabel(data.monthlyGrowthPct),
      icon: <TrendingUp />,
      accent: "info",
    },
    {
      key: "withdrawals",
      title: "Withdrawals",
      value: formatINR(data.withdrawals),
      icon: <Payments />,
      accent: "warning",
    },
  ];
}

function mapTransactions(data) {
  return data.map((t) => ({
    id: t.id,
    date: formatDate(t.date),
    amount: `${t.type === "debit" ? "−" : "+"}${formatINR(t.amount, false)}`,
    status: t.status,
    type: t.type,
  }));
}

/* ------------------------------ design tokens ------------------------------ */

const tokens = {
  bg: "linear-gradient(160deg,#FDFBF6 0%,#FBF7EE 45%,#FAF4E9 100%)",
  ink: "#241608",
  sub: "#7A6A57",
  card: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(36,22,8,0.07)",
  gold: "#C9962E",
  goldDeep: "#8A6414",
  accents: {
    primary: "linear-gradient(135deg,#8A6414,#C9962E)",
    success: "linear-gradient(135deg,#0F766E,#22C55E)",
    info: "linear-gradient(135deg,#3B2A18,#6B4A22)",
    warning: "linear-gradient(135deg,#B45309,#D97706)",
  },
  shadow: "0 4px 24px rgba(36,22,8,0.06)",
};

const STATUS_STYLES = {
  Completed: { bg: "#E4F6EC", color: "#0B6E4F" },
  Pending: { bg: "#FCEFDA", color: "#B45309" },
  Rejected: { bg: "#FDE8E8", color: "#B42318" },
};

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { severity, text }
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const stats = useMemo(() => mapSummary(summary), [summary]);

  const topMonth = useMemo(() => {
    const best = chartData.reduce(
      (acc, cur) => (cur.earnings > (acc?.earnings ?? 0) ? cur : acc),
      null
    );
    return best?.month || null;
  }, [chartData]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, chartRes, txnRes] = await Promise.all([
        apiGet("/vendor/earnings/summary"),
        apiGet("/vendor/earnings/chart?range=6"),
        apiGet("/vendor/earnings/transactions?limit=6"),
      ]);
      setSummary({ ...EMPTY_SUMMARY, ...summaryRes });
      setChartData(chartRes);
      setTransactions(mapTransactions(txnRes));
    } catch (err) {
      console.error(err);
      setNotice({
        severity: "error",
        text: err.message || "Earnings data load nahi ho paya.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const canWithdraw =
    summary.availableBalance > 0 &&
    summary.availableBalance >= summary.minWithdrawal;

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const data = await apiPost("/vendor/earnings/withdraw", {});
      setNotice({
        severity: "success",
        text: data.message || "Withdrawal request submit ho gayi.",
      });
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setNotice({
        severity: "error",
        text: err.message || "Withdrawal request fail ho gayi.",
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await request("/vendor/earnings/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "earnings-report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setNotice({
        severity: "error",
        text: err.message || "Report export nahi ho paya.",
      });
    } finally {
      setExportLoading(false);
    }
  };

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
          spacing={3}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{ color: tokens.ink, letterSpacing: "-0.02em" }}
            >
              Earnings Dashboard
            </Typography>
            <Typography sx={{ color: tokens.sub, mt: 1 }}>
              Delivered orders ki earnings, withdrawals aur growth trends ek jagah track karo.
              {summary.minWithdrawal > 0 &&
                ` Minimum withdrawal ${formatINR(summary.minWithdrawal, false)}.`}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <MuiTooltip title="Refresh data">
              <span>
                <IconButton
                  onClick={loadDashboard}
                  disabled={loading}
                  sx={{ border: tokens.border, borderRadius: 3, flexShrink: 0 }}
                >
                  <Refresh />
                </IconButton>
              </span>
            </MuiTooltip>

            <Button
              variant="contained"
              onClick={handleWithdraw}
              disabled={withdrawLoading || loading || !canWithdraw}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: tokens.accents.primary,
                boxShadow: "0 8px 20px rgba(138,100,20,0.25)",
                "&:hover": { background: tokens.accents.primary, opacity: 0.92 },
              }}
            >
              {withdrawLoading ? "Processing..." : "Withdraw Funds"}
            </Button>

            <Button
              startIcon={<Download />}
              variant="outlined"
              onClick={handleExport}
              disabled={exportLoading || loading}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                borderColor: tokens.gold,
                color: "#7A5A16",
                "&:hover": { borderColor: tokens.gold, background: "#FBF3E1" },
              }}
            >
              {exportLoading ? "Exporting..." : "Export Report"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {notice && (
        <Alert
          severity={notice.severity}
          sx={{ mb: 3, borderRadius: 3 }}
          onClose={() => setNotice(null)}
        >
          {notice.text}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    transition:
                      "transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease",
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
                    <Typography sx={{ opacity: 0.92, fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{ letterSpacing: "-0.01em" }}
                    >
                      {item.value}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
      </Grid>

      {/* Chart + Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
              Earnings Growth (Last 6 Months)
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height="85%" sx={{ borderRadius: 3 }} />
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9962E" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C9962E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,22,8,0.08)" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => formatINR(v)} />
                  <Tooltip formatter={(v) => [formatINR(v, false), "Earnings"]} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#8A6414"
                    fillOpacity={1}
                    fill="url(#earnings)"
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
            <Typography variant="h6" fontWeight={800} mb={3} sx={{ color: tokens.ink }}>
              Earnings Insights
            </Typography>

            {loading ? (
              <Stack spacing={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 3 }} />
                ))}
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <InsightCard
                  label="This Month"
                  value={formatINR(summary.thisMonthEarnings)}
                  bg="linear-gradient(135deg,#FBF3E1,#FFFBF2)"
                  color="#8A6414"
                />
                <InsightCard
                  label="Platform Commission"
                  value={`${summary.commissionPct}%`}
                  bg="linear-gradient(135deg,#E1F4EF,#F0FBF9)"
                  color="#0F766E"
                />
                <InsightCard
                  label="Monthly Growth"
                  value={growthLabel(summary.monthlyGrowthPct)}
                  bg="linear-gradient(135deg,#FCEFDA,#FFF8ED)"
                  color="#B45309"
                />
                {topMonth && (
                  <Chip
                    label={`Top Performing Month : ${topMonth} 🚀`}
                    sx={{
                      bgcolor: "#FBF3E1",
                      color: tokens.goldDeep,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Transactions */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 5,
          background: tokens.card,
          backdropFilter: "blur(18px)",
          boxShadow: tokens.shadow,
          border: tokens.border,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight={800} sx={{ color: tokens.ink }}>
            Recent Transactions
          </Typography>
          {transactions.length > 0 && (
            <Chip
              label={`${transactions.length} record${transactions.length > 1 ? "s" : ""}`}
              size="small"
              sx={{
                bgcolor: "#FBF3E1",
                color: tokens.goldDeep,
                fontWeight: 700,
              }}
            />
          )}
        </Stack>

        <Stack spacing={1.5}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 4 }} />
            ))
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Payments sx={{ fontSize: 40, color: "rgba(36,22,8,0.2)", mb: 1 }} />
              <Typography sx={{ color: tokens.sub }}>
                Abhi koi transaction nahi mila. Delivered orders yahan dikhenge.
              </Typography>
            </Box>
          ) : (
            transactions.map((txn) => {
              const style = STATUS_STYLES[txn.status] || STATUS_STYLES.Pending;
              return (
                <Paper
                  key={txn.id}
                  elevation={0}
                  sx={{
                    p: { xs: 1.75, md: 2.25 },
                    borderRadius: 4,
                    border: tokens.border,
                    transition: "transform .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(36,22,8,0.08)",
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1.25, sm: 2 }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ minWidth: { sm: 220 }, flexShrink: 0 }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: style.bg,
                          color: style.color,
                        }}
                      >
                        <Payments sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} fontSize={14}>
                          {txn.id}
                        </Typography>
                        <Typography sx={{ color: tokens.sub, fontSize: 12 }}>
                          {txn.date} • {txn.type === "debit" ? "Withdrawal" : "Order earning"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ flex: 1, minWidth: { sm: 100 } }}>
                      <Typography
                        fontWeight={800}
                        fontSize={17}
                        sx={{ color: txn.type === "debit" ? "#B45309" : tokens.ink }}
                      >
                        {txn.amount}
                      </Typography>
                    </Box>

                    <Chip
                      label={txn.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        alignSelf: { xs: "flex-start", sm: "center" },
                        bgcolor: style.bg,
                        color: style.color,
                      }}
                    />
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

function InsightCard({ label, value, bg, color }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 4, background: bg }}>
      <Typography fontWeight={700} sx={{ color: "#334155" }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={900} sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );
}