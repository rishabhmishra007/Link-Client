import React, { useContext, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Slide,
  Link,
  useMediaQuery,
  Typography,
  Fade,
  Grow,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/new-link-logo.png";
import { GlobalContext } from "../context";

const getButtonStyle = () => ({
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "white",
  backgroundColor: "#6a0dad",
  "&:hover": {
    backgroundColor: "#59168b",
  },
  width: "100%",
  borderRadius: "10px",
  boxShadow: "0 4px 24px 0 rgba(106,13,173,0.08)",
  transition: "all 0.3s",
});

function Auth() {
  const { setAuthUsers, authUsers } = useContext(GlobalContext);

  const [view, setView] = useState("default"); // default, signin, signup
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [logoIn, setLogoIn] = useState(false);
  const [formIn, setFormIn] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  React.useEffect(() => {
    setTimeout(() => setLogoIn(true), 200);
    setTimeout(() => setFormIn(true), 600);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "email") {
      validateEmail(formData.email);
    } else if (name === "password") {
      validatePassword(formData.password);
    }
  };

  const validateEmail = (email) => {
    const emailValid = email.includes("@");
    setErrors((prev) => ({
      ...prev,
      email: emailValid ? "" : 'Email must include "@"',
    }));
    return emailValid;
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const passwordValid = passwordRegex.test(password);
    setErrors((prev) => ({
      ...prev,
      password: passwordValid
        ? ""
        : "Password must be at least 8 characters, with one uppercase, one lowercase, and a number.",
    }));
    return passwordValid;
  };

  const handleSignUp = async () => {
    if (
      !validateEmail(formData.email) ||
      !validatePassword(formData.password)
    ) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/signup",
        formData
      );
      if (response.status === 201) {
        toast.success("Signup successful! Now you can login");
        setTimeout(() => {
          setView("default");
        }, 2000);
      } else {
        toast.warn("Signup succeeded, but there was an issue.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during signup.");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        formData,
        {
          withCredentials: true,
        }
      );
      setAuthUsers(response.data.data);
      if (response.status === 200) {
        const userRes = await axios.get(
          "http://localhost:8000/api/v1/auth/me",
          { withCredentials: true }
        );
        const user = userRes.data.user;

        const { accessToken, username } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", response.data.data.id);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        toast.success(`Welcome, ${username}! Redirecting...`);
        setTimeout(() => {
          if (user && user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/home");
          }
        }, 2000);
      } else {
        toast.warn("Login succeeded, but there was an issue.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login.");
    }
  };

  const handleSignInClick = () => setView("signin");
  const handleSignUpClick = () => setView("signup");
  const handleLogoClick = () => setView("default");

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height="100vh"
      width="100vw"
      minHeight={isMobile ? "100vh" : 655}
      bgcolor="#f7f3fa"
      alignItems="center"
      justifyContent="center"
      sx={{
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transition: "all 0.5s",
      }}
    >
      {/* Logo Section */}
      <Grow in={logoIn} timeout={700}>
        <Box
          flex={isMobile ? "none" : 1}
          width={isMobile ? "100%" : "50%"}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            minHeight: isMobile ? 120 : "100%",
            cursor: view !== "default" ? "pointer" : "default",
            zIndex: 2,
            py: isMobile ? 4 : 0,
            background: isMobile
              ? "none"
              : "linear-gradient(135deg, #6a0dad 0%, #b993e6 100%)",
            borderRadius: isMobile ? 0 : "0 32px 32px 0",
            boxShadow: isMobile ? "none" : "0 8px 32px 0 rgba(106,13,173,0.10)",
            transition: "all 0.5s",
          }}
          onClick={view !== "default" ? handleLogoClick : null}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: isMobile ? "60vw" : "22rem",
              maxWidth: 320,
              height: "auto",
              filter: "drop-shadow(0 4px 24px #6a0dad33)",
              transition: "all 0.5s",
            }}
          />
        </Box>
      </Grow>

      {/* Form Section */}
      <Fade in={formIn} timeout={900}>
        <Box
          flex={1}
          width={isMobile ? "100%" : "50%"}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            position: "relative",
            minHeight: isMobile ? "calc(100vh - 180px)" : "100%",
            background: "#fff",
            borderRadius: isMobile ? "32px 32px 0 0" : "32px 0 0 32px",
            boxShadow: isMobile
              ? "0 -2px 24px 0 rgba(106,13,173,0.08)"
              : "0 8px 32px 0 rgba(106,13,173,0.10)",
            p: isMobile ? 2 : 6,
            m: isMobile ? "0 auto" : 0,
            transition: "all 0.5s",
          }}
        >
          {/* Default View */}
          {view === "default" && (
            <Box
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
              justifyContent="center"
              alignItems="center"
              width="100%"
              gap={isMobile ? 2 : 6}
            >
              <Button
                sx={getButtonStyle()}
                onClick={handleSignInClick}
                size="large"
              >
                SIGN IN
              </Button>
              <Button
                sx={getButtonStyle()}
                onClick={handleSignUpClick}
                size="large"
              >
                SIGN UP
              </Button>
            </Box>
          )}

          {/* Signup Form */}
          <Slide
            direction="right"
            in={view === "signup"}
            mountOnEnter
            unmountOnExit
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="100%"
              maxWidth={400}
              mx="auto"
              gap={2}
            >
              <Typography variant="h5" fontWeight={700} color="#6a0dad" mb={2}>
                Create Account
              </Typography>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="outlined"
                fullWidth
                error={!!errors.email && touched.email}
                helperText={touched.email && errors.email}
              />
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="outlined"
                fullWidth
                error={!!errors.password && touched.password}
                helperText={touched.password && errors.password}
              />
              <Button
                variant="contained"
                sx={getButtonStyle()}
                onClick={handleSignUp}
                size="large"
              >
                Sign Up
              </Button>
              <Link
                href="#"
                onClick={() => setView("signin")}
                sx={{
                  color: "#6a0dad",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Already have an account? Login
              </Link>
            </Box>
          </Slide>

          {/* Signin Form */}
          <Slide
            direction="left"
            in={view === "signin"}
            mountOnEnter
            unmountOnExit
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="100%"
              maxWidth={400}
              mx="auto"
              gap={2}
            >
              <Typography variant="h5" fontWeight={700} color="#6a0dad" mb={2}>
                Welcome Back
              </Typography>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
              <Button
                variant="contained"
                sx={getButtonStyle()}
                onClick={handleLogin}
                size="large"
              >
                Log In
              </Button>
              <Link
                href="#"
                onClick={() => setView("signup")}
                sx={{
                  color: "#6a0dad",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Don't have an account? Signup
              </Link>
            </Box>
          </Slide>
        </Box>
      </Fade>
      <ToastContainer />
    </Box>
  );
}

export default Auth;
