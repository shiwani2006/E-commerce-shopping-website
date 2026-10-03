import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedIcon from "@mui/icons-material/Verified";

import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const API_BASE_URL = "http://localhost:5000/api";

export default function Wishlist() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { refreshCart } = useCart();

  const [activeCategory, setActiveCategory] = useState("All");
  const [message, setMessage] = useState("");
  const [movingId, setMovingId] = useState(null);

  const categories = ["All", ...new Set(wishlistItems.map((item) => item.category))];

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return wishlistItems;
    return wishlistItems.filter((item) => item.category === activeCategory);
  }, [wishlistItems, activeCategory]);

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = wishlistItems.reduce((sum, item) => sum + (item.old - item.price), 0);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      setMovingId(item.id);
      const token = localStorage.getItem("shopsphereToken");

      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.id, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to add to cart");
      }

      await refreshCart();
      await removeFromWishlist(item.id);

      setMessage(`${item.name} moved to cart ✅`);
      setTimeout(() => setMessage(""), 2200);
    } catch (error) {
      setMessage(error.message || "Something went wrong");
      setTimeout(() => setMessage(""), 2200);
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* HERO */}
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: { xs: 3, md: 3.5 },
          borderRadius: 6,
          background: "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 28px 75px rgba(236,72,153,.28)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -90,
            top: -90,
            width: 300,
            height: 300,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.14)",
          }}
        />

        <Grid container spacing={2.5} alignItems="center" sx={{ position: "relative", zIndex: 2 }}>
          <Grid item xs={12} md={8}>
            <Chip
              icon={<FavoriteIcon />}
              label="Premium Wishlist"
              sx={{
                bgcolor: "rgba(255,255,255,.22)",
                color: "white",
                fontWeight: 900,
                mb: 2,
              }}
            />

            <Typography variant="h3" fontWeight={900}>
              Saved For Later
            </Typography>

            <Typography sx={{ mt: 1, opacity: 0.92, maxWidth: 760 }}>
              Your favorite products are saved here. Move them to cart whenever you are ready.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.18)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(255,255,255,.22)" }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Box>
                  <Typography fontWeight={900}>Wishlist Value</Typography>
                  <Typography sx={{ opacity: 0.9 }}>₹{totalValue}</Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={72}
                sx={{
                  mt: 2,
                  height: 10,
                  borderRadius: 99,
                  bgcolor: "rgba(255,255,255,.25)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    bgcolor: "white",
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {message && (
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            p: 2,
            borderRadius: 4,
            bgcolor: "#dcfce7",
            color: "#16a34a",
            fontWeight: 900,
          }}
        >
          {message}
        </Paper>
      )}

      {wishlistItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 5,
            textAlign: "center",
            bgcolor: "rgba(255,255,255,.9)",
          }}
        >
          <FavoriteIcon sx={{ fontSize: 50, color: "#ec4899", mb: 1 }} />
          <Typography variant="h6" fontWeight={900}>
            Your wishlist is empty
          </Typography>
          <Typography sx={{ color: "#6b647a", mt: 0.5 }}>
            Start adding products you love ❤️
          </Typography>
        </Paper>
      ) : (
        <>
          {/* CATEGORY FILTERS */}
          <Paper
            elevation={0}
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.9)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 14px 38px rgba(124,58,237,.1)",
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    px: 1,
                    fontWeight: 900,
                    bgcolor: activeCategory === cat ? "#7c3aed" : "#f3e8ff",
                    color: activeCategory === cat ? "white" : "#7c3aed",
                    "&:hover": {
                      bgcolor: activeCategory === cat ? "#6d28d9" : "#eadcff",
                    },
                  }}
                />
              ))}
            </Stack>
          </Paper>

          <Grid container spacing={1.5} alignItems="stretch">
            {/* PRODUCTS */}
            <Grid item xs={12} lg={8.4}>
              <Grid container spacing={1.5}>
                {filteredItems.map((item) => (
                  <Grid item xs={12} sm={6} xl={4} key={item.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: 5,
                        bgcolor: "rgba(255,255,255,.92)",
                        backdropFilter: "blur(18px)",
                        border: "1px solid rgba(255,255,255,.95)",
                        boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                        transition: ".3s",
                        "&:hover": {
                          transform: "translateY(-7px)",
                          boxShadow: "0 24px 60px rgba(236,72,153,.16)",
                        },
                        "&:hover img": {
                          transform: "scale(1.06)",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <Box
                          component="img"
                          src={item.img}
                          sx={{
                            width: "100%",
                            height: 235,
                            objectFit: "cover",
                            transition: ".35s",
                          }}
                        />

                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "rgba(255,255,255,.94)",
                            color: "#7c3aed",
                            fontWeight: 900,
                          }}
                        />

                        <Avatar
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            bgcolor: "rgba(255,255,255,.94)",
                            color: "#ec4899",
                            boxShadow: "0 8px 20px rgba(0,0,0,.12)",
                          }}
                        >
                          <FavoriteIcon />
                        </Avatar>
                      </Box>

                      <Box sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={900} noWrap>
                              {item.name}
                            </Typography>
                            <Typography sx={{ color: "#6b647a", fontSize: 14 }} noWrap>
                              {item.brand}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                          <Rating value={item.rating} precision={0.5} readOnly size="small" />
                          <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                            {item.rating}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 1 }}>
                          <Typography variant="h6" fontWeight={900} color="#ec4899">
                            ₹{item.price}
                          </Typography>
                          <Typography sx={{ color: "#9ca3af", textDecoration: "line-through" }}>
                            ₹{item.old}
                          </Typography>
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                          <Button
                            fullWidth
                            disabled={movingId === item.id}
                            startIcon={<ShoppingBagIcon />}
                            onClick={() => handleMoveToCart(item)}
                            sx={{
                              borderRadius: 99,
                              py: 1.05,
                              textTransform: "none",
                              fontWeight: 900,
                              color: "white",
                              background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                              boxShadow: "0 14px 32px rgba(236,72,153,.22)",
                            }}
                          >
                            {movingId === item.id ? "Moving..." : "Cart"}
                          </Button>

                          <Button
                            fullWidth
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemove(item.id)}
                            sx={{
                              borderRadius: 99,
                              py: 1.05,
                              textTransform: "none",
                              fontWeight: 900,
                              color: "#ec4899",
                              bgcolor: "#fff1f7",
                              "&:hover": { bgcolor: "#ffe4f0" },
                            }}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* RIGHT PANEL */}
            <Grid item xs={12} lg={3.6}>
              <Stack spacing={1.5} sx={{ position: { lg: "sticky" }, top: 96 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 5,
                    bgcolor: "rgba(255,255,255,.92)",
                    boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                  }}
                >
                  <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>
                    Wishlist Summary
                  </Typography>

                  {[
                    ["Saved Items", wishlistItems.length],
                    ["Estimated Value", `₹${totalValue}`],
                    ["Total Savings", `₹${totalSavings}`],
                  ].map(([label, value]) => (
                    <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1.1 }}>
                      <Typography sx={{ color: "#6b647a" }}>{label}</Typography>
                      <Typography fontWeight={900} color="#ec4899">
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 5,
                    background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                    color: "white",
                    boxShadow: "0 24px 65px rgba(236,72,153,.22)",
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", mb: 1.5 }}>
                    <LocalOfferIcon />
                  </Avatar>

                  <Typography variant="h6" fontWeight={900}>
                    Wishlist Offer
                  </Typography>
                  <Typography sx={{ mt: 1, opacity: 0.92 }}>
                    Move 2 items to cart and use SHOPS10 to get ₹200 off.
                  </Typography>

                  <Button
                    sx={{
                      mt: 2,
                      bgcolor: "white",
                      color: "#7c3aed",
                      borderRadius: 99,
                      px: 3,
                      fontWeight: 900,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#fff7fb" },
                    }}
                  >
                    Claim Offer
                  </Button>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 5,
                    bgcolor: "#fff7fb",
                    boxShadow: "0 16px 45px rgba(124,58,237,.1)",
                  }}
                >
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={900}>Smart Picks</Typography>
                      <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                        Prices may drop soon on saved items.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 5,
                    bgcolor: "rgba(255,255,255,.92)",
                    boxShadow: "0 16px 45px rgba(124,58,237,.1)",
                  }}
                >
                  {[
                    [<VerifiedIcon />, "Verified sellers only"],
                    [<ShoppingBagIcon />, "Easy move to cart"],
                    [<FavoriteIcon />, "Saved safely"],
                  ].map(([icon, text]) => (
                    <Stack key={text} direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.3 }}>
                      <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed", width: 34, height: 34 }}>
                        {icon}
                      </Avatar>
                      <Typography fontWeight={800} color="#5b5470">
                        {text}
                      </Typography>
                    </Stack>
                  ))}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}