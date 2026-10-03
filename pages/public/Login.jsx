import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [step, setStep] = useState("login"); // "login" | "otp"
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(
        () => setResendCooldown((prev) => prev - 1),
        1000
      );
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  const redirectByRole = (user) => {
    if (user.role === "customer") {
      navigate("/customer/dashboard");
    } else if (user.role === "vendor") {
      navigate("/vendor/dashboard");
    } else if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  // STEP 1: email + password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      // 🆕 2FA required
      if (data.requiresOtp) {
        setStep("otp");
        setInfo(`OTP sent to ${data.email}`);
        setResendCooldown(30);
        return;
      }

      // Normal login (no 2FA)
      localStorage.setItem(
        "shopsphereUser",
        JSON.stringify(data.user)
      );
      localStorage.setItem("shopsphereToken", data.token);

      redirectByRole(data.user);
    } catch (error) {
      setError(
        "Backend not connected. Please check server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "OTP verification failed");
        return;
      }

      localStorage.setItem(
        "shopsphereUser",
        JSON.stringify(data.user)
      );
      localStorage.setItem("shopsphereToken", data.token);

      redirectByRole(data.user);
    } catch (error) {
      setError(
        "Backend not connected. Please check server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setInfo("");

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: form.email }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to resend OTP");
        return;
      }

      setInfo("A new OTP has been sent to your email");
      setResendCooldown(30);
    } catch (error) {
      setError(
        "Backend not connected. Please check server is running."
      );
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
            "radial-gradient(circle at top left,#d4af37,transparent 30%), radial-gradient(circle at bottom right,#0f766e,transparent 35%), linear-gradient(135deg,#f4fdf9,#ecfdf5)",
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
              boxShadow:
                "0 30px 80px rgba(5,150,105,0.18)",
            }}
          >
            {step === "login" ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  textAlign="center"
                >
                  Welcome Back
                </Typography>

                <Typography
                  textAlign="center"
                  sx={{
                    mt: 1,
                    mb: 3,
                    color: "#6b647a",
                  }}
                >
                  Login to your ShopSphere account
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleLogin}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    margin="normal"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 99,
                      background:
                        "linear-gradient(90deg,#059669,#d4af37)",
                      boxShadow:
                        "0 16px 35px rgba(212,175,55,0.25)",
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={24}
                        sx={{ color: "white" }}
                      />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Box>

                <Typography
                  textAlign="center"
                  sx={{ mt: 3 }}
                >
                  New here?{" "}
                  <Box
                    component={Link}
                    to="/register"
                    sx={{
                      color: "#059669",
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    Create account
                  </Box>
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  textAlign="center"
                >
                  Verify OTP
                </Typography>

                <Typography
                  textAlign="center"
                  sx={{
                    mt: 1,
                    mb: 3,
                    color: "#6b647a",
                  }}
                >
                  Enter the 6-digit code sent to your email
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 3 }}
                  >
                    {error}
                  </Alert>
                )}

                {info && (
                  <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 3 }}
                  >
                    {info}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleVerifyOtp}
                >
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    margin="normal"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    inputProps={{
                      maxLength: 6,
                      style: {
                        letterSpacing: "8px",
                        textAlign: "center",
                        fontSize: "1.3rem",
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 99,
                      background:
                        "linear-gradient(90deg,#059669,#d4af37)",
                      boxShadow:
                        "0 16px 35px rgba(212,175,55,0.25)",
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={24}
                        sx={{ color: "white" }}
                      />
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>
                </Box>

                <Typography
                  textAlign="center"
                  sx={{ mt: 3 }}
                >
                  Didn't receive the code?{" "}
                  <Box
                    component="span"
                    onClick={handleResendOtp}
                    sx={{
                      color:
                        resendCooldown > 0
                          ? "#b0a8c2"
                          : "#059669",
                      fontWeight: 800,
                      cursor:
                        resendCooldown > 0
                          ? "default"
                          : "pointer",
                    }}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend OTP"}
                  </Box>
                </Typography>

                <Typography
                  textAlign="center"
                  sx={{ mt: 1 }}
                >
                  <Box
                    component="span"
                    onClick={() => {
                      setStep("login");
                      setOtp("");
                      setError("");
                      setInfo("");
                    }}
                    sx={{
                      color: "#6b647a",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    ← Back to login
                  </Box>
                </Typography>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
}