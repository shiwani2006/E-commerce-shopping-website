import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Card,
  CardMedia,
  Chip,
  Stack,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import {
  Search,
  Edit,
  Delete,
  Visibility,
  Add,
  Inventory2Outlined,
  ShoppingBagOutlined,
  CurrencyRupee,
  WarningAmberRounded,
  InfoOutlined,
} from "@mui/icons-material";

const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

// ---------------------------------------------------------------------------
// Design system — a boutique "ledger" aesthetic: deep ink surfaces, a serif
// display face for numerals and headings, brass for the brand accent, and
// wine as the one warm alert color (a nod to the leather-goods catalogue
// this portal is built to manage). One dark, considered palette throughout
// rather than a light theme trying to look "premium" with pastel gradients.
// ---------------------------------------------------------------------------
const c = {
  ink: "#FFFFFF",              // Main page background
  surface: "#FFFFFF",          // Cards, hero, filters
  surfaceRaised: "#F5F5F5",    // Dropdown background
  border: "rgba(0,0,0,0.10)",
  borderStrong: "rgba(0,0,0,0.20)",

  textPrimary: "#222222",
  textSecondary: "#666666",
  textMuted: "#888888",

  brass: "#B5893E",
  brassDim: "rgba(181,137,62,0.14)",

  emerald: "#29966B",
  emeraldDim: "rgba(41,150,107,0.12)",

  wine: "#C0596E",
  wineDim: "rgba(192,89,110,0.14)",

  slate: "#7A8290",
  slateDim: "rgba(122,130,144,0.14)",
};

// 🆕 Approval status → chip color/label mapping
const STATUS_STYLES = {
  Pending: { fg: c.brass, bg: c.brassDim, label: "Pending Review" },
  Active: { fg: c.emerald, bg: c.emeraldDim, label: "Live" },
  Inactive: { fg: c.slate, bg: c.slateDim, label: "Inactive" },
  Rejected: { fg: c.wine, bg: c.wineDim, label: "Rejected" },
};

const fontDisplay = "'Fraunces', serif";
const fontBody = "'Inter', sans-serif";

// Loads the two typefaces once, without touching index.html.
function useDashboardFonts() {
  useEffect(() => {
    if (document.getElementById("vendor-dashboard-fonts")) return;
    const link = document.createElement("link");
    link.id = "vendor-dashboard-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

export default function VendorProducts() {
  const navigate = useNavigate();
  useDashboardFonts();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersReceived: 0,
    revenueEarned: 0,
    lowStockCount: 0,
  });

  const getToken = () => localStorage.getItem("shopsphereToken");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/my-products`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const fetched = res.data.products || [];
      setProducts(fetched);

      const lowStockCount = fetched.filter(
        (p) => p.stock <= (p.lowStockAlert || 5)
      ).length;

      setStats((prev) => ({
        ...prev,
        totalProducts: fetched.length,
        lowStockCount,
      }));
    } catch (error) {
      console.error("Failed to fetch vendor products:", error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/vendor/my-orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const orders = res.data.orders || [];
      const revenueEarned = orders.reduce(
        (sum, o) => sum + (o.myItemsTotal || 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        ordersReceived: orders.length,
        revenueEarned,
      }));
    } catch (error) {
      console.error("Failed to fetch vendor order stats:", error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrderStats()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/products/${product._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      setStats((prev) => ({
        ...prev,
        totalProducts: prev.totalProducts - 1,
      }));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const getImageUrl = (product) => {
    const img = product.images?.[0];
    if (!img) return PLACEHOLDER_IMAGE;
    return img.startsWith("http") ? img : `${SERVER_BASE}${img}`;
  };

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const ledgerItems = [
    {
      label: "Catalogue",
      value: stats.totalProducts,
      icon: <Inventory2Outlined sx={{ fontSize: 16 }} />,
    },
    {
      label: "Orders",
      value: stats.ordersReceived,
      icon: <ShoppingBagOutlined sx={{ fontSize: 16 }} />,
    },
    {
      label: "Revenue",
      value: `₹${stats.revenueEarned.toLocaleString("en-IN")}`,
      icon: <CurrencyRupee sx={{ fontSize: 16 }} />,
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      icon: <WarningAmberRounded sx={{ fontSize: 16 }} />,
      warn: stats.lowStockCount > 0,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: c.ink,
        }}
      >
        <CircularProgress sx={{ color: c.brass }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: c.ink,
        fontFamily: fontBody,
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Hero + ledger */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          borderRadius: "18px",
          bgcolor: c.surface,
          border: `1px solid ${c.border}`,
        }}
      >
        {/* single quiet glow, not a scattered blob field */}
        <Box
          sx={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249, 245, 239, 0.16) 0%, rgba(234, 228, 218, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", p: { xs: 3, md: 5 }, pb: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 600,
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  color: c.textPrimary,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.08,
                }}
              >
                Product Management
              </Typography>

              <Typography
                sx={{ mt: 1.25, color: c.textSecondary, fontSize: "0.95rem" }}
              >
                {stats.totalProducts} product
                {stats.totalProducts !== 1 ? "s" : ""} across your catalogue.
              </Typography>
            </Box>

            <Button
              disableElevation
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/vendor/add-product")}
              sx={{
                textTransform: "none",
                fontFamily: fontBody,
                fontWeight: 600,
                fontSize: "0.9rem",
                px: 2.75,
                py: 1.1,
                borderRadius: "10px",
                color: c.ink,
                bgcolor: c.brass,
                border: `1px solid ${c.brass}`,
                "&:hover": {
                  bgcolor: "#DCB87C",
                  border: "1px solid #DCB87C",
                },
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Box>

        {/* Ledger strip — the signature element: a boarding-pass style row
            of hairline-divided metrics instead of separate colour blocks. */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            borderTop: `1px solid ${c.border}`,
          }}
        >
          {ledgerItems.map((item, i) => (
            <Box
              key={item.label}
              sx={{
                flex: { xs: "1 1 50%", md: "1 1 0" },
                px: { xs: 2.5, md: 4 },
                py: 2.75,
                borderTop: {
                  xs: i >= 2 ? `1px solid ${c.border}` : "none",
                  md: "none",
                },
                borderLeft: {
                  xs: i % 2 === 1 ? `1px solid ${c.border}` : "none",
                  md: i !== 0 ? `1px solid ${c.border}` : "none",
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  color: item.warn ? c.wine : c.brass,
                  mb: 0.75,
                }}
              >
                {item.icon}
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: item.warn ? c.wine : c.textMuted,
                  }}
                >
                  {item.label}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontFamily: fontDisplay,
                  fontWeight: 600,
                  fontSize: { xs: "1.5rem", md: "1.75rem" },
                  color: c.textPrimary,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "14px",
          bgcolor: c.surface,
          border: `1px solid ${c.border}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 19, color: c.textMuted }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "10px",
                  bgcolor: c.ink,
                  color: c.textPrimary,
                  "& fieldset": { borderColor: c.border },
                  "&:hover fieldset": { borderColor: c.borderStrong },
                  "&.Mui-focused fieldset": { borderColor: c.brass },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: c.ink,
                  color: c.textPrimary,
                  "& fieldset": { borderColor: c.border },
                  "&:hover fieldset": { borderColor: c.borderStrong },
                  "&.Mui-focused fieldset": { borderColor: c.brass },
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: c.surfaceRaised,
                      color: c.textPrimary,
                      border: `1px solid ${c.border}`,
                    },
                  },
                },
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Cards */}
      {filteredProducts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: "14px",
            textAlign: "center",
            bgcolor: c.surface,
            border: `1px solid ${c.border}`,
          }}
        >
          <Typography sx={{ color: c.textSecondary, fontSize: "1.02rem" }}>
            {products.length === 0
              ? "You haven't added any products yet."
              : "No products match your search or filter."}
          </Typography>

          {products.length === 0 && (
            <Button
              disableElevation
              sx={{
                mt: 3,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                color: c.ink,
                bgcolor: c.brass,
                "&:hover": { bgcolor: "#DCB87C" },
              }}
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/vendor/add-product")}
            >
              Add Your First Product
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredProducts.map((product) => {
            const inStock = product.stock > (product.lowStockAlert || 5);
            const outOfStock = product.stock === 0;
            const stockTone = outOfStock
              ? { fg: c.wine, bg: c.wineDim, label: "Out of Stock" }
              : inStock
              ? { fg: c.emerald, bg: c.emeraldDim, label: "In Stock" }
              : { fg: c.brass, bg: c.brassDim, label: "Low Stock" };

            // 🆕 approval status chip
            const approvalTone =
              STATUS_STYLES[product.status] || STATUS_STYLES.Pending;

            return (
              <Grid key={product._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "14px",
                    overflow: "hidden",
                    bgcolor: c.surface,
                    border: `1px solid ${c.border}`,
                    transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "rgba(201,164,103,0.35)",
                      boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getImageUrl(product)}
                      alt={product.name}
                      sx={{ objectFit: "cover" }}
                    />

                    {/* 🆕 Approval status badge — top-left */}
                    <Tooltip
                      title={
                        product.status === "Rejected" && product.rejectionReason
                          ? `Reason: ${product.rejectionReason}`
                          : ""
                      }
                      arrow
                    >
                      <Chip
                        label={approvalTone.label}
                        size="small"
                        icon={
                          product.status === "Rejected" ? (
                            <InfoOutlined sx={{ fontSize: "14px !important" }} />
                          ) : undefined
                        }
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          color: approvalTone.fg,
                          bgcolor: "rgba(255,255,255,0.92)",
                          border: `1px solid ${approvalTone.fg}`,
                          "& .MuiChip-icon": { color: approvalTone.fg },
                        }}
                      />
                    </Tooltip>

                    {product.isFeatured && (
                      <Chip
                        label="Featured"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontWeight: 600,
                          fontSize: "0.68rem",
                          color: c.ink,
                          bgcolor: c.brass,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: c.textMuted,
                      }}
                    >
                      {product.category}
                      {product.subCategory ? ` · ${product.subCategory}` : ""}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontFamily: fontDisplay,
                        fontWeight: 600,
                        fontSize: "1.15rem",
                        color: c.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* 🆕 Rejection reason line, shown inline if rejected */}
                    {product.status === "Rejected" && product.rejectionReason && (
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: "0.78rem",
                          color: c.wine,
                          bgcolor: c.wineDim,
                          borderRadius: "6px",
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        {product.rejectionReason}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1} alignItems="baseline" mt={1.5}>
                      <Typography
                        sx={{
                          fontFamily: fontDisplay,
                          fontWeight: 600,
                          fontSize: "1.35rem",
                          color: c.brass,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                      </Typography>

                      {product.mrp > product.sellingPrice && (
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                            color: c.textMuted,
                            textDecoration: "line-through",
                          }}
                        >
                          ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </Typography>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                    >
                      <Typography sx={{ color: c.textSecondary, fontSize: "0.85rem" }}>
                        Stock: <b style={{ color: c.textPrimary }}>{product.stock}</b>
                      </Typography>

                      <Chip
                        size="small"
                        label={stockTone.label}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          bgcolor: stockTone.bg,
                          color: stockTone.fg,
                        }}
                      />
                    </Stack>

                    <Box sx={{ borderTop: `1px solid ${c.border}`, mt: 2, pt: 1.5 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/vendor/product/${product._id}`)
                            }
                            sx={{
                              border: `1px solid ${c.border}`,
                              borderRadius: "9px",
                              color: c.textSecondary,
                              "&:hover": { borderColor: c.borderStrong, color: c.textPrimary },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/vendor/edit-product/${product._id}`)
                            }
                            sx={{
                              border: `1px solid ${c.border}`,
                              borderRadius: "9px",
                              color: c.brass,
                              "&:hover": { borderColor: "rgba(201,164,103,0.45)" },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(product)}
                            sx={{
                              border: `1px solid ${c.border}`,
                              borderRadius: "9px",
                              color: c.wine,
                              "&:hover": { borderColor: "rgba(192,89,110,0.45)" },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}