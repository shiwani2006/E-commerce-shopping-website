import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Skeleton,
  TextField,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const tokens = {
  glass: "rgba(255,255,255,0.72)",
  glassStrong: "rgba(255,255,255,0.86)",
  glassBorder: "rgba(255,255,255,0.6)",
  hairline: "rgba(31,36,48,0.06)",
  textPrimary: "#1f2430",
  textMuted: "#8a93a3",
  primary: "#14b8a6",
  primaryDim: "#0d9488",
  primarySoft: "rgba(20,184,166,0.14)",
  purple: "#8b7cf6",
  danger: "#ef4444",
  dangerSoft: "rgba(239,68,68,0.1)",
  shadow: "0 12px 32px rgba(31,41,55,0.08)",
};

const API_BASE = "http://localhost:5000/api";
const EMPTY_FORM = { name: "", description: "", image: "", subCategories: [], isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subInput, setSubInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("shopsphereToken")}`,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/categories/admin/all`, { headers: headers() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
      setCategories(data.categories);
    } catch (err) {
      setError(`Could not load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSubInput("");
    setFormError("");
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      image: c.image || "",
      subCategories: c.subCategories || [],
      isActive: c.isActive,
    });
    setSubInput("");
    setFormError("");
    setOpen(true);
  };

  const addSub = () => {
    const v = subInput.trim();
    if (!v || form.subCategories.includes(v)) return;
    setForm((f) => ({ ...f, subCategories: [...f.subCategories, v] }));
    setSubInput("");
  };

  const removeSub = (v) =>
    setForm((f) => ({ ...f, subCategories: f.subCategories.filter((s) => s !== v) }));

  const save = async () => {
    if (!form.name.trim()) {
      setFormError("Category name is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(
        editingId ? `${API_BASE}/categories/${editingId}` : `${API_BASE}/categories`,
        { method: editingId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${c._id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      setCategories((prev) => prev.map((x) => (x._id === c._id ? { ...x, isActive: !c.isActive } : x)));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/categories/${c._id}`, { method: "DELETE", headers: headers() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");
      setCategories((prev) => prev.filter((x) => x._id !== c._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ color: tokens.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.6rem" }}>
            Categories
          </Typography>
          <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem" }}>
            Vendors pick from this list when adding products. Customers browse by it.
          </Typography>
        </Box>
        <Button
          onClick={openCreate}
          startIcon={<AddRoundedIcon />}
          sx={{
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "14px",
            px: 2.5,
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
          }}
        >
          Add category
        </Button>
      </Box>

      {error && <Typography sx={{ color: tokens.danger, mb: 2, fontWeight: 600 }}>{error}</Typography>}

      {loading ? (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: "20px" }} />
          ))}
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, bgcolor: tokens.glassStrong, borderRadius: "24px", boxShadow: tokens.shadow }}>
          <CategoryRoundedIcon sx={{ fontSize: 40, color: tokens.textMuted, mb: 1 }} />
          <Typography sx={{ color: tokens.textMuted }}>
            No categories yet. Add the first one so vendors can list products.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {categories.map((c) => (
            <Box
              key={c._id}
              sx={{
                p: 2.5,
                borderRadius: "20px",
                bgcolor: tokens.glassStrong,
                backdropFilter: "blur(20px)",
                border: `1px solid ${tokens.glassBorder}`,
                boxShadow: tokens.shadow,
                opacity: c.isActive ? 1 : 0.65,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem" }} noWrap>{c.name}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: tokens.textMuted }}>
                    {c.productCount} product{c.productCount === 1 ? "" : "s"}
                  </Typography>
                </Box>
                <Switch size="small" checked={c.isActive} onChange={() => toggleActive(c)} />
              </Box>

              {c.description && (
                <Typography sx={{ fontSize: "0.82rem", mt: 1, color: "#5b6472" }}>{c.description}</Typography>
              )}

              {c.subCategories?.length > 0 && (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1.25 }}>
                  {c.subCategories.map((s) => (
                    <Chip key={s} label={s} size="small" sx={{ bgcolor: tokens.primarySoft, color: tokens.primaryDim, fontWeight: 600 }} />
                  ))}
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 1.5 }}>
                <IconButton size="small" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => remove(c)}
                  aria-label={`Delete ${c.name}`}
                  sx={{ color: tokens.danger, "&:hover": { bgcolor: tokens.dangerSoft } }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} fullWidth />

          <Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Sub-category"
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSub();
                  }
                }}
                size="small"
                fullWidth
              />
              <Button onClick={addSub} sx={{ textTransform: "none", fontWeight: 700 }}>Add</Button>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
              {form.subCategories.map((s) => (
                <Chip key={s} label={s} onDelete={() => removeSub(s)} size="small" />
              ))}
            </Box>
            <Typography sx={{ fontSize: "0.72rem", color: tokens.textMuted, mt: 0.75 }}>
              If you add sub-categories, vendors must choose one of them.
            </Typography>
          </Box>

          {formError && <Typography sx={{ color: tokens.danger, fontWeight: 600, fontSize: "0.85rem" }}>{formError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            onClick={save}
            disabled={saving}
            sx={{
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "12px",
              px: 2.5,
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.purple})`,
              "&.Mui-disabled": { opacity: 0.6, color: "#fff" },
            }}
          >
            {saving ? "Saving..." : "Save category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}