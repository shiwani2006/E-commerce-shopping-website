import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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

import CreditCardIcon from "@mui/icons-material/CreditCard";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import UpiIcon from "@mui/icons-material/CurrencyRupee";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getPaymentOverview,
  getCards,
  addCardApi,
  deleteCardApi,
  getTransactions,
  addMoneyApi,
  updateUpiApi,
} from "../../api/paymentsApi";

import {
  getSecuritySettings,
  changePasswordApi,
  toggle2FAApi,
} from "../../api/securityApi";

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [overview, setOverview] = useState({
    walletBalance: 0,
    upiId: "",
    cardsCount: 0,
    security: 100,
  });

  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [newCard, setNewCard] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
  });

  // Security settings state
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    email: "",
    twoFactorEnabled: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  // Add Money dialog state
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneySubmitting, setAddMoneySubmitting] = useState(false);
  const [addMoneyMsg, setAddMoneyMsg] = useState({ type: "", text: "" });

  // Link/Change UPI dialog state
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiInput, setUpiInput] = useState("");
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [upiMsg, setUpiMsg] = useState({ type: "", text: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, cardsData, txnData, secData] = await Promise.all([
        getPaymentOverview(),
        getCards(),
        getTransactions(),
        getSecuritySettings(),
      ]);

      setOverview(overviewData);
      setCards(cardsData);
      setTransactions(txnData);
      setSecuritySettings(secData);
    } catch (err) {
      console.error("Payments load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCard = async () => {
    if (!newCard.cardName || !newCard.cardNumber || !newCard.expiry) return;

    try {
      const created = await addCardApi(newCard);
      setCards((prev) => [created, ...prev]);
      setOverview((prev) => ({ ...prev, cardsCount: prev.cardsCount + 1 }));
      setNewCard({ cardName: "", cardNumber: "", expiry: "" });
      setOpen(false);
    } catch (err) {
      console.error("Add card error:", err);
    }
  };

  const removeCard = async (id) => {
    try {
      await deleteCardApi(id);
      setCards((prev) => prev.filter((c) => c._id !== id));
      setOverview((prev) => ({ ...prev, cardsCount: prev.cardsCount - 1 }));
    } catch (err) {
      console.error("Delete card error:", err);
    }
  };

  const handlePasswordChange = async () => {
    setSecurityMsg({ type: "", text: "" });

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSecurityMsg({ type: "error", text: "Please fill both fields" });
      return;
    }

    try {
      await changePasswordApi(passwordForm.currentPassword, passwordForm.newPassword);
      setSecurityMsg({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setSecurityMsg({ type: "error", text: err.message });
    }
  };

  const handleToggle2FA = async () => {
    try {
      const result = await toggle2FAApi();
      setSecuritySettings((prev) => ({ ...prev, twoFactorEnabled: result.twoFactorEnabled }));
    } catch (err) {
      console.error("2FA toggle error:", err);
    }
  };

  // ---- Add Money handlers ----
  const handleAddMoney = async () => {
    setAddMoneyMsg({ type: "", text: "" });

    const amount = Number(addMoneyAmount);
    if (!addMoneyAmount || isNaN(amount) || amount <= 0) {
      setAddMoneyMsg({ type: "error", text: "Enter a valid amount" });
      return;
    }

    try {
      setAddMoneySubmitting(true);
      const result = await addMoneyApi(amount);
      setOverview((prev) => ({
        ...prev,
        walletBalance: result.walletBalance ?? prev.walletBalance + amount,
      }));
      setAddMoneyMsg({ type: "success", text: "Money added to wallet!" });
      setAddMoneyAmount("");
      setTimeout(() => {
        setAddMoneyOpen(false);
        setAddMoneyMsg({ type: "", text: "" });
      }, 900);
    } catch (err) {
      setAddMoneyMsg({ type: "error", text: err.message || "Failed to add money" });
    } finally {
      setAddMoneySubmitting(false);
    }
  };

  // ---- UPI handlers ----
  const openUpiDialog = () => {
    setUpiInput(overview.upiId || "");
    setUpiMsg({ type: "", text: "" });
    setUpiOpen(true);
  };

  const handleSaveUpi = async () => {
    setUpiMsg({ type: "", text: "" });

    const upiPattern = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiInput || !upiPattern.test(upiInput)) {
      setUpiMsg({ type: "error", text: "Enter a valid UPI ID (e.g. name@bank)" });
      return;
    }

    try {
      setUpiSubmitting(true);
      const result = await updateUpiApi(upiInput);
      setOverview((prev) => ({ ...prev, upiId: result.upiId ?? upiInput }));
      setUpiMsg({ type: "success", text: "UPI linked successfully!" });
      setTimeout(() => {
        setUpiOpen(false);
        setUpiMsg({ type: "", text: "" });
      }, 900);
    } catch (err) {
      setUpiMsg({ type: "error", text: err.message || "Failed to link UPI" });
    } finally {
      setUpiSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#ec4899" }} />
      </Box>
    );
  }

  return (
    <Box>
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

        <Grid container spacing={2.5} alignItems="center" sx={{ position: "relative", zIndex: 2 }}>
          <Grid item xs={12} md={8}>
            <Chip
              icon={<PaymentIcon />}
              label="Secure Payments"
              sx={{
                bgcolor: "rgba(255,255,255,.22)",
                color: "white",
                fontWeight: 900,
                mb: 2,
              }}
            />

            <Typography variant="h3" fontWeight={900}>
              Payments & Wallet
            </Typography>

            <Typography sx={{ mt: 1, opacity: 0.92 }}>
              Manage saved cards, wallet balance, UPI and transaction history.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
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
                  <AccountBalanceWalletIcon />
                </Avatar>

                <Box>
                  <Typography fontWeight={900}>Wallet Balance</Typography>
                  <Typography variant="h5" fontWeight={900}>
                    ₹{overview.walletBalance.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min((overview.walletBalance / 5000) * 100, 100)}
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
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {[
          ["Saved Cards", overview.cardsCount, <CreditCardIcon />],
          [
            "Wallet",
            `₹${(overview.walletBalance / 1000).toFixed(1)}K`,
            <AccountBalanceWalletIcon />,
          ],
          ["UPI Linked", overview.upiId ? "Yes" : "No", <UpiIcon />],
          ["Security", `${overview.security}%`, <SecurityIcon />],
        ].map(([title, value, icon]) => (
          <Grid item xs={6} md={3} key={title}>
            <Paper
              elevation={0}
              sx={{
                p: 2.1,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,.92)",
                cursor: "pointer",
                boxShadow: "0 14px 40px rgba(124,58,237,.09)",
                transition: ".3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 24px 60px rgba(236,72,153,.16)",
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
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

      <Grid container spacing={1.5}>
        <Grid item xs={12} lg={8}>
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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    Saved Cards
                  </Typography>
                  <Typography sx={{ color: "#6b647a" }}>
                    Manage cards used for fast checkout.
                  </Typography>
                </Box>

                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
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
                  Add Card
                </Button>
              </Stack>

              {cards.length === 0 ? (
                <Typography sx={{ color: "#6b647a", textAlign: "center", py: 3 }}>
                  No cards saved yet. Add one to get started.
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {cards.map((card) => (
                    <Grid item xs={12} md={6} key={card._id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 5,
                          background: "linear-gradient(135deg,#24143f,#7c3aed)",
                          color: "white",
                          overflow: "hidden",
                          position: "relative",
                          minHeight: 190,
                          transition: ".3s",
                          "&:hover": { transform: "translateY(-6px)" },
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            right: -45,
                            top: -45,
                            width: 150,
                            height: 150,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,.1)",
                          }}
                        />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ position: "relative", zIndex: 2 }}
                        >
                          <Typography fontWeight={900}>{card.cardName}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={card.type}
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,.2)",
                                color: "white",
                                fontWeight: 900,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeCard(card._id)}
                              sx={{ color: "white" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Typography sx={{ mt: 4, letterSpacing: 2, fontSize: 20 }}>
                          •••• •••• •••• {card.last4}
                        </Typography>

                        <Typography sx={{ mt: 1, opacity: 0.8 }}>
                          Expires {card.expiry}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            <Grid container spacing={1.5}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: "100%",
                    borderRadius: 5,
                    background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                    color: "white",
                    boxShadow: "0 24px 60px rgba(236,72,153,.2)",
                  }}
                >
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", mb: 1.5 }}>
                    <AccountBalanceWalletIcon />
                  </Avatar>

                  <Typography variant="h6" fontWeight={900}>
                    ShopSphere Wallet
                  </Typography>
                  <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
                    Use wallet balance for faster checkout and refunds.
                  </Typography>

                  <Button
                    onClick={() => {
                      setAddMoneyMsg({ type: "", text: "" });
                      setAddMoneyOpen(true);
                    }}
                    sx={{
                      mt: 2,
                      borderRadius: 99,
                      bgcolor: "white",
                      color: "#7c3aed",
                      px: 3,
                      fontWeight: 900,
                      textTransform: "none",
                    }}
                  >
                    Add Money
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: "100%",
                    borderRadius: 5,
                    bgcolor: "rgba(255,255,255,.92)",
                    boxShadow: "0 16px 45px rgba(124,58,237,.11)",
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}>
                      <UpiIcon />
                    </Avatar>

                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        UPI Linked
                      </Typography>
                      <Typography sx={{ color: "#6b647a" }}>
                        {overview.upiId || "No UPI linked yet"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    onClick={openUpiDialog}
                    sx={{
                      mt: 2,
                      borderRadius: 99,
                      py: 1.05,
                      bgcolor: "#f3e8ff",
                      color: "#7c3aed",
                      fontWeight: 900,
                      textTransform: "none",
                    }}
                  >
                    {overview.upiId ? "Change UPI" : "Link UPI"}
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
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
                Recent Transactions
              </Typography>

              {transactions.length === 0 ? (
                <Typography sx={{ color: "#6b647a", textAlign: "center", py: 2 }}>
                  No transactions yet.
                </Typography>
              ) : (
                <Stack spacing={1.3}>
                  {transactions.map((txn) => (
                    <Paper
                      key={txn.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 4,
                        bgcolor: "#fff7fb",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography fontWeight={900}>{txn.name}</Typography>
                          <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                            {txn.mode} • {formatDate(txn.date)}
                          </Typography>
                        </Box>

                        <Typography fontWeight={900} color="#ec4899">
                          ₹{txn.amount}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                color: "white",
                boxShadow: "0 24px 60px rgba(236,72,153,.2)",
              }}
            >
              <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", mb: 1.5 }}>
                <VerifiedIcon />
              </Avatar>

              <Typography variant="h6" fontWeight={900}>
                Payment Security
              </Typography>
              <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
                Your saved payment methods are encrypted and protected.
              </Typography>

              <Button
                onClick={() => setSecurityOpen(true)}
                sx={{
                  mt: 2,
                  borderRadius: 99,
                  bgcolor: "white",
                  color: "#7c3aed",
                  px: 3,
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Security Settings
              </Button>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 5,
                bgcolor: "#fff7fb",
                boxShadow: "0 14px 40px rgba(124,58,237,.08)",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: "#f3e8ff", color: "#ec4899" }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography fontWeight={900}>Spending Insight</Typography>
                  <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                    Track your savings as you shop more with ShopSphere.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Add Card Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Add New Card
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                Save card for faster checkout.
              </Typography>
            </Box>

            <IconButton onClick={() => setOpen(false)} sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <TextField
              label="Card Name"
              value={newCard.cardName}
              onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            <TextField
              label="Card Number"
              value={newCard.cardNumber}
              onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            <TextField
              label="Expiry"
              placeholder="MM/YY"
              value={newCard.expiry}
              onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            <Button
              fullWidth
              onClick={addCard}
              sx={{
                borderRadius: 99,
                py: 1.2,
                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                color: "white",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              Save Card
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Security Settings Dialog */}
      <Dialog
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Security Settings
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                Manage your password and account protection.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setSecurityOpen(false)}
              sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <Typography fontWeight={900}>Change Password</Typography>

            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            {securityMsg.text && (
              <Typography
                sx={{
                  color: securityMsg.type === "success" ? "#16a34a" : "#dc2626",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {securityMsg.text}
              </Typography>
            )}

            <Button
              fullWidth
              onClick={handlePasswordChange}
              sx={{
                borderRadius: 99,
                py: 1.2,
                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                color: "white",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              Update Password
            </Button>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2, p: 2, borderRadius: 4, bgcolor: "#fff7fb" }}
            >
              <Box>
                <Typography fontWeight={900}>Two-Factor Authentication</Typography>
                <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                  Extra layer of security for your account
                </Typography>
              </Box>

              <Switch
                checked={securitySettings.twoFactorEnabled}
                onChange={handleToggle2FA}
                color="secondary"
              />
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
        maxWidth="xs"
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Add Money
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                Top up your ShopSphere wallet.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setAddMoneyOpen(false)}
              sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <TextField
              label="Amount (₹)"
              type="number"
              value={addMoneyAmount}
              onChange={(e) => setAddMoneyAmount(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            <Stack direction="row" spacing={1}>
              {[100, 500, 1000, 2000].map((amt) => (
                <Chip
                  key={amt}
                  label={`₹${amt}`}
                  onClick={() => setAddMoneyAmount(String(amt))}
                  sx={{
                    bgcolor: "#f3e8ff",
                    color: "#7c3aed",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Stack>

            {addMoneyMsg.text && (
              <Typography
                sx={{
                  color: addMoneyMsg.type === "success" ? "#16a34a" : "#dc2626",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {addMoneyMsg.text}
              </Typography>
            )}

            <Button
              fullWidth
              disabled={addMoneySubmitting}
              onClick={handleAddMoney}
              sx={{
                borderRadius: 99,
                py: 1.2,
                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                color: "white",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              {addMoneySubmitting ? "Adding..." : "Add Money"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Link / Change UPI Dialog */}
      <Dialog
        open={upiOpen}
        onClose={() => setUpiOpen(false)}
        maxWidth="xs"
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                {overview.upiId ? "Change UPI" : "Link UPI"}
              </Typography>
              <Typography sx={{ color: "#6b647a" }}>
                Link your UPI ID for quick payments.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setUpiOpen(false)}
              sx={{ bgcolor: "#fff1f7", color: "#ec4899" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1.5}>
            <TextField
              label="UPI ID"
              placeholder="yourname@bank"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#fff7fb" } }}
            />

            {upiMsg.text && (
              <Typography
                sx={{
                  color: upiMsg.type === "success" ? "#16a34a" : "#dc2626",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {upiMsg.text}
              </Typography>
            )}

            <Button
              fullWidth
              disabled={upiSubmitting}
              onClick={handleSaveUpi}
              sx={{
                borderRadius: 99,
                py: 1.2,
                background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
                color: "white",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              {upiSubmitting ? "Saving..." : "Save UPI"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}