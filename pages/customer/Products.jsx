import { useMemo, useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Rating,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { getAllProducts } from "../../api/productApi";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

// 🔴 IMPORTANT: change this when you deploy your backend (Render/Railway/VPS/etc).
const API_BASE_URL =
  import.meta?.env?.VITE_API_URL || "http://localhost:5000";

const priceRanges = [
  { label: "₹0+", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 499 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "₹2000+", min: 2000, max: Infinity },
];

// Renders the product image, falls back to "No Image" box
function ProductImage({ product }) {
  const [imgError, setImgError] = useState(false);

  const rawPath = product.images?.[0];
  const imageUrl = rawPath
    ? rawPath.startsWith("http")
      ? rawPath
      : `${API_BASE_URL}${rawPath}`
    : null;

  if (!imageUrl || imgError) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 220, md: 250 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          bgcolor: "#f3e8ff",
          color: "#9333ea",
        }}
      >
        <ImageNotSupportedIcon sx={{ fontSize: 28, opacity: 0.6 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
          No Image
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={product.name}
      onError={() => setImgError(true)}
      sx={{
        width: "100%",
        height: { xs: 220, md: 250 },
        objectFit: "cover",
        transition: ".35s",
      }}
    />
  );
}

export default function Products() {
  const { refreshCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [priceRange, setPriceRange] = useState("₹0+");
  const [sort, setSort] = useState("popular");

  const [sourceProducts, setSourceProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  const [applied, setApplied] = useState({
    category: "All",
    brand: "All",
    priceRange: "₹0+",
    sort: "popular",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getAllProducts();
        if (data.success && Array.isArray(data.products)) {
          setSourceProducts(data.products);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Dynamically build filter options from real backend data
  const categories = useMemo(() => {
    const unique = [...new Set(sourceProducts.map((p) => p.category).filter(Boolean))];
    return ["All", ...unique];
  }, [sourceProducts]);

  const brands = useMemo(() => {
    const unique = [...new Set(sourceProducts.map((p) => p.brand).filter(Boolean))];
    return ["All", ...unique];
  }, [sourceProducts]);

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
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Could not add item to cart");
    }
  };

  const handleToggleWishlist = async (product) => {
    const productId = product._id;
    if (!productId) return; // safety: no real id, nothing to toggle

    try {
      const token = localStorage.getItem("shopsphereToken");
      if (!token) {
        alert("Please login first!");
        return;
      }

      setWishlistLoadingId(productId);

      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Wishlist update failed:", error);
      alert("Wishlist update failed");
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const range = priceRanges.find((p) => p.label === applied.priceRange);

    let result = sourceProducts.filter((product) => {
      const categoryMatch =
        applied.category === "All" || product.category === applied.category;

      const brandMatch =
        applied.brand === "All" || product.brand === applied.brand;

      const currentPrice = product.sellingPrice || product.price || 0;

      const priceMatch =
        currentPrice >= range.min && currentPrice <= range.max;

      return categoryMatch && brandMatch && priceMatch;
    });

    if (applied.sort === "low")
      result = [...result].sort(
        (a, b) => (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0)
      );

    if (applied.sort === "high")
      result = [...result].sort(
        (a, b) => (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0)
      );

    if (applied.sort === "rating")
      result = [...result].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));

    return result;
  }, [applied, sourceProducts]);

  const applyFilters = () => {
    setApplied({ category, brand, priceRange, sort });
  };

  const resetFilters = () => {
    setCategory("All");
    setBrand("All");
    setPriceRange("₹0+");
    setSort("popular");
    setApplied({
      category: "All",
      brand: "All",
      priceRange: "₹0+",
      sort: "popular",
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 8% 8%, #fbcfe8 0, transparent 26%), radial-gradient(circle at 90% 5%, #ddd6fe 0, transparent 30%), radial-gradient(circle at 70% 90%, #bfdbfe 0, transparent 26%), linear-gradient(135deg,#fff7fb,#f7f0ff,#eef7ff)",
        py: 4,
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3, lg: 4 } }}>
        {/* Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 3, md: 4 },
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(135deg,#8b5cf6,#ec4899,#fb7185)",
            color: "white",
            boxShadow: "0 26px 70px rgba(236,72,153,.25)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Chip
                icon={<LocalFireDepartmentIcon />}
                label="Premium Collection 2026"
                sx={{
                  bgcolor: "rgba(255,255,255,.22)",
                  color: "white",
                  fontWeight: 900,
                  mb: 2,
                }}
              />

              <Typography
                variant="h2"
                fontWeight={900}
                sx={{ fontSize: { xs: "2.2rem", md: "3.4rem" }, lineHeight: 1 }}
              >
                ShopSphere Products
              </Typography>

              <Typography sx={{ mt: 1.5, maxWidth: 680, opacity: 0.92 }}>
                {`${filteredProducts.length} Products Available with premium UI, filters and backend integration.`}
              </Typography>
            </Box>

            <Chip
              icon={<TuneIcon />}
              label={loading ? "Loading..." : `${filteredProducts.length} Products`}
              sx={{ bgcolor: "white", color: "#7c3aed", fontWeight: 900, px: 2, py: 2.5 }}
            />
          </Stack>
        </Paper>

        {/* Filters Bar */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 5,
            bgcolor: "rgba(255,255,255,.82)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,.9)",
            boxShadow: "0 16px 40px rgba(124,58,237,.1)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterListIcon sx={{ color: "#7c3aed" }} />
              <Typography fontWeight={900}>Filters</Typography>
            </Stack>

            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", flex: 1, pb: 0.5 }}>
              {categories.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  clickable
                  onClick={() => setCategory(item)}
                  sx={{
                    flexShrink: 0,
                    bgcolor: category === item ? "#7c3aed" : "#f3e8ff",
                    color: category === item ? "white" : "#7c3aed",
                    fontWeight: 900,
                  }}
                />
              ))}
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Select
                size="small"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                sx={{ minWidth: 150, borderRadius: 99, bgcolor: "#fff7fb", fontWeight: 800 }}
              >
                {brands.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                sx={{ minWidth: 155, borderRadius: 99, bgcolor: "#fff7fb", fontWeight: 800 }}
              >
                {priceRanges.map((range) => (
                  <MenuItem key={range.label} value={range.label}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={{ minWidth: 160, borderRadius: 99, bgcolor: "#fff7fb", fontWeight: 800 }}
              >
                <MenuItem value="popular">Popular</MenuItem>
                <MenuItem value="low">Low to High</MenuItem>
                <MenuItem value="high">High to Low</MenuItem>
                <MenuItem value="rating">Top Rated</MenuItem>
              </Select>

              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{
                  borderRadius: 99,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 900,
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                }}
              >
                Apply
              </Button>

              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={resetFilters}
                sx={{
                  borderRadius: 99,
                  px: 2.2,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#7c3aed",
                  borderColor: "#c4b5fd",
                  bgcolor: "rgba(255,255,255,.6)",
                }}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Product Grid */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#7c3aed", fontWeight: 700, fontSize: 18 }}>
              Loading products...
            </Typography>
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#7c3aed", fontWeight: 700, fontSize: 18 }}>
              No products found. Try adjusting filters.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredProducts.map((product) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={product._id}>
                <Paper
                  elevation={0}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,.84)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,.95)",
                    boxShadow: "0 12px 35px rgba(124,58,237,.10)",
                    transition: ".3s",
                    position: "relative",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 22px 55px rgba(236,72,153,.16)",
                    },
                    "&:hover img": { transform: "scale(1.05)" },
                    "&:hover .hoverBtns": { opacity: 1, transform: "translateY(0px)" },
                  }}
                >
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <ProductImage product={product} />

                    <Avatar
                      onClick={() => handleToggleWishlist(product)}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 34,
                        height: 34,
                        bgcolor: "rgba(255,255,255,.95)",
                        color: "#ec4899",
                        boxShadow: "0 6px 18px rgba(0,0,0,.12)",
                        cursor: wishlistLoadingId === product._id ? "wait" : "pointer",
                        opacity: wishlistLoadingId === product._id ? 0.6 : 1,
                      }}
                    >
                      {isInWishlist(product._id) ? (
                        <FavoriteIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                      )}
                    </Avatar>

                    <Stack
                      className="hoverBtns"
                      sx={{
                        position: "absolute",
                        left: 12,
                        right: 12,
                        bottom: 12,
                        opacity: 0,
                        transform: "translateY(20px)",
                        transition: ".3s",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingBagIcon />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          borderRadius: 99,
                          py: 1,
                          textTransform: "none",
                          fontWeight: 900,
                          fontSize: 13,
                          background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          fontWeight={900}
                          noWrap
                          sx={{ fontSize: 17, color: "#24143f", lineHeight: 1.2 }}
                        >
                          {product.name}
                        </Typography>

                        <Typography noWrap sx={{ color: "#6b647a", fontSize: 13, mt: 0.4 }}>
                          {product.brand}
                        </Typography>
                      </Box>

                      <Chip
                        label={product.category}
                        size="small"
                        sx={{
                          bgcolor: "#f3e8ff",
                          color: "#7c3aed",
                          fontWeight: 800,
                          fontSize: 11,
                          maxWidth: 90,
                        }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1 }}>
                      <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" />
                      <Typography sx={{ fontSize: 12, color: "#6b647a" }}>
                        {product.rating || 4.5}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Typography fontWeight={900} sx={{ color: "#ec4899", fontSize: 21 }}>
                        ₹{product.sellingPrice || product.price}
                      </Typography>

                      {product.mrp || product.old ? (
                        <Typography
                          sx={{ color: "#9ca3af", textDecoration: "line-through", fontSize: 14 }}
                        >
                          ₹{product.mrp || product.old}
                        </Typography>
                      ) : null}
                    </Stack>

                    {product.discount ? (
                      <Chip
                        label={`${product.discount}% OFF`}
                        size="small"
                        sx={{ mt: 1, bgcolor: "#ecfdf5", color: "#059669", fontWeight: 800 }}
                      />
                    ) : null}

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 13,
                        fontWeight: 700,
                        color: product.stock > 0 ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out Of Stock"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}