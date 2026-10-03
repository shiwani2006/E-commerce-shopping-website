import { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  Switch,
  InputAdornment,
  LinearProgress,
  CircularProgress,
  Tooltip,
} from "@mui/material";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SaveIcon from "@mui/icons-material/Save";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PercentIcon from "@mui/icons-material/Percent";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import axiosInstance from "../../services/axiosInstance";

/* ═══════════════════════════════════════════════════════════════
   SHOPSPHERE DESIGN SYSTEM
   White + Charcoal + Luxury Gold
══════════════════════════════════════════════════════════════ */

const c = {
  ink: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceRaised: "#F8F7F4",

  border: "rgba(18,17,22,0.10)",
  borderStrong: "rgba(18,17,22,0.20)",

  textPrimary: "#121116",
  textSecondary: "#6F6B75",
  textMuted: "#9A969F",

  gold: "#C9A467",
  goldDark: "#A9864F",
  goldLight: "#F4E8D0",

  emerald: "#3E9B78",
  emeraldLight: "#E8F5EF",

  wine: "#B85468",
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  "Men",
  "Women",
  "Beauty",
  "Electronics",
  "Home & Living",
  "Sports",
  "Kids",
  "Books",
  "Grocery",
  "Jewellery",
];

const SUB_CATEGORIES = {
  Men: [
    "T-Shirts",
    "Shirts",
    "Jeans",
    "Jackets",
    "Shoes",
    "Accessories",
  ],

  Women: [
    "Kurtas",
    "Sarees",
    "Tops",
    "Dresses",
    "Footwear",
    "Jewellery",
  ],

  Beauty: [
    "Skincare",
    "Makeup",
    "Haircare",
    "Fragrance",
    "Body Care",
  ],

  Electronics: [
    "Mobile",
    "Laptop",
    "Headphones",
    "Smartwatch",
    "Cameras",
    "Accessories",
  ],

  "Home & Living": [
    "Furniture",
    "Decor",
    "Kitchen",
    "Bedding",
    "Lighting",
  ],

  Sports: [
    "Fitness",
    "Cricket",
    "Football",
    "Cycling",
    "Swimming",
  ],

  Kids: [
    "Clothing",
    "Toys",
    "Books",
    "School Supplies",
  ],

  Books: [
    "Fiction",
    "Non-Fiction",
    "Academic",
    "Comics",
  ],

  Grocery: [
    "Fruits & Veg",
    "Dairy",
    "Snacks",
    "Beverages",
  ],

  Jewellery: [
    "Gold",
    "Silver",
    "Diamond",
    "Artificial",
  ],
};

const COLORS = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Pink",
  "Yellow",
  "Purple",
  "Orange",
  "Brown",
  "Grey",
  "Beige",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "Free Size",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
];

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC DIMENSION CONFIGURATION
══════════════════════════════════════════════════════════════ */

const DIMENSION_FIELDS_BY_SUBCATEGORY = {
  /* ───────── FOOTWEAR ───────── */

  Shoes: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "shoeSize",
      label: "Shoe Size (UK)",
      unit: "UK",
      type: "number",
    },
    {
      key: "soleLength",
      label: "Sole Length (inch)",
      unit: "in",
      type: "number",
    },
  ],

  Footwear: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "shoeSize",
      label: "Shoe Size (UK)",
      unit: "UK",
      type: "number",
    },
    {
      key: "soleLength",
      label: "Sole Length (inch)",
      unit: "in",
      type: "number",
    },
  ],

  /* ───────── CLOTHING ───────── */

  "T-Shirts": [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "chest",
      label: "Chest Width (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  Shirts: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "chest",
      label: "Chest Width (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  Jeans: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "waist",
      label: "Waist (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "inseam",
      label: "Inseam Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  Jackets: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "chest",
      label: "Chest Width (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  Kurtas: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "chest",
      label: "Bust/Chest (in)",
      unit: "in",
      type: "number",
    },
  ],

  Sarees: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "sareeLength",
      label: "Saree Length (m)",
      unit: "m",
      type: "number",
    },
    {
      key: "blouseLength",
      label: "Blouse Piece (m)",
      unit: "m",
      type: "number",
    },
  ],

  Tops: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "chest",
      label: "Bust/Chest (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  Dresses: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "chest",
      label: "Bust/Chest (in)",
      unit: "in",
      type: "number",
    },
    {
      key: "garmentLength",
      label: "Garment Length (in)",
      unit: "in",
      type: "number",
    },
  ],

  /* ───────── JEWELLERY ───────── */

  Gold: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
  ],

  Silver: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
  ],

  Diamond: [
    {
      key: "weight",
      label: "Weight (carat)",
      unit: "ct",
      type: "number",
    },
  ],

  Artificial: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
  ],

  /* ───────── TOYS ───────── */

  Toys: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  /* ───────── ELECTRONICS ───────── */

  Mobile: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (mm)",
      unit: "mm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (mm)",
      unit: "mm",
      type: "number",
    },
    {
      key: "height",
      label: "Thickness (mm)",
      unit: "mm",
      type: "number",
    },
  ],

  Laptop: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Thickness (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  /* ───────── HOME ───────── */

  Furniture: [
    {
      key: "weight",
      label: "Weight (kg)",
      unit: "kg",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   CATEGORY LEVEL DIMENSIONS
══════════════════════════════════════════════════════════════ */

const DIMENSION_FIELDS_BY_CATEGORY = {
  Men: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  Women: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  Electronics: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  "Home & Living": [
    {
      key: "weight",
      label: "Weight (kg)",
      unit: "kg",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  Kids: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],

  Sports: [
    {
      key: "weight",
      label: "Weight (grams)",
      unit: "g",
      type: "number",
    },
    {
      key: "length",
      label: "Length (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "width",
      label: "Width (cm)",
      unit: "cm",
      type: "number",
    },
    {
      key: "height",
      label: "Height (cm)",
      unit: "cm",
      type: "number",
    },
  ],
};

const DEFAULT_DIMENSION_FIELDS = [
  {
    key: "weight",
    label: "Weight (grams)",
    unit: "g",
    type: "number",
  },
];

const getDimensionFields = (category, subCategory) => {
  if (
    subCategory &&
    DIMENSION_FIELDS_BY_SUBCATEGORY[subCategory]
  ) {
    return DIMENSION_FIELDS_BY_SUBCATEGORY[subCategory];
  }

  if (
    category &&
    DIMENSION_FIELDS_BY_CATEGORY[category]
  ) {
    return DIMENSION_FIELDS_BY_CATEGORY[category];
  }

  return DEFAULT_DIMENSION_FIELDS;
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

const uid = () =>
  Math.random().toString(36).slice(2, 9);

const calcDiscount = (mrp, selling) => {
  if (!mrp || !selling || +mrp <= 0) {
    return 0;
  }

  return Math.round(
    ((+mrp - +selling) / +mrp) * 100
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    description: "",
    highlights: "",

    sku: "",
    barcode: "",

    mrp: "",
    sellingPrice: "",

    stock: "",
    lowStockAlert: "5",

    dimensions: {},

    metaTitle: "",
    metaDesc: "",
    tags: [],

    isFeatured: false,
    isCOD: true,
    isReturnable: true,
    returnDays: "7",
  });

  const [images, setImages] = useState([]);

  const [selectedColors, setSelectedColors] =
    useState([]);

  const [selectedSizes, setSelectedSizes] =
    useState([]);

  const [tagInput, setTagInput] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [seoLoading, setSeoLoading] =
    useState(false);

  const [toast, setToast] =
    useState({
      open: false,
      msg: "",
      sev: "success",
    });

  const [step, setStep] =
    useState(0);

  const fileRef =
    useRef();

  const discount =
    calcDiscount(
      form.mrp,
      form.sellingPrice
    );

  const subCatList =
    SUB_CATEGORIES[form.category] || [];

  const dimensionFields =
    getDimensionFields(
      form.category,
      form.subCategory
    );

  const filled = [
    form.name,
    form.category,
    form.description,
    form.mrp,
    form.sellingPrice,
    form.stock,
    images.length > 0,
  ].filter(Boolean).length;

  const progress =
    Math.round((filled / 7) * 100);

  const set = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: val,
    }));

  const setDimension = (key, val) =>
    setForm((f) => ({
      ...f,
      dimensions: {
        ...f.dimensions,
        [key]: val,
      },
    }));

  const showToast = (
    msg,
    sev = "success"
  ) =>
    setToast({
      open: true,
      msg,
      sev,
    });

  const handleCategoryChange = (
    newCategory
  ) => {
    const newFields =
      getDimensionFields(
        newCategory,
        ""
      );

    const allowedKeys =
      new Set(
        newFields.map(
          (f) => f.key
        )
      );

    setForm((f) => ({
      ...f,
      category: newCategory,
      subCategory: "",
      dimensions:
        Object.fromEntries(
          Object.entries(
            f.dimensions
          ).filter(
            ([k]) =>
              allowedKeys.has(k)
          )
        ),
    }));
  };

  const handleSubCategoryChange = (
    newSubCategory
  ) => {
    const newFields =
      getDimensionFields(
        form.category,
        newSubCategory
      );

    const allowedKeys =
      new Set(
        newFields.map(
          (f) => f.key
        )
      );

    setForm((f) => ({
      ...f,
      subCategory:
        newSubCategory,
      dimensions:
        Object.fromEntries(
          Object.entries(
            f.dimensions
          ).filter(
            ([k]) =>
              allowedKeys.has(k)
          )
        ),
    }));
  };
    /* ═══════════════════════════════════════════════════════════════
     IMAGE HANDLERS
  ═══════════════════════════════════════════════════════════════ */

  const handleImageUpload = (e) => {
    const files = Array.from(
      e.target.files
    );

    if (
      images.length + files.length >
      6
    ) {
      showToast(
        "Maximum 6 images allowed",
        "warning"
      );

      return;
    }

    setImages((prev) => [
      ...prev,

      ...files.map((file) => ({
        id: uid(),
        url: URL.createObjectURL(
          file
        ),
        file,
      })),
    ]);
  };

  const removeImage = (id) => {
    setImages((prev) =>
      prev.filter(
        (img) => img.id !== id
      )
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     VARIANT HANDLERS
  ═══════════════════════════════════════════════════════════════ */

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter(
            (x) => x !== color
          )
        : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter(
            (x) => x !== size
          )
        : [...prev, size]
    );
  };

  const addTag = () => {
    const tag =
      tagInput.trim();

    if (
      tag &&
      !form.tags.includes(tag) &&
      form.tags.length < 10
    ) {
      set(
        "tags",
        [...form.tags, tag]
      );
    }

    setTagInput("");
  };

  /* ═══════════════════════════════════════════════════════════════
     CLAUDE AI HELPER
  ═══════════════════════════════════════════════════════════════ */

  const callClaude = async (
    prompt
  ) => {
    const response =
      await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model:
              "claude-sonnet-4-20250514",

            max_tokens: 1000,

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

    if (!response.ok) {
      throw new Error(
        "AI API error"
      );
    }

    const data =
      await response.json();

    return data.content
      .map(
        (i) => i.text || ""
      )
      .join("\n")
      .trim();
  };

  /* ═══════════════════════════════════════════════════════════════
     AI DESCRIPTION
  ═══════════════════════════════════════════════════════════════ */

  const handleAIDescription =
    async () => {
      if (!form.name) {
        showToast(
          "Pehle product ka naam likhein",
          "warning"
        );

        return;
      }

      setAiLoading(true);

      try {
        const prompt = `
You are a product copywriter for an Indian e-commerce platform.

Product name: "${form.name}"
Brand: "${form.brand || "N/A"}"
Category: "${form.category || "N/A"}"
Sub-category: "${form.subCategory || "N/A"}"

Generate:

1. A compelling product description
   3-4 sentences in Indian English.

2. 4-5 key highlights.
   Every highlight must start with •.

Respond ONLY in this exact JSON format:

{
  "description": "...",
  "highlights": "• ...\\n• ...\\n• ..."
}
`;

        const raw =
          await callClaude(
            prompt
          );

        const clean =
          raw
            .replace(
              /```json|```/g,
              ""
            )
            .trim();

        const json =
          JSON.parse(clean);

        set(
          "description",
          json.description || ""
        );

        set(
          "highlights",
          json.highlights || ""
        );

        showToast(
          "AI ne description generate kar diya! ✨"
        );
      } catch (e) {
        showToast(
          "AI error: " +
            e.message,
          "error"
        );
      } finally {
        setAiLoading(false);
      }
    };

  /* ═══════════════════════════════════════════════════════════════
     AI SEO
  ═══════════════════════════════════════════════════════════════ */

  const handleAISEO =
    async () => {
      if (!form.name) {
        showToast(
          "Pehle product ka naam likhein",
          "warning"
        );

        return;
      }

      setSeoLoading(true);

      try {
        const prompt = `
You are an SEO expert for an Indian e-commerce site.

Product: "${form.name}"
Category: "${form.category || "N/A"}"
Description: "${form.description || "N/A"}"

Generate:

1. Meta title.
   Maximum 60 characters.

2. Meta description.
   Maximum 160 characters.

3. 6-8 short product tags.

Respond ONLY in this exact JSON:

{
  "metaTitle": "...",
  "metaDesc": "...",
  "tags": ["tag1", "tag2"]
}
`;

        const raw =
          await callClaude(
            prompt
          );

        const clean =
          raw
            .replace(
              /```json|```/g,
              ""
            )
            .trim();

        const json =
          JSON.parse(clean);

        set(
          "metaTitle",
          json.metaTitle || ""
        );

        set(
          "metaDesc",
          json.metaDesc || ""
        );

        if (
          Array.isArray(
            json.tags
          )
        ) {
          set(
            "tags",
            json.tags.slice(
              0,
              10
            )
          );
        }

        showToast(
          "SEO data AI ne generate kar diya! 🚀"
        );
      } catch (e) {
        showToast(
          "AI error: " +
            e.message,
          "error"
        );
      } finally {
        setSeoLoading(false);
      }
    };

  /* ═══════════════════════════════════════════════════════════════
     SAVE PRODUCT
  ═══════════════════════════════════════════════════════════════ */

  const handleSave =
    async () => {
      if (!form.name) {
        showToast(
          "Product name zaroori hai",
          "error"
        );

        return;
      }

      if (!form.category) {
        showToast(
          "Category select karein",
          "error"
        );

        return;
      }

      if (!form.sellingPrice) {
        showToast(
          "Selling price zaroori hai",
          "error"
        );

        return;
      }

      if (!form.stock) {
        showToast(
          "Stock quantity zaroori hai",
          "error"
        );

        return;
      }

      if (!images.length) {
        showToast(
          "Kam se kam ek image add karein",
          "error"
        );

        return;
      }

      setSaving(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "name",
          form.name
        );

        formData.append(
          "brand",
          form.brand
        );

        formData.append(
          "category",
          form.category
        );

        formData.append(
          "subCategory",
          form.subCategory
        );

        formData.append(
          "description",
          form.description
        );

        formData.append(
          "highlights",
          form.highlights
        );

        formData.append(
          "sku",
          form.sku
        );

        formData.append(
          "barcode",
          form.barcode
        );

        formData.append(
          "mrp",
          form.mrp
        );

        formData.append(
          "sellingPrice",
          form.sellingPrice
        );

        formData.append(
          "stock",
          form.stock
        );

        formData.append(
          "lowStockAlert",
          form.lowStockAlert
        );

        formData.append(
          "colors",
          JSON.stringify(
            selectedColors
          )
        );

        formData.append(
          "sizes",
          JSON.stringify(
            selectedSizes
          )
        );

        formData.append(
          "tags",
          JSON.stringify(
            form.tags
          )
        );

        formData.append(
          "dimensions",
          JSON.stringify(
            form.dimensions
          )
        );

        formData.append(
          "metaTitle",
          form.metaTitle
        );

        formData.append(
          "metaDesc",
          form.metaDesc
        );

        formData.append(
          "isFeatured",
          form.isFeatured
        );

        formData.append(
          "isCOD",
          form.isCOD
        );

        formData.append(
          "isReturnable",
          form.isReturnable
        );

        formData.append(
          "returnDays",
          form.returnDays
        );

        images.forEach(
          (img) => {
            formData.append(
              "images",
              img.file
            );
          }
        );

        const {
          data,
        } =
          await axiosInstance.post(
            "/products",
            formData
          );

        if (!data.success) {
          throw new Error(
            data.message
          );
        }

        setSaved(true);

        showToast(
          "Product MongoDB me save ho gaya! 🎉"
        );

        setTimeout(
          () => {
            setForm({
              name: "",
              brand: "",
              category: "",
              subCategory: "",
              description: "",
              highlights: "",

              sku: "",
              barcode: "",

              mrp: "",
              sellingPrice: "",

              stock: "",
              lowStockAlert: "5",

              dimensions: {},

              metaTitle: "",
              metaDesc: "",
              tags: [],

              isFeatured: false,
              isCOD: true,
              isReturnable: true,
              returnDays: "7",
            });

            setImages([]);
            setSelectedColors([]);
            setSelectedSizes([]);
            setSaved(false);
            setStep(0);
          },
          1500
        );
      } catch (e) {
        const msg =
          e.response?.data
            ?.message ||
          e.message;

        showToast(
          "Save failed: " +
            msg,
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  const steps = [
    "Basic Info",
    "Pricing & Stock",
    "Variants & Images",
    "SEO & Settings",
  ];

  /* ═══════════════════════════════════════════════════════════════
     AI BUTTON
  ═══════════════════════════════════════════════════════════════ */

  const AIButton = ({
    onClick,
    loading,
    label,
  }) => (
    <Button
      variant="outlined"
      size="small"
      startIcon={
        loading ? (
          <CircularProgress
            size={14}
          />
        ) : (
          <AutoAwesomeIcon fontSize="small" />
        )
      }
      onClick={onClick}
      disabled={loading}
      sx={{
        borderRadius: 3,

        borderColor:
          c.gold,

        color:
          c.goldDark,

        fontWeight: 700,

        fontSize: 12,

        px: 2,

        "&:hover": {
          borderColor:
            c.goldDark,

          background:
            "rgba(201,164,103,0.08)",
        },
      }}
    >
      {loading
        ? "Generating…"
        : label}
    </Button>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: {
          xs: 2,
          md: 3,
        },
        bgcolor: c.ink,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════════ */}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 5,

          background:
            "linear-gradient(135deg, #FFFFFF 0%, #F8F7F4 100%)",

          border:
            `1px solid ${c.border}`,

          boxShadow:
            "0 8px 32px rgba(18,17,22,0.08)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            sm: "center",
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,

                background:
                  "linear-gradient(135deg, #C9A467, #A9864F)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                boxShadow:
                  "0 6px 18px rgba(201,164,103,0.25)",
              }}
            >
              <InventoryIcon
                sx={{
                  color: "#FFFFFF",
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  color:
                    c.textPrimary,
                }}
              >
                Add New Product
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    c.textSecondary,
                }}
              >
                ✅ Backend connected
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                minWidth: 140,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={0.5}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      c.textSecondary,
                  }}
                >
                  Completion
                </Typography>

                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color:
                      c.goldDark,
                  }}
                >
                  {progress}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 10,

                  backgroundColor:
                    c.goldLight,

                  "& .MuiLinearProgress-bar":
                    {
                      background:
                        "linear-gradient(90deg, #C9A467, #A9864F)",
                    },
                }}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={
                saving
                  ? null
                  : saved
                  ? <CheckCircleIcon />
                  : <SaveIcon />
              }
              onClick={handleSave}
              disabled={saving}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,

                background: saved
                  ? "linear-gradient(90deg, #3E9B78, #57B08C)"
                  : "linear-gradient(90deg, #C9A467, #A9864F)",

                boxShadow:
                  "0 4px 20px rgba(201,164,103,0.28)",

                minWidth: 140,

                "&:hover": {
                  background: saved
                    ? "linear-gradient(90deg, #3E9B78, #57B08C)"
                    : "linear-gradient(90deg, #A9864F, #8F703F)",
                },
              }}
            >
              {saving
                ? "Saving…"
                : saved
                ? "Saved!"
                : "Publish Product"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ═══════════════════════════════════════════════════════════════
          STEP TABS
      ═══════════════════════════════════════════════════════════════ */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,

          background:
            "rgba(255,255,255,0.95)",

          border:
            `1px solid ${c.border}`,

          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          sx={{
            overflowX: "auto",
          }}
        >
          {steps.map(
            (label, i) => (
              <Button
                key={i}
                onClick={() =>
                  setStep(i)
                }
                sx={{
                  flex: 1,
                  minWidth: 130,
                  py: 1.8,
                  borderRadius: 0,

                  fontWeight:
                    step === i
                      ? 800
                      : 500,

                  fontSize: 13,

                  color:
                    step === i
                      ? c.goldDark
                      : c.textSecondary,

                  borderBottom:
                    step === i
                      ? `3px solid ${c.gold}`
                      : "3px solid transparent",

                  background:
                    step === i
                      ? "rgba(201,164,103,0.08)"
                      : "transparent",

                  transition:
                    "all .2s",

                  gap: 1,

                  "&:hover": {
                    background:
                      "rgba(201,164,103,0.06)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,

                    background:
                      step === i
                        ? "linear-gradient(135deg, #C9A467, #A9864F)"
                        : "rgba(18,17,22,0.10)",

                    color:
                      step === i
                        ? "#FFFFFF"
                        : c.textMuted,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </Box>

                {label}
              </Button>
            )
          )}
        </Stack>
      </Paper>
            {/* ═══════════════════════════════════════════════════════════════
          STEP 0: BASIC INFO
      ═══════════════════════════════════════════════════════════════ */}

      {step === 0 && (
        <Grid
          container
          spacing={3}
        >
          {/* PRODUCT DETAILS */}

          <Grid
            item
            xs={12}
            md={8}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <DescriptionIcon
                    sx={{
                      color:
                        c.gold,
                    }}
                  />

                  <Typography
                    fontWeight={800}
                    sx={{
                      color:
                        c.textPrimary,
                    }}
                  >
                    Product Details
                  </Typography>
                </Stack>

                <Tooltip
                  title="AI se description aur highlights generate karein"
                >
                  <span>
                    <AIButton
                      onClick={
                        handleAIDescription
                      }
                      loading={
                        aiLoading
                      }
                      label="AI se Fill Karein ✨"
                    />
                  </span>
                </Tooltip>
              </Stack>

              <Stack spacing={2.5}>
                <TextField
                  label="Product Name *"
                  value={form.name}
                  onChange={(e) =>
                    set(
                      "name",
                      e.target.value
                    )
                  }
                  fullWidth
                  placeholder="e.g. Premium Cotton T-Shirt for Men"
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <TextField
                  label="Brand Name"
                  value={form.brand}
                  onChange={(e) =>
                    set(
                      "brand",
                      e.target.value
                    )
                  }
                  fullWidth
                  placeholder="e.g. Nike, Zara, Local Brand"
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <FormControl
                      fullWidth
                    >
                      <InputLabel>
                        Category *
                      </InputLabel>

                      <Select
                        value={
                          form.category
                        }
                        label="Category *"
                        onChange={(e) =>
                          handleCategoryChange(
                            e.target.value
                          )
                        }
                        sx={{
                          borderRadius: 3,
                        }}
                      >
                        {CATEGORIES.map(
                          (category) => (
                            <MenuItem
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {category}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <FormControl
                      fullWidth
                      disabled={
                        !form.category
                      }
                    >
                      <InputLabel>
                        Sub-Category
                      </InputLabel>

                      <Select
                        value={
                          form.subCategory
                        }
                        label="Sub-Category"
                        onChange={(e) =>
                          handleSubCategoryChange(
                            e.target.value
                          )
                        }
                        sx={{
                          borderRadius: 3,
                        }}
                      >
                        {subCatList.map(
                          (sub) => (
                            <MenuItem
                              key={sub}
                              value={sub}
                            >
                              {sub}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField
                  label="Product Description *"
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                    )
                  }
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Write Product Details"
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <TextField
                  label="Key Highlights"
                  value={
                    form.highlights
                  }
                  onChange={(e) =>
                    set(
                      "highlights",
                      e.target.value
                    )
                  }
                  fullWidth
                  multiline
                  rows={3}
                  placeholder={
                    "• 100% Pure Cotton\n• Machine Washable\n• 5 colors available"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* IDENTIFIERS + DIMENSIONS */}

          <Grid
            item
            xs={12}
            md={4}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                mb={2.5}
              >
                <LocalOfferIcon
                  sx={{
                    color:
                      c.goldDark,
                  }}
                />

                <Typography
                  fontWeight={800}
                  sx={{
                    color:
                      c.textPrimary,
                  }}
                >
                  Identifiers
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label="SKU Code"
                  value={form.sku}
                  onChange={(e) =>
                    set(
                      "sku",
                      e.target.value
                    )
                  }
                  fullWidth
                  placeholder="e.g. MEN-TSHIRT-001"
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <TextField
                  label="Barcode / EAN"
                  value={form.barcode}
                  onChange={(e) =>
                    set(
                      "barcode",
                      e.target.value
                    )
                  }
                  fullWidth
                  placeholder="e.g. 8901234567890"
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />
              </Stack>
            </Paper>

            {/* PACKAGE DIMENSIONS */}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography
                  fontWeight={800}
                  sx={{
                    color:
                      c.textPrimary,
                  }}
                >
                  📦 Package Dimensions
                </Typography>

                {(form.category ||
                  form.subCategory) && (
                  <Chip
                    size="small"
                    label={
                      form.subCategory ||
                      form.category
                    }
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,

                      background:
                        c.goldLight,

                      color:
                        c.goldDark,

                      border:
                        `1px solid ${c.gold}`,
                    }}
                  />
                )}
              </Stack>

              {!form.category && (
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      c.textMuted,
                  }}
                >
                  Category select karne ke
                  baad relevant dimension
                  fields yahan aayenge.
                </Typography>
              )}

              {form.category && (
                <Stack spacing={2}>
                  {dimensionFields.map(
                    (field) => (
                      <TextField
                        key={
                          field.key
                        }
                        label={
                          field.label
                        }
                        value={
                          form
                            .dimensions[
                            field.key
                          ] ?? ""
                        }
                        onChange={(e) =>
                          setDimension(
                            field.key,
                            e.target.value
                          )
                        }
                        type={
                          field.type
                        }
                        fullWidth
                        size="small"
                        InputProps={
                          field.unit
                            ? {
                                endAdornment:
                                  (
                                    <InputAdornment position="end">
                                      {
                                        field.unit
                                      }
                                    </InputAdornment>
                                  ),
                              }
                            : undefined
                        }
                        sx={{
                          "& .MuiOutlinedInput-root":
                            {
                              borderRadius: 3,
                            },
                        }}
                      />
                    )
                  )}

                  {dimensionFields.length ===
                    1 &&
                    dimensionFields[0]
                      .key ===
                      "weight" && (
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            c.textMuted,
                        }}
                      >
                        Iss category/sub-category
                        ke liye sirf weight
                        relevant hai.
                      </Typography>
                    )}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 1: PRICING & STOCK
      ═══════════════════════════════════════════════════════════════ */}

      {step === 1 && (
        <Grid
          container
          spacing={3}
        >
          {/* PRICING */}

          <Grid
            item
            xs={12}
            md={7}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                mb={2.5}
              >
                <CurrencyRupeeIcon
                  sx={{
                    color:
                      c.gold,
                  }}
                />

                <Typography
                  fontWeight={800}
                  sx={{
                    color:
                      c.textPrimary,
                  }}
                >
                  Pricing
                </Typography>
              </Stack>

              <Stack spacing={2.5}>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      label="MRP (Original Price) *"
                      value={form.mrp}
                      onChange={(e) =>
                        set(
                          "mrp",
                          e.target.value
                        )
                      }
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment:
                          (
                            <InputAdornment position="start">
                              ₹
                            </InputAdornment>
                          ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root":
                          {
                            borderRadius: 3,
                          },
                      }}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                  >
                    <TextField
                      label="Selling Price *"
                      value={
                        form.sellingPrice
                      }
                      onChange={(e) =>
                        set(
                          "sellingPrice",
                          e.target.value
                        )
                      }
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment:
                          (
                            <InputAdornment position="start">
                              ₹
                            </InputAdornment>
                          ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root":
                          {
                            borderRadius: 3,
                          },
                      }}
                    />
                  </Grid>
                </Grid>

                {discount > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,

                      background:
                        c.emeraldLight,

                      border:
                        "1px solid rgba(62,155,120,0.25)",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <PercentIcon
                        sx={{
                          color:
                            c.emerald,
                        }}
                      />

                      <Box>
                        <Typography
                          fontWeight={800}
                          sx={{
                            color:
                              c.emerald,
                          }}
                        >
                          {discount}% OFF
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              c.textSecondary,
                          }}
                        >
                          Customer saves ₹
                          {(
                            +form.mrp -
                            +form.sellingPrice
                          ).toLocaleString()}
                        </Typography>
                      </Box>

                      <Chip
                        label={`₹${+form.mrp.toLocaleString()} → ₹${+form.sellingPrice.toLocaleString()}`}
                        size="small"
                        sx={{
                          ml: "auto",
                          background:
                            c.emeraldLight,

                          color:
                            c.emerald,

                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Paper>

            {/* INVENTORY */}

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                mb={2.5}
              >
                <InventoryIcon
                  sx={{
                    color:
                      c.goldDark,
                  }}
                />

                <Typography
                  fontWeight={800}
                  sx={{
                    color:
                      c.textPrimary,
                  }}
                >
                  Inventory
                </Typography>
              </Stack>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <TextField
                    label="Stock Quantity *"
                    value={form.stock}
                    onChange={(e) =>
                      set(
                        "stock",
                        e.target.value
                      )
                    }
                    type="number"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 3,
                        },
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <TextField
                    label="Low Stock Alert (units)"
                    value={
                      form.lowStockAlert
                    }
                    onChange={(e) =>
                      set(
                        "lowStockAlert",
                        e.target.value
                      )
                    }
                    type="number"
                    fullWidth
                    helperText="Stock Out Alert"
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 3,
                        },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* PRODUCT POLICIES */}

          <Grid
            item
            xs={12}
            md={5}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,
              }}
            >
              <Typography
                fontWeight={800}
                mb={2.5}
                sx={{
                  color:
                    c.textPrimary,
                }}
              >
                🛡️ Product Policies
              </Typography>

              <Stack spacing={2}>
                {[
                  {
                    key: "isFeatured",
                    label: "Featured Product",
                    color: c.gold,
                  },

                  {
                    key: "isCOD",
                    label: "Cash on Delivery",
                    color: c.emerald,
                  },

                  {
                    key: "isReturnable",
                    label: "Returnable",
                    color: c.goldDark,
                  },
                ].map((item) => (
                  <Paper
                    key={
                      item.key
                    }
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,

                      background:
                        form[
                          item.key
                        ]
                          ? `${item.color}12`
                          : "rgba(0,0,0,0.02)",

                      border:
                        `1px solid ${
                          form[
                            item.key
                          ]
                            ? `${item.color}45`
                            : c.border
                        }`,

                      transition:
                        "all .2s",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          fontWeight={700}
                          fontSize={14}
                          sx={{
                            color:
                              c.textPrimary,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>

                      <Switch
                        checked={
                          form[
                            item.key
                          ]
                        }
                        onChange={() =>
                          set(
                            item.key,
                            !form[
                              item.key
                            ]
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked":
                            {
                              color:
                                item.color,
                            },

                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor:
                                item.color,
                            },
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}

                {form.isReturnable && (
                  <TextField
                    label="Return Window (days)"
                    value={
                      form.returnDays
                    }
                    onChange={(e) =>
                      set(
                        "returnDays",
                        e.target.value
                      )
                    }
                    type="number"
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 3,
                        },
                    }}
                  />
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
            {/* ═══════════════════════════════════════════════════════════════
          STEP 2: VARIANTS & IMAGES
      ═══════════════════════════════════════════════════════════════ */}

      {step === 2 && (
        <Grid
          container
          spacing={3}
        >
          {/* PRODUCT IMAGES */}

          <Grid
            item
            xs={12}
            md={7}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Typography
                  fontWeight={800}
                  sx={{
                    color:
                      c.textPrimary,
                  }}
                >
                  🖼️ Product Images
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color:
                      c.textSecondary,
                  }}
                >
                  {images.length}/6 uploaded
                </Typography>
              </Stack>

              <Box
                onClick={() =>
                  fileRef.current?.click()
                }
                sx={{
                  border:
                    `2px dashed ${c.gold}`,

                  borderRadius: 4,
                  p: 4,
                  mb: 2,

                  textAlign: "center",
                  cursor: "pointer",

                  background:
                    "rgba(201,164,103,0.03)",

                  transition:
                    "all .2s",

                  "&:hover": {
                    border:
                      `2px dashed ${c.goldDark}`,

                    background:
                      "rgba(201,164,103,0.08)",
                  },
                }}
              >
                <AddPhotoAlternateIcon
                  sx={{
                    fontSize: 40,
                    color:
                      c.gold,
                    mb: 1,
                  }}
                />

                <Typography
                  fontWeight={700}
                  sx={{
                    color:
                      c.goldDark,
                  }}
                >
                  Click to upload images
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      c.textSecondary,
                  }}
                  mt={0.5}
                >
                  PNG, JPG, WEBP up to
                  5MB each · Max 6 images
                </Typography>

                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={
                    handleImageUpload
                  }
                />
              </Box>

              {images.length > 0 && (
                <Grid
                  container
                  spacing={1.5}
                >
                  {images.map(
                    (img, idx) => (
                      <Grid
                        item
                        xs={4}
                        sm={3}
                        key={img.id}
                      >
                        <Box
                          sx={{
                            position:
                              "relative",

                            borderRadius: 3,
                            overflow:
                              "hidden",

                            border:
                              `1px solid ${c.border}`,
                          }}
                        >
                          <Box
                            component="img"
                            src={img.url}
                            sx={{
                              width:
                                "100%",

                              aspectRatio:
                                "1",

                              objectFit:
                                "cover",

                              display:
                                "block",
                            }}
                          />

                          {idx === 0 && (
                            <Chip
                              label="Main"
                              size="small"
                              icon={
                                <StarIcon
                                  sx={{
                                    fontSize:
                                      "12px !important",
                                  }}
                                />
                              }
                              sx={{
                                position:
                                  "absolute",

                                top: 4,
                                left: 4,

                                background:
                                  `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`,

                                color:
                                  "#FFFFFF",

                                fontSize:
                                  10,

                                height:
                                  20,
                              }}
                            />
                          )}

                          <IconButton
                            size="small"
                            onClick={() =>
                              removeImage(
                                img.id
                              )
                            }
                            sx={{
                              position:
                                "absolute",

                              top: 4,
                              right: 4,

                              bgcolor:
                                "rgba(0,0,0,0.6)",

                              color:
                                "#FFFFFF",

                              width: 22,
                              height: 22,

                              "&:hover":
                                {
                                  bgcolor:
                                    c.wine,
                                },
                            }}
                          >
                            <CloseIcon
                              sx={{
                                fontSize:
                                  14,
                              }}
                            />
                          </IconButton>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* COLORS + SIZES */}

          <Grid
            item
            xs={12}
            md={5}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Typography
                fontWeight={800}
                mb={2}
                sx={{
                  color:
                    c.textPrimary,
                }}
              >
                🎨 Available Colors
              </Typography>

              <Box
                sx={{
                  display:
                    "flex",

                  flexWrap:
                    "wrap",

                  gap: 1,
                }}
              >
                {COLORS.map(
                  (color) => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() =>
                        toggleColor(
                          color
                        )
                      }
                      variant={
                        selectedColors.includes(
                          color
                        )
                          ? "filled"
                          : "outlined"
                      }
                      sx={{
                        cursor:
                          "pointer",

                        background:
                          selectedColors.includes(
                            color
                          )
                            ? `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`
                            : "transparent",

                        color:
                          selectedColors.includes(
                            color
                          )
                            ? "#FFFFFF"
                            : c.textPrimary,

                        borderColor:
                          selectedColors.includes(
                            color
                          )
                            ? "transparent"
                            : c.borderStrong,

                        fontWeight:
                          selectedColors.includes(
                            color
                          )
                            ? 700
                            : 400,

                        transition:
                          "all .15s",
                      }}
                    />
                  )
                )}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,
              }}
            >
              <Typography
                fontWeight={800}
                mb={2}
                sx={{
                  color:
                    c.textPrimary,
                }}
              >
                📐 Available Sizes
              </Typography>

              <Box
                sx={{
                  display:
                    "flex",

                  flexWrap:
                    "wrap",

                  gap: 1,
                }}
              >
                {SIZES.map(
                  (size) => (
                    <Chip
                      key={size}
                      label={size}
                      onClick={() =>
                        toggleSize(
                          size
                        )
                      }
                      variant={
                        selectedSizes.includes(
                          size
                        )
                          ? "filled"
                          : "outlined"
                      }
                      sx={{
                        cursor:
                          "pointer",

                        background:
                          selectedSizes.includes(
                            size
                          )
                            ? `linear-gradient(135deg, ${c.goldDark}, ${c.gold})`
                            : "transparent",

                        color:
                          selectedSizes.includes(
                            size
                          )
                            ? "#FFFFFF"
                            : c.textPrimary,

                        borderColor:
                          selectedSizes.includes(
                            size
                          )
                            ? "transparent"
                            : c.borderStrong,

                        fontWeight:
                          selectedSizes.includes(
                            size
                          )
                            ? 700
                            : 400,

                        transition:
                          "all .15s",
                      }}
                    />
                  )
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP 3: SEO & SETTINGS
      ═══════════════════════════════════════════════════════════════ */}

      {step === 3 && (
        <Grid
          container
          spacing={3}
        >
          {/* SEO */}

          <Grid
            item
            xs={12}
            md={8}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,

                mb: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2.5}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <SearchIcon
                    sx={{
                      color:
                        c.goldDark,
                    }}
                  />

                  <Typography
                    fontWeight={800}
                    sx={{
                      color:
                        c.textPrimary,
                    }}
                  >
                    SEO Settings
                  </Typography>
                </Stack>

                <Tooltip
                  title="AI se SEO meta aur tags generate karein"
                >
                  <span>
                    <AIButton
                      onClick={
                        handleAISEO
                      }
                      loading={
                        seoLoading
                      }
                      label="AI SEO Generate ✨"
                    />
                  </span>
                </Tooltip>
              </Stack>

              <Stack spacing={2.5}>
                <TextField
                  label="Meta Title"
                  value={
                    form.metaTitle
                  }
                  onChange={(e) =>
                    set(
                      "metaTitle",
                      e.target.value
                    )
                  }
                  fullWidth
                  placeholder="Search engines title (60 chars)"
                  inputProps={{
                    maxLength: 60,
                  }}
                  helperText={`${form.metaTitle.length}/60 characters`}
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <TextField
                  label="Meta Description"
                  value={
                    form.metaDesc
                  }
                  onChange={(e) =>
                    set(
                      "metaDesc",
                      e.target.value
                    )
                  }
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Search results mein description (160 chars)"
                  inputProps={{
                    maxLength: 160,
                  }}
                  helperText={`${form.metaDesc.length}/160 characters`}
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius: 3,
                      },
                  }}
                />

                <Box>
                  <Typography
                    fontWeight={700}
                    mb={1}
                    fontSize={14}
                    sx={{
                      color:
                        c.textPrimary,
                    }}
                  >
                    Product Tags
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    mb={1.5}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Write Tag and Add"
                      value={
                        tagInput
                      }
                      onChange={(e) =>
                        setTagInput(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) =>
                        e.key ===
                          "Enter" &&
                        addTag()
                      }
                      sx={{
                        "& .MuiOutlinedInput-root":
                          {
                            borderRadius: 3,
                          },
                      }}
                    />

                    <Button
                      variant="contained"
                      size="small"
                      onClick={addTag}
                      startIcon={
                        <AddIcon />
                      }
                      sx={{
                        borderRadius: 3,
                        px: 2,
                        whiteSpace:
                          "nowrap",

                        background:
                          `linear-gradient(90deg, ${c.gold}, ${c.goldDark})`,

                        "&:hover":
                          {
                            background:
                              `linear-gradient(90deg, ${c.goldDark}, #8F703F)`,
                          },
                      }}
                    >
                      Add
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      display:
                        "flex",

                      flexWrap:
                        "wrap",

                      gap: 1,
                    }}
                  >
                    {form.tags.map(
                      (tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() =>
                            set(
                              "tags",
                              form.tags.filter(
                                (t) =>
                                  t !==
                                  tag
                              )
                            )
                          }
                          sx={{
                            background:
                              c.goldLight,

                            border:
                              `1px solid ${c.gold}`,

                            color:
                              c.goldDark,

                            fontWeight: 600,
                          }}
                        />
                      )
                    )}
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* PRODUCT SUMMARY */}

          <Grid
            item
            xs={12}
            md={4}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,

                background:
                  c.surface,

                border:
                  `1px solid ${c.border}`,
              }}
            >
              <Typography
                fontWeight={800}
                mb={2}
                sx={{
                  color:
                    c.textPrimary,
                }}
              >
                📋 Product Summary
              </Typography>

              <Stack spacing={1.5}>
                {[
                  {
                    label: "Name",
                    val:
                      form.name ||
                      "—",
                  },

                  {
                    label: "Category",
                    val:
                      form.category ||
                      "—",
                  },

                  {
                    label: "MRP",
                    val: form.mrp
                      ? `₹${form.mrp}`
                      : "—",
                  },

                  {
                    label: "Price",
                    val: form.sellingPrice
                      ? `₹${form.sellingPrice}`
                      : "—",
                  },

                  {
                    label: "Discount",
                    val:
                      discount > 0
                        ? `${discount}% OFF`
                        : "—",
                  },

                  {
                    label: "Stock",
                    val:
                      form.stock ||
                      "—",
                  },

                  {
                    label: "Images",
                    val: `${images.length} uploaded`,
                  },

                  {
                    label: "Colors",
                    val:
                      selectedColors.length
                        ? selectedColors.join(
                            ", "
                          )
                        : "—",
                  },

                  {
                    label: "Sizes",
                    val:
                      selectedSizes.length
                        ? selectedSizes.join(
                            ", "
                          )
                        : "—",
                  },

                  {
                    label: "Tags",
                    val:
                      form.tags.length
                        ? form.tags.join(
                            ", "
                          )
                        : "—",
                  },

                  {
                    label:
                      "Dimensions",

                    val:
                      Object.keys(
                        form.dimensions
                      ).length
                        ? dimensionFields
                            .filter(
                              (f) =>
                                form
                                  .dimensions[
                                  f.key
                                ]
                            )
                            .map(
                              (f) =>
                                `${f.label.split(" (")[0]}: ${form.dimensions[f.key]}${f.unit || ""}`
                            )
                            .join(
                              ", "
                            ) ||
                          "—"
                        : "—",
                  },
                ].map(
                  (row) => (
                    <Stack
                      key={
                        row.label
                      }
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            c.textSecondary,
                        }}
                      >
                        {row.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          maxWidth: 140,
                          textAlign:
                            "right",
                          wordBreak:
                            "break-word",

                          color:
                            c.textPrimary,
                        }}
                      >
                        {row.val}
                      </Typography>
                    </Stack>
                  )
                )}
              </Stack>

              <Divider
                sx={{
                  my: 2,
                  borderColor:
                    c.border,
                }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  saved ? (
                    <CheckCircleIcon />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSave}
                disabled={saving}
                sx={{
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 700,

                  background: saved
                    ? "linear-gradient(90deg, #3E9B78, #57B08C)"
                    : `linear-gradient(90deg, ${c.gold}, ${c.goldDark})`,

                  boxShadow:
                    "0 4px 20px rgba(201,164,103,0.28)",

                  "&:hover": {
                    background: saved
                      ? "linear-gradient(90deg, #3E9B78, #57B08C)"
                      : "linear-gradient(90deg, #A9864F, #8F703F)",
                  },
                }}
              >
                {saving
                  ? "Saving…"
                  : saved
                  ? "Product Saved!"
                  : "Publish Product"}
              </Button>

              {/* BACKEND STATUS */}

              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 3,
                  textAlign: "center",

                  background:
                    c.emeraldLight,

                  border:
                    "1px solid rgba(62,155,120,0.3)",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color:
                      c.emerald,
                  }}
                >
                  ✅ Backend: /products
                  (via axiosInstance)
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STEP NAVIGATION
      ═══════════════════════════════════════════════════════════════ */}

      <Stack
        direction="row"
        justifyContent="space-between"
        mt={3}
      >
        <Button
          variant="outlined"
          disabled={step === 0}
          onClick={() =>
            setStep(
              (s) => s - 1
            )
          }
          sx={{
            borderRadius: 3,
            px: 3,

            color:
              c.textPrimary,

            borderColor:
              c.borderStrong,

            "&:hover": {
              borderColor:
                c.gold,
            },
          }}
        >
          ← Previous
        </Button>

        <Button
          variant="contained"
          disabled={
            step ===
            steps.length - 1
          }
          onClick={() =>
            setStep(
              (s) => s + 1
            )
          }
          sx={{
            borderRadius: 3,
            px: 3,

            background:
              `linear-gradient(90deg, ${c.gold}, ${c.goldDark})`,

            "&:hover": {
              background:
                "linear-gradient(90deg, #A9864F, #8F703F)",
            },
          }}
        >
          Next →
        </Button>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════
          TOAST
      ═══════════════════════════════════════════════════════════════ */}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() =>
          setToast(
            (t) => ({
              ...t,
              open: false,
            })
          )
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity={toast.sev}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}