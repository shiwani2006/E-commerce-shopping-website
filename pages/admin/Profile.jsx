import { useState, useEffect } from "react";
import { Box, Typography, Button, Skeleton, TextField, Avatar } from "@mui/material";

const tokens = {
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  textPrimary: "#1f2430",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  purple: "#8b7cf6",
  success: "#22c55e",
  danger: "#ef4444",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
};

const API_BASE = "http://localhost:5000/api";
const gradient = `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`;

const primaryBtn = {
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  borderRadius: "14px",
  px: 3,
  background: gradient,
  "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
};

function Panel({ title, note, children }) {
  return (
    <Box sx={{ bgcolor: tokens.glassStrong, border: `1px solid ${tokens.glassBorder}`, borderRadius: "24px", boxShadow: tokens.shadow, p: 3, mb: 2 }}>
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>{title}</Typography>
      <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted, mb: 2 }}>{note}</Typography>
      {children}
    </Box>
  );
}

function Message({ msg }) {
  if (!msg.text) return null;
  return (
    <Typography sx={{ color: msg.type === "error" ? tokens.danger : tokens.success, fontWeight: 600, fontSize: "0.85rem", mt: 1.5 }}>
      {msg.text}
    </Typography>
  );
}

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({});

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({});

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("shopsphereToken")}`,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin-profile`, { headers: headers() });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
        setProfile(data.profile);
      } catch (err) {
        setLoadError(`Could not load profile: ${err.message}`);
      }
    })();
  }, []);

  const setField = (key, value) => {
    setProfileMsg({});
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg({});
    try {
      const { name, phone, city, state, address } = profile;
      const res = await fetch(`${API_BASE}/admin-profile`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, phone, city, state, address }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setProfile(data.profile);
      setProfileMsg({ type: "success", text: "Profile saved." });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setPwMsg({});
    if (pw.next.length < 8) {
      setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch(`${API_BASE}/admin-profile/password`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not change password");
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ type: "success", text: "Password changed." });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif", maxWidth: 820 }}>
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>Profile</Typography>
      <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem", mb: 3 }}>Your admin account details and password.</Typography>

      {loadError && <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{loadError}</Typography>}

      {!profile ? (
        !loadError && <Skeleton variant="rounded" height={320} sx={{ borderRadius: "24px" }} />
      ) : (
        <>
          <Panel title="Account details" note="Your email is your login, so it can't be changed here.">
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, background: gradient, fontWeight: 800 }}>
                {(profile.name || "A").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{profile.name}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted }}>{profile.email}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField label="Name" value={profile.name || ""} onChange={(e) => setField("name", e.target.value)} required />
              <TextField label="Email" value={profile.email || ""} disabled />
              <TextField label="Phone" value={profile.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
              <TextField label="City" value={profile.city || ""} onChange={(e) => setField("city", e.target.value)} />
              <TextField label="State" value={profile.state || ""} onChange={(e) => setField("state", e.target.value)} />
              <TextField label="Address" value={profile.address || ""} onChange={(e) => setField("address", e.target.value)} />
            </Box>

            <Button onClick={saveProfile} disabled={savingProfile} sx={{ ...primaryBtn, mt: 2.5 }}>
              {savingProfile ? "Saving..." : "Save profile"}
            </Button>
            <Message msg={profileMsg} />
          </Panel>

          <Panel title="Change password" note="Use at least 8 characters.">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 420 }}>
              <TextField label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
              <TextField label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
              <TextField label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
            </Box>
            <Button onClick={changePassword} disabled={savingPw || !pw.current || !pw.next} sx={{ ...primaryBtn, mt: 2.5 }}>
              {savingPw ? "Changing..." : "Change password"}
            </Button>
            <Message msg={pwMsg} />
          </Panel>
        </>
      )}
    </Box>
  );
}