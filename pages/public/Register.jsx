import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("shopsphereUser", JSON.stringify(data.user));
      localStorage.setItem("shopsphereToken", data.token);

      if (data.user.role === "customer") navigate("/customer/dashboard");
      if (data.user.role === "vendor") navigate("/vendor/dashboard");
      if (data.user.role === "admin") navigate("/admin/dashboard");
    } catch (error) {
      setError("Backend not connected. Please check server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          background:
            "radial-gradient(circle at top right,#d4af37,transparent 30%), radial-gradient(circle at bottom left,#0f766e,transparent 35%), linear-gradient(135deg,#f4fdf9,#ecfdf5)",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 8,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 30px 80px rgba(5,150,105,0.18)",
            }}
          >
            <Typography variant="h4" fontWeight={900} textAlign="center">
              Create Account
            </Typography>

            <Typography textAlign="center" sx={{ mt: 1, mb: 3, color: "#6b647a" }}>
              Start your shopping or vendor journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <TextField
                select
                fullWidth
                label="Register As"
                margin="normal"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
              </TextField>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 99,
                  background: "linear-gradient(90deg,#059669,#d4af37)",
                  boxShadow: "0 16px 35px rgba(212,175,55,0.25)",
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Register"}
              </Button>
            </Box>

            <Typography textAlign="center" sx={{ mt: 3 }}>
              Already have account?{" "}
              <Box component={Link} to="/login" sx={{ color: "#059669", fontWeight: 800 }}>
                Login
              </Box>
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
}