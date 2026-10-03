import { useState } from "react";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReplayIcon from "@mui/icons-material/Replay";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedIcon from "@mui/icons-material/Verified";
import SendIcon from "@mui/icons-material/Send";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ShieldIcon from "@mui/icons-material/Shield";
import StarIcon from "@mui/icons-material/Star";
import MoodIcon from "@mui/icons-material/Mood";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CancelIcon from "@mui/icons-material/Cancel";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DiscountIcon from "@mui/icons-material/Discount";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StraightenIcon from "@mui/icons-material/Straighten";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const quickTopics = [
  {
    title: "Track My Order",
    text: "Track your order in real-time",
    icon: <LocalShippingIcon />,
    reply: "Sure 💜 Please share your Order ID. I’ll help you track it.",
  },
  {
    title: "Cancel My Order",
    text: "Cancel your order easily",
    icon: <CancelIcon />,
    reply: "I can help with cancellation. Please share your Order ID.",
  },
  {
    title: "Return / Refund",
    text: "Start return or refund request",
    icon: <ReplayIcon />,
    reply: "I can help you with returns. Please share your Order ID and reason.",
  },
  {
    title: "Exchange Product",
    text: "Request product exchange",
    icon: <SwapHorizIcon />,
    reply: "Exchange request noted. Please share product name and order ID.",
  },
  {
    title: "Payment Issue",
    text: "Payment failed or debited issue",
    icon: <PaymentIcon />,
    reply: "For payment issues, please share transaction ID or order ID.",
  },
  {
    title: "Delivery Delay",
    text: "My order is delayed",
    icon: <LocalShippingIcon />,
    reply: "Sorry for delay. Please share your Order ID so I can check status.",
  },
  {
    title: "Coupon / Discount",
    text: "Apply coupon or check offers",
    icon: <DiscountIcon />,
    reply: "Use SHOPS10 for ₹200 off. Tell me your cart value for best coupon.",
  },
  {
    title: "Product Not Received",
    text: "I didn't receive my order",
    icon: <InventoryIcon />,
    reply: "I’ll help you report this. Please share your Order ID.",
  },
  {
    title: "Wrong Product",
    text: "Received wrong product",
    icon: <ReportProblemIcon />,
    reply: "Sorry bro. Please share product image and Order ID for replacement.",
  },
  {
    title: "Damaged Item",
    text: "Product received is damaged",
    icon: <ReportProblemIcon />,
    reply: "I can start damage claim. Please share Order ID and product photo.",
  },
  {
    title: "Size / Color Issue",
    text: "Wrong size or color received",
    icon: <StraightenIcon />,
    reply: "No worries. Please share your Order ID and preferred size/color.",
  },
  {
    title: "Account / Login",
    text: "Login or account related issue",
    icon: <PersonIcon />,
    reply: "Tell me what issue you’re facing: login, password, or profile?",
  },
  {
    title: "Wallet / Refund Status",
    text: "Check wallet or refund status",
    icon: <AccountBalanceWalletIcon />,
    reply: "Please share your refund/order ID. I’ll check the refund status.",
  },
  {
    title: "How to Place Order",
    text: "Help me place an order",
    icon: <ShoppingBagIcon />,
    reply: "Choose product → Add to cart → Checkout → Select payment. I can guide step by step.",
  },
  {
    title: "Offer Details",
    text: "More details about offers",
    icon: <LocalOfferIcon />,
    reply: "Today’s best offer: SHOPS10 gives ₹200 off on eligible carts.",
  },
  {
    title: "Other Queries",
    text: "Any other issue or question",
    icon: <ChatIcon />,
    reply: "Sure, tell me your issue. I’m here to help 💜",
  },
];

