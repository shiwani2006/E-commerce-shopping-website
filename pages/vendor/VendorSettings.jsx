import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  TextField,
  Button,
  Divider,
  Avatar,
  Grid,
  Snackbar,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tab,
  Tabs,
  CircularProgress,
} from "@mui/material";

import SettingsIcon        from "@mui/icons-material/Settings";
import SecurityIcon        from "@mui/icons-material/Security";
import SaveIcon            from "@mui/icons-material/Save";
import DarkModeIcon        from "@mui/icons-material/DarkMode";
import LightModeIcon       from "@mui/icons-material/LightMode";
import NotificationsIcon   from "@mui/icons-material/Notifications";
import PersonIcon          from "@mui/icons-material/Person";
import LanguageIcon        from "@mui/icons-material/Language";
import DeleteForeverIcon   from "@mui/icons-material/DeleteForever";
import CameraAltIcon       from "@mui/icons-material/CameraAlt";
import VisibilityIcon      from "@mui/icons-material/Visibility";
import VisibilityOffIcon   from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import ShieldIcon          from "@mui/icons-material/Shield";
import StorefrontIcon      from "@mui/icons-material/Storefront";
import PaletteIcon         from "@mui/icons-material/Palette";

/* =========================================================================
   BACKEND CONFIG — same pattern as VendorOrders.jsx / MyShop.jsx / VendorEarnings.jsx
   ========================================================================= */
const API_BASE_URL = "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("shopsphereToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders() });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `GET ${path} failed`);
  return json;
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `PUT ${path} failed`);
  return json;
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `DELETE ${path} failed`);
  return json;
}

/* 🎨 Purely local, cosmetic preference — no backend needed for these
   (dark mode / language / currency / timezone don't affect business data) */
const LOCAL_APPEARANCE_KEY = "shopsphere-appearance-v1";

/* ─── password strength ─── */
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "grey" };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "error"   },
    { label: "Weak",      color: "error"   },
    { label: "Fair",      color: "warning" },
    { label: "Good",      color: "info"    },
    { label: "Strong",    color: "success" },
  ];
  return { score, ...map[score] };
};

/* ─── tab list — Sessions removed (was fake/mock data, no real device
   tracking infra exists) ─── */
