import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("shopsphereToken");

        const res = await fetch("http://localhost:5000/api/coupons/active", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setErr(data.message || "Failed to load offers");
          return;
        }

        setCoupons(data.coupons);
      } catch (error) {
        setErr("Backend not connected. Please check server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 1500);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 6,
          background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight={900}>
          Offers & Coupons
        </Typography>
        <Typography>Grab these deals before they expire!</Typography>
      </Paper>

      {err && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: "#fee2e2", color: "#dc2626" }}>
          {err}
        </Paper>
      )}

      {coupons.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 5, textAlign: "center" }}>
          <Typography fontWeight={800}>No active offers right now</Typography>
          <Typography sx={{ color: "#6b647a" }}>Check back soon!</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {coupons.map((coupon) => (
            <Grid key={coupon._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 5,
                  border: "2px dashed #ec4899",
                  transition: ".3s",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>
                    <LocalOfferIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={900}>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                  </Typography>
                </Stack>

                {coupon.minOrderValue > 0 && (
                  <Typography sx={{ color: "#6b647a", fontSize: 14, mb: 1 }}>
                    Min order ₹{coupon.minOrderValue}
                  </Typography>
                )}

                <Typography sx={{ color: "#6b647a", fontSize: 13, mb: 2 }}>
                  Valid till{" "}
                  {new Date(coupon.expiryDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip label={coupon.code} sx={{ fontWeight: 900 }} />

                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(coupon.code)}
                  >
                    {copiedCode === coupon.code ? "Copied!" : "Copy"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}