export default function Support() {
  const [chatInput, setChatInput] = useState("");

  const [chat, setChat] = useState([
    {
      from: "agent",
      text: "Hi Shiwani 👋 How can I help you today?",
    },
  ]);

  const chooseTopic = (topic) => {
    setChat((prev) => [
      ...prev,
      {
        from: "user",
        text: topic.title,
      },
      {
        from: "agent",
        text: topic.reply,
      },
    ]);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;

    setChat((prev) => [
      ...prev,
      {
        from: "user",
        text: userText,
      },
      {
        from: "agent",
        text: "Thanks 💜 Our premium support team is reviewing your message. I can also help you choose a topic above for faster support.",
      },
    ]);

    setChatInput("");
  };

  const newChat = () => {
    setChat([
      {
        from: "agent",
        text: "New chat started ✨ Choose a topic or type your issue.",
      },
    ]);
    setChatInput("");
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: { xs: 3, md: 3.5 },
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#fff7fb 0%,#f5edff 45%,#eef7ff 100%)",
          boxShadow: "0 30px 80px rgba(124,58,237,.13)",
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 76,
                  height: 76,
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                  color: "white",
                  boxShadow: "0 18px 40px rgba(236,72,153,.22)",
                }}
              >
                <SupportAgentIcon sx={{ fontSize: 38 }} />
              </Avatar>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="h3" fontWeight={900} color="#24143f">
                    Help & Support
                  </Typography>

                  <Chip
                    icon={<WorkspacePremiumIcon />}
                    label="Platinum Support"
                    sx={{
                      bgcolor: "#f3e8ff",
                      color: "#7c3aed",
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                <Typography sx={{ mt: 1, color: "#6b647a", fontWeight: 700 }}>
                  We are here to help you 24/7 with premium support 💜
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.85)",
                border: "1px solid rgba(236,72,153,.14)",
              }}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                  <ShieldIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={900}>ShopSphere Promise</Typography>
                  <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                    Fast • Friendly • Reliable
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {[
          ["Live Agents", "24/7", "Always Online", <SupportAgentIcon />],
          ["Tickets Solved", "12.4K+", "This Month", <VerifiedIcon />],
          ["Customer Rating", "4.9", "★★★★★", <StarIcon />],
          ["Happy Customers", "98%", "Satisfaction", <MoodIcon />],
          ["Secure Support", "100%", "Protected", <ShieldIcon />],
        ].map(([title, value, desc, icon]) => (
          <Grid item xs={12} sm={6} md={2.4} key={title}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                height: "100%",
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,.92)",
                boxShadow: "0 14px 40px rgba(124,58,237,.08)",
                transition: ".3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 24px 60px rgba(236,72,153,.16)",
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={900} color="#31235c">
                    {title}
                  </Typography>

                  <Typography variant="h5" fontWeight={900}>
                    {value}
                  </Typography>

                  <Typography sx={{ color: "#16a34a", fontSize: 13, fontWeight: 800 }}>
                    ● {desc}
                  </Typography>
                </Box>

                <Avatar sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}>
                  {icon}
                </Avatar>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} lg={5.8}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.94)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                  <ChatIcon />
                </Avatar>

                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Live Chat
                  </Typography>
                  <Typography sx={{ color: "#16a34a", fontSize: 14, fontWeight: 800 }}>
                    ● Agent online now
                  </Typography>
                </Box>
              </Stack>

              <Button
                onClick={newChat}
                sx={{
                  borderRadius: 99,
                  px: 2.5,
                  bgcolor: "#f3e8ff",
                  color: "#7c3aed",
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                New Chat
              </Button>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 4,
                bgcolor: "#fff7fb",
                border: "1px solid rgba(236,72,153,.08)",
              }}
            >
              <Typography fontWeight={900} color="#31235c" sx={{ mb: 1.5 }}>
                Choose a topic to get started
              </Typography>

              <Grid container spacing={1}>
                {quickTopics.map((topic) => (
                  <Grid item xs={12} sm={6} key={topic.title}>
                    <Button
                      fullWidth
                      onClick={() => chooseTopic(topic)}
                      startIcon={topic.icon}
                      sx={{
                        justifyContent: "flex-start",
                        borderRadius: 4,
                        py: 1.1,
                        px: 1.5,
                        bgcolor: "white",
                        color: "#31235c",
                        fontWeight: 900,
                        textTransform: "none",
                        border: "1px solid rgba(124,58,237,.08)",
                        "&:hover": {
                          bgcolor: "#f3e8ff",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {topic.title}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                height: 300,
                overflowY: "auto",
                borderRadius: 4,
                bgcolor: "#fff7fb",
              }}
            >
              <Stack spacing={1.2}>
                {chat.map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: item.from === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.4,
                        maxWidth: "78%",
                        borderRadius: 4,
                        background:
                          item.from === "user"
                            ? "linear-gradient(90deg,#8b5cf6,#ec4899)"
                            : "white",
                        color: item.from === "user" ? "white" : "#24143f",
                      }}
                    >
                      <Typography fontWeight={800} fontSize={14}>
                        {item.text}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 99,
                    bgcolor: "#fff7fb",
                  },
                }}
              />

              <Button
                onClick={sendChat}
                sx={{
                  minWidth: 54,
                  borderRadius: "50%",
                  background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                  color: "white",
                }}
              >
                <SendIcon />
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6.2}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.94)",
              boxShadow: "0 16px 45px rgba(124,58,237,.11)",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                <WorkspacePremiumIcon />
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Popular Help Topics
                </Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                  Select a topic and we’ll guide you instantly
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={1.2}>
              {quickTopics.map((topic) => (
                <Grid item xs={12} sm={6} key={topic.title}>
                  <Paper
                    onClick={() => chooseTopic(topic)}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 4,
                      cursor: "pointer",
                      bgcolor: "white",
                      border: "1px solid rgba(124,58,237,.08)",
                      transition: ".3s",
                      "&:hover": {
                        transform: "translateX(5px)",
                        bgcolor: "#fff7fb",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                        {topic.icon}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={900} color="#31235c">
                          {topic.title}
                        </Typography>
                        <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                          {topic.text}
                        </Typography>
                      </Box>

                      <KeyboardArrowRightIcon sx={{ color: "#6b647a" }} />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 1.5,
          p: 2.5,
          borderRadius: 5,
          bgcolor: "rgba(255,255,255,.94)",
          boxShadow: "0 16px 45px rgba(124,58,237,.09)",
        }}
      >
        <Typography variant="h6" fontWeight={900}>
          Other Ways to Reach Us
        </Typography>

        <Typography sx={{ color: "#6b647a", mb: 2 }}>
          We’re available on multiple channels
        </Typography>

        <Grid container spacing={1.5}>
          {[
            [<EmailIcon />, "Email Support", "support@shopsphere.com", "24/7 Response"],
            [<PhoneIcon />, "Phone Support", "+91 98765 43210", "9 AM - 9 PM"],
            [<ChatIcon />, "Live Chat", "Chat with our agents", "Instant Help"],
            [<AccessTimeIcon />, "Average Response Time", "Under 10 Minutes", "We value your time 💜"],
          ].map(([icon, title, text, sub]) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: "#fff7fb",
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                    {icon}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={900}>{title}</Typography>
                    <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                      {text}
                    </Typography>
                    <Typography sx={{ color: "#16a34a", fontSize: 12, fontWeight: 900 }}>
                      {sub}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}