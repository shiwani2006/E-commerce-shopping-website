import { useState, useEffect } from "react";
import { Box, TextField, MenuItem } from "@mui/material";

const API_BASE = "http://localhost:5000/api";

/**
 * Vendor-side category + sub-category dropdowns.
 *
 * Usage inside your add/edit product form:
 *   <CategorySelect
 *     category={form.category}
 *     subCategory={form.subCategory}
 *     onChange={({ category, subCategory }) => setForm((f) => ({ ...f, category, subCategory }))}
 *   />
 *
 * Your form keeps sending `category` and `subCategory` as plain strings, so the
 * request body to POST/PUT /api/products does not change.
 */
export default function CategorySelect({ category = "", subCategory = "", onChange, required = true }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
        setCategories(data.categories);
      } catch (err) {
        setError("Could not load categories. Check that the server is running.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = categories.find((c) => c.name === category);
  const subs = selected?.subCategories || [];

  // An old product may use a category that was later deactivated: keep it
  // visible instead of showing an empty select.
  const orphan = category && !selected && !loading;

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <TextField
        select
        label="Category"
        value={category}
        required={required}
        disabled={loading}
        error={Boolean(error)}
        helperText={error || (orphan ? "This category is no longer available. Pick another to change it." : "")}
        onChange={(e) => onChange({ category: e.target.value, subCategory: "" })}
        sx={{ flex: 1, minWidth: 220 }}
      >
        {orphan && (
          <MenuItem value={category} disabled>
            {category} (unavailable)
          </MenuItem>
        )}
        {categories.map((c) => (
          <MenuItem key={c._id} value={c.name}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {subs.length > 0 && (
        <TextField
          select
          label="Sub-category"
          value={subCategory}
          required={required}
          onChange={(e) => onChange({ category, subCategory: e.target.value })}
          sx={{ flex: 1, minWidth: 220 }}
        >
          {subs.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Box>
  );
}