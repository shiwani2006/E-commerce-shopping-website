import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Rating,
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const productData = {
  skincare: [
    {
      id: 1,
      name: "SPF 50 Sunscreen",
      price: "₹499",
      tag: "College must-have",
      img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900",
    },
    {
      id: 2,
      name: "Daily Moisturizer",
      price: "₹349",
      tag: "Skin safe",
      img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900",
    },
    {
      id: 3,
      name: "Vitamin C Face Wash",
      price: "₹299",
      tag: "Glow care",
      img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900",
    },
  ],

  beauty: [
    {
      id: 4,
      name: "Glow Makeup Kit",
      price: "₹499",
      tag: "Budget beauty",
      img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900",
    },
    {
      id: 5,
      name: "Daily Lip Tint",
      price: "₹249",
      tag: "Natural look",
      img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900",
    },
    {
      id: 6,
      name: "Compact Powder",
      price: "₹399",
      tag: "Daily makeup",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900",
    },
  ],

  fashion: [
    {
      id: 7,
      name: "Pastel Party Dress",
      price: "₹899",
      tag: "Best for party",
      img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
    },
    {
      id: 8,
      name: "Trendy Crop Top",
      price: "₹499",
      tag: "College fit",
      img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900",
    },
    {
      id: 9,
      name: "Ethnic Kurti",
      price: "₹699",
      tag: "Festive look",
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900",
    },
  ],

  shoes: [
    {
      id: 10,
      name: "White Sneakers",
      price: "₹1,299",
      tag: "College fit",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
    },
    {
      id: 11,
      name: "Pastel Running Shoes",
      price: "₹999",
      tag: "Daily wear",
      img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900",
    },
    {
      id: 12,
      name: "Chunky Sneakers",
      price: "₹1,499",
      tag: "Trending",
      img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900",
    },
  ],

  electronics: [
    {
      id: 13,
      name: "Wireless Headphones",
      price: "₹999",
      tag: "Best audio",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
    },
    {
      id: 14,
      name: "Smart Watch",
      price: "₹1,499",
      tag: "Fitness + style",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
    },
    {
      id: 15,
      name: "Bluetooth Speaker",
      price: "₹799",
      tag: "Mini speaker",
      img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900",
    },
  ],

  bags: [
    {
      id: 16,
      name: "Pastel Tote Bag",
      price: "₹699",
      tag: "College bag",
      img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900",
    },
    {
      id: 17,
      name: "Mini Sling Bag",
      price: "₹599",
      tag: "Cute look",
      img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900",
    },
    {
      id: 18,
      name: "Travel Backpack",
      price: "₹999",
      tag: "Daily use",
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",
    },
  ],

  gift: [
    {
      id: 19,
      name: "Perfume Gift Set",
      price: "₹799",
      tag: "Best gift",
      img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900",
    },
    {
      id: 20,
      name: "Skincare Combo",
      price: "₹999",
      tag: "Self-care gift",
      img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900",
    },
    {
      id: 21,
      name: "Jewelry Box",
      price: "₹499",
      tag: "Cute gift",
      img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900",
    },
  ],
};

const promptSections = [
  {
    title: "Fashion Picks",
    icon: <CheckroomIcon />,
    prompts: [
      "Party dress under ₹1000",
      "College outfit under ₹1500",
      "Best kurti under ₹800",
      "Style me for a date",
    ],
  },
  {
    title: "Beauty & Skincare",
    icon: <FaceRetouchingNaturalIcon />,
    prompts: [
      "Best skincare under ₹500",
      "Makeup kit for beginners",
      "Suggest sunscreen for college",
      "Budget glow-up products",
    ],
  },
  {
    title: "Shoes & Sneakers",
    icon: <ShoppingBagIcon />,
    prompts: [
      "Sneakers for college",
      "White shoes under ₹1500",
      "Daily wear shoes",
      "Comfortable shoes for girls",
    ],
  },
  {
    title: "Gifts & Deals",
    icon: <CardGiftcardIcon />,
    prompts: [
      "Gift for best friend under ₹1000",
      "Cute bag for college",
      "Best headphones under ₹1000",
      "Smart watch under ₹1500",
    ],
  },
];

const detectCategory = (text) => {
  const msg = text.toLowerCase();

  if (
    msg.includes("skincare") ||
    msg.includes("sunscreen") ||
    msg.includes("moisturizer") ||
    msg.includes("face wash") ||
    msg.includes("haircare")
  )
    return "skincare";

  if (
    msg.includes("makeup") ||
    msg.includes("lipstick") ||
    msg.includes("lip tint") ||
    msg.includes("compact") ||
    msg.includes("beauty")
  )
    return "beauty";

  if (
    msg.includes("sneaker") ||
    msg.includes("shoes") ||
    msg.includes("footwear")
  )
    return "shoes";

  if (
    msg.includes("headphone") ||
    msg.includes("speaker") ||
    msg.includes("watch") ||
    msg.includes("electronics") ||
    msg.includes("tech")
  )
    return "electronics";

  if (
    msg.includes("bag") ||
    msg.includes("backpack") ||
    msg.includes("tote") ||
    msg.includes("sling")
  )
    return "bags";

  if (
    msg.includes("gift") ||
    msg.includes("girlfriend") ||
    msg.includes("best friend") ||
    msg.includes("friend")
  )
    return "gift";

  return "fashion";
};

const getAIReply = (text, category) => {
  if (category === "skincare") {
    return `For "${text}", choose beginner-friendly, high-rated and skin-safe products. I found skincare picks below 💜`;
  }

  if (category === "beauty") {
    return `For "${text}", start with daily-use makeup like lip tint, compact and beginner beauty kits. I found beauty picks below 💄`;
  }

  if (category === "shoes") {
    return `For "${text}", go with comfy, trendy and college-friendly footwear. I found sneaker picks below 👟`;
  }

  if (category === "electronics") {
    return `For "${text}", I found useful and budget-friendly electronics below 🎧`;
  }

  if (category === "bags") {
    return `For "${text}", I found cute, useful and aesthetic bag options below 👜`;
  }

  if (category === "gift") {
    return `For "${text}", I found cute gift ideas below 🎁`;
  }

  return `For "${text}", I found trendy and budget-friendly fashion picks below ✨`;
};

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [chatClosed, setChatClosed] = useState(false);
  const [rating, setRating] = useState(0);

  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi Shiwani 👋 I’m your ShopSphere AI Shopping Assistant. Ask me about outfits, skincare, shoes, gifts or products.",
      products: [],
      reviewBox: false,
    },
  ]);

  const addToCart = (product) => {
    const oldCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = oldCart.find((item) => item.id === product.id);

    const updatedCart = existing
      ? oldCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      : [...oldCart, { ...product, quantity: 1 }];

    localStorage.setItem("cart", JSON.stringify(updatedCart));

    window.dispatchEvent(
      new CustomEvent("shopsphere-notification", {
        detail: {
          type: "cart",
          message: `${product.name} added to cart 🛍️`,
        },
      })
    );
  };

  const viewProduct = (product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = `/product/${product.id}`;
  };

  const closeChatWithReview = () => {
    setMessages((prev) => [
      ...prev,
      {
        from: "ai",
        text: "Did you like my suggestion? Please give a quick review ⭐",
        products: [],
        reviewBox: true,
      },
    ]);

    setChatClosed(true);
  };

  const submitReview = (value) => {
    setRating(value);

    const oldReviews = JSON.parse(localStorage.getItem("aiAssistantReviews")) || [];

    localStorage.setItem(
      "aiAssistantReviews",
      JSON.stringify([
        ...oldReviews,
        {
          rating: value,
          date: new Date().toLocaleString(),
        },
      ])
    );

    setMessages((prev) => [
      ...prev,
      {
        from: "ai",
        text: `Thank you for your ${value}-star review 💜 Chat closed. Start a new chat anytime.`,
        products: [],
        reviewBox: false,
      },
    ]);
  };

  const startNewChat = () => {
    setInput("");
    setRating(0);
    setChatClosed(false);

    setMessages([
      {
        from: "ai",
        text: "New chat started 💜 Tell me what you want to shop today.",
        products: [],
        reviewBox: false,
      },
    ]);
  };

  const sendMessage = (text = input) => {
    if (!text.trim() || chatClosed) return;

    const category = detectCategory(text);
    const products = productData[category] || productData.fashion;

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text,
        products: [],
        reviewBox: false,
      },
    ]);

    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: getAIReply(text, category),
          products,
          reviewBox: false,
        },
      ]);

      setTimeout(() => {
        closeChatWithReview();
      }, 900);
    }, 500);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          background: "linear-gradient(135deg,#7c3aed,#ec4899,#fb7185)",
          color: "white",
          boxShadow: "0 28px 75px rgba(236,72,153,.24)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Chip
          icon={<SmartToyIcon />}
          label="AI Shopping Assistant"
          sx={{
            bgcolor: "rgba(255,255,255,.22)",
            color: "white",
            fontWeight: 900,
            mb: 2,
          }}
        />

        <Typography variant="h3" fontWeight={900}>
          ShopSphere AI
        </Typography>

        <Typography sx={{ mt: 1, opacity: 0.92, maxWidth: 760 }}>
          AI gives one smart suggestion, asks for review, closes chat and gives
          option to start a new chat.
        </Typography>
      </Paper>

      <Grid container spacing={1.5}>
        <Grid item xs={12} lg={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.92)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>
                <SmartToyIcon />
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Chat with AI
                </Typography>
                <Typography
                  sx={{
                    color: chatClosed ? "#ef4444" : "#16a34a",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {chatClosed ? "Chat closed • Review required" : "Online now"}
                </Typography>
              </Box>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                height: 520,
                overflowY: "auto",
                borderRadius: 4,
                bgcolor: "#fff7fb",
                border: "1px solid #f5d0fe",
              }}
            >
              <Stack spacing={1.2}>
                {messages.map((msg, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.4,
                        maxWidth: msg.products?.length ? "95%" : "82%",
                        borderRadius: 4,
                        background:
                          msg.from === "user"
                            ? "linear-gradient(90deg,#8b5cf6,#ec4899)"
                            : "white",
                        color: msg.from === "user" ? "white" : "#24143f",
                        boxShadow: "0 8px 22px rgba(124,58,237,.08)",
                      }}
                    >
                      <Typography fontWeight={800} fontSize={14}>
                        {msg.text}
                      </Typography>

                      {msg.products?.length > 0 && (
                        <Grid container spacing={1.2} sx={{ mt: 1 }}>
                          {msg.products.map((product) => (
                            <Grid item xs={12} md={4} key={product.id}>
                              <Paper
                                elevation={0}
                                sx={{
                                  overflow: "hidden",
                                  borderRadius: 4,
                                  bgcolor: "#fff7fb",
                                  border: "1px solid #f5d0fe",
                                  height: "100%",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={product.img}
                                  alt={product.name}
                                  sx={{
                                    width: "100%",
                                    height: 120,
                                    objectFit: "cover",
                                  }}
                                />

                                <Box sx={{ p: 1.2 }}>
                                  <Chip
                                    label={product.tag}
                                    size="small"
                                    sx={{
                                      bgcolor: "#f3e8ff",
                                      color: "#7c3aed",
                                      fontWeight: 900,
                                      mb: 0.8,
                                    }}
                                  />

                                  <Typography fontWeight={900} fontSize={14}>
                                    {product.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      color: "#ec4899",
                                      fontWeight: 900,
                                      mt: 0.4,
                                    }}
                                  >
                                    {product.price}
                                  </Typography>

                                  <Stack spacing={0.8} sx={{ mt: 1 }}>
                                    <Button
                                      fullWidth
                                      size="small"
                                      startIcon={<ShoppingBagIcon />}
                                      onClick={() => addToCart(product)}
                                      sx={{
                                        borderRadius: 99,
                                        background:
                                          "linear-gradient(90deg,#8b5cf6,#ec4899)",
                                        color: "white",
                                        fontWeight: 900,
                                        textTransform: "none",
                                      }}
                                    >
                                      Add to Cart
                                    </Button>

                                    <Button
                                      fullWidth
                                      size="small"
                                      startIcon={<VisibilityIcon />}
                                      onClick={() => viewProduct(product)}
                                      sx={{
                                        borderRadius: 99,
                                        bgcolor: "white",
                                        color: "#7c3aed",
                                        fontWeight: 900,
                                        textTransform: "none",
                                        border: "1px solid #e9d5ff",
                                      }}
                                    >
                                      View Product
                                    </Button>
                                  </Stack>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      )}

                      {msg.reviewBox && (
                        <Box sx={{ mt: 1.5 }}>
                          <Rating
                            value={rating}
                            onChange={(e, newValue) => {
                              if (newValue) submitReview(newValue);
                            }}
                          />

                          <Typography fontSize={13} fontWeight={700} color="#7c3aed">
                            Tap stars to submit your review.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {chatClosed ? (
              <Button
                fullWidth
                startIcon={<RestartAltIcon />}
                onClick={startNewChat}
                sx={{
                  mt: 1.5,
                  borderRadius: 99,
                  py: 1.2,
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  color: "white",
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Start New Chat
              </Button>
            ) : (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask: skincare under ₹500, comfortable shoes, gifts..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 99,
                      bgcolor: "#fff7fb",
                      fontWeight: 800,
                    },
                  }}
                />

                <Button
                  onClick={() => sendMessage()}
                  sx={{
                    minWidth: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                    color: "white",
                  }}
                >
                  <SendIcon />
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4.5}>
          <Stack spacing={1.5}>
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
                Ready AI Prompts
              </Typography>

              <Stack spacing={2}>
                {promptSections.map((section) => (
                  <Box key={section.title}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: "#f3e8ff",
                          color: "#ec4899",
                        }}
                      >
                        {section.icon}
                      </Avatar>

                      <Typography fontWeight={900}>{section.title}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {section.prompts.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          disabled={chatClosed}
                          onClick={() => sendMessage(item)}
                          clickable
                          sx={{
                            bgcolor: "#f3e8ff",
                            color: "#7c3aed",
                            fontWeight: 900,
                            mb: 0.5,
                            "&:hover": {
                              bgcolor: "#ec4899",
                              color: "white",
                            },
                          }}
                        />
                      ))}
                    </Stack>

                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                color: "white",
              }}
            >
              <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", mb: 1.5 }}>
                <AutoAwesomeIcon />
              </Avatar>

              <Typography variant="h6" fontWeight={900}>
                Smart One-Shot Suggestion
              </Typography>

              <Typography sx={{ mt: 1, opacity: 0.92 }}>
                AI gives suggestion, shows products, takes review and then starts fresh chat.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}