import { useState, useEffect } from "react";
import { Box, Chip, Skeleton } from "@mui/material";

const API_BASE = "http://localhost:5000/api";

/**
 * Customer-side category filter.
 *
 * Usage on your home / products page:
 *   const [category, setCategory] = useState("");
 *   <CategoryChips selected={category} onSelect={setCategory} />
 *   ...then fetch `${API}/products${category ? `?category=${encodeURIComponent(category)}` : ""}`
 *
 * "" means "All". Categories with no live products are hidden so customers
 * never land on an empty page.
 */
export default function CategoryChips({ selected = "", onSelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories(data.categories.filter((c) => c.productCount > 0));
        }
      } catch {
        // chips are optional UI: if this fails the product list still works
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={90} height={32} sx={{ borderRadius: 16 }} />
        ))}
      </Box>
    );
  }

  if (categories.length === 0) return null;

  const chipSx = (active) => ({
    fontWeight: 700,
    color: active ? "#fff" : "#5b6472",
    background: active ? "linear-gradient(135deg, #14b8a6, #8b7cf6)" : "rgba(255,255,255,0.8)",
    border: "1px solid rgba(31,36,48,0.06)",
    "&:hover": { background: active ? "linear-gradient(135deg, #14b8a6, #8b7cf6)" : "rgba(255,255,255,1)" },
  });

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      <Chip label="All" onClick={() => onSelect("")} sx={chipSx(selected === "")} />
      {categories.map((c) => (
        <Chip
          key={c._id}
          label={`${c.name} (${c.productCount})`}
          onClick={() => onSelect(c.name)}
          sx={chipSx(selected === c.name)}
        />
      ))}
    </Box>
  );
}