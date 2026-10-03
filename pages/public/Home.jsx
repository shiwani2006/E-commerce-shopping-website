import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Rating,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
  Zoom,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getAllProducts } from "../../api/productApi";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SecurityIcon from "@mui/icons-material/Security";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import PaymentsIcon from "@mui/icons-material/Payments";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import DiscountIcon from "@mui/icons-material/Discount";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";

// ─── Static display data (categories, collections, brands, testimonials) ─────

const categories = [
  { name: "Women", icon: "👗" },
  { name: "Men", icon: "👕" },
  { name: "Beauty", icon: "💄" },
  { name: "Footwear", icon: "👟" },
  { name: "Electronics", icon: "🎧" },
  { name: "Home Decor", icon: "🕯️" },
  { name: "Accessories", icon: "👜" },
  { name: "Kids", icon: "🧸" },
];

const collections = [
  {
    title: "Soft Girl Fits",
    text: "Dresses, cute tops and everyday outfits.",
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
  },
  {
    title: "Streetwear Picks",
    text: "Sneakers, oversized tees and cool statement pieces.",
    img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900",
  },
  {
    title: "Tech Essentials",
    text: "Smart watches, headphones and useful accessories.",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
  },
];

const brands = ["LavishLane", "UrbanAura", "GlowCart", "StyleNest", "TechBloom", "Homechilli"];

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Vendor",
    text: "The premium storefront and simple dashboard made my first online shop feel professional instantly.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Sanya Kapoor",
    role: "Customer",
    text: "The interface is clean, fast, and visually rich. It feels like a real modern marketplace.",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Ritika Sharma",
    role: "Support",
    text: "Vendor approval, product checks, and order handling are very easy to manage from one place.",
    rating: 5,
    avatar: "R",
  },
];

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900";

const API_BASE_URL = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

function getImageUrl(product) {
  const rawPath = product?.images?.[0];
  if (!rawPath) return FALLBACK_IMG;
  return rawPath.startsWith("http") ? rawPath : `${API_BASE_URL}${rawPath}`;
}

// ─── CountdownTimer ───────────────────────────────────────────────────────────

function CountdownTimer() {
  const target = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(target - new Date(), 0);
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const box = (v, label) => (
    <Box
      sx={{
        minWidth: 60,
        p: "10px 8px 8px",
        textAlign: "center",
        borderRadius: 2.5,
        bgcolor: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <Typography sx={{ fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {String(v).padStart(2, "0")}
      </Typography>
      <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Typography>
    </Box>
  );
  return (
    <Stack direction="row" spacing={1}>
      {box(timeLeft.h, "Hrs")} {box(timeLeft.m, "Min")} {box(timeLeft.s, "Sec")}
    </Stack>
  );
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const end = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    let start = 0;
    const step = Math.max(1, Math.ceil(end / 80));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
  const rawSuffix = value.match(/[^0-9]*$/)?.[0] ?? "";
  return (
    <Typography
      variant="h3"
      fontWeight={900}
      sx={{
        letterSpacing: "-2px",
        background: "linear-gradient(135deg,#059669,#d4af37)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}
    >
      {prefix}{count}{rawSuffix || suffix}
    </Typography>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, to = "/products" }) {
  return (
    <Box
      sx={{
        mb: 5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "flex-end" },
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ color: "text.primary", letterSpacing: "-1px", fontSize: { xs: "1.6rem", md: "2rem" } }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", fontSize: 15 }}>
          {subtitle}
        </Typography>
      </Box>
      <Button
        component={Link}
        to={to}
        endIcon={<ArrowForwardIcon sx={{ fontSize: "16px !important" }} />}
        sx={{
          color: "primary.main",
          fontWeight: 800,
          textTransform: "none",
          borderRadius: 99,
          px: 2.5,
          py: 0.8,
          fontSize: 14,
          bgcolor: "rgba(5,150,105,0.06)",
          border: "1px solid",
          borderColor: "rgba(5,150,105,0.15)",
          transition: "all 0.2s",
          "&:hover": { bgcolor: "primary.main", color: "white", borderColor: "primary.main" },
        }}
      >
        View all
      </Button>
    </Box>
  );
}

// ─── HoverCard ────────────────────────────────────────────────────────────────

function HoverCard({ children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      component={motion.div}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": { boxShadow: "0 24px 50px rgba(5,150,105,0.13)", borderColor: "rgba(5,150,105,0.25)" },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

// ─── FloatingOrbs (decorative) ────────────────────────────────────────────────

function FloatingOrbs({ mode }) {
  return (
    <>
      {[
        { size: 420, top: "8%", left: "-5%", color: mode === "light" ? "rgba(5,150,105,0.12)" : "rgba(5,150,105,0.07)" },
        { size: 320, top: "5%", right: "-3%", color: mode === "light" ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.06)" },
        { size: 260, bottom: "20%", right: "5%", color: mode === "light" ? "rgba(15,118,110,0.09)" : "rgba(15,118,110,0.05)" },
      ].map((o, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{ y: [0, -20, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          sx={{
            position: "fixed",
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            top: o.top,
            left: o.left,
            right: o.right,
            bottom: o.bottom,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [mode, setMode] = useState(() => localStorage.getItem("shopTheme") || "light");
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Real cart, from CartContext — same one used in Checkout/Orders/Products
  const { refreshCart } = useCart();

  // Real wishlist, from WishlistContext — same one used in Wishlist.jsx
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => { localStorage.setItem("shopTheme", mode); }, [mode]);

  // Fetch real products from backend for the "Trending Now" row
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getAllProducts();
        const list = data?.success && Array.isArray(data.products) ? data.products : [];
        if (isMounted) {
          setProducts(list.slice(0, 6));
          if (list.length > 0) setSelectedProduct(list[0]);
        }
      } catch (err) {
        console.error("Failed to load products on Home:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#059669" },
          secondary: { main: "#0f766e" },
          background: {
            default: mode === "light" ? "#f4fdf9" : "#071310",
            paper: mode === "light" ? "rgba(255,255,255,0.85)" : "rgba(8,20,17,0.82)",
          },
        },
        shape: { borderRadius: 14 },
        typography: { fontFamily: `"Inter", "Segoe UI", sans-serif` },
        components: { MuiPaper: { styleOverrides: { root: { backdropFilter: "blur(20px)" } } } },
      }),
    [mode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Adds a real product to the real cart — same pattern as Products.jsx
  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem("shopsphereToken");

      if (!token) {
        alert("Please login first!");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      await refreshCart();
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Could not add item to cart");
    }
  };

  const openQuickView = (p) => { setSelectedProduct(p); setQuickViewOpen(true); };

  // Toggles a product in the real wishlist — same context used in Wishlist.jsx
  const toggleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("shopsphereToken");

      if (!token) {
        alert("Please login first!");
        return;
      }

      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          background:
            mode === "light"
              ? "linear-gradient(160deg,#f0fdf6 0%,#f4fdf9 40%,#f0fdfa 80%,#eefcf3 100%)"
              : "linear-gradient(160deg,#050f0c 0%,#071310 50%,#081411 100%)",
          color: "text.primary",
          overflow: "hidden",
        }}
      >
        <FloatingOrbs mode={mode} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Navbar />

          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4, lg: 5 }, pb: 10 }}>

            {/* ── Top bar ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 3, mb: 4 }}>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Chip
                  icon={<DiamondOutlinedIcon sx={{ fontSize: "15px !important", color: "primary.main" }} />}
                  label="India's Premium Marketplace"
                  sx={{
                    fontWeight: 800,
                    fontSize: 12,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "rgba(5,150,105,0.2)",
                    px: 0.5,
                    boxShadow: "0 4px 16px rgba(5,150,105,0.08)",
                  }}
                />
              </motion.div>
              <IconButton
                onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                size="medium"
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  "&:hover": { transform: "rotate(20deg) scale(1.05)" },
                  transition: "transform 0.25s",
                }}
              >
                {mode === "light" ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
              </IconButton>
            </Stack>

            {/* ── HERO ── */}
            <Grid container spacing={{ xs: 4, lg: 5 }} alignItems="center" sx={{ pb: { xs: 6, md: 8 } }}>
              <Grid item xs={12} md={6} lg={7}>
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: "easeOut" }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 0.8,
                      borderRadius: 99,
                      bgcolor: "background.paper",
                      border: "1px solid rgba(5,150,105,0.2)",
                      boxShadow: "0 6px 20px rgba(5,150,105,0.06)",
                      mb: 3,
                    }}
                  >
                    <Box
                      component={motion.div}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)", flexShrink: 0 }}
                    />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
                      50,000+ products live right now
                    </Typography>
                  </Box>

                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.02,
                      fontSize: { xs: "2.8rem", sm: "3.6rem", md: "4rem", lg: "4.6rem" },
                      letterSpacing: "-3px",
                      mb: 2.5,
                    }}
                  >
                    <Box component="span" sx={{ background: "linear-gradient(90deg,#047857 0%,#059669 55%,#d4af37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Shop smarter,
                    </Box>
                    <br />
                    <Box component="span" sx={{ color: "text.primary" }}>
                      sell prettier.
                    </Box>
                  </Typography>

                  <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: 15, md: 16.5 }, maxWidth: 500, lineHeight: 1.75, mb: 4 }}>
                    ShopSphere is a premium multi-vendor marketplace — customers discover
                    products, vendors build shops, and everyone wins.
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Search fashion, beauty, electronics…"
                    sx={{
                      maxWidth: 540,
                      mb: 4,
                      "& .MuiOutlinedInput-root": {
                        height: 54,
                        borderRadius: 99,
                        bgcolor: "background.paper",
                        boxShadow: "0 8px 30px rgba(5,150,105,0.07)",
                        border: "1px solid",
                        borderColor: "rgba(5,150,105,0.2)",
                        pr: 0.75,
                        "& fieldset": { border: "none" },
                        "&:hover": { borderColor: "primary.main" },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ pl: 1 }}>
                          <SearchIcon sx={{ color: "primary.main", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Button
                          component={Link}
                          to="/products"
                          variant="contained"
                          sx={{
                            borderRadius: 99,
                            px: 3,
                            height: 40,
                            textTransform: "none",
                            fontWeight: 800,
                            fontSize: 13,
                            background: "linear-gradient(90deg,#059669,#0f766e)",
                            boxShadow: "0 4px 14px rgba(5,150,105,0.35)",
                          }}
                        >
                          Search
                        </Button>
                      ),
                    }}
                  />

                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
                    <Button
                      component={Link}
                      to="/products"
                      variant="contained"
                      startIcon={<ShoppingBagIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 99,
                        textTransform: "none",
                        fontWeight: 900,
                        fontSize: 15,
                        background: "linear-gradient(90deg,#059669,#0f766e)",
                        boxShadow: "0 12px 30px rgba(5,150,105,0.3)",
                        "&:hover": { boxShadow: "0 16px 35px rgba(212,175,55,0.35)", transform: "translateY(-1px)" },
                        transition: "all 0.2s",
                      }}
                    >
                      Explore Products
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="outlined"
                      startIcon={<StorefrontIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 99,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 15,
                        color: "primary.main",
                        borderColor: "rgba(5,150,105,0.3)",
                        bgcolor: "background.paper",
                        "&:hover": { borderColor: "primary.main", bgcolor: "rgba(5,150,105,0.04)" },
                      }}
                    >
                      Become a Vendor
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {["Verified sellers", "Secure checkout", "Fast delivery", "24/7 support"].map((item) => (
                      <Chip
                        key={item}
                        icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "primary.main" }} />}
                        label={item}
                        size="small"
                        sx={{ bgcolor: "background.paper", fontWeight: 700, fontSize: 12, border: "1px solid", borderColor: "divider" }}
                      />
                    ))}
                  </Stack>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6} lg={5}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
                  <Paper
                    elevation={0}
                    component={motion.div}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    sx={{
                      position: "relative",
                      p: 1.5,
                      height: { xs: 380, md: 580 },
                      borderRadius: 6,
                      background: mode === "light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 30px 70px rgba(5,150,105,0.13)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000"
                      alt="Hero"
                      sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4.5 }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>

            {/* ── Sticky categories ── */}
            <Box
              sx={{
                position: "sticky",
                top: isMobile ? 62 : 74,
                zIndex: 9,
                mb: 7,
                py: 1.5,
                px: 2,
                backdropFilter: "blur(24px)",
                bgcolor: mode === "light" ? "rgba(244,253,249,0.88)" : "rgba(7,19,16,0.88)",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 32px rgba(5,150,105,0.05)",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, alignItems: "center", px: 0.5 }}
              >
                {categories.map((cat) => (
                  <Chip
                    key={cat.name}
                    label={`${cat.icon} ${cat.name}`}
                    component={Link}
                    to="/products"
                    clickable
                    sx={{
                      fontWeight: 800,
                      fontSize: 13,
                      px: 1,
                      py: 2.5,
                      bgcolor: "background.paper",
                      color: "text.primary",
                      border: "1px solid",
                      borderColor: "divider",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.main", bgcolor: "rgba(5,150,105,0.05)", transform: "translateY(-1px)" },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* ── Deal Banner ── */}
            <Paper
              elevation={0}
              sx={{
                mb: 8,
                p: { xs: 3.5, md: 5 },
                borderRadius: 6,
                background: "linear-gradient(110deg, #065f46 0%, #059669 50%, #d4af37 100%)",
                color: "white",
                boxShadow: "0 24px 60px rgba(6,95,70,0.3)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box sx={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", top: -80, right: -60, pointerEvents: "none" }} />
              <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", bottom: -40, left: "40%", pointerEvents: "none" }} />

              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={3} sx={{ position: "relative", zIndex: 1 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <DiscountIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.9 }}>
                      Today's Deals
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: "-0.5px", mb: 0.5 }}>
                    Summer Glow Sale ends tonight.
                  </Typography>
                  <Typography sx={{ opacity: 0.85, fontSize: 14, maxWidth: 480 }}>
                    Flat deals on fashion, beauty, footwear and accessories.
                  </Typography>
                </Box>

                <Stack spacing={2} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
                  <CountdownTimer />
                  <Button
                    component={Link}
                    to="/products"
                    variant="contained"
                    startIcon={<FlashOnIcon />}
                    sx={{
                      bgcolor: "white",
                      color: "#065f46",
                      borderRadius: 99,
                      px: 3.5,
                      py: 1.3,
                      fontWeight: 900,
                      textTransform: "none",
                      fontSize: 14,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.92)" },
                    }}
                  >
                    Shop Deals
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* ── Stats ── */}
            <Grid container spacing={2.5} sx={{ mb: 8 }}>
              {[
                { num: "10K+", label: "Happy Customers", icon: "🛍️" },
                { num: "800+", label: "Active Sellers", icon: "🏪" },
                { num: "50K+", label: "Products Listed", icon: "📦" },
                { num: "99%", label: "Secure Orders", icon: "🔒" },
              ].map(({ num, label, icon }) => (
                <Grid item xs={6} md={3} key={label}>
                  <HoverCard sx={{ p: { xs: 2.5, md: 3.5 }, textAlign: "center", borderRadius: 5, minHeight: 140, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 28, mb: 1 }}>{icon}</Typography>
                    <AnimatedCounter value={num} />
                    <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
                      {label}
                    </Typography>
                  </HoverCard>
                </Grid>
              ))}
            </Grid>

            {/* ── Categories Grid ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="Shop by Category" subtitle="Discover products across all lifestyle categories." />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(8, 1fr)" }, gap: { xs: 1.5, md: 2 } }}>
                {categories.map((cat, i) => (
                  <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Paper
                      component={Link}
                      to="/products"
                      elevation={0}
                      sx={{
                        height: { xs: 90, md: 120 },
                        p: 1,
                        borderRadius: 4,
                        textDecoration: "none",
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 0.5,
                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                        "&:hover": { transform: "translateY(-5px)", borderColor: "primary.main", boxShadow: "0 12px 28px rgba(5,150,105,0.1)" },
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: 24, md: 30 } }}>{cat.icon}</Typography>
                      <Typography variant="caption" fontWeight={800} color="text.primary" textAlign="center" sx={{ fontSize: { xs: 10, md: 12 } }}>
                        {cat.name}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </Box>

            {/* ── Products Row — REAL DATA FROM BACKEND ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="Trending Now" subtitle="Handpicked products selling fast today." />

              {loadingProducts ? (
                <LinearProgress sx={{ borderRadius: 99 }} />
              ) : products.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: "center", border: "1px dashed", borderColor: "divider" }}>
                  <Typography color="text.secondary">No products available right now.</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", gap: 2.5, overflowX: "auto", pb: 2, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                  {products.map((product, i) => {
                    const inWishlist = isInWishlist(product._id);
                    const currentPrice = product.sellingPrice || product.price || 0;
                    const oldPrice = product.mrp || product.old;
                    const discountPct = product.discount || (oldPrice && currentPrice
                      ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
                      : null);

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{ flexShrink: 0 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            width: { xs: 260, md: 285 },
                            overflow: "hidden",
                            borderRadius: 5,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                            "&:hover": { transform: "translateY(-8px)", boxShadow: "0 28px 55px rgba(5,150,105,0.25)", borderColor: "primary.main" },
                            "&:hover img": { transform: "scale(1.06)" },
                          }}
                        >
                          <Box sx={{ overflow: "hidden", position: "relative", height: 270 }}>
                            <Box
                              component="img"
                              src={getImageUrl(product)}
                              onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                              sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s ease" }}
                            />
                            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />
                            {discountPct ? (
                              <Chip
                                label={`${discountPct}% OFF`}
                                size="small"
                                sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(255,255,255,0.95)", color: "secondary.main", fontWeight: 900, fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                              />
                            ) : null}
                            <IconButton
                              onClick={() => toggleWishlist(product._id)}
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 34,
                                height: 34,
                                bgcolor: "rgba(255,255,255,0.95)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                "&:hover": { bgcolor: "white" },
                              }}
                            >
                              {inWishlist ? (
                                <FavoriteIcon sx={{ fontSize: 16, color: "#d4af37" }} />
                              ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 16, color: "#d4af37" }} />
                              )}
                            </IconButton>

                            <Stack direction="row" spacing={1} sx={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
                              <Button
                                size="small"
                                onClick={() => handleAddToCart(product)}
                                sx={{ flex: 1, borderRadius: 99, textTransform: "none", fontWeight: 900, fontSize: 12, bgcolor: "rgba(255,255,255,0.95)", color: "primary.main", "&:hover": { bgcolor: "white" } }}
                              >
                                + Cart
                              </Button>
                              <Button
                                size="small"
                                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                onClick={() => openQuickView(product)}
                                sx={{ flex: 1, borderRadius: 99, textTransform: "none", fontWeight: 900, fontSize: 12, bgcolor: "rgba(255,255,255,0.95)", color: "primary.main", "&:hover": { bgcolor: "white" } }}
                              >
                                View
                              </Button>
                            </Stack>
                          </Box>

                          <Box sx={{ p: 2.5 }}>
                            <Typography variant="body1" fontWeight={900} noWrap sx={{ mb: 0.8 }}>
                              {product.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" />
                              <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 500 }}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.2 }}>
                              <Typography fontWeight={900} sx={{ color: "secondary.main", fontSize: 17 }}>
                                ₹{currentPrice}
                              </Typography>
                              {oldPrice ? (
                                <Typography variant="body2" sx={{ color: "text.disabled", textDecoration: "line-through", fontSize: 13 }}>
                                  ₹{oldPrice}
                                </Typography>
                              ) : null}
                            </Stack>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleAddToCart(product)}
                              sx={{
                                mt: 2,
                                borderRadius: 99,
                                py: 1.1,
                                textTransform: "none",
                                fontWeight: 900,
                                fontSize: 13,
                                background: "linear-gradient(90deg,#059669,#0f766e)",
                                boxShadow: "0 6px 18px rgba(5,150,105,0.22)",
                                "&:hover": { boxShadow: "0 8px 24px rgba(212,175,55,0.3)" },
                              }}
                            >
                              Add to Cart
                            </Button>
                          </Box>
                        </Paper>
                      </motion.div>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* ── Collections ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="Curated Collections" subtitle="Editorially styled shopping moments." />
              <Grid container spacing={2.5}>
                {collections.map((item, i) => (
                  <Grid item xs={12} sm={6} lg={4} key={item.title}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          height: 300,
                          borderRadius: 5,
                          overflow: "hidden",
                          position: "relative",
                          "&:hover img": { transform: "scale(1.06)" },
                          "&:hover .explore-btn": { opacity: 1, transform: "translateY(0)" },
                        }}
                      >
                        <Box component="img" src={item.img} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,15,12,0.88) 0%, rgba(6,60,45,0.2) 55%, transparent 100%)" }} />
                        <Box sx={{ position: "absolute", bottom: 26, left: 26, right: 26, color: "white" }}>
                          <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.3px", mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.5, mb: 2 }}>
                            {item.text}
                          </Typography>
                          <Button
                            component={Link}
                            to="/products"
                            className="explore-btn"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: "14px !important" }} />}
                            sx={{
                              bgcolor: "white",
                              color: "primary.main",
                              borderRadius: 99,
                              px: 3,
                              py: 0.9,
                              fontWeight: 900,
                              textTransform: "none",
                              fontSize: 13,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                              opacity: 0.92,
                              transform: "translateY(3px)",
                              transition: "all 0.25s",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                            }}
                          >
                            Explore
                          </Button>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* ── Why ShopSphere ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="Why ShopSphere?" subtitle="Built for both customers and sellers to thrive." />
              <Grid container spacing={2.5}>
                {[
                  {
                    icon: <StorefrontIcon />,
                    title: "Premium Storefronts",
                    text: "Sellers create beautiful shops, upload products, and track all sales from one clean dashboard.",
                    gradient: "linear-gradient(135deg,#059669,#065f46)",
                  },
                  {
                    icon: <LocalShippingIcon />,
                    title: "Real-Time Tracking",
                    text: "Customers get live order updates from checkout to doorstep delivery.",
                    gradient: "linear-gradient(135deg,#d4af37,#b8860b)",
                  },
                  {
                    icon: <SecurityIcon />,
                    title: "Secure by Design",
                    text: "Safe payments, trusted seller verification, and buyer protection built-in.",
                    gradient: "linear-gradient(135deg,#0f766e,#134e4a)",
                  },
                ].map(({ icon, title, text, gradient }) => (
                  <Grid item xs={12} md={4} key={title}>
                    <HoverCard sx={{ p: 3, borderRadius: 5, height: "100%", display: "flex", flexDirection: "row", alignItems: "center", gap: 2.5 }}>
                      <Avatar sx={{ width: 48, height: 48, flexShrink: 0, background: gradient, boxShadow: "0 8px 20px rgba(5,150,105,0.22)" }}>
                        {icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={900} sx={{ mb: 0.4, letterSpacing: "-0.2px" }}>
                          {title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.65 }}>
                          {text}
                        </Typography>
                      </Box>
                    </HoverCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* ── Brands ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="Top Brands" subtitle="The best names, all in one place." />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }, gap: 2 }}>
                {brands.map((brand) => (
                  <Paper
                    key={brand}
                    elevation={0}
                    component={motion.div}
                    whileHover={{ y: -3 }}
                    sx={{
                      height: 78,
                      borderRadius: 4,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <Typography variant="body2" fontWeight={900} textAlign="center" noWrap sx={{ color: "text.secondary" }}>
                      {brand}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* ── Testimonials ── */}
            <Box sx={{ mb: 8 }}>
              <SectionHeader title="What People Say" subtitle="Real voices from the ShopSphere community." />
              <Grid container spacing={2.5}>
                {testimonials.map((item, i) => (
                  <Grid item xs={12} md={4} key={item.name}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <HoverCard sx={{ p: 3.5, borderRadius: 5, height: "100%" }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          {[...Array(item.rating)].map((_, j) => (
                            <StarIcon key={j} sx={{ fontSize: 16, color: "#d4af37" }} />
                          ))}
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.75, fontStyle: "italic", mb: 3, fontSize: 14 }}>
                          "{item.text}"
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, background: "linear-gradient(135deg,#059669,#0f766e)", fontSize: 14, fontWeight: 900 }}>
                            {item.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                              {item.name}
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{item.role}</Typography>
                          </Box>
                        </Stack>
                      </HoverCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* ── Seller CTA ── */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 8,
                position: "relative",
                overflow: "hidden",
                background: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(10,25,20,0.7)",
                border: "1px solid",
                borderColor: "divider",
                mb: 8,
              }}
            >
              <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.08), transparent 70%)", top: -150, right: -100, pointerEvents: "none" }} />

              <Grid container spacing={4} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                <Grid item xs={12} lg={5}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200"
                    sx={{ width: "100%", height: { xs: 240, md: 360 }, objectFit: "cover", borderRadius: 5, display: "block", boxShadow: "0 20px 50px rgba(0,0,0,0.18)" }}
                  />
                </Grid>

                <Grid item xs={12} lg={7}>
                  <Chip
                    icon={<WorkspacePremiumIcon sx={{ fontSize: "14px !important" }} />}
                    label="Seller Program"
                    sx={{ bgcolor: "rgba(5,150,105,0.08)", color: "primary.main", fontWeight: 800, mb: 2.5 }}
                  />

                  <Typography sx={{ fontWeight: 900, lineHeight: 1.1, fontSize: { xs: "2rem", md: "2.6rem" }, mb: 2, letterSpacing: "-1px" }}>
                    Sell with a premium storefront.
                  </Typography>

                  <Typography sx={{ color: "text.secondary", fontSize: 15, lineHeight: 1.8, mb: 3 }}>
                    Manage products, track earnings, handle orders and grow your online
                    shop — all in one beautiful dashboard.
                  </Typography>

                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 3.5 }}>
                    {[
                      [<InventoryIcon sx={{ fontSize: 16 }} />, "Manage Products"],
                      [<TrendingUpIcon sx={{ fontSize: 16 }} />, "Track Earnings"],
                      [<VerifiedIcon sx={{ fontSize: 16 }} />, "Verified Status"],
                      [<InsightsOutlinedIcon sx={{ fontSize: 16 }} />, "Growth Insights"],
                    ].map(([icon, text]) => (
                      <Chip key={text} icon={icon} label={text} sx={{ bgcolor: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)", fontWeight: 700 }} />
                    ))}
                  </Stack>

                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 5,
                      py: 1.7,
                      borderRadius: 99,
                      fontWeight: 900,
                      textTransform: "none",
                      fontSize: 15,
                      background: "linear-gradient(90deg,#059669 0%,#d4af37 100%)",
                      boxShadow: "0 12px 30px rgba(212,175,55,0.35)",
                    }}
                  >
                    Start Selling Today
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* ── Trust Bar ── */}
            <Grid container spacing={2.5} sx={{ mb: 8 }}>
              {[
                { icon: <VerifiedIcon />, title: "Verified Sellers", text: "Every vendor is screened and approved." },
                { icon: <PaymentsIcon />, title: "Secure Payments", text: "Encrypted checkout on every order." },
                { icon: <SupportAgentIcon />, title: "24/7 Support", text: "Help whenever you need it, instantly." },
              ].map(({ icon, title, text }) => (
                <Grid item xs={12} md={4} key={title}>
                  <HoverCard sx={{ p: 3, borderRadius: 5, display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Avatar sx={{ bgcolor: "rgba(5,150,105,0.08)", color: "primary.main", width: 46, height: 46, flexShrink: 0 }}>
                      {icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={900}>{title}</Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.3 }}>{text}</Typography>
                    </Box>
                  </HoverCard>
                </Grid>
              ))}
            </Grid>

            {/* ── Final CTA ── */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                p: { xs: 5, md: 7 },
                borderRadius: 6,
                textAlign: "center",
                background: mode === "light" ? "linear-gradient(135deg,#ecfdf5,#f0fdfa)" : "linear-gradient(135deg,#052e21,#0a1f1c)",
                border: "1px solid",
                borderColor: "rgba(5,150,105,0.18)",
                boxShadow: "0 30px 70px rgba(5,150,105,0.07)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: "linear-gradient(135deg,#059669,#d4af37)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  boxShadow: "0 10px 30px rgba(5,150,105,0.25)",
                }}
              >
                <DiamondOutlinedIcon sx={{ color: "white", fontSize: 28 }} />
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: "-1px", mb: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}>
                Ready to start your online shop?
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 500, lineHeight: 1.7 }}>
                Join ShopSphere as a seller and reach thousands of customers with a premium storefront.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mt: 3.5, mb: 4 }}>
                {["Easy product upload", "Seller approval", "Earnings dashboard"].map((item) => (
                  <Chip
                    key={item}
                    icon={<CheckCircleIcon sx={{ fontSize: "14px !important", color: "primary.main" }} />}
                    label={item}
                    sx={{ bgcolor: "rgba(5,150,105,0.06)", fontWeight: 700, fontSize: 13, border: "1px solid", borderColor: "rgba(5,150,105,0.12)" }}
                  />
                ))}
              </Stack>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 6,
                  py: 1.6,
                  borderRadius: 99,
                  fontWeight: 900,
                  textTransform: "none",
                  fontSize: 15,
                  background: "linear-gradient(90deg,#059669,#d4af37)",
                  boxShadow: "0 12px 30px rgba(212,175,55,0.28)",
                }}
              >
                Join ShopSphere Free
              </Button>
            </Paper>

          </Container>

          {/* ── Quick View Modal — REAL DATA ── */}
          <Dialog
            open={quickViewOpen}
            onClose={() => setQuickViewOpen(false)}
            maxWidth="md"
            fullWidth
            TransitionComponent={Zoom}
            PaperProps={{ sx: { borderRadius: 5, overflow: "hidden", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" } }}
          >
            <DialogContent sx={{ p: 0 }}>
              {selectedProduct && (
                <Grid container>
                  <Grid item xs={12} md={5}>
                    <Box
                      component="img"
                      src={getImageUrl(selectedProduct)}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      sx={{ width: "100%", height: { xs: 280, md: "100%" }, maxHeight: { md: 480 }, objectFit: "cover" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ p: { xs: 3, md: 4.5 }, position: "relative" }}>
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 3 }}>
                        <IconButton onClick={() => setQuickViewOpen(false)} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.5px", mb: 1.5 }}>
                        {selectedProduct.name}
                      </Typography>

                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Rating value={selectedProduct.rating || 4.5} precision={0.5} readOnly size="small" />
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : "Out of stock"}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}>
                        {selectedProduct.description}
                      </Typography>

                      <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 3.5 }}>
                        <Typography variant="h5" fontWeight={900} color="secondary.main">
                          ₹{selectedProduct.sellingPrice || selectedProduct.price}
                        </Typography>
                        {(selectedProduct.mrp || selectedProduct.old) ? (
                          <Typography sx={{ color: "text.disabled", textDecoration: "line-through", fontSize: 14 }}>
                            ₹{selectedProduct.mrp || selectedProduct.old}
                          </Typography>
                        ) : null}
                      </Stack>

                      <Divider sx={{ mb: 3 }} />

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingBagIcon />}
                          sx={{
                            borderRadius: 99,
                            py: 1.4,
                            fontWeight: 900,
                            textTransform: "none",
                            background: "linear-gradient(90deg,#059669,#0f766e)",
                            boxShadow: "0 6px 20px rgba(5,150,105,0.22)",
                          }}
                          onClick={() => {
                            handleAddToCart(selectedProduct);
                            setQuickViewOpen(false);
                          }}
                        >
                          Add to Cart
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={isInWishlist(selectedProduct._id) ? <FavoriteIcon sx={{ color: "#d4af37" }} /> : <FavoriteBorderIcon />}
                          onClick={() => toggleWishlist(selectedProduct._id)}
                          sx={{
                            borderRadius: 99,
                            py: 1.4,
                            fontWeight: 900,
                            textTransform: "none",
                            borderColor: "divider",
                            color: isInWishlist(selectedProduct._id) ? "#d4af37" : "text.primary",
                          }}
                        >
                          {isInWishlist(selectedProduct._id) ? "Wishlisted" : "Wishlist"}
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
}