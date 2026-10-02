import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Users", path: "/admin/users" },
  { name: "Vendors", path: "/admin/vendors" },
  { name: "Products", path: "/admin/products" },
  { name: "Orders", path: "/admin/orders" },
  { name: "Analytics", path: "/admin/analytics" },
  { name: "Reports", path: "/admin/reports" },
  { name: "Commission", path: "/admin/commission" },
  { name: "Settings", path: "/admin/settings" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 280,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.6)",
        p: 3,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{
          mb: 4,
          background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ShopSphere
      </Typography>

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 3,
              mb: 1,
            }}
          >
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default AdminSidebar;