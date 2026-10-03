import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";

import {
  Campaign,
  TrendingUp,
  Groups,
  Paid,
  Add,
  AutoAwesome,
  Email,
  LocalOffer,
  FlashOn,
  Search,
  Edit,
  Delete,
  Pause,
  PlayArrow,
} from "@mui/icons-material";

/* ---------------- STATS ---------------- */

const marketingStats = [
  {
    title: "Total Campaigns",
    value: "28",
    icon: <Campaign />,
    gradient:
      "linear-gradient(135deg,#8b5cf6,#ec4899)",
  },
  {
    title: "Active Campaigns",
    value: "16",
    icon: <TrendingUp />,
    gradient:
      "linear-gradient(135deg,#10b981,#22c55e)",
  },
  {
    title: "Audience Reach",
    value: "124K",
    icon: <Groups />,
    gradient:
      "linear-gradient(135deg,#06b6d4,#3b82f6)",
  },
  {
    title: "Revenue Generated",
    value: "₹4.8L",
    icon: <Paid />,
    gradient:
      "linear-gradient(135deg,#f59e0b,#f97316)",
  },
];

/* ---------------- INITIAL DATA ---------------- */

const initialCampaigns = [
  {
    id: 1,
    name: "Summer Sale",
    type: "Coupon Campaign",
    budget: "₹10,000",
    reach: "15,000",
    conversion: "12%",
    status: "Active",
  },
  {
    id: 2,
    name: "Festival Blast",
    type: "Email Marketing",
    budget: "₹20,000",
    reach: "32,000",
    conversion: "18%",
    status: "Active",
  },
  {
    id: 3,
    name: "Flash Friday",
    type: "Flash Sale",
    budget: "₹8,000",
    reach: "9,500",
    conversion: "9%",
    status: "Paused",
  },
];

export default function VendorMarketing() {
  const [campaigns, setCampaigns] =
    useState(initialCampaigns);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [openCreate, setOpenCreate] =
    useState(false);

  const [openEdit, setOpenEdit] =
    useState(false);

  const [toast, setToast] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("Success");

  const [emailCount, setEmailCount] =
    useState(0);

  const [aiSuggestions, setAiSuggestions] =
    useState([
      "🔥 Beauty products are trending this week.",
      "💡 Increase discount from 15% to 20%.",
      "📈 Best posting time: 7PM - 9PM.",
      "🎯 Launch flash sales on weekends.",
    ]);

  const [newCampaign, setNewCampaign] =
    useState({
      name: "",
      type: "",
      budget: "",
    });

  const [editCampaign, setEditCampaign] =
    useState(null);
      /* ---------------- CREATE CAMPAIGN ---------------- */

  const handleCreateCampaign = () => {
    if (
      !newCampaign.name ||
      !newCampaign.type ||
      !newCampaign.budget
    )
      return;

    const campaign = {
      id: Date.now(),
      name: newCampaign.name,
      type: newCampaign.type,
      budget: `₹${newCampaign.budget}`,
      reach: "0",
      conversion: "0%",
      status: "Active",
    };

    setCampaigns((prev) => [
      campaign,
      ...prev,
    ]);

    setNewCampaign({
      name: "",
      type: "",
      budget: "",
    });

    setOpenCreate(false);

    setToastMessage(
      "Campaign Created Successfully 🚀"
    );

    setToast(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDeleteCampaign = (id) => {
    setCampaigns((prev) =>
      prev.filter((c) => c.id !== id)
    );

    setToastMessage(
      "Campaign Deleted Successfully 🗑️"
    );

    setToast(true);
  };

  /* ---------------- EDIT ---------------- */

  const openEditDialog = (campaign) => {
    setEditCampaign(campaign);
    setOpenEdit(true);
  };

  const handleEditSave = () => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === editCampaign.id
          ? editCampaign
          : c
      )
    );

    setOpenEdit(false);

    setToastMessage(
      "Campaign Updated Successfully ✨"
    );

    setToast(true);
  };

  /* ---------------- PAUSE ---------------- */

  const handlePauseCampaign = (id) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Paused",
            }
          : c
      )
    );

    setToastMessage(
      "Campaign Paused ⏸️"
    );

    setToast(true);
  };

  /* ---------------- RESUME ---------------- */

  const handleResumeCampaign = (id) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Active",
            }
          : c
      )
    );

    setToastMessage(
      "Campaign Activated ▶️"
    );

    setToast(true);
  };

  /* ---------------- BULK EMAIL ---------------- */

  const handleBulkEmail = () => {
    setEmailCount((prev) => prev + 1);

    setToastMessage(
      "Bulk Email Sent Successfully 📧"
    );

    setToast(true);
  };

  /* ---------------- AI GENERATOR ---------------- */

  const handleGenerateAI = () => {
    const suggestions = [
      "🔥 Launch Buy 1 Get 1 Weekend Offer",
      "🎯 Target Female Audience 18-30",
      "📈 Promote Products at 8 PM",
      "💎 Premium Combo Offers Recommended",
      "🚀 Influencer Collaboration Suggested",
      "🎉 Festival Campaign Recommended",
    ];

    const random =
      suggestions[
        Math.floor(
          Math.random() *
            suggestions.length
        )
      ];

    setAiSuggestions((prev) => [
      random,
      ...prev,
    ]);

    setToastMessage(
      "AI Suggestion Generated 🤖"
    );

    setToast(true);
  };

  /* ---------------- FLASH SALE ---------------- */

  const handleFlashSale = () => {
    const flashSale = {
      id: Date.now(),
      name: "Flash Sale",
      type: "Flash Sale",
      budget: "₹5000",
      reach: "0",
      conversion: "0%",
      status: "Active",
    };

    setCampaigns((prev) => [
      flashSale,
      ...prev,
    ]);

    setToastMessage(
      "Flash Sale Created ⚡"
    );

    setToast(true);
  };

  /* ---------------- CREATE COUPON ---------------- */

  const handleCreateCoupon = () => {
    const couponCampaign = {
      id: Date.now(),
      name: "New Coupon Campaign",
      type: "Coupon Campaign",
      budget: "₹3000",
      reach: "0",
      conversion: "0%",
      status: "Active",
    };

    setCampaigns((prev) => [
      couponCampaign,
      ...prev,
    ]);

    setToastMessage(
      "Coupon Campaign Created 🎟️"
    );

    setToast(true);
  };

  /* ---------------- FILTERS ---------------- */

  const filteredCampaigns =
    campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        campaign.type
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "All"
          ? true
          : campaign.status ===
            statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const totalCampaigns =
    campaigns.length;

  const activeCampaigns =
    campaigns.filter(
      (c) => c.status === "Active"
    ).length;

  const pausedCampaigns =
    campaigns.filter(
      (c) => c.status === "Paused"
    ).length;
      return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        background:
          "linear-gradient(135deg,#fff1f2,#faf5ff,#eff6ff)",
      }}
    >
      {/* HERO */}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 6,
          background:
            "linear-gradient(135deg,rgba(255,255,255,.85),rgba(255,255,255,.65))",
          backdropFilter: "blur(25px)",
          border:
            "1px solid rgba(255,255,255,.5)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
            >
              Marketing Center 🚀
            </Typography>

            <Typography
              color="text.secondary"
              mt={1}
            >
              Create campaigns, grow
              sales and boost engagement.
            </Typography>
          </Box>

          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() =>
              setOpenCreate(true)
            }
            sx={{
              borderRadius: 4,
              px: 4,
              background:
                "linear-gradient(135deg,#8b5cf6,#ec4899)",
            }}
          >
            Create Campaign
          </Button>
        </Stack>
      </Paper>

      {/* SEARCH + FILTER */}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 6,
          background:
            "rgba(255,255,255,.75)",
          backdropFilter:
            "blur(20px)",
        }}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search Campaign..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <TextField
              select
              fullWidth
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <MenuItem value="All">
                All Status
              </MenuItem>

              <MenuItem value="Active">
                Active
              </MenuItem>

              <MenuItem value="Paused">
                Paused
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* STATS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        {marketingStats.map(
          (item) => (
            <Grid
              key={item.title}
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 6,
                  color: "#fff",
                  background:
                    item.gradient,
                  transition:
                    ".3s",

                  "&:hover": {
                    transform:
                      "translateY(-6px)",
                  },
                }}
              >
                <Stack spacing={2}>
                  {item.icon}

                  <Typography>
                    {item.title}
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={900}
                  >
                    {item.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          )
        )}
      </Grid>

      {/* LIVE STATS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total Campaigns
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              {totalCampaigns}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Active Campaigns
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              color="success.main"
            >
              {activeCampaigns}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Paused Campaigns
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              color="warning.main"
            >
              {pausedCampaigns}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
            {/* CAMPAIGN MANAGEMENT */}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 6,
          background:
            "rgba(255,255,255,.75)",
          backdropFilter:
            "blur(20px)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          mb={3}
        >
          Campaign Management
        </Typography>

        <Stack spacing={2}>
          {filteredCampaigns.map(
            (campaign) => (
              <Paper
                key={campaign.id}
                sx={{
                  p: 3,
                  borderRadius: 4,
                }}
              >
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    <Typography fontWeight={700}>
                      {campaign.name}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    <Chip
                      label={campaign.type}
                      color="primary"
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    {campaign.budget}
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    Reach:
                    {" "}
                    {campaign.reach}
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    Conv:
                    {" "}
                    {campaign.conversion}
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 2,
                    }}
                  >
                    <Chip
                      label={
                        campaign.status
                      }
                      color={
                        campaign.status ===
                        "Active"
                          ? "success"
                          : "warning"
                      }
                    />
                  </Grid>
                </Grid>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={2}
                  flexWrap="wrap"
                >
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() =>
                      openEditDialog(
                        campaign
                      )
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={() =>
                      handleDeleteCampaign(
                        campaign.id
                      )
                    }
                  >
                    Delete
                  </Button>

                  {campaign.status ===
                  "Active" ? (
                    <Button
                      size="small"
                      color="warning"
                      variant="outlined"
                      startIcon={<Pause />}
                      onClick={() =>
                        handlePauseCampaign(
                          campaign.id
                        )
                      }
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() =>
                        handleResumeCampaign(
                          campaign.id
                        )
                      }
                    >
                      Resume
                    </Button>
                  )}
                </Stack>
              </Paper>
            )
          )}
        </Stack>
      </Paper>

      {/* PERFORMANCE */}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 6,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          mb={3}
        >
          Marketing Performance
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography>
              Email Campaign
            </Typography>

            <LinearProgress
              value={82}
              variant="determinate"
            />
          </Box>

          <Box>
            <Typography>
              Coupon Campaign
            </Typography>

            <LinearProgress
              value={68}
              variant="determinate"
            />
          </Box>

          <Box>
            <Typography>
              Flash Sale
            </Typography>

            <LinearProgress
              value={75}
              variant="determinate"
            />
          </Box>
        </Stack>
      </Paper>

      {/* AI SUGGESTIONS */}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 6,
          background:
            "linear-gradient(135deg,#ede9fe,#fae8ff)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          mb={3}
        >
          AI Marketing Suggestions
        </Typography>

        <Stack spacing={2}>
          {aiSuggestions.map(
            (
              suggestion,
              index
            ) => (
              <Typography
                key={index}
              >
                {suggestion}
              </Typography>
            )
          )}
        </Stack>
      </Paper>

      {/* QUICK ACTIONS */}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 6,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          mb={3}
        >
          Quick Actions
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={
                <LocalOffer />
              }
              onClick={
                handleCreateCoupon
              }
            >
              Create Coupon
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <Button
              fullWidth
              color="success"
              variant="contained"
              startIcon={<Email />}
              onClick={
                handleBulkEmail
              }
            >
              Bulk Email
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <Button
              fullWidth
              color="secondary"
              variant="contained"
              startIcon={
                <AutoAwesome />
              }
              onClick={
                handleGenerateAI
              }
            >
              AI Ad Copy
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}
          >
            <Button
              fullWidth
              color="warning"
              variant="contained"
              startIcon={
                <FlashOn />
              }
              onClick={
                handleFlashSale
              }
            >
              Flash Sale
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* CREATE DIALOG */}

      <Dialog
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
      >
        <DialogTitle>
          Create Campaign
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            mt={1}
            sx={{
              minWidth: 350,
            }}
          >
            <TextField
              label="Campaign Name"
              value={
                newCampaign.name
              }
              onChange={(e) =>
                setNewCampaign({
                  ...newCampaign,
                  name:
                    e.target.value,
                })
              }
            />

            <TextField
              select
              label="Campaign Type"
              value={
                newCampaign.type
              }
              onChange={(e) =>
                setNewCampaign({
                  ...newCampaign,
                  type:
                    e.target.value,
                })
              }
            >
              <MenuItem value="Email Marketing">
                Email Marketing
              </MenuItem>

              <MenuItem value="Coupon Campaign">
                Coupon Campaign
              </MenuItem>

              <MenuItem value="Flash Sale">
                Flash Sale
              </MenuItem>
            </TextField>

            <TextField
              label="Budget"
              value={
                newCampaign.budget
              }
              onChange={(e) =>
                setNewCampaign({
                  ...newCampaign,
                  budget:
                    e.target.value,
                })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenCreate(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleCreateCampaign
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}

      <Dialog
        open={openEdit}
        onClose={() =>
          setOpenEdit(false)
        }
      >
        <DialogTitle>
          Edit Campaign
        </DialogTitle>

        <DialogContent>
          {editCampaign && (
            <Stack
              spacing={2}
              mt={1}
              sx={{
                minWidth: 350,
              }}
            >
              <TextField
                label="Campaign Name"
                value={
                  editCampaign.name
                }
                onChange={(e) =>
                  setEditCampaign({
                    ...editCampaign,
                    name:
                      e.target.value,
                  })
                }
              />

              <TextField
                label="Budget"
                value={
                  editCampaign.budget
                }
                onChange={(e) =>
                  setEditCampaign({
                    ...editCampaign,
                    budget:
                      e.target.value,
                  })
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenEdit(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleEditSave
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast}
        autoHideDuration={2500}
        onClose={() =>
          setToast(false)
        }
      >
        <Alert
          severity="success"
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}