import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Skeleton, TextField, InputAdornment } from "@mui/material";

const tokens = {
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  primaryDim: "#0d9488",
  purple: "#8b7cf6",
  success: "#22c55e",
  danger: "#ef4444",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
  shadowSoft: "0 4px 14px rgba(31,41,55,0.06)",
};

const API_BASE = "http://localhost:5000/api";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Stat({ label, value, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 200,
        p: 2.5,
        borderRadius: "18px",
        bgcolor: tokens.glassStrong,
        border: `1px solid ${tokens.glassBorder}`,
        boxShadow: tokens.shadowSoft,
      }}
    >
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.4rem", color }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted, fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}

function Panel({ title, note, children }) {
  return (
    <Box sx={{ bgcolor: tokens.glassStrong, border: `1px solid ${tokens.glassBorder}`, borderRadius: "24px", boxShadow: tokens.shadow, p: 3, mb: 2 }}>
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>{title}</Typography>
      {note && <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted, mb: 2 }}>{note}</Typography>}
      {!note && <Box sx={{ mb: 2 }} />}
      {children}
    </Box>
  );
}

export default function AdminCommission() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [defaultRate, setDefaultRate] = useState("10");
  const [overrides, setOverrides] = useState({}); // { categoryName: "12" } ; missing/"" = use default
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("shopsphereToken")}`,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, cRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/commission`, { headers: headers() }).then((r) => r.json()),
        fetch(`${API_BASE}/categories/admin/all`, { headers: headers() }).then((r) => r.json()),
        fetch(`${API_BASE}/commission/summary`, { headers: headers() }).then((r) => r.json()),
      ]);
      if (!sRes.success) throw new Error(sRes.message || "Could not load settings");

      setDefaultRate(String(sRes.settings.defaultRate));
      const map = {};
      sRes.settings.categoryRates.forEach((r) => (map[r.category] = String(r.rate)));
      setOverrides(map);
      setCategories(cRes.success ? cRes.categories : []);
      setSummary(sumRes.success ? sumRes.summary : null);
    } catch (err) {
      setError(`Could not load commission data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const def = Number(defaultRate);
    if (defaultRate === "" || Number.isNaN(def) || def < 0 || def > 100) {
      setError("Default rate must be a number between 0 and 100");
      return;
    }
    const categoryRates = [];
    for (const [category, val] of Object.entries(overrides)) {
      if (val === "" || val === undefined) continue;
      const rate = Number(val);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        setError(`Rate for ${category} must be between 0 and 100`);
        return;
      }
      categoryRates.push({ category, rate });
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`${API_BASE}/commission`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ defaultRate: def, categoryRates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setSaved(true);
      load(); // refresh the estimated totals with the new rates
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setOverride = (name, value) => {
    setSaved(false);
    setOverrides((o) => ({ ...o, [name]: value }));
  };

  const adornment = { endAdornment: <InputAdornment position="end">%</InputAdornment> };

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>Commission</Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            The share ShopSphere keeps from each sale. A category rate overrides the default.
          </Typography>
        </Box>
        <Button
          onClick={save}
          disabled={saving || loading}
          sx={{
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "14px",
            px: 3,
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
            "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
          }}
        >
          {saving ? "Saving..." : "Save rates"}
        </Button>
      </Box>

      {error && <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{error}</Typography>}
      {saved && <Typography sx={{ color: tokens.success, mb: 2, fontWeight: 600 }}>Rates saved.</Typography>}

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={84} sx={{ flex: 1, minWidth: 200, borderRadius: "18px" }} />
          ))
        ) : (
          <>
            <Stat label="Delivered sales" value={formatINR(summary?.totalSales)} color={tokens.textPrimary} />
            <Stat label="Platform commission (estimated)" value={formatINR(summary?.totalCommission)} color={tokens.primaryDim} />
            <Stat label="Vendor payout (estimated)" value={formatINR(summary?.vendorPayout)} color={tokens.purple} />
          </>
        )}
      </Box>

      <Panel title="Default rate" note="Applied to every category that has no rate of its own.">
        {loading ? (
          <Skeleton variant="rounded" height={56} width={200} />
        ) : (
          <TextField
            type="number"
            label="Default commission"
            value={defaultRate}
            onChange={(e) => {
              setSaved(false);
              setDefaultRate(e.target.value);
            }}
            InputProps={adornment}
            inputProps={{ min: 0, max: 100, step: 0.5 }}
            sx={{ width: 220 }}
          />
        )}
      </Panel>

      <Panel title="Category rates" note="Leave a field empty to use the default rate.">
        {loading ? (
          <Skeleton variant="rounded" height={160} />
        ) : categories.length === 0 ? (
          <Typography sx={{ color: tokens.textMuted }}>
            No categories yet. Add them on the Categories page to set separate rates.
          </Typography>
        ) : (
          categories.map((c) => {
            const sales = summary?.byCategory?.find((x) => x.category === c.name);
            return (
              <Box
                key={c._id}
                sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.25, borderBottom: `1px solid ${tokens.hairline}`, flexWrap: "wrap" }}
              >
                <Box sx={{ flex: 1, minWidth: 160 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{c.name}</Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: tokens.textMuted }}>
                    {sales ? `${formatINR(sales.sales)} sold, ${formatINR(sales.commission)} commission` : "No delivered sales yet"}
                  </Typography>
                </Box>
                <TextField
                  type="number"
                  size="small"
                  placeholder={defaultRate || "10"}
                  value={overrides[c.name] ?? ""}
                  onChange={(e) => setOverride(c.name, e.target.value)}
                  InputProps={adornment}
                  inputProps={{ min: 0, max: 100, step: 0.5, "aria-label": `${c.name} commission` }}
                  sx={{ width: 140 }}
                />
              </Box>
            );
          })
        )}
      </Panel>
    </Box>
  );
}