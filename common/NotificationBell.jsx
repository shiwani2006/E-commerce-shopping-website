import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { useNotifications } from "../../context/NotificationContext";

const iconMap = {
  order: <ShoppingBagIcon />,
  reward: <CardGiftcardIcon />,
  payment: <PaymentIcon />,
  offer: <LocalOfferIcon />,
};

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          bgcolor: "#fff1f7",
          color: "#ec4899",
          "&:hover": { bgcolor: "#ffe4f0" },
        }}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 390,
            maxWidth: "92vw",
            borderRadius: 5,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,.96)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 70px rgba(124,58,237,.18)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Notifications
              </Typography>
              <Typography sx={{ color: "#6b647a", fontSize: 13 }}>
                {unreadCount} unread updates
              </Typography>
            </Box>

            <Button
              onClick={markAllAsRead}
              sx={{
                borderRadius: 99,
                textTransform: "none",
                fontWeight: 900,
                color: "#7c3aed",
                bgcolor: "#f3e8ff",
              }}
            >
              Mark all read
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Stack sx={{ p: 1.2, maxHeight: 420, overflowY: "auto" }} spacing={1}>
          {notifications.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 4,
                bgcolor: "#fff7fb",
              }}
            >
              <Typography fontWeight={900}>No notifications</Typography>
              <Typography sx={{ color: "#6b647a", fontSize: 14 }}>
                You are all caught up.
              </Typography>
            </Paper>
          ) : (
            notifications.map((item) => (
              <Paper
                key={item.id}
                onClick={() => markAsRead(item.id)}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 4,
                  cursor: "pointer",
                  bgcolor: item.read ? "white" : "#fff7fb",
                  border: item.read
                    ? "1px solid rgba(124,58,237,.06)"
                    : "1px solid rgba(236,72,153,.16)",
                  transition: ".3s",
                  "&:hover": {
                    transform: "translateX(4px)",
                    bgcolor: "#f3e8ff",
                  },
                }}
              >
                <Stack direction="row" spacing={1.3} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: item.read ? "#f3e8ff" : "#ec4899",
                      color: item.read ? "#7c3aed" : "white",
                    }}
                  >
                    {iconMap[item.type] || <NotificationsIcon />}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography fontWeight={900}>{item.title}</Typography>
                      {!item.read && (
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            bgcolor: "#ec4899",
                            mt: 0.7,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography sx={{ color: "#6b647a", fontSize: 13, mt: 0.3 }}>
                      {item.message}
                    </Typography>

                    <Typography sx={{ color: "#9ca3af", fontSize: 12, mt: 0.6 }}>
                      {item.time}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>

        <Divider />

        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            onClick={clearAll}
            sx={{
              borderRadius: 99,
              py: 1,
              textTransform: "none",
              fontWeight: 900,
              color: "#ec4899",
              bgcolor: "#fff1f7",
              "&:hover": { bgcolor: "#ffe4f0" },
            }}
          >
            Clear All
          </Button>
        </Box>
      </Menu>
    </>
  );
}