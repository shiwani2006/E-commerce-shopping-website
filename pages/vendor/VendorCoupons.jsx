import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import {
  LocalOffer,
  Discount,
  TrendingUp,
  Redeem,
  Add,
  Search,
  Edit,
  Delete,
} from "@mui/icons-material";

const API_BASE = "http://localhost:5000/api/coupons";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  expiryDate: "",
};

/* ------------------------------------------------------------------ */
/*  Design tokens — "House of Ledger" gold voucher theme (LIGHT MODE)  */
/* ------------------------------------------------------------------ */
const T = {
  canvas: "#f6f2ea",
  canvasSoft: "#f0e9db",
  surface: "#ffffff",
  surfaceRaised: "#fffdf8",
  hairline: "rgba(150,111,53,0.22)",
  hairlineStrong: "rgba(150,111,53,0.4)",
  gold: "#b8863f",
  goldBright: "#c9a25a",
  goldDim: "#8c6d3f",
  ink: "#2b2118",
  inkDim: "#7a6c58",
  wine: "#8a3a44",
  wineBright: "#a94750",
  emerald: "#3f7057",
  emeraldBright: "#2f8a5f",
  amber: "#b8863b",
  amberBright: "#a1701f",
};

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

// Wax-seal styling per admin approval status
const SEAL_STYLES = {
  Pending: { ring: T.amber, glow: "#e0ac5b", label: "Pending" },
  Approved: { ring: T.emerald, glow: "#6bab86", label: "Approved" },
  Rejected: { ring: T.wine, glow: "#c1616d", label: "Rejected" },
};

function GoldCorner({ sx }) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: 16,
        height: 16,
        borderTop: `1.5px solid ${T.gold}`,
        borderLeft: `1.5px solid ${T.gold}`,
        opacity: 0.8,
        ...sx,
      }}
    />
  );
}

function WaxSeal({ status }) {
  const s = SEAL_STYLES[status] || SEAL_STYLES.Pending;
  return (
    <Box
      sx={{
        width: 66,
        height: 66,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        transform: "rotate(-7deg)",
        background: `radial-gradient(circle at 35% 30%, ${s.glow}, ${s.ring} 70%)`,
        border: `2px solid rgba(0,0,0,0.18)`,
        boxShadow: `0 4px 10px rgba(150,111,53,0.25), inset 0 0 0 3px rgba(255,255,255,0.25)`,
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.6)",
          lineHeight: 1.15,
        }}
      >
        {s.label}
      </Typography>
    </Box>
  );
}

function TicketDivider() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "1px",
        alignSelf: "stretch",
        borderLeft: `2px dashed ${T.hairlineStrong}`,
        mx: { xs: 0, md: 1 },
        display: { xs: "none", md: "block" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -13,
          left: -13,
          width: 26,
          height: 26,
          borderRadius: "50%",
          bgcolor: T.canvas,
          border: `2px solid ${T.hairlineStrong}`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -13,
          left: -13,
          width: 26,
          height: 26,
          borderRadius: "50%",
          bgcolor: T.canvas,
          border: `2px solid ${T.hairlineStrong}`,
        }}
      />
    </Box>
  );
}

export default function VendorCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load display faces once — falls back gracefully if offline
  useEffect(() => {
    const id = "vendor-coupons-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const getToken = () => localStorage.getItem("shopsphereToken");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.message || "Failed to load coupons");
        return;
      }

      setCoupons(data.coupons);
    } catch (error) {
      setErr("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (coupon) => new Date(coupon.expiryDate) < new Date();

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenCreate(true);
  };

  const openEditDialog = (coupon) => {
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || "",
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit,
      expiryDate: coupon.expiryDate?.slice(0, 10) || "",
    });
    setEditId(coupon._id);
    setOpenEdit(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.expiryDate) return;

    setSaving(true);
    setErr("");

    try {
      const url = editId ? `${API_BASE}/${editId}` : API_BASE;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.message || "Failed to save coupon");
        return;
      }

      if (editId) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === editId ? data.coupon : c))
        );
        setOpenEdit(false);
      } else {
        setCoupons((prev) => [data.coupon, ...prev]);
        setOpenCreate(false);
      }

      resetForm();
    } catch (error) {
      setErr("Backend not connected. Please check server is running.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.message || "Failed to delete coupon");
        return;
      }

      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      setErr("Backend not connected. Please check server is running.");
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(
    (c) => c.isActive && !isExpired(c) && c.status === "Approved"
  ).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const pendingCount = coupons.filter((c) => c.status === "Pending").length;

  const couponStats = [
    { title: "Total Coupons", value: totalCoupons, icon: <LocalOffer /> },
    { title: "Live Coupons", value: activeCoupons, icon: <Discount /> },
    { title: "Pending Approval", value: pendingCount, icon: <Redeem /> },
    { title: "Coupon Usage", value: totalUsage, icon: <TrendingUp /> },
  ];

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      color: T.ink,
      fontFamily: FONT_BODY,
      bgcolor: "rgba(150,111,53,0.03)",
      "& fieldset": { borderColor: T.hairline },
      "&:hover fieldset": { borderColor: T.hairlineStrong },
      "&.Mui-focused fieldset": { borderColor: T.gold, borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { color: T.inkDim, fontFamily: FONT_BODY },
    "& .MuiInputLabel-root.Mui-focused": { color: T.gold },
    "& .MuiSvgIcon-root": { color: T.inkDim },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
          minHeight: "100vh",
          bgcolor: T.canvas,
        }}
      >
        <CircularProgress sx={{ color: T.gold }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 4 },
        position: "relative",
        overflow: "hidden",
        bgcolor: T.canvas,
        backgroundImage: `
          radial-gradient(ellipse 900px 500px at 15% -10%, rgba(184,134,63,0.08), transparent 60%),
          radial-gradient(ellipse 700px 500px at 100% 10%, rgba(184,134,63,0.06), transparent 60%)
        `,
      }}
    >
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${T.surfaceRaised}, ${T.canvasSoft})`,
          border: `1px solid ${T.hairline}`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.5,
            backgroundImage: `repeating-linear-gradient(115deg, rgba(150,111,53,0.05) 0px, rgba(150,111,53,0.05) 1px, transparent 1px, transparent 26px)`,
            pointerEvents: "none",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ position: "relative" }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_MONO,
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: T.gold,
                mb: 1,
              }}
            >
              Vendor Ledger
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: { xs: "1.9rem", md: "2.4rem" },
                color: T.ink,
                lineHeight: 1.1,
              }}
            >
              Coupons &amp; Discounts
            </Typography>
            <Box sx={{ width: 64, height: 2, bgcolor: T.gold, my: 1.5 }} />
            <Typography sx={{ color: T.inkDim, fontFamily: FONT_BODY }}>
              Issue promotional vouchers — every coupon is reviewed by admin
              before it reaches customers.
            </Typography>
          </Box>

          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={openCreateDialog}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 1.5,
              fontWeight: 700,
              fontFamily: FONT_BODY,
              textTransform: "none",
              color: "#ffffff",
              background: `linear-gradient(135deg, ${T.goldBright}, ${T.gold})`,
              boxShadow: "0 8px 20px rgba(184,134,63,0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDim})`,
              },
            }}
          >
            Create Coupon
          </Button>
        </Stack>
      </Paper>

      {err && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 1.5,
            bgcolor: "rgba(138,58,68,0.08)",
            border: `1px solid ${T.wine}`,
            color: T.wineBright,
            fontWeight: 600,
            fontFamily: FONT_BODY,
          }}
        >
          {err}
        </Paper>
      )}

      {/* Stat plaques */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {couponStats.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 1.5,
                position: "relative",
                bgcolor: T.surface,
                border: `1px solid ${T.hairline}`,
                boxShadow: "0 2px 10px rgba(150,111,53,0.06)",
                transition: ".25s",
                "&:hover": {
                  borderColor: T.gold,
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 22px rgba(150,111,53,0.14)",
                },
              }}
            >
              <GoldCorner sx={{ top: 10, left: 10 }} />
              <GoldCorner
                sx={{
                  top: 10,
                  right: 10,
                  left: "auto",
                  transform: "scaleX(-1)",
                }}
              />
              <Avatar
                sx={{
                  bgcolor: "rgba(184,134,63,0.12)",
                  color: T.gold,
                  mb: 2,
                  width: 42,
                  height: 42,
                }}
              >
                {item.icon}
              </Avatar>
              <Typography
                sx={{
                  fontFamily: FONT_MONO,
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: T.inkDim,
                }}
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  fontSize: "2rem",
                  color: T.ink,
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Paper
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 1.5,
          bgcolor: T.surface,
          border: `1px solid ${T.hairline}`,
          boxShadow: "0 2px 10px rgba(150,111,53,0.06)",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search coupon code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: T.gold }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {filteredCoupons.length === 0 ? (
        <Paper
          sx={{
            p: 5,
            borderRadius: 1.5,
            textAlign: "center",
            bgcolor: T.surface,
            border: `1.5px dashed ${T.hairlineStrong}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              color: T.ink,
              fontSize: "1.2rem",
            }}
          >
            No coupons yet
          </Typography>
          <Typography sx={{ color: T.inkDim, fontFamily: FONT_BODY, mt: 0.5 }}>
            Click "Create Coupon" to issue your first voucher.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon);
            const statusLabel = expired
              ? "Expired"
              : coupon.isActive
              ? "Active"
              : "Inactive";
            const statusColor =
              expired || !coupon.isActive ? T.wineBright : T.emeraldBright;

            return (
              <Paper
                key={coupon._id}
                sx={{
                  borderRadius: 2,
                  overflow: "visible",
                  bgcolor: T.surface,
                  border: `1px solid ${T.hairline}`,
                  boxShadow: "0 2px 12px rgba(150,111,53,0.06)",
                  transition: ".3s",
                  "&:hover": {
                    borderColor: T.gold,
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 34px rgba(150,111,53,0.16)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "stretch" },
                  }}
                >
                  {/* Main stub */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 1.5, sm: 4 }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Box sx={{ minWidth: 130 }}>
                        <Typography
                          sx={{
                            fontFamily: FONT_MONO,
                            fontSize: "0.62rem",
                            letterSpacing: "0.15em",
                            color: T.inkDim,
                            textTransform: "uppercase",
                          }}
                        >
                          Code
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FONT_DISPLAY,
                            fontWeight: 800,
                            fontSize: "1.15rem",
                            color: T.ink,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {coupon.code}
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`
                        }
                        sx={{
                          fontFamily: FONT_MONO,
                          fontWeight: 700,
                          bgcolor: "rgba(184,134,63,0.12)",
                          color: T.goldDim,
                          border: `1px solid ${T.hairlineStrong}`,
                        }}
                      />

                      <Box>
                        <Typography
                          sx={{
                            fontFamily: FONT_MONO,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: statusColor,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ● {statusLabel}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FONT_BODY,
                            fontSize: "0.8rem",
                            color: T.inkDim,
                          }}
                        >
                          {coupon.usedCount || 0}/{coupon.usageLimit} redeemed
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontFamily: FONT_MONO,
                            fontSize: "0.62rem",
                            letterSpacing: "0.1em",
                            color: T.inkDim,
                            textTransform: "uppercase",
                          }}
                        >
                          Expires
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: FONT_BODY,
                            fontWeight: 600,
                            color: T.ink,
                          }}
                        >
                          {new Date(coupon.expiryDate).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </Typography>
                      </Box>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        ((coupon.usedCount || 0) / (coupon.usageLimit || 1)) *
                          100,
                        100
                      )}
                      sx={{
                        mt: 2.5,
                        height: 6,
                        borderRadius: 10,
                        bgcolor: "rgba(150,111,53,0.1)",
                        "& .MuiLinearProgress-bar": {
                          background: `linear-gradient(90deg, ${T.goldDim}, ${T.gold})`,
                        },
                      }}
                    />

                    {coupon.status === "Rejected" && coupon.rejectionReason && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "rgba(138,58,68,0.08)",
                          border: `1px solid ${T.wine}`,
                          color: T.wineBright,
                          fontSize: "0.82rem",
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                        }}
                      >
                        Rejected — {coupon.rejectionReason}
                      </Box>
                    )}

                    {coupon.status === "Pending" && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "rgba(184,134,59,0.1)",
                          border: `1px solid ${T.amber}`,
                          color: T.amberBright,
                          fontSize: "0.82rem",
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                        }}
                      >
                        Awaiting admin approval — not yet visible to customers
                      </Box>
                    )}
                  </Box>

                  <TicketDivider />

                  {/* Action stub */}
                  <Box
                    sx={{
                      p: 3,
                      width: { xs: "100%", md: 190 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      borderTop: { xs: `1px dashed ${T.hairline}`, md: "none" },
                    }}
                  >
                    <WaxSeal status={coupon.status} />

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<Edit fontSize="small" />}
                        onClick={() => openEditDialog(coupon)}
                        sx={{
                          textTransform: "none",
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                          color: T.goldDim,
                          border: `1px solid ${T.hairlineStrong}`,
                          borderRadius: 1.5,
                          "&:hover": {
                            bgcolor: "rgba(184,134,63,0.08)",
                            borderColor: T.gold,
                          },
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        startIcon={<Delete fontSize="small" />}
                        onClick={() => handleDelete(coupon._id)}
                        sx={{
                          textTransform: "none",
                          fontFamily: FONT_BODY,
                          fontWeight: 600,
                          color: T.wineBright,
                          border: `1px solid rgba(138,58,68,0.4)`,
                          borderRadius: 1.5,
                          "&:hover": {
                            bgcolor: "rgba(138,58,68,0.08)",
                            borderColor: T.wineBright,
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* CREATE / EDIT dialog shared */}
      <Dialog
        open={openCreate || openEdit}
        onClose={() => {
          setOpenCreate(false);
          setOpenEdit(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: T.surfaceRaised,
            border: `1px solid ${T.hairline}`,
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            color: T.ink,
            borderBottom: `1px solid ${T.hairline}`,
          }}
        >
          {openEdit ? "Edit Coupon" : "Create Coupon"}
        </DialogTitle>

        <DialogContent sx={{ bgcolor: T.surfaceRaised }}>
          <Stack spacing={2.5} mt={2}>
            <TextField
              label="Coupon Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              sx={inputSx}
            />

            <TextField
              select
              label="Discount Type"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value })
              }
              sx={inputSx}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { bgcolor: T.surfaceRaised, color: T.ink },
                  },
                },
              }}
            >
              <MenuItem value="percentage">Percentage (%)</MenuItem>
              <MenuItem value="flat">Flat (₹)</MenuItem>
            </TextField>

            <TextField
              label={
                form.discountType === "percentage" ? "Discount %" : "Discount ₹"
              }
              type="number"
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              sx={inputSx}
            />

            <TextField
              label="Minimum Order Value (₹)"
              type="number"
              value={form.minOrderValue}
              onChange={(e) =>
                setForm({ ...form, minOrderValue: e.target.value })
              }
              sx={inputSx}
            />

            {form.discountType === "percentage" && (
              <TextField
                label="Max Discount Cap (₹)"
                type="number"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({ ...form, maxDiscount: e.target.value })
                }
                sx={inputSx}
              />
            )}

            <TextField
              label="Usage Limit"
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              sx={inputSx}
            />

            <TextField
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              sx={inputSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: T.surfaceRaised }}>
          <Button
            onClick={() => {
              setOpenCreate(false);
              setOpenEdit(false);
              resetForm();
            }}
            sx={{ color: T.inkDim, textTransform: "none", fontFamily: FONT_BODY }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontFamily: FONT_BODY,
              color: "#ffffff",
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${T.goldBright}, ${T.gold})`,
              "&:hover": {
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDim})`,
              },
              "&.Mui-disabled": {
                background: "rgba(184,134,63,0.25)",
                color: "rgba(255,255,255,0.6)",
              },
            }}
          >
            {saving ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : openEdit ? (
              "Save"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}