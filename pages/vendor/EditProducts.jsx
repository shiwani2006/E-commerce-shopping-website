import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";

import {
  Save,
  CloudUpload,
  ArrowBack,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    name: "Pastel Sneakers",
    category: "Fashion",
    price: "2499",
    stock: "45",
    brand: "ShopSphere",
    description:
      "Premium sneakers with aesthetic pastel design.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Product Updated Successfully 🚀");

    // Later:
    // API Call
    // PUT /api/products/:id
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        position: "relative",
      }}
    >
      {/* Background Glow */}

      <Box
        sx={{
          position: "fixed",
          top: -120,
          right: -120,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "#f9a8d4",
          filter: "blur(120px)",
          opacity: 0.3,
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          position: "fixed",
          bottom: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "#93c5fd",
          filter: "blur(140px)",
          opacity: 0.25,
          zIndex: -1,
        }}
      />

      {/* Header */}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 5,
          background:
            "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              Edit Product
            </Typography>

            <Typography color="text.secondary">
              Product ID: {id}
            </Typography>
          </Box>

          <Button
            startIcon={<ArrowBack />}
            variant="outlined"
            onClick={() =>
              navigate("/vendor/products")
            }
          >
            Back
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Side */}

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 5,
              background:
                "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Typography
              variant="h6"
              mb={3}
              fontWeight={700}
            >
              Product Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={product.brand}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                >
                  <MenuItem value="Fashion">
                    Fashion
                  </MenuItem>

                  <MenuItem value="Beauty">
                    Beauty
                  </MenuItem>

                  <MenuItem value="Electronics">
                    Electronics
                  </MenuItem>

                  <MenuItem value="Fitness">
                    Fitness
                  </MenuItem>

                  <MenuItem value="Home">
                    Home
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Side */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 5,
              background:
                "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Product Preview
            </Typography>

            <Stack
              alignItems="center"
              spacing={2}
              mt={3}
            >
              <Avatar
                src={product.image}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: 250,
                  borderRadius: 4,
                }}
              />

              <Typography
                variant="h6"
                fontWeight={700}
              >
                {product.name}
              </Typography>

              <Chip
                label={product.category}
                color="primary"
              />

              <Typography
                variant="h5"
                fontWeight={800}
              >
                ₹{product.price}
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudUpload />}
              >
                Upload New Image
              </Button>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg,#ec4899,#8b5cf6)",
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}