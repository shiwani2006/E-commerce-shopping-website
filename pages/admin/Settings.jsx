import { useState, useEffect } from "react";
import { Box, Typography, Button, Skeleton, TextField, Switch } from "@mui/material";

const tokens = {
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  purple: "#8b7cf6",
  success: "#22c55e",
  danger: "#ef4444",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
};

const API_BASE = "http://localhost:5000/api";

function Panel({ title, note, children }) {
  return (
    <Box sx={{ bgcolor: tokens.glassStrong, border: `1px solid ${tokens.glassBorder}`, borderRadius: "24px", boxShadow: tokens.shadow, p: 3, mb: 2 }}>
      <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>{title}</Typography>
      <Typography sx={{ fontSize: "0.8rem", color: tokens.textMuted, mb: 2 }}>{note}</Typography>
      {children}
    </Box>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.25, borderBottom: `1px solid ${tokens.hairline}` }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>{hint}</Typography>
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} inputProps={{ "aria-label": label }} />
    </Box>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("shopsphereToken")}`,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`, { headers: headers() });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
        setForm(data.settings);
      } catch (err) {
        setError(`Could not load settings: ${err.message}`);
      }
    })();
  }, []);

  const set = (key, value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { siteName, supportEmail, supportPhone, allowVendorRegistration, allowCustomerRegistration } = form;
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ siteName, supportEmail, supportPhone, allowVendorRegistration, allowCustomerRegistration }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setForm(data.settings);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif", maxWidth: 820 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>Settings</Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>Platform-wide details and sign-up rules.</Typography>
        </Box>
        <Button
          onClick={save}
          disabled={saving || !form}
          sx={{
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "14px",
            px: 3,
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
            "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
          }}
        >
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </Box>

      {error && <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{error}</Typography>}
      {saved && <Typography sx={{ color: tokens.success, mb: 2, fontWeight: 600 }}>Settings saved.</Typography>}

      {!form ? (
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: "24px" }} />
      ) : (
        <>
          <Panel title="Store details" note="Shown to customers and vendors, for example in the footer and support pages.">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Store name" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} required fullWidth />
              <TextField label="Support email" type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} fullWidth />
              <TextField label="Support phone" value={form.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} fullWidth />
            </Box>
          </Panel>

          <Panel title="Sign-ups" note="Turn a switch off to stop new accounts of that type. Existing accounts keep working.">
            <ToggleRow
              label="Allow vendor sign-ups"
              hint="New sellers can register and submit products."
              checked={form.allowVendorRegistration}
              onChange={(v) => set("allowVendorRegistration", v)}
            />
            <ToggleRow
              label="Allow customer sign-ups"
              hint="New shoppers can create an account."
              checked={form.allowCustomerRegistration}
              onChange={(v) => set("allowCustomerRegistration", v)}
            />
          </Panel>
        </>
      )}
    </Box>
  );
}