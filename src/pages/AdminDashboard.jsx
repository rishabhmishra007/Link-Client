import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Divider,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

const API = "http://localhost:8000/api/v1/admin";

const EditableText = ({ text, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

  return editing ? (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        variant="outlined"
        sx={{ minWidth: 100, maxWidth: 200 }}
      />
      <IconButton
        color="primary"
        onClick={() => {
          setEditing(false);
          if (value !== text) onSave(value);
        }}
      >
        <SaveIcon />
      </IconButton>
      <IconButton color="error" onClick={() => setEditing(false)}>
        <CancelIcon />
      </IconButton>
    </Stack>
  ) : (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{text}</Typography>
      <IconButton size="small" onClick={() => setEditing(true)}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [postsDialogOpen, setPostsDialogOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`, { withCredentials: true });
      setUsers(res.data);
    } catch {
      alert("Failed to fetch users");
    }
    setLoading(false);
  };

  // Fetch posts for a user
  const fetchUserPosts = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/user/${userId}/posts`, { withCredentials: true });
      setUserPosts(res.data);
      setSelectedUser(users.find((u) => u._id === userId));
      setPostsDialogOpen(true);
    } catch {
      alert("Failed to fetch posts");
    }
    setLoading(false);
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API}/user/${id}`, { withCredentials: true });
      setUsers(users.filter((u) => u._id !== id));
      setSelectedUser(null);
      setUserPosts([]);
      setPostsDialogOpen(false);
    } catch {
      alert("Failed to delete user");
    }
  };

  // Edit user
  const startEdit = (user) => {
    setEditUserId(user._id);
    setEditUsername(user.username);
  };
  const handleEditUser = async (id) => {
    try {
      const res = await axios.put(
        `${API}/user/${id}`,
        { username: editUsername },
        { withCredentials: true }
      );
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      setEditUserId(null);
      setEditUsername("");
    } catch {
      alert("Failed to update user");
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API}/post/${postId}`, { withCredentials: true });
      setUserPosts(userPosts.filter((p) => p._id !== postId));
    } catch {
      alert("Failed to delete post");
    }
  };

  // Edit post
  const handleEditPost = async (postId, newDesc) => {
    try {
      const res = await axios.put(
        `${API}/post/${postId}`,
        { description: newDesc },
        { withCredentials: true }
      );
      setUserPosts(userPosts.map((p) => (p._id === postId ? res.data : p)));
    } catch {
      alert("Failed to update post");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`${API}/comment/${commentId}`, { withCredentials: true });
      setUserPosts(
        userPosts.map((post) => ({
          ...post,
          comments: post.comments.filter((c) => c._id !== commentId),
        }))
      );
    } catch {
      alert("Failed to delete comment");
    }
  };

  // Edit comment
  const handleEditComment = async (commentId, newText, postId) => {
    try {
      const res = await axios.put(
        `${API}/comment/${commentId}`,
        { text: newText },
        { withCredentials: true }
      );
      setUserPosts(
        userPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((c) =>
                  c._id === commentId ? res.data : c
                ),
              }
            : post
        )
      );
    } catch {
      alert("Failed to update comment");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{ p: isMobile ? 1 : 4 }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom align={isMobile ? "center" : "left"}>
        Admin Dashboard
      </Typography>
      {loading && <CircularProgress sx={{ display: "block", mx: "auto", my: 2 }} />}
      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mt: 2 }} align={isMobile ? "center" : "left"}>
        Users
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2, boxShadow: isMobile ? 0 : 2 }}>
        {isMobile ? (
          <Table size="small">
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell colSpan={6} sx={{ border: 0, p: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={user.profilePicture} alt={user.username} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography fontWeight={600}>{user.username}</Typography>
                        <Typography variant="caption">{user.email}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {user.role}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {editUserId === user._id ? (
                        <>
                          <TextField
                            size="small"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            sx={{ flex: 1 }}
                          />
                          <IconButton color="primary" onClick={() => handleEditUser(user._id)}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => setEditUserId(null)}>
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton color="primary" onClick={() => startEdit(user)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton color="info" onClick={() => fetchUserPosts(user._id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Posts</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar src={user.profilePicture} alt={user.username} />
                  </TableCell>
                  <TableCell>
                    {editUserId === user._id ? (
                      <TextField
                        size="small"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                      />
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {editUserId === user._id ? (
                      <>
                        <IconButton color="primary" onClick={() => handleEditUser(user._id)}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => setEditUserId(null)}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton color="primary" onClick={() => startEdit(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => fetchUserPosts(user._id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Posts Dialog */}
      <Dialog
        open={postsDialogOpen}
        onClose={() => setPostsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            m: isMobile ? 1 : 4,
            width: isMobile ? "98vw" : "auto",
            maxWidth: isMobile ? "98vw" : "900px",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: isMobile ? 18 : 22 }}>
          {selectedUser ? `${selectedUser.username}'s Posts` : "User's Posts"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: isMobile ? 1 : 3 }}>
          {userPosts.length === 0 ? (
            <Typography>No posts found.</Typography>
          ) : (
            userPosts.map((post) => (
              <Card
                key={post._id}
                sx={{
                  mb: 3,
                  boxShadow: isMobile ? 1 : 3,
                  borderRadius: 2,
                  maxWidth: isMobile ? "100%" : 500,
                  mx: "auto",
                }}
              >
                {post.imgurl && (
                  <CardMedia
                    component="img"
                    image={
                      post.imgurl
                        ? post.imgurl.startsWith("http")
                          ? post.imgurl
                          : `http://localhost:8000${post.imgurl}`
                        : ""
                    }
                    alt="Post"
                    sx={{
                      objectFit: "contain",
                      background: "#fafafa",
                      maxHeight: isMobile ? 180 : 250,
                      maxWidth: isMobile ? "100%" : 350,
                      margin: "0 auto",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  />
                )}
                <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                  <Stack direction={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "center"} spacing={1} sx={{ mb: 1 }}>
                    <EditableText
                      text={post.description || "No description"}
                      onSave={(newDesc) => handleEditPost(post._id, newDesc)}
                    />
                    <IconButton color="error" onClick={() => handleDeletePost(post._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Comments:
                  </Typography>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <Stack
                        key={comment._id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ ml: 2, mb: 1 }}
                      >
                        <EditableText
                          text={comment.description || "No comment"}
                          onSave={(newText) =>
                            handleEditComment(comment._id, newText, post._id)
                          }
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))
                  ) : (
                    <Typography sx={{ ml: 2 }}>No comments.</Typography>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostsDialogOpen(false)} fullWidth={isMobile}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;