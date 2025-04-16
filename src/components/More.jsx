import * as React from "react";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import { Divider, Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Import toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import axios from 'axios'; // Import axios for making API requests

export default function More({ isMoreOpen, setIsMoreOpen }) { 
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Get the token and username from localStorage
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');

      // Make API request to logout endpoint with authorization headers
      await axios.post('http://localhost:8000/api/v1/users/logout', 
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      // Clear localStorage
      // localStorage.removeItem('accessToken');
      localStorage.removeItem('username');

      // Trigger success toast notification
      toast.success('Successfully logged out!', {
        position: "top-right",
        autoClose: 2000, // Auto close after 2 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Redirect to home page after successful logout
      setTimeout(() => {
        navigate('/');
      }, 2000); // Wait 2 seconds before redirecting to show the toast

    } catch (error) {
      console.error("Logout failed:", error);
      toast.error('Logout failed!', {
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

  return (
    <>
      <Modal
        open={isMoreOpen}
        onClose={() => {
          setIsMoreOpen(false);
          setIsSettingsOpen(false); // Close settings menu when main menu is closed
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Paper
          style={{
            position: "fixed",
            top: "55%",
            left: "2rem",
            width: "17rem",
            height: "auto",
            borderRadius: "15px",
            zIndex: 2000,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
            color: "#000",
            fontFamily: "sans-serif",
          }}
        >
          <MenuList>
            <MenuItem
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" sx={{ color: "#000" }} />
              </ListItemIcon>
              <Typography variant="inherit">Setting</Typography>
            </MenuItem>

            {isSettingsOpen && (
              <Paper
                style={{
                  position: "absolute",
                  top: "0",
                  left: "100%",
                  width: "15rem",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
                  marginLeft: "10px",
                }}
              >
                <MenuList>
                  <MenuItem>
                    <Typography variant="inherit" style={{ fontWeight: 'bold' }}>
                      Setting
                    </Typography>
                  </MenuItem>
                  <MenuItem>Edit profile</MenuItem>
                </MenuList>
              </Paper>
            )}

            <MenuItem>
              <ListItemIcon>
                <AssignmentOutlinedIcon fontSize="small" sx={{ color: "#000" }} />
              </ListItemIcon>
              <Typography variant="inherit">Your activity</Typography>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <BookmarkBorderOutlinedIcon fontSize="small" sx={{ color: "#000" }} />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Saved
              </Typography>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <LightModeOutlinedIcon fontSize="small" sx={{ color: "#000" }} />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Switch appearance
              </Typography>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <AnnouncementOutlinedIcon fontSize="small" sx={{ color: "#000" }} />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                Report a problem
              </Typography>
            </MenuItem>
            <Divider className="custom-divider" />
            <MenuItem onClick={handleLogout}> {/* Call the handleLogout function */}
              <Typography variant="inherit" noWrap>
                Log out
              </Typography>
            </MenuItem>
          </MenuList>
        </Paper>
      </Modal>
      <ToastContainer /> {/* Add ToastContainer for toast notifications */}
    </>
  );
}