const TABS = [
  { id: "profile",       label: "Profile",       icon: <PersonIcon fontSize="small" />        },
  { id: "appearance",    label: "Appearance",     icon: <PaletteIcon fontSize="small" />       },
  { id: "notifications", label: "Notifications",  icon: <NotificationsIcon fontSize="small" /> },
  { id: "security",      label: "Security",       icon: <SecurityIcon fontSize="small" />      },
  { id: "store",         label: "Store",          icon: <StorefrontIcon fontSize="small" />    },
  { id: "danger",        label: "Danger Zone",    icon: <DeleteForeverIcon fontSize="small" /> },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Settings = () => {

  /* ── backend-connected state ── */
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", website: "", bio: "", avatarUrl: "",
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: "", gstNumber: "", panNumber: "", bankAccountNumber: "",
    ifscCode: "", isStoreVisible: true,
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailNotif: true, pushNotif: false, smsNotif: false,
    orderNotif: true, reviewNotif: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  /* 🎨 Local-only appearance prefs */
  const [appearance, setAppearance] = useState({
    darkMode: false, language: "en", currency: "INR", timezone: "Asia/Kolkata",
  });

  /* ── UI state ── */
  const [toast,        setToast]        = useState({ open: false, msg: "", severity: "success" });
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [dangerDialog, setDangerDialog] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [activeTab,    setActiveTab]    = useState("profile");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [pwSaving,     setPwSaving]     = useState(false);

  const pwStrength = getPasswordStrength(security.newPassword);

  /* ── load everything from backend on mount ── */
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [accountRes, shopRes] = await Promise.all([
        apiGet("/vendor/settings/profile"),
        apiGet("/vendor/profile"),
      ]);

      if (accountRes?.success) {
        setProfile((p) => ({
          ...p,
          name: accountRes.name || "",
          email: accountRes.email || "",
          phone: accountRes.phone || "",
        }));
      }

      const shop = shopRes?.vendor;
      if (shop) {
        setProfile((p) => ({
          ...p,
          website: shop.website || "",
          bio: shop.description || "",
          avatarUrl: shop.logoUrl || "",
        }));
        setStoreInfo({
          storeName: shop.storeName || "",
          gstNumber: shop.gstNumber || "",
          panNumber: shop.panNumber || "",
          bankAccountNumber: shop.bankAccountNumber || "",
          ifscCode: shop.ifscCode || "",
          isStoreVisible: shop.isStoreVisible !== false,
        });
        if (shop.notificationPrefs) {
          setNotifPrefs(shop.notificationPrefs);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Appearance prefs are cosmetic-only — load from localStorage
    try {
      const raw = localStorage.getItem(LOCAL_APPEARANCE_KEY);
      if (raw) setAppearance((a) => ({ ...a, ...JSON.parse(raw) }));
    } catch (_) {}
  }, [loadSettings]);

  /* ── MUI theme (Appearance tab only affects this page's own subtree) ── */
  const theme = useMemo(() => createTheme({
    palette: {
      mode: appearance.darkMode ? "dark" : "light",
      primary:   { main: "#B28A4A" },
      secondary: { main: "#9A7438" },
      background: {
        default: appearance.darkMode ? "#1a1408" : "#FBF8F1",
        paper:   appearance.darkMode ? "#241c0f" : "#ffffff",
      },
    },
    typography: { fontFamily: "'DM Sans', sans-serif" },
    shape: { borderRadius: 12 },
  }), [appearance.darkMode]);

  const showToast = (msg, severity = "success") =>
    setToast({ open: true, msg, severity });

  /* ── SAVE ALL (Profile + Store + Notifications) ──
     Ye ek hi button teen alag panels ke fields ko do backend
     endpoints par bhejta hai: /settings/profile (name/phone) aur
     /vendor/profile (website/bio/avatar/store/KYC/notifications) */
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await apiPut("/vendor/settings/profile", {
        name: profile.name,
        phone: profile.phone,
      });

      await apiPut("/vendor/profile", {
        website: profile.website,
        description: profile.bio,
        logoUrl: profile.avatarUrl,
        storeName: storeInfo.storeName,
        gstNumber: storeInfo.gstNumber,
        panNumber: storeInfo.panNumber,
        bankAccountNumber: storeInfo.bankAccountNumber,
        ifscCode: storeInfo.ifscCode,
        isStoreVisible: storeInfo.isStoreVisible,
        notificationPrefs: notifPrefs,
      });

      // Appearance is local-only
      localStorage.setItem(LOCAL_APPEARANCE_KEY, JSON.stringify(appearance));

      showToast("All settings saved successfully 🚀");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleStoreChange = (e) =>
    setStoreInfo((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleNotifToggle = (key) =>
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleAppearanceToggle = (key) =>
    setAppearance((a) => ({ ...a, [key]: !a[key] }));

  const handleAppearanceChange = (key, val) =>
    setAppearance((a) => ({ ...a, [key]: val }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setProfile((p) => ({ ...p, avatarUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async () => {
    if (!security.currentPassword) { showToast("Enter your current password", "error"); return; }
    if (security.newPassword.length < 8) { showToast("New password must be at least 8 characters", "error"); return; }
    if (security.newPassword !== security.confirmPassword) { showToast("Passwords do not match", "error"); return; }

    setPwSaving(true);
    try {
      await apiPut("/vendor/settings/password", {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      showToast("Password updated successfully 🔒");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await apiPut("/vendor/settings/deactivate", {});
      showToast("Account deactivated. Logging out...", "warning");
      setDeactivateDialog(false);
      setTimeout(() => {
        localStorage.removeItem("shopsphereToken");
        window.location.href = "/vendor/login";
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to deactivate account", "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiDelete("/vendor/settings/account");
      showToast("Account permanently deleted", "error");
      setDangerDialog(false);
      setTimeout(() => {
        localStorage.removeItem("shopsphereToken");
        window.location.href = "/vendor/login";
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to delete account", "error");
    }
  };

  const handleClearLocalData = () => {
    localStorage.removeItem(LOCAL_APPEARANCE_KEY);
    localStorage.removeItem("shopsphere-settings-v2"); // old pre-backend cache, if present
    showToast("Local cache cleared", "warning");
  };

  /* ── shared paper sx ── */
  const panelSx = {
    p: 4,
    borderRadius: 5,
    background: appearance.darkMode ? "rgba(36,28,15,0.9)" : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "#B28A4A" }} />
      </Box>
    );
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          p: { xs: 2, md: 3 },
          background: appearance.darkMode
            ? "linear-gradient(135deg,#1a1408,#241c0f,#1a1408)"
            : "linear-gradient(135deg,#FCFAF6,#F8F4EC,#F5F1E8)",
        }}
      >

        {/* ══ HEADER ══ */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 5,
            background: appearance.darkMode
              ? "linear-gradient(135deg,#241c0f,#3a2e18)"
              : "linear-gradient(135deg,#fff,#F6EEDC,#FBF8F1)",
            boxShadow: "0 8px 32px rgba(178,138,74,0.15)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#B28A4A", width: 48, height: 48 }}>
                <SettingsIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your account, security &amp; preferences
                </Typography>
              </Box>
            </Stack>

            <Button
              onClick={handleSaveAll}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SaveIcon />}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#B28A4A,#9A7438)",
                px: 3, py: 1.2, borderRadius: 3, fontWeight: 700,
                boxShadow: "0 4px 20px rgba(178,138,74,0.35)",
              }}
            >
              {saving ? "Saving..." : "Save All"}
            </Button>
          </Stack>
        </Paper>

        {/* ══ HORIZONTAL TABS ══ */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 4,
            background: appearance.darkMode ? "rgba(36,28,15,0.9)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{
              style: {
                background: activeTab === "danger"
                  ? "#ef4444"
                  : "linear-gradient(90deg,#B28A4A,#9A7438)",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
            sx={{
              px: 1,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                minHeight: 56,
                gap: 0.5,
                color: "text.secondary",
                transition: "color .2s",
              },
              "& .Mui-selected": {
                color: activeTab === "danger" ? "#ef4444 !important" : "#B28A4A !important",
                fontWeight: 800,
              },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={tab.id === "danger" ? { color: "#ef4444 !important" } : {}}
              />
            ))}
          </Tabs>
        </Paper>

        {/* ══ CONTENT PANELS ══ */}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <Paper elevation={0} sx={panelSx}>
            <Typography variant="h6" fontWeight={800} mb={3}>👤 Profile Information</Typography>

            <Stack direction="row" spacing={3} alignItems="center" mb={4}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Tooltip title="Change photo">
                    <IconButton
                      component="label"
                      sx={{ bgcolor: "#B28A4A", color: "#fff", width: 32, height: 32, "&:hover": { bgcolor: "#9A7438" } }}
                    >
                      <CameraAltIcon sx={{ fontSize: 16 }} />
                      <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar src={profile.avatarUrl} sx={{ width: 80, height: 80, fontSize: 32 }}>
                  {profile.name?.[0]?.toUpperCase() || "V"}
                </Avatar>
              </Badge>

              <Box>
                <Typography fontWeight={700}>{profile.name || "Vendor Name"}</Typography>
                <Typography variant="body2" color="text.secondary">{profile.email || "vendor@email.com"}</Typography>
                <Chip label="Verified Vendor" size="small" icon={<CheckCircleIcon />} color="success" sx={{ mt: 0.5 }} />
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name" name="name"
                  value={profile.name} onChange={handleProfileChange}
                  fullWidth variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Login email can't be changed here yet — contact support if needed">
                  <TextField
                    label="Email Address" name="email"
                    value={profile.email} disabled
                    fullWidth variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number" name="phone"
                  value={profile.phone} onChange={handleProfileChange}
                  fullWidth variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website URL" name="website"
                  value={profile.website} onChange={handleProfileChange}
                  fullWidth variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio" name="bio" value={profile.bio}
                  onChange={handleProfileChange} fullWidth multiline rows={3}
                  placeholder="Tell customers about yourself..."
                  helperText="Same as My Shop → Store Description"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ── APPEARANCE (local-only, cosmetic) ── */}
        {activeTab === "appearance" && (
          <Paper elevation={0} sx={panelSx}>
            <Typography variant="h6" fontWeight={800} mb={1}>🎨 Appearance &amp; Locale</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              These are just display preferences for this browser — they don't affect your store data.
            </Typography>

            <Stack spacing={3}>
              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 4,
                background: appearance.darkMode ? "rgba(178,138,74,0.1)" : "rgba(178,138,74,0.05)",
                border: "1px solid rgba(178,138,74,0.2)",
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    {appearance.darkMode
                      ? <DarkModeIcon sx={{ color: "#B28A4A" }} />
                      : <LightModeIcon sx={{ color: "#f59e0b" }} />}
                    <Box>
                      <Typography fontWeight={700}>{appearance.darkMode ? "Dark Mode" : "Light Mode"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appearance.darkMode ? "Switch to light theme" : "Switch to dark theme"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Switch
                    checked={appearance.darkMode}
                    onChange={() => handleAppearanceToggle("darkMode")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#B28A4A" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#B28A4A" },
                    }}
                  />
                </Stack>
              </Paper>

              <Divider />

              <Stack direction="row" spacing={2} alignItems="center">
                <LanguageIcon sx={{ color: "#06b6d4" }} />
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select value={appearance.language} label="Language"
                    onChange={(e) => handleAppearanceChange("language", e.target.value)}
                    sx={{ borderRadius: 3 }}>
                    <MenuItem value="en">🇬🇧 English</MenuItem>
                    <MenuItem value="hi">🇮🇳 Hindi</MenuItem>
                    <MenuItem value="mr">🇮🇳 Marathi</MenuItem>
                    <MenuItem value="ta">🇮🇳 Tamil</MenuItem>
                    <MenuItem value="te">🇮🇳 Telugu</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select value={appearance.currency} label="Currency"
                  onChange={(e) => handleAppearanceChange("currency", e.target.value)}
                  sx={{ borderRadius: 3 }}>
                  <MenuItem value="INR">🇮🇳 INR — Indian Rupee</MenuItem>
                  <MenuItem value="USD">🇺🇸 USD — US Dollar</MenuItem>
                  <MenuItem value="EUR">🇪🇺 EUR — Euro</MenuItem>
                  <MenuItem value="GBP">🇬🇧 GBP — British Pound</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select value={appearance.timezone} label="Timezone"
                  onChange={(e) => handleAppearanceChange("timezone", e.target.value)}
                  sx={{ borderRadius: 3 }}>
                  <MenuItem value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">EST — New York</MenuItem>
                  <MenuItem value="Europe/London">GMT — London</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === "notifications" && (
          <Paper elevation={0} sx={panelSx}>
            <Typography variant="h6" fontWeight={800} mb={1}>🔔 Notification Preferences</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              These preferences are saved to your account. Actual email/SMS/push delivery isn't wired up yet —
              toggling these just stores your preference for when it is.
            </Typography>
            <Stack spacing={2}>
              {[
                { key: "emailNotif",  label: "Email Notifications",  sub: "Get updates via email",              color: "#6366f1" },
                { key: "pushNotif",   label: "Push Notifications",   sub: "Browser push alerts",                color: "#ec4899" },
                { key: "smsNotif",    label: "SMS Notifications",    sub: "Receive SMS for critical alerts",     color: "#f59e0b" },
                { key: "orderNotif",  label: "New Order Alerts",     sub: "Notify when a new order is placed",   color: "#10b981" },
                { key: "reviewNotif", label: "Review Alerts",        sub: "Notify when customers leave reviews", color: "#B28A4A" },
              ].map((item) => (
                <Paper key={item.key} elevation={0} sx={{
                  p: 2.5, borderRadius: 4,
                  background: notifPrefs[item.key]
                    ? appearance.darkMode ? "rgba(178,138,74,0.08)" : "rgba(178,138,74,0.04)"
                    : "transparent",
                  border: `1px solid ${notifPrefs[item.key] ? "rgba(178,138,74,0.25)" : "rgba(128,128,128,0.15)"}`,
                  transition: "all .2s",
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: `${item.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <NotificationsIcon sx={{ color: item.color, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={700}>{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.sub}</Typography>
                      </Box>
                    </Stack>
                    <Switch
                      checked={notifPrefs[item.key]}
                      onChange={() => handleNotifToggle(item.key)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: item.color },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: item.color },
                      }}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {/* ── SECURITY ── */}
        {activeTab === "security" && (
          <Paper elevation={0} sx={panelSx}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <ShieldIcon sx={{ color: "#6366f1" }} />
              <Typography variant="h6" fontWeight={800}>Security &amp; Password</Typography>
            </Stack>

            <Stack spacing={2.5}>
              <TextField
                type={showCurrent ? "text" : "password"}
                label="Current Password"
                value={security.currentPassword}
                onChange={(e) => setSecurity(s => ({ ...s, currentPassword: e.target.value }))}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowCurrent(v => !v)}>
                      {showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />

              <TextField
                type={showNew ? "text" : "password"}
                label="New Password"
                value={security.newPassword}
                onChange={(e) => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowNew(v => !v)}>
                      {showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />

              {security.newPassword && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">Password strength</Typography>
                    <Typography variant="body2" fontWeight={700} color={`${pwStrength.color}.main`}>
                      {pwStrength.label}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(pwStrength.score / 4) * 100}
                    color={pwStrength.color}
                    sx={{ height: 6, borderRadius: 10 }}
                  />
                </Box>
              )}

              <TextField
                type={showConfirm ? "text" : "password"}
                label="Confirm New Password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))}
                fullWidth
                error={!!security.confirmPassword && security.newPassword !== security.confirmPassword}
                helperText={
                  security.confirmPassword && security.newPassword !== security.confirmPassword
                    ? "Passwords do not match" : ""
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />

              <Button
                onClick={handlePasswordChange}
                disabled={pwSaving}
                variant="contained"
                sx={{ background: "linear-gradient(90deg,#6366f1,#B28A4A)", borderRadius: 3, py: 1.4, fontWeight: 700 }}
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, background: "linear-gradient(135deg,#fef3c7,#fde68a)" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={800}>Two-Factor Authentication</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coming soon — not built yet
                  </Typography>
                </Box>
                <Button
                  variant="contained" size="small" disabled
                  sx={{ bgcolor: "#f59e0b", color: "#fff", borderRadius: 2 }}
                >
                  Enable 2FA
                </Button>
              </Stack>
            </Paper>
          </Paper>
        )}

        {/* ── STORE ── */}
        {activeTab === "store" && (
          <Paper elevation={0} sx={panelSx}>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <StorefrontIcon sx={{ color: "#B28A4A" }} />
              <Typography variant="h6" fontWeight={800}>Store Settings</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Store Name is shared with My Shop — editing it here updates the same field.
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Store Name" name="storeName"
                value={storeInfo.storeName} onChange={handleStoreChange}
                fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GST Number" name="gstNumber"
                    value={storeInfo.gstNumber} onChange={handleStoreChange}
                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="PAN Number" name="panNumber"
                    value={storeInfo.panNumber} onChange={handleStoreChange}
                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bank Account No." name="bankAccountNumber"
                    value={storeInfo.bankAccountNumber} onChange={handleStoreChange}
                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="IFSC Code" name="ifscCode"
                    value={storeInfo.ifscCode} onChange={handleStoreChange}
                    fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 4,
                background: "linear-gradient(135deg,rgba(178,138,74,0.06),rgba(154,116,56,0.06))",
                border: "1px solid rgba(178,138,74,0.2)",
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>Store Visibility</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Make your store visible to customers
                    </Typography>
                  </Box>
                  <Switch
                    checked={storeInfo.isStoreVisible}
                    onChange={() => setStoreInfo((s) => ({ ...s, isStoreVisible: !s.isStoreVisible }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#B28A4A" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#B28A4A" },
                    }}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        )}

        {/* ── DANGER ZONE ── */}
        {activeTab === "danger" && (
          <Paper elevation={0} sx={{
            ...panelSx,
            background: appearance.darkMode ? "rgba(30,10,10,0.9)" : "rgba(255,245,245,0.9)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <DeleteForeverIcon sx={{ color: "#ef4444" }} />
              <Typography variant="h6" fontWeight={800} color="error">Danger Zone</Typography>
            </Stack>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 4,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                  <Box>
                    <Typography fontWeight={700}>Deactivate Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Blocks login until reactivated by support. Your data is kept.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined" color="warning"
                    sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                    onClick={() => setDeactivateDialog(true)}
                  >
                    Deactivate
                  </Button>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 4,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                  <Box>
                    <Typography fontWeight={700}>Clear Local Cache</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clears saved appearance preferences from this browser only.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined" color="error"
                    sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                    onClick={handleClearLocalData}
                  >
                    Clear Cache
                  </Button>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 4,
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                  <Box>
                    <Typography fontWeight={700}>Delete Account Permanently</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This action is irreversible. All your products, orders history, and data will be lost forever.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined" color="error"
                    sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                    onClick={() => setDangerDialog(true)}
                  >
                    Delete Account
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        )}

        {/* ── DEACTIVATE CONFIRM DIALOG ── */}
        <Dialog open={deactivateDialog} onClose={() => setDeactivateDialog(false)}
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle fontWeight={800} color="warning.main">⚠️ Deactivate Account?</DialogTitle>
          <DialogContent>
            <Typography>
              You won't be able to log in until an admin reactivates your account. Your products and orders stay saved.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeactivateDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button color="warning" variant="contained" sx={{ borderRadius: 2 }} onClick={handleDeactivate}>
              Yes, Deactivate
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DELETE CONFIRM DIALOG ── */}
        <Dialog open={dangerDialog} onClose={() => setDangerDialog(false)}
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle fontWeight={800} color="error">⚠️ Delete Account Permanently?</DialogTitle>
          <DialogContent>
            <Typography>
              This will permanently delete your account, all products, orders, and data.
              This action <strong>cannot be undone</strong>.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDangerDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button color="error" variant="contained" sx={{ borderRadius: 2 }} onClick={handleDeleteAccount}>
              Yes, Delete Everything
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── TOAST ── */}
        <Snackbar
          open={toast.open}
          autoHideDuration={2500}
          onClose={() => setToast(t => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
            {toast.msg}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default Settings;