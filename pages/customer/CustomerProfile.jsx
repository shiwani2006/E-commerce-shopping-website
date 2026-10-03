import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DiamondIcon from "@mui/icons-material/Diamond";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddCardIcon from "@mui/icons-material/AddCard";
import CloseIcon from "@mui/icons-material/Close";

import {
  getProfileApi,
  updateProfileApi,
  updateAddressApi,
} from "../../api/profileApi";
import { getMyOrders } from "../../api/ordersApi";
import { useWishlist } from "../../context/WishlistContext";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
};

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const [edit, setEdit] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [address, setAddress] = useState("");

  const [ordersCount, setOrdersCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  // ✅ Fetch real profile from backend
  useEffect(() => {
    const token = localStorage.getItem("shopsphereToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getProfileApi();
        if (data.success) {
          setProfile(data.profile);
          setAddress(data.address || "");
        } else {
          setSaveStatus("error");
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        setSaveStatus("error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // ✅ Fetch real orders count + delivered count
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getMyOrders();
        if (data.success && Array.isArray(data.orders)) {
          setOrdersCount(data.orders.length);

          const delivered = data.orders.filter(
            (order) =>
              (order.status || "").toLowerCase() === "delivered"
          ).length;

          setDeliveredCount(delivered);
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
      }
    };

    loadOrders();
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const data = await updateProfileApi(profile);
      if (data.success) {
        setProfile(data.profile);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setSaveStatus("error");
    }
    setEdit(false);
    setTimeout(() => setSaveStatus(""), 2500);
  };

  const handleAddressSave = async () => {
    try {
      const data = await updateAddressApi(address);
      if (data.success) {
        setAddress(data.address);
      }
    } catch (error) {
      console.error("Update address error:", error);
    }
    setAddressOpen(false);
  };

  const cardHover = {
    transition: ".3s",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 24px 60px rgba(236,72,153,.16)",
    },
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ color: "#7c3aed", fontWeight: 700, fontSize: 18 }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  const filledFields = Object.values(profile).filter(Boolean).length;

  return (
    <Box>
      {/* SAVE STATUS BANNER */}
      {saveStatus && (
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: 4,
            bgcolor:
              saveStatus === "saved"
                ? "#f0fdf4"
                : saveStatus === "error"
                ? "#fff1f2"
                : "#fff7fb",
            border: `1px solid ${
              saveStatus === "saved"
                ? "#86efac"
                : saveStatus === "error"
                ? "#fca5a5"
                : "#e9d5ff"
            }`,
            textAlign: "center",
          }}
        >
          <Typography
            fontWeight={800}
            sx={{
              color:
                saveStatus === "saved"
                  ? "#16a34a"
                  : saveStatus === "error"
                  ? "#dc2626"
                  : "#7c3aed",
            }}
          >
            {saveStatus === "saving"
              ? "Saving your profile..."
              : saveStatus === "saved"
              ? "✅ Profile saved successfully!"
              : "⚠️ Could not update profile. Try again."}
          </Typography>
        </Paper>
      )}

      {/* HERO */}
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: { xs: 3, md: 3.5 },
          borderRadius: 6,
          background: "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
          color: "white",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 28px 75px rgba(236,72,153,.24)",
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
            bgcolor: "rgba(255,255,255,.13)",
          }}
        />

        <Grid
          container
          spacing={2.5}
          alignItems="center"
          sx={{ position: "relative", zIndex: 2 }}
        >
          <Grid item xs={12} md={7.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Avatar
                sx={{
                  width: 94,
                  height: 94,
                  fontSize: 40,
                  fontWeight: 900,
                  background: "rgba(255,255,255,.22)",
                  border: "3px solid rgba(255,255,255,.32)",
                }}
              >
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>

              <Box>
                <Chip
                  icon={<DiamondIcon />}
                  label="Verified Shopper"
                  sx={{
                    mb: 1,
                    bgcolor: "rgba(255,255,255,.22)",
                    color: "white",
                    fontWeight: 900,
                  }}
                />

                <Typography variant="h3" fontWeight={900}>
                  {profile.name || "Your Name"}
                </Typography>

                <Typography sx={{ opacity: 0.92 }}>
                  Manage your profile, address and account preferences.
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4.5}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.18)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,.22)",
              }}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(255,255,255,.22)" }}>
                  <AutoAwesomeIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={900}>Profile Completion</Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    {filledFields}/5 fields filled
                  </Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={(filledFields / 5) * 100}
                sx={{
                  mt: 1.7,
                  height: 10,
                  borderRadius: 99,
                  bgcolor: "rgba(255,255,255,.25)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "white",
                    borderRadius: 99,
                  },
                }}
              />

              <Button
                onClick={() => setEdit(true)}
                fullWidth
                sx={{
                  mt: 2,
                  borderRadius: 99,
                  bgcolor: "white",
                  color: "#7c3aed",
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#fff7fb" },
                }}
              >
                Complete Profile
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* STATS — ab sirf real data */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {[
          ["Orders", ordersCount, <ShoppingBagIcon />, "/customer/orders"],
          ["Wishlist", wishlistItems.length, <FavoriteIcon />, "/customer/wishlist"],
          ["Delivered", deliveredCount, <LocalShippingIcon />, "/customer/orders"],
        ].map(([title, value, icon, path]) => (
          <Grid item xs={12} sm={4} key={title}>
            <Paper
              onClick={() => navigate(path)}
              elevation={0}
              sx={{
                p: 2.1,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.92)",
                cursor: "pointer",
                boxShadow: "0 14px 40px rgba(124,58,237,.09)",
                ...cardHover,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography sx={{ color: "#6b647a", fontWeight: 800 }}>
                    {title}
                  </Typography>
                  <Typography variant="h5" fontWeight={900}>
                    {value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>
                  {icon}
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* MAIN ROW */}
      <Grid container spacing={1.5}>
        {/* PERSONAL */}
        <Grid item xs={12} lg={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
              ...cardHover,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Personal Information
                </Typography>
                <Typography sx={{ color: "#6b647a" }}>
                  Manage your account details.
                </Typography>
              </Box>

              <Button
                startIcon={edit ? <SaveIcon /> : <EditIcon />}
                onClick={edit ? handleSave : () => setEdit(true)}
                sx={{
                  borderRadius: 99,
                  px: 3,
                  py: 1.1,
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  color: "white",
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                {edit ? "Save Changes" : "Edit Profile"}
              </Button>
            </Stack>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NAME"
                  value={profile.name}
                  disabled={!edit}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      bgcolor: edit ? "#fff7fb" : "#fff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="EMAIL"
                  value={profile.email}
                  disabled
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      bgcolor: "#fff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PHONE"
                  value={profile.phone}
                  disabled={!edit}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      bgcolor: edit ? "#fff7fb" : "#fff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CITY"
                  value={profile.city}
                  disabled={!edit}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      bgcolor: edit ? "#fff7fb" : "#fff",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="STATE"
                  value={profile.state}
                  disabled={!edit}
                  onChange={(e) =>
                    setProfile({ ...profile, state: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 4,
                      bgcolor: edit ? "#fff7fb" : "#fff",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* VERIFIED */}
        <Grid item xs={12} lg={4.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              color: "white",
              boxShadow: "0 24px 60px rgba(236,72,153,.2)",
              ...cardHover,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)" }}>
                <VerifiedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Account Status
                </Typography>
                <Typography sx={{ opacity: 0.92 }}>
                  Active & secure
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 2 }}
            >
              {["Verified Email"].map((item) => (
                <Chip
                  key={item}
                  label={item}
                  sx={{
                    bgcolor: "rgba(255,255,255,.22)",
                    color: "white",
                    fontWeight: 900,
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* HORIZONTAL CARDS */}
      <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
        {/* ADDRESS */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
              ...cardHover,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                <LocationOnIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Saved Address
                </Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                  Default delivery location
                </Typography>
              </Box>
            </Stack>

            <Paper
              elevation={0}
              sx={{ mt: 2, p: 2, borderRadius: 4, bgcolor: "#fff7fb" }}
            >
              <Typography fontWeight={900}>Home Address</Typography>
              <Typography sx={{ mt: 1, color: "#6b647a" }}>
                {address || "No address saved yet"}
              </Typography>
            </Paper>

            <Button
              fullWidth
              onClick={() => setAddressOpen(true)}
              sx={{
                mt: 2,
                borderRadius: 99,
                py: 1.05,
                bgcolor: "#f3e8ff",
                color: "#7c3aed",
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: "#eadcff" },
              }}
            >
              Manage Address
            </Button>
          </Paper>
        </Grid>

        {/* SECURITY — UI only, backend abhi connect nahi hai */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
              ...cardHover,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={900}>
                Security Preferences
              </Typography>
              <Chip
                label="Coming soon"
                size="small"
                sx={{ bgcolor: "#f3e8ff", color: "#7c3aed", fontWeight: 800 }}
              />
            </Stack>

            <Stack spacing={1.4} sx={{ mt: 2 }}>
              {[
                ["Two Factor Authentication", <ShieldIcon />],
                ["Email Notifications", <NotificationsIcon />],
                ["Login Alerts", <LockIcon />],
              ].map(([title, icon]) => (
                <Paper
                  key={title}
                  elevation={0}
                  sx={{ p: 1.4, borderRadius: 4, bgcolor: "#fff7fb" }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: "#f3e8ff",
                          color: "#ec4899",
                        }}
                      >
                        {icon}
                      </Avatar>
                      <Typography fontWeight={800} fontSize={14}>
                        {title}
                      </Typography>
                    </Stack>
                    <Switch disabled />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* CARD — abhi koi payment backend nahi hai */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
              ...cardHover,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                <CreditCardIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={900}>
                Saved Card
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 3,
                borderRadius: 5,
                bgcolor: "#fff7fb",
                textAlign: "center",
              }}
            >
              <AddCardIcon sx={{ fontSize: 34, color: "#c4b5fd", mb: 1 }} />
              <Typography sx={{ color: "#6b647a", fontWeight: 700 }}>
                No payment method saved yet
              </Typography>
            </Paper>

            <Button
              fullWidth
              onClick={() => navigate("/customer/payments")}
              sx={{
                mt: 2,
                borderRadius: 99,
                py: 1.05,
                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                color: "white",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              Add Payment Method
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* LAST ROW */}
      <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
        {[
          {
            icon: <LocalShippingIcon />,
            title: "Orders",
            text: `${ordersCount} order${ordersCount === 1 ? "" : "s"} placed`,
            path: "/customer/orders",
          },
          {
            icon: <PaymentIcon />,
            title: "Payments",
            text: "Manage payment methods",
            path: "/customer/payments",
          },
          {
            icon: <SecurityIcon />,
            title: "Account",
            text: "Secure & verified",
            path: "/customer/profile",
          },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Paper
              onClick={() => navigate(item.path)}
              elevation={0}
              sx={{
                p: 2.3,
                height: "100%",
                borderRadius: 5,
                bgcolor: "#fff7fb",
                cursor: "pointer",
                boxShadow: "0 14px 40px rgba(124,58,237,.08)",
                ...cardHover,
              }}
            >
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899", mb: 1 }}>
                {item.icon}
              </Avatar>
              <Typography fontWeight={900}>{item.title}</Typography>
              <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                {item.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ADDRESS DIALOG */}
      <Dialog
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            bgcolor: "rgba(255,255,255,.96)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Manage Address
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                Edit your default delivery address.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setAddressOpen(false)}
              sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "#fff7fb",
              },
            }}
          />

          <Button
            fullWidth
            onClick={handleAddressSave}
            sx={{
              mt: 2,
              borderRadius: 99,
              py: 1.2,
              background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
              color: "white",
              fontWeight: 900,
              textTransform: "none",
            }}
          >
            Save Address
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}