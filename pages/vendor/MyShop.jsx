import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Avatar,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Rating,
  LinearProgress,
  Badge,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import StorefrontIcon       from "@mui/icons-material/Storefront";
import EditIcon             from "@mui/icons-material/Edit";
import VerifiedIcon         from "@mui/icons-material/Verified";
import StarIcon             from "@mui/icons-material/Star";
import Inventory2Icon       from "@mui/icons-material/Inventory2";
import ShoppingCartIcon     from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon       from "@mui/icons-material/TrendingUp";
import PeopleIcon           from "@mui/icons-material/People";
import LocationOnIcon       from "@mui/icons-material/LocationOn";
import PhoneIcon            from "@mui/icons-material/Phone";
import EmailIcon            from "@mui/icons-material/Email";
import LanguageIcon         from "@mui/icons-material/Language";
import CameraAltIcon        from "@mui/icons-material/CameraAlt";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import LocalShippingIcon    from "@mui/icons-material/LocalShipping";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ThumbUpIcon          from "@mui/icons-material/ThumbUp";
import ShareIcon            from "@mui/icons-material/Share";
import AddIcon              from "@mui/icons-material/Add";
import VisibilityIcon       from "@mui/icons-material/Visibility";

/* ═══════════════════════════════════════
   GOLD THEME (same palette as VendorLayout.jsx)
═══════════════════════════════════════ */
const GOLD       = "#B28A4A";
const DARK_GOLD  = "#9A7438";
const LIGHT_GOLD = "#F6EEDC";
const SOFT_GOLD  = "#FBF8F1";
const TEXT_DARK  = "#1F2937";
const TEXT_MUTED = "#64748B";
const GOLD_RGB   = "178,138,74"; // for rgba() tints

const GOLD_GRADIENT = "linear-gradient(90deg,#C8A15A,#A98243)";
const GOLD_GRADIENT_135 = "linear-gradient(135deg,#C8A15A 0%,#A98243 100%)";

/* ═══════════════════════════════════════
   BACKEND CONFIG
   ⚠️ storeName/tagline/etc ka backend already ready hai
   (vendor.controller.js -> getMyShop/updateMyShop).
   PRODUCTS_ENDPOINT / REVIEWS_ENDPOINT — agar in routes ka
   actual path alag hai apne backend mein, to yahan update kar dena.
═══════════════════════════════════════ */
const API_BASE = "http://localhost:5000";
const SHOP_ENDPOINT     = `${API_BASE}/api/vendor/profile`;      // GET + PUT ✅ ready
const PRODUCTS_ENDPOINT = `${API_BASE}/api/products/my-products`;
const REVIEWS_ENDPOINT  = `${API_BASE}/api/reviews/my-reviews`;
const STATS_ENDPOINT    = `${API_BASE}/api/vendor/dashboard`;    // ✅ ready

const token = () => localStorage.getItem("shopsphereToken");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

/* ─── badge colors by category ─── */
const CAT_COLOR = {
  Beauty:"#ec4899", Electronics:"#6366f1", Men:"#3b82f6",
  Women:"#a855f7", "Home & Living":"#10b981", Sports:"#f59e0b",
  Kids:"#14b8a6", Books:"#8b5cf6", Grocery:"#22c55e", Jewellery:"#f97316",
};

/* 🔧 FIX: product.images[0] backend se sirf relative path aata hai
   (jaise "/uploads/xyz.jpg"), usko API_BASE se prefix karna padta hai —
   warna browser use current-site-origin/uploads/xyz.jpg maan ke 404 deta hai.
   Agar already full URL (http/https/data:) hai to as-is use karo. */
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${API_BASE}${path}`;
};

/* ═══════════════════════════════════════
   STAT CARD
═══════════════════════════════════════ */
const StatCard = ({ icon, label, value, gradient, sub }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: 4,
    background: gradient,
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  }}>
    <Box sx={{
      position: "absolute", right: -12, top: -12,
      width: 80, height: 80, borderRadius: "50%",
      background: "rgba(255,255,255,0.12)",
    }} />
    <Stack spacing={1}>
      <Box sx={{ opacity: 0.9 }}>{icon}</Box>
      <Typography variant="h4" fontWeight={900}>{value}</Typography>
      <Typography fontWeight={600} sx={{ opacity: 0.9 }}>{label}</Typography>
      {sub && <Typography variant="caption" sx={{ opacity: 0.75 }}>{sub}</Typography>}
    </Stack>
  </Paper>
);

/* ═══════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════ */
const ProductCard = ({ product }) => (
  <Paper elevation={0} sx={{
    borderRadius: 4, overflow: "hidden",
    background: "rgba(255,255,255,0.9)",
    border: `1px solid rgba(${GOLD_RGB},0.12)`,
    transition: "all .25s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: `0 12px 40px rgba(${GOLD_RGB},0.18)`,
    },
  }}>
    {/* Image */}
    <Box sx={{ position: "relative", aspectRatio: "1", overflow: "hidden", bgcolor: SOFT_GOLD }}>
      {product.images?.[0] ? (
        <Box
          component="img"
          src={getImageUrl(product.images[0])}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
          <Inventory2Icon sx={{ fontSize: 48, color: `rgba(${GOLD_RGB},0.3)` }} />
        </Stack>
      )}
      {product.discount > 0 && (
        <Chip
          label={`${product.discount}% OFF`}
          size="small"
          sx={{
            position: "absolute", top: 8, left: 8,
            background: "linear-gradient(135deg,#ec4899,#f97316)",
            color: "#fff", fontWeight: 800, fontSize: 11,
          }}
        />
      )}
      {product.isFeatured && (
        <Chip
          label="⭐ Featured"
          size="small"
          sx={{
            position: "absolute", top: 8, right: 8,
            background: GOLD_GRADIENT_135,
            color: "#fff", fontWeight: 700, fontSize: 10,
          }}
        />
      )}
    </Box>

    {/* Info */}
    <Box sx={{ p: 2 }}>
      {product.category && (
        <Chip
          label={product.category}
          size="small"
          sx={{
            mb: 1, fontSize: 10, fontWeight: 700, height: 20,
            background: `${CAT_COLOR[product.category] || GOLD}18`,
            color: CAT_COLOR[product.category] || DARK_GOLD,
          }}
        />
      )}
      <Typography fontWeight={700} fontSize={14} noWrap mb={0.5}>
        {product.name}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography fontWeight={900} sx={{ color: DARK_GOLD }} fontSize={16}>
          ₹{Number(product.sellingPrice || product.price || 0).toLocaleString()}
        </Typography>
        {product.mrp && +product.mrp > +(product.sellingPrice || 0) && (
          <Typography
            variant="caption"
            sx={{ textDecoration: "line-through", color: "text.disabled" }}
          >
            ₹{Number(product.mrp).toLocaleString()}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
        <Typography variant="caption" color="text.secondary">
          Stock: {product.stock || 0}
        </Typography>
        <Chip
          label={product.status || "Active"}
          size="small"
          color={product.status === "Active" || !product.status ? "success" : "warning"}
          sx={{ fontSize: 10, height: 18 }}
        />
      </Stack>
    </Box>
  </Paper>
);

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function MyShop() {

  /* ── state ── */
  const [shop, setShop] = useState({
    storeName:   "",
    tagline:     "",
    description: "",
    location:    "",
    phone:       "",
    email:       "",
    website:     "",
    bannerColor: GOLD_GRADIENT_135,
    logoUrl:     "",
    bannerUrl:   "",
    established: "2024",
    category:    "Multi-Category",
    monthlyGoal: 0,
  });

  const [products,    setProducts]    = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [stats,       setStats]       = useState({ totalOrders: 0, revenue: 0, totalCustomers: 0 });

  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [saving,       setSaving]       = useState(false);

  const [editOpen,    setEditOpen]    = useState(false);
  const [editForm,    setEditForm]    = useState({});
  const [toast,       setToast]       = useState({ open: false, msg: "", sev: "success" });
  const [activeTab,   setActiveTab]   = useState("products");
  const [filterCat,   setFilterCat]   = useState("All");

  /* ── fetch everything from backend ──
     🔧 FIX: har endpoint apna independent try/catch rakhta hai.
     Pehle Promise.all use ho raha tha — agar ek bhi endpoint fail
     hota (jaise products/reviews route abhi bana hi nahi), poora
     page "Backend not connected" dikha deta tha, chahe shop profile
     load ho chuki ho. Ab sirf jo fail hua wahi section empty rahega,
     baaki sab normally dikhega. */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    let shopLoaded = false;
    let shopErrorMsg = "";

    // 1) Shop profile — ye sabse zaroori hai, iska error dikhayenge
    try {
      const shopRes = await fetch(SHOP_ENDPOINT, { headers: authHeaders() });
      const shopJson = await shopRes.json().catch(() => null);

      if (shopRes.ok && shopJson?.success) {
        const shopData = shopJson.shop || shopJson.vendor || shopJson.profile || shopJson.data;
        if (shopData) {
          setShop(prev => ({ ...prev, ...shopData }));
          shopLoaded = true;
        }
      } else {
        shopErrorMsg = shopJson?.message || "Failed to load shop profile";
      }
    } catch (err) {
      console.error("Shop profile fetch error:", err);
      shopErrorMsg = "Backend not connected. Please check the server is running.";
    }

    // 2) Products — agar route exist nahi karta ya fail ho, sirf empty list rahegi
    try {
      const productsRes = await fetch(PRODUCTS_ENDPOINT, { headers: authHeaders() });
      const productsJson = await productsRes.json().catch(() => null);
      const productsData = productsJson?.products || productsJson?.data;
      if (productsRes.ok && Array.isArray(productsData)) {
        setProducts(productsData);
      }
    } catch (err) {
      console.warn("Products fetch skipped (endpoint may not exist yet):", err);
    }

    // 3) Reviews — same, silently skip if not available
    try {
      const reviewsRes = await fetch(REVIEWS_ENDPOINT, { headers: authHeaders() });
      const reviewsJson = await reviewsRes.json().catch(() => null);
      const reviewsData = reviewsJson?.reviews || reviewsJson?.data;
      if (reviewsRes.ok && Array.isArray(reviewsData)) {
        setReviews(reviewsData);
      }
    } catch (err) {
      console.warn("Reviews fetch skipped (endpoint may not exist yet):", err);
    }

    // 4) Dashboard stats — same, silently skip if not available
    try {
      const statsRes = await fetch(STATS_ENDPOINT, { headers: authHeaders() });
      const statsJson = await statsRes.json().catch(() => null);
      if (statsRes.ok && statsJson) {
        const s = statsJson.stats || statsJson.data || statsJson;
        setStats({
          totalOrders:    s.totalOrders    ?? s.ordersReceived ?? s.orders ?? s.orderCount ?? 0,
          revenue:        s.revenue        ?? s.revenueEarned  ?? s.totalRevenue ?? s.earnings ?? 0,
          totalCustomers: s.totalCustomers ?? s.customers ?? s.customerCount ?? 0,
        });
      }
    } catch (err) {
      console.warn("Stats fetch skipped (endpoint may not exist yet):", err);
    }

    if (!shopLoaded && shopErrorMsg) {
      setError(shopErrorMsg);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── computed stats ── */
  const totalProducts  = products.length;
  const totalStock     = products.reduce((s, p) => s + +(p.stock || 0), 0);
  const totalReviews   = reviews.length;
  const avgRating      = totalReviews
    ? +(reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;
  const categories     = [...new Set(products.map(p => p.category).filter(Boolean))];
  const allCategories  = ["All", ...categories];
  const filtered       = filterCat === "All" ? products : products.filter(p => p.category === filterCat);

  const ratingDist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   totalReviews ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  /* ── handlers ── */
  const showToast = (msg, sev = "success") => setToast({ open: true, msg, sev });

  const openEdit = () => {
    setEditForm({ ...shop });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(SHOP_ENDPOINT, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(editForm),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        const updated = json.shop || json.vendor || editForm;
        setShop(prev => ({ ...prev, ...updated }));
        setEditOpen(false);
        showToast("Shop profile updated successfully! 🎉");
      } else {
        showToast(json?.message || "Failed to update shop profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Backend not connected", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditForm(f => ({ ...f, logoUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditForm(f => ({ ...f, bannerUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  /* ════════════════════════════════════
     LOADING / ERROR STATES
  ════════════════════════════════════ */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ══ BANNER ══ */}
      <Paper elevation={0} sx={{
        mb: 3, borderRadius: 5, overflow: "hidden",
        position: "relative",
        boxShadow: `0 8px 40px rgba(${GOLD_RGB},0.22)`,
      }}>
        {/* Banner bg */}
        <Box sx={{
          height: { xs: 140, md: 200 },
          background: shop.bannerUrl ? `url(${shop.bannerUrl}) center/cover` : (shop.bannerColor || GOLD_GRADIENT_135),
          position: "relative",
        }}>
          <Box sx={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.45))",
          }} />

          {/* Edit button */}
          <Tooltip title="Edit Shop Profile">
            <IconButton
              onClick={openEdit}
              sx={{
                position: "absolute", top: 16, right: 16,
                bgcolor: "rgba(255,255,255,0.92)",
                "&:hover": { bgcolor: "#fff", transform: "scale(1.05)" },
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              }}
            >
              <EditIcon sx={{ color: GOLD }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Store info bar */}
        <Box sx={{ px: { xs: 2, md: 4 }, pb: 3, pt: 0, background: "#fff" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "center", sm: "flex-end" }}
            sx={{ mt: { xs: -4, sm: -5 } }}
          >
            {/* Logo */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box sx={{
                  width: 22, height: 22, borderRadius: "50%",
                  bgcolor: "#10b981", border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
                </Box>
              }
            >
              <Avatar
                src={shop.logoUrl}
                sx={{
                  width: { xs: 80, md: 96 },
                  height: { xs: 80, md: 96 },
                  border: "4px solid #fff",
                  background: GOLD_GRADIENT_135,
                  fontSize: 36, fontWeight: 900,
                  boxShadow: `0 4px 20px rgba(${GOLD_RGB},0.35)`,
                }}
              >
                {shop.storeName?.[0]?.toUpperCase() || "S"}
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1, pb: 1 }}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={1.5}>
                <Typography variant="h5" fontWeight={900}>
                  {shop.storeName || "My Store"}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
                    label="Verified"
                    size="small"
                    sx={{ bgcolor: "#10b981", color: "#fff", fontWeight: 700, fontSize: 11 }}
                  />
                  <Chip
                    label={shop.category}
                    size="small"
                    sx={{
                      bgcolor: `rgba(${GOLD_RGB},0.12)`,
                      color: DARK_GOLD, fontWeight: 700, fontSize: 11,
                    }}
                  />
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {shop.tagline || "Quality products, great prices!"}
              </Typography>

              <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                {shop.location && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOnIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                    <Typography variant="caption" color="text.secondary">{shop.location}</Typography>
                  </Stack>
                )}
                {shop.email && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmailIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                    <Typography variant="caption" color="text.secondary">{shop.email}</Typography>
                  </Stack>
                )}
                {shop.phone && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PhoneIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                    <Typography variant="caption" color="text.secondary">{shop.phone}</Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StarIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {avgRating} · {totalReviews} reviews
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ pb: 1 }}>
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 3,
                  color: DARK_GOLD,
                  borderColor: `rgba(${GOLD_RGB},0.4)`,
                  "&:hover": { borderColor: GOLD, background: `rgba(${GOLD_RGB},0.06)` },
                }}
                onClick={() => showToast("Shop link copied! 🔗")}
              >
                Share
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                size="small"
                onClick={openEdit}
                sx={{
                  borderRadius: 3,
                  background: GOLD_GRADIENT,
                  "&:hover": { background: GOLD_GRADIENT },
                }}
              >
                Edit Shop
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* ══ STATS ══ */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            icon: <Inventory2Icon />, label: "Total Products",
            value: totalProducts, gradient: GOLD_GRADIENT_135,
            sub: `${categories.length} categories`,
          },
          {
            icon: <ShoppingCartIcon />, label: "Total Orders",
            value: stats.totalOrders, gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
            sub: "Live from orders",
          },
          {
            icon: <TrendingUpIcon />, label: "Revenue",
            value: `₹${Number(stats.revenue || 0).toLocaleString("en-IN")}`,
            gradient: "linear-gradient(135deg,#10b981,#22c55e)",
            sub: "All-time",
          },
          {
            icon: <StarIcon />, label: "Avg Rating",
            value: avgRating || "—", gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
            sub: `${totalReviews} reviews`,
          },
          {
            icon: <PeopleIcon />, label: "Customers",
            value: stats.totalCustomers, gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)",
            sub: "Unique buyers",
          },
          {
            icon: <Inventory2Icon />, label: "Stock Units",
            value: totalStock.toLocaleString(), gradient: "linear-gradient(135deg,#14b8a6,#06b6d4)",
            sub: "Across all products",
          },
        ].map((s, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ══ TRUST BADGES ══ */}
      <Paper elevation={0} sx={{
        px: 3, py: 2, mb: 3, borderRadius: 4,
        background: "rgba(255,255,255,0.85)",
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-around"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem />}
        >
          {[
            { icon: <VerifiedIcon sx={{ color: "#10b981" }} />,         label: "Verified Seller"      },
            { icon: <LocalShippingIcon sx={{ color: "#6366f1" }} />,    label: "Fast Delivery"        },
            { icon: <AssignmentReturnIcon sx={{ color: "#f59e0b" }} />, label: "Easy Returns"         },
            { icon: <ThumbUpIcon sx={{ color: "#ec4899" }} />,          label: "Trusted by 1000+"     },
            { icon: <CheckCircleIcon sx={{ color: GOLD }} />,           label: "Quality Assured"      },
          ].map((b, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              {b.icon}
              <Typography fontWeight={700} fontSize={13}>{b.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* ══ TABS ══ */}
      <Paper elevation={0} sx={{
        mb: 3, borderRadius: 4,
        background: "rgba(255,255,255,0.85)",
        overflow: "hidden",
      }}>
        <Stack direction="row">
          {["products", "about", "reviews"].map(tab => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                flex: 1, py: 1.8, borderRadius: 0,
                fontWeight: activeTab === tab ? 800 : 500,
                textTransform: "capitalize",
                fontSize: 14,
                color: activeTab === tab ? DARK_GOLD : "text.secondary",
                borderBottom: activeTab === tab ? `3px solid ${GOLD}` : "3px solid transparent",
                background: activeTab === tab ? `rgba(${GOLD_RGB},0.06)` : "transparent",
              }}
            >
              {tab === "products" ? `Products (${totalProducts})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* ══ PRODUCTS TAB ══ */}
      {activeTab === "products" && (
        <Box>
          {/* Filter + Add */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} mb={3}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {allCategories.map(cat => (
                <Chip
                  key={cat} label={cat}
                  onClick={() => setFilterCat(cat)}
                  variant={filterCat === cat ? "filled" : "outlined"}
                  sx={{
                    cursor: "pointer",
                    background: filterCat === cat ? GOLD_GRADIENT : "transparent",
                    color: filterCat === cat ? "#fff" : "inherit",
                    fontWeight: filterCat === cat ? 700 : 400,
                    borderColor: `rgba(${GOLD_RGB},0.35)`,
                  }}
                />
              ))}
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              href="/vendor/add-product"
              sx={{
                borderRadius: 3, px: 3,
                background: GOLD_GRADIENT,
                whiteSpace: "nowrap",
                "&:hover": { background: GOLD_GRADIENT },
              }}
            >
              Add Product
            </Button>
          </Stack>

          {/* Products grid */}
          {filtered.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 8, borderRadius: 5, textAlign: "center",
              background: "rgba(255,255,255,0.7)",
            }}>
              <Inventory2Icon sx={{ fontSize: 64, color: `rgba(${GOLD_RGB},0.3)`, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                No products yet
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                Start adding products to your shop
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                href="/vendor/add-product"
                sx={{
                  borderRadius: 3, px: 4,
                  background: GOLD_GRADIENT,
                  "&:hover": { background: GOLD_GRADIENT },
                }}
              >
                Add First Product
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {filtered.map(product => (
                <Grid item xs={6} sm={4} md={3} key={product._id || product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ══ ABOUT TAB ══ */}
      {activeTab === "about" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "rgba(255,255,255,0.85)", mb: 3 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>🏪 About Our Store</Typography>
              <Typography color="text.secondary" lineHeight={1.8}>
                {shop.description || "Welcome to our store! We offer a wide range of quality products at competitive prices. Our mission is to provide the best shopping experience with fast delivery and easy returns. We are committed to customer satisfaction and quality assurance."}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "rgba(255,255,255,0.85)" }}>
              <Typography variant="h6" fontWeight={800} mb={2}>📊 Store Highlights</Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Products Listed",    value: totalProducts },
                  { label: "Happy Customers",    value: `${stats.totalCustomers || 0}+` },
                  { label: "Orders Completed",   value: stats.totalOrders || 0 },
                  { label: "Avg Response Time",  value: "< 2 hrs"     },
                  { label: "Established",        value: shop.established },
                  { label: "Categories",         value: categories.length || 1 },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Paper elevation={0} sx={{
                      p: 2, borderRadius: 3, textAlign: "center",
                      background: `linear-gradient(135deg,rgba(${GOLD_RGB},0.06),rgba(${GOLD_RGB},0.02))`,
                      border: `1px solid rgba(${GOLD_RGB},0.15)`,
                    }}>
                      <Typography variant="h6" fontWeight={900} sx={{ color: DARK_GOLD }}>{item.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "rgba(255,255,255,0.85)", mb: 3 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>📬 Contact Info</Typography>
              <Stack spacing={2}>
                {[
                  { icon: <EmailIcon sx={{ color: "#6366f1" }} />,      label: "Email",    val: shop.email    || "Not provided" },
                  { icon: <PhoneIcon sx={{ color: "#10b981" }} />,      label: "Phone",    val: shop.phone    || "Not provided" },
                  { icon: <LocationOnIcon sx={{ color: "#ec4899" }} />, label: "Location", val: shop.location || "Not provided" },
                  { icon: <LanguageIcon sx={{ color: "#f59e0b" }} />,   label: "Website",  val: shop.website  || "Not provided" },
                ].map((row, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      background: `rgba(${GOLD_RGB},0.1)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {row.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                      <Typography fontWeight={600} fontSize={14}>{row.val}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "rgba(255,255,255,0.85)" }}>
              <Typography variant="h6" fontWeight={800} mb={2}>🏷️ Categories</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {categories.length > 0 ? categories.map(cat => (
                  <Chip
                    key={cat} label={cat}
                    sx={{
                      background: `${CAT_COLOR[cat] || GOLD}18`,
                      color: CAT_COLOR[cat] || DARK_GOLD,
                      fontWeight: 700,
                    }}
                  />
                )) : (
                  <Typography variant="body2" color="text.disabled">
                    No products added yet
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ══ REVIEWS TAB ══ */}
      {activeTab === "reviews" && (
        <Grid container spacing={3}>
          {/* Rating summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "rgba(255,255,255,0.85)" }}>
              <Typography variant="h6" fontWeight={800} mb={2}>⭐ Rating Summary</Typography>

              <Stack alignItems="center" mb={3}>
                <Typography sx={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: "#f59e0b" }}>
                  {avgRating || "—"}
                </Typography>
                <Rating value={avgRating} precision={0.1} readOnly sx={{ color: "#f59e0b" }} />
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  Based on {totalReviews} reviews
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {ratingDist.map(({ star, count, pct }) => (
                  <Stack key={star} direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 8 }}>{star}</Typography>
                    <StarIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
                    <LinearProgress
                      variant="determinate" value={pct}
                      sx={{
                        flex: 1, height: 8, borderRadius: 10,
                        bgcolor: "rgba(245,158,11,0.1)",
                        "& .MuiLinearProgress-bar": { bgcolor: "#f59e0b", borderRadius: 10 },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                      {count}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Review list */}
          <Grid item xs={12} md={8}>
            {reviews.length === 0 ? (
              <Paper elevation={0} sx={{
                p: 6, borderRadius: 4, textAlign: "center",
                background: "rgba(255,255,255,0.85)",
              }}>
                <StarIcon sx={{ fontSize: 48, color: `rgba(${GOLD_RGB},0.3)`, mb: 1 }} />
                <Typography color="text.secondary">No reviews yet</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {reviews.map(review => (
                  <Paper key={review._id || review.id} elevation={0} sx={{
                    p: 3, borderRadius: 4,
                    background: "rgba(255,255,255,0.85)",
                    transition: "all .2s",
                    "&:hover": { boxShadow: `0 4px 20px rgba(${GOLD_RGB},0.12)` },
                  }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{
                        background: GOLD_GRADIENT_135,
                        fontWeight: 800,
                      }}>
                        {review.avatar || review.name?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                      <Box flex={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>{review.name}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {review.date || (review.createdAt && new Date(review.createdAt).toLocaleDateString("en-IN"))}
                          </Typography>
                        </Stack>
                        <Rating value={review.rating} readOnly size="small" sx={{ color: "#f59e0b", my: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      )}

      {/* ══ EDIT SHOP DIALOG ══ */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>
          ✏️ Edit Shop Profile
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>

            {/* Logo + Banner upload */}
            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* Logo */}
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 3, flex: 1, textAlign: "center",
                  border: `2px dashed rgba(${GOLD_RGB},0.35)`,
                  cursor: "pointer",
                  "&:hover": { border: `2px dashed ${GOLD}` },
                }}
                  component="label"
                >
                  <input hidden type="file" accept="image/*" onChange={handleLogoChange} />
                  <Avatar
                    src={editForm.logoUrl}
                    sx={{ width: 60, height: 60, mx: "auto", mb: 1, bgcolor: GOLD }}
                  >
                    <CameraAltIcon />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Click to upload Logo
                  </Typography>
                </Paper>

                {/* Banner */}
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: 3, flex: 2, textAlign: "center",
                  border: `2px dashed rgba(${GOLD_RGB},0.35)`,
                  cursor: "pointer",
                  "&:hover": { border: `2px dashed ${GOLD}` },
                  background: editForm.bannerUrl
                    ? `url(${editForm.bannerUrl}) center/cover`
                    : editForm.bannerColor || shop.bannerColor || GOLD_GRADIENT_135,
                  minHeight: 80,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                  component="label"
                >
                  <input hidden type="file" accept="image/*" onChange={handleBannerChange} />
                  <Stack alignItems="center">
                    <CameraAltIcon sx={{ color: "rgba(255,255,255,0.8)", mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)" }}>
                      Click to upload Banner
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {[
              { label: "Store Name",   key: "storeName",   xs: 12, sm: 6 },
              { label: "Tagline",      key: "tagline",     xs: 12, sm: 6 },
              { label: "Category",     key: "category",    xs: 12, sm: 6 },
              { label: "Established",  key: "established", xs: 12, sm: 6 },
              { label: "Location",     key: "location",    xs: 12, sm: 6 },
              { label: "Phone",        key: "phone",       xs: 12, sm: 6 },
              { label: "Email",        key: "email",       xs: 12, sm: 6 },
              { label: "Website",      key: "website",     xs: 12, sm: 6 },
              { label: "Monthly Revenue Goal (₹)", key: "monthlyGoal", xs: 12, sm: 6, type: "number" },
            ].map(f => (
              <Grid item xs={f.xs} sm={f.sm} key={f.key}>
                <TextField
                  label={f.label}
                  type={f.type || "text"}
                  value={editForm[f.key] ?? ""}
                  onChange={e => setEditForm(ef => ({ ...ef, [f.key]: e.target.value }))}
                  fullWidth size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": { borderColor: GOLD },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: DARK_GOLD },
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                label="Store Description"
                value={editForm.description || ""}
                onChange={e => setEditForm(ef => ({ ...ef, description: e.target.value }))}
                fullWidth multiline rows={3} size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&.Mui-focused fieldset": { borderColor: GOLD },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: DARK_GOLD },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 3, color: TEXT_MUTED }}>
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleEditSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CheckCircleIcon />}
            sx={{
              borderRadius: 3, px: 3,
              background: GOLD_GRADIENT,
              "&:hover": { background: GOLD_GRADIENT },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── TOAST ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}