import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardMedia,
  Modal,
  Backdrop,
  Fade,
  Avatar,
  Divider,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import defaultProfile from "../assets/defaultProfile.jpg";
import { Close } from "@mui/icons-material";
import "./profile.css"

const getButtonStyle = () => ({
  fontSize: "1rem",
  fontWeight: "bold",
  color: "#6a0dad",
  borderColor: "#6a0dad",
  "&:hover": {
    backgroundColor: "#6a0dad",
    color: "white",
    borderColor: "#6a0dad",
  },
  width: "12rem",
  borderRadius: "20px",
});

export default function Profile() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [user, setUser] = useState({
    username: "Sample User",
    bio: "",
    profilePicture: "",
    followers: 0,
    following: 0,
    posts: [],
  });

  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

        let posts = [];
        if (userData.posts && userData.posts.length > 0) {
          const postResponse = await axios.get(
            `http://localhost:8000/api/v1/posts/user/${username}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (postResponse.status === 200) {
            posts = postResponse.data;
          }
        }

        setUser({
          username: userData.username || "Sample User",
          bio: userData.description || "This user has no bio.",
          profilePicture: userData.profilePicture || "",
          followers: userData.followers ? userData.followers.length : 0,
          following: userData.followings ? userData.followings.length : 0,
          posts: posts || [],
        });
        setPostCount(posts.length);
        setLoading(false);
      } else {
        console.error("Failed to fetch user data", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Check if the selected post belongs to the logged-in user
  const isOwnPost = selectedPost && user && selectedPost.user === user.username;

  // Delete post handler
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    setDeleting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(
        `http://localhost:8000/api/v1/posts/${selectedPost._id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Remove the deleted post from state
      setUser((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p._id !== selectedPost._id),
      }));
      setPostCount((prev) => prev - 1);
      setIsDeleteModalOpen(false);
      setIsPostModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    const intervalId = setInterval(fetchUserProfile, 20000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleOpenPostModal = async (post) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/v1/comments/${post._id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        const comments = response.data.comments;
        setSelectedPost({ ...post, comments });
        setIsPostModalOpen(true);
      } else {
        console.error("Failed to fetch comments", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <Box
      sx={{
        minHeight: "85vh",
        backgroundColor: "#f9f9f9",
        p: isSmallScreen ? 2 : 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 4,
          alignItems: isSmallScreen ? "flex-start" : "center",
          pb: 4,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Avatar
          src={user.profilePicture || defaultProfile}
          alt={user.username}
          sx={{
            width: isSmallScreen ? 100 : 134,
            height: isSmallScreen ? 100 : 134,
            cursor: "pointer",
            boxShadow: 3,
          }}
          onClick={handleOpenProfileModal}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            component="h1"
            fontWeight="bold"
          >
            {user.username}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            @{user.username}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            mt={1}
            sx={{ textAlign: isSmallScreen ? "center" : "left" }}
          >
            {user.bio}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row", // Stack buttons on smaller screens
            gap: 2,
            width: isSmallScreen ? "100%" : "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon />
            <Typography>{user.followers} Followers</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon />
            <Typography>{user.following} Following</Typography>
          </Box>
          <Button
            variant="outlined"
            component={Link}
            to="/edit-profile"
            sx={getButtonStyle()}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      <Box sx={{ pt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isSmallScreen ? "column" : "row", // Stack title and count on small screens
            gap: isSmallScreen ? 2 : 0,
          }}
        >
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            component="h2"
            fontWeight="bold"
          >
            Posts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {postCount} {postCount === 1 ? "Post" : "Posts"}
          </Typography>
        </Box>
        <Grid container spacing={isSmallScreen ? 2 : 4} sx={{ pt: 2 }}>
          {loading ? (
            <Typography
              sx={{
                textAlign: "center",
                width: "100%",
                color: "grey",
                fontWeight: "bold",
                mt: 4,
              }}
            >
              Loading posts...
            </Typography>
          ) : user.posts.length > 0 ? (
            user.posts
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((post, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card
                    sx={{
                      position: "relative",
                      boxShadow: 3,
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={() => handleOpenPostModal(post)}
                  >
                    <CardMedia
                      component="img"
                      image={post.imgurl || "https://picsum.photos/200"}
                      alt={`Post ${index + 1}`}
                      sx={{
                        height: 200,
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {post.description || "No description"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <FavoriteIcon fontSize="small" />
                        <Typography>{post.likes?.length || 0}</Typography>
                        <CommentIcon fontSize="small" />
                        <Typography>{post.comments?.length || 0}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
          ) : (
            <Typography
              sx={{
                textAlign: "center",
                width: "100%",
                color: "grey",
                fontWeight: "bold",
                mt: 4,
              }}
            >
              No posts yet.
            </Typography>
          )}
        </Grid>
      </Box>

      {/* Profile Modal */}
      <Modal
        open={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ timeout: 500 }}
      >
        <Fade in={isProfileModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              borderRadius: "12px",
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              {user.username}
            </Typography>
            <Avatar
              src={user.profilePicture || defaultProfile}
              alt="Profile"
              sx={{
                width: 120,
                height: 120,
                margin: "20px auto",
                boxShadow: 3,
              }}
            />
            <Typography variant="body1">
              {user.bio || "No bio available."}
            </Typography>
            <Button
              variant="contained"
              onClick={handleCloseProfileModal}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>

      {/* Post Modal */}
      <Modal
        open={isPostModalOpen}
        onClose={handleClosePostModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ timeout: 500 }}
      >
        <Fade in={isPostModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 800,
              bgcolor: "background.paper",
              borderRadius: "16px",
              boxShadow: 24,
              p: 4,
              overflowY: "auto",
              maxHeight: "90vh",
            }}
          >
            {selectedPost && (
              <>
                {/* Close Button */}
                <Button
                  onClick={handleClosePostModal}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    minWidth: "auto",
                    padding: 0,
                    color: "grey.600",
                    zIndex: 10,
                  }}
                >
                  <Close />
                </Button>

                {/* Post Image */}
                <Box
                  sx={{
                    width: "100%",
                    height: "50vh",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: 3,
                    mb: 3,
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <img
                    src={selectedPost.imgurl}
                    alt="Post"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>

                {/* Delete Button (only for own post) */}
                {/* Post Details */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                    mb={2}
                  >
                    Post Details
                  </Typography>

                  <button
                    className="del-btn"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <svg viewBox="0 0 448 512" class="svgIcon">
                      <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
                    </svg>
                  </button>
                </Box>

                <Typography variant="body1" mb={2}>
                  {selectedPost.description || "No description available."}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Likes: {selectedPost.likes?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Comments: {selectedPost.comments?.length || 0}
                  </Typography>
                </Box>

                {/* Divider */}
                <Box sx={{ my: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Comments
                  </Typography>
                  <Divider />
                </Box>

                {/* Comments Section */}
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
                    {selectedPost.comments.map((comment, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 2,
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#f9f9f9",
                          boxShadow: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold" }}
                          color="primary"
                        >
                          {comment.user.username}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {comment.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No comments yet.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ timeout: 500 }}
      >
        <Fade in={isDeleteModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 350,
              bgcolor: "background.paper",
              borderRadius: "16px",
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <WarningAmberRoundedIcon
              color="warning"
              sx={{ fontSize: 48, mb: 2 }}
            />
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Confirm Deletion
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                sx={{ borderRadius: "20px", minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeletePost}
                disabled={deleting}
                sx={{
                  borderRadius: "20px",
                  minWidth: 100,
                  fontWeight: "bold",
                  boxShadow: 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
