import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Avatar,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  AddBox as CreateIcon,
  Person,
} from "@mui/icons-material";
import { FiLogOut } from "react-icons/fi";
import SearchPanel from "./SearchPanel";
import CreatePost from "./createPost";
import { styled } from "@mui/material/styles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/link-logo-big.png";
import LogoIcon from "../assets/logo_icon_light.png";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultProfile from "../assets/defaultProfile.jpg";
import { GlobalContext } from "../context";

// Drawer width
const drawerWidth = 260;

// Styled ListItem component with modern styling
const StyledListItem = styled(ListItem)(({ theme, isActive, isCollapsed }) => ({
  padding: isCollapsed ? "15px 10px" : "12px 20px",
  marginBottom: "8px",
  borderRadius: "12px",
  justifyContent: isCollapsed ? "center" : "flex-start",
  backgroundColor: isActive ? "rgba(106, 13, 173, 0.08)" : "transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: isActive
      ? "rgba(106, 13, 173, 0.12)"
      : "rgba(0, 0, 0, 0.04)",
    transform: "translateX(4px)",
  },
}));

// Modernized Logo styling
const AppLogo = styled(Box)(({ isCollapsed }) => ({
  backgroundImage: `url(${isCollapsed ? LogoIcon : Logo})`,
  backgroundPosition: "center",
  backgroundSize: "contain",
  width: isCollapsed ? "40px" : "160px",
  height: isCollapsed ? "40px" : "70px",
  marginTop: "20px",
  marginBottom: "30px",
  backgroundRepeat: "no-repeat",
  display: "inline-block",
  transition: "all 0.3s ease",
}));

// Styled Icon component
const StyledIcon = styled(Box)(({ theme, isActive }) => ({
  color: isActive ? "#6a0dad" : "#606060",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledText = styled(ListItemText)(({ theme, isActive }) => ({
  "& .MuiListItemText-primary": {
    fontSize: "16px",
    fontWeight: isActive ? "600" : "500",
    color: isActive ? "#6a0dad" : "#303030",
  },
}));

const SideNav = () => {
  const { profilePic, setProfilePic, setAuthUsers } = useContext(GlobalContext);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("/home");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width: 900px)");
  const isMobileScreen = useMediaQuery("(max-width: 600px)");

  // Handle state reset when navigating to a new route
  useEffect(() => {
    const path = location.pathname;

    if (path !== activeTab) {
      setSearchOpen(false);
      setActiveTab(path);
    }
  }, [location, activeTab]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data.user && res.data.user.role === "admin") {
          setIsAdmin(true);
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  // Fetch the profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        const accessToken = localStorage.getItem("accessToken");

        if (!username || !accessToken) {
          console.error("No username or access token found");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/v1/users/${username}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          const userData = response.data.data;
          setProfilePic(userData.profilePicture || defaultProfile);
        } else {
          console.error("Failed to fetch user data", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setProfilePic(defaultProfile);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Auto-collapse on smaller screens
    if (isSmallScreen && !isMobileScreen) {
      setCollapsed(true);
    } else if (!isSmallScreen) {
      setCollapsed(false);
    }
  }, [isSmallScreen, isMobileScreen]);

  const handleSearchClick = () => {
    setSearchOpen(true);
    setCollapsed(true);
  };

  const handleCreateClick = () => {
    setCreatePostOpen(true);
  };

  const handleCreatePostClose = () => {
    setCreatePostOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const username = localStorage.getItem("username");

      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");

      toast.success("Successfully logged out!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setTimeout(() => {
        navigate("/");
        setAuthUsers(null);
        console.log("authUser state cleared");
      }, 2000);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const renderNavItem = (path, icon, label) => {
    const isActive = activeTab === path;
    return (
      <Tooltip title={isCollapsed ? label : ""} placement="right" arrow>
        <StyledListItem
          button
          component={Link}
          to={path}
          isActive={isActive}
          isCollapsed={isCollapsed}
          onClick={() => setActiveTab(path)}
        >
          <ListItemIcon sx={{ minWidth: isCollapsed ? "24px" : "40px" }}>
            <StyledIcon isActive={isActive}>{icon}</StyledIcon>
          </ListItemIcon>
          {!isCollapsed && <StyledText primary={label} isActive={isActive} />}
        </StyledListItem>
      </Tooltip>
    );
  };

  if (isAdmin) {
    if (isMobileScreen) {
      // Show only logout in bottom nav for admin on mobile
      return (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "center",
            padding: "10px 0",
            zIndex: 1300,
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 0",
              borderRadius: "8px",
              width: "48px",
            }}
            onClick={handleLogout}
          >
            <Box sx={{ color: "#f44336" }}>
              <FiLogOut size={28} />
            </Box>
            <span style={{ fontSize: 12, color: "#f44336", marginTop: 2 }}>
              Logout
            </span>
          </Box>
          <ToastContainer />
        </Box>
      );
    }
    // Desktop/tablet: centered logout button
    return (
      <Box
        sx={{
          width: { xs: "100vw", sm: 80, md: 120 },
          position: "fixed",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          top: 0,
          left: 0,
          backgroundColor: "#fff",
          zIndex: 1300,
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
          p: { xs: 2, sm: 1 },
        }}
      >
        <Tooltip title="Logout" placement="right" arrow>
          <Button
            variant="contained"
            onClick={handleLogout}
            startIcon={<FiLogOut />}
            sx={{
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: "#f44336",
              borderRadius: "12px",
              padding: { xs: "18px 32px", sm: "12px 16px", md: "10px 20px", lg: "10px 20px", xl: "10px 20px" },
              width: { xs: "80vw", sm: "100%" },
              minWidth: 0,
              fontWeight: 600,
              fontSize: { xs: "1.1rem", sm: "1rem" },
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.2)",
              },
            }}
          >
            Logout
          </Button>
        </Tooltip>
        <ToastContainer />
      </Box>
    );
  }

  const fullNav = (
    <Box
      sx={{
        width: isCollapsed ? 80 : drawerWidth,
        position: "fixed",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        top: 0,
        left: 0,
        padding: "16px",
        backgroundColor: "#fff",
        zIndex: 1300,
        transition: "width 0.3s ease",
        overflow: "hidden",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            marginBottom: "20px",
          }}
        >
          <Link to="/home">
            <AppLogo isCollapsed={isCollapsed} />
          </Link>
        </Box>
        <List
          sx={{
            marginTop: "0",
            padding: isCollapsed ? "0 4px" : "0 8px",
          }}
        >
          {renderNavItem("/home", <HomeIcon fontSize="medium" />, "Home")}
          {renderNavItem("/feed", <ExploreIcon fontSize="medium" />, "Feed")}

          <Tooltip title={isCollapsed ? "Search" : ""} placement="right" arrow>
            <StyledListItem
              button
              onClick={handleSearchClick}
              isActive={isSearchOpen}
              isCollapsed={isCollapsed}
            >
              <ListItemIcon sx={{ minWidth: isCollapsed ? "24px" : "40px" }}>
                <StyledIcon isActive={isSearchOpen}>
                  <SearchIcon fontSize="medium" />
                </StyledIcon>
              </ListItemIcon>
              {!isCollapsed && (
                <StyledText primary="Search" isActive={isSearchOpen} />
              )}
            </StyledListItem>
          </Tooltip>

          <Tooltip title={isCollapsed ? "Create" : ""} placement="right" arrow>
            <StyledListItem
              button
              onClick={handleCreateClick}
              isActive={isCreatePostOpen}
              isCollapsed={isCollapsed}
            >
              <ListItemIcon sx={{ minWidth: isCollapsed ? "24px" : "40px" }}>
                <StyledIcon isActive={isCreatePostOpen}>
                  <CreateIcon fontSize="medium" />
                </StyledIcon>
              </ListItemIcon>
              {!isCollapsed && (
                <StyledText primary="Create" isActive={isCreatePostOpen} />
              )}
            </StyledListItem>
          </Tooltip>

          {renderNavItem("/chat", <Person fontSize="medium" />, "Chat")}

          <Tooltip title={isCollapsed ? "Profile" : ""} placement="right" arrow>
            <StyledListItem
              button
              component={Link}
              to="/profile"
              isActive={activeTab === "/profile"}
              isCollapsed={isCollapsed}
              onClick={() => setActiveTab("/profile")}
            >
              <ListItemIcon sx={{ minWidth: isCollapsed ? "24px" : "40px" }}>
                <Avatar
                  src={profilePic}
                  sx={{
                    width: 32,
                    height: 32,
                    border:
                      activeTab === "/profile" ? "2px solid #6a0dad" : "none",
                  }}
                />
              </ListItemIcon>
              {!isCollapsed && (
                <StyledText
                  primary="Profile"
                  isActive={activeTab === "/profile"}
                />
              )}
            </StyledListItem>
          </Tooltip>
        </List>
      </Box>

      <Box sx={{ marginBottom: "20px" }}>
        <Tooltip title={isCollapsed ? "Logout" : ""} placement="right" arrow>
          <Button
            variant="contained"
            onClick={handleLogout}
            startIcon={!isCollapsed && <FiLogOut />}
            sx={{
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: "#f44336",
              borderRadius: "12px",
              padding: isCollapsed ? "10px" : "10px 20px",
              width: isCollapsed ? "50px" : "100%",
              justifyContent: isCollapsed ? "center" : "flex-start",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.2)",
              },
            }}
          >
            {isCollapsed ? <FiLogOut /> : "Logout"}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  const bottomNav = (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        zIndex: 1300,
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      }}
    >
      {[
        { path: "/home", icon: <HomeIcon />, active: activeTab === "/home" },
        {
          path: "/search",
          icon: <SearchIcon />,
          active: isSearchOpen,
          onClick: handleSearchClick,
        },
        {
          path: "/create",
          icon: <CreateIcon />,
          active: isCreatePostOpen,
          onClick: handleCreateClick,
        },
        { path: "/feed", icon: <ExploreIcon />, active: activeTab === "/feed" },
        { path: "/chat", icon: <Person />, active: activeTab === "/chat" },
        {
          path: "/profile",
          icon: <Avatar src={profilePic} sx={{ width: 24, height: 24 }} />,
          active: activeTab === "/profile",
        },
      ].map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0",
            borderRadius: "8px",
            width: "48px",
            transition: "all 0.2s",
            backgroundColor: item.active
              ? "rgba(106, 13, 173, 0.08)"
              : "transparent",
          }}
          component={item.onClick ? "div" : Link}
          to={!item.onClick ? item.path : undefined}
          onClick={item.onClick || (() => setActiveTab(item.path))}
        >
          <Box
            sx={{
              color: item.active ? "#6a0dad" : "#606060",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.icon}
          </Box>
        </Box>
      ))}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 0",
          borderRadius: "8px",
          width: "48px",
        }}
        onClick={handleLogout}
      >
        <Box sx={{ color: "#f44336" }}>
          <FiLogOut size={24} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobileScreen ? bottomNav : fullNav}
      <SearchPanel
        open={isSearchOpen}
        onClose={() => {
          console.log("Closing Search Panel...");
          setSearchOpen(false);
          setCollapsed(false); // Always reset the side navigation to expanded state
        }}
        sx={{
          "& .MuiDrawer-paper": {
            marginLeft: isMobileScreen
              ? 0
              : isCollapsed
              ? "80px"
              : `${drawerWidth}px`,
            width: `calc(100% - ${
              isMobileScreen ? 0 : isCollapsed ? "80px" : drawerWidth
            }px)`,
            transition: "margin-left 0.3s ease",
          },
        }}
      />
      <CreatePost open={isCreatePostOpen} onClose={handleCreatePostClose} />
      <ToastContainer />
    </>
  );
};

export default SideNav;
