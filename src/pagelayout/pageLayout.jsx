import React from "react";
import { useLocation } from "react-router-dom";
import SideNav from "../components/Sidenav"; // Import your SideNav component
import Box from "@mui/material/Box";
import { useMediaQuery, useTheme } from "@mui/material";

const sideNavWidth = 240; // Adjust this to the width of your SideNav

const PageLayout = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Specify the paths where the SideNav should NOT be shown (e.g., authentication pages)
  const noNavPaths = ["/"];

  // Check if the current path is in the noNavPaths array
  const showSideNav = !noNavPaths.includes(location.pathname);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        height: "100vh",
      }}
    >
      {showSideNav && (
        <Box
          sx={{
            width: isSmallScreen ? "100%" : sideNavWidth, // Full width on small screens
            flexShrink: 0, // Prevent shrinking of SideNav
          }}
        >
          <SideNav />
        </Box>
      )}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%", // Ensure the children box takes full width
          overflowY: "auto", // Add scrolling for content if needed
        }}
      >
        {children} {/* This renders the page content */}
      </Box>
    </Box>
  );
};

export default PageLayout;
