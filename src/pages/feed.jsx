import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Grid, Card, CardMedia, Typography, IconButton, Modal, Box, TextField, Button, CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SendIcon from '@mui/icons-material/Send';
import UserSuggestion from '../components/userSuggestion';
import Masonry from '@mui/lab/Masonry';

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIj4KICA8Y2lyY2xlIGN4PSI3MCIgY3k9IjcwIiByPSI3MCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtY29sb3I9InJnYmEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
const accessToken = localStorage.getItem('accessToken');

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      if (!accessToken) {
        console.error("No token found, please log in again.");
        return;
      }

      const response = await axios.get('http://localhost:8000/api/v1/posts/random', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 200) {
        setPosts(response.data.posts);
      } else {
        console.error('Failed to fetch posts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`http://localhost:8000/api/v1/comments/${post._id}/comments`);
      if (response.status === 200) {
        setSelectedPost((prev) => ({
          ...prev,
          comments: response.data.comments,
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handlePreviousPost = () => {
    const currentIndex = posts.findIndex((post) => post === selectedPost);
    if (currentIndex > 0) {
      setSelectedPost(posts[currentIndex - 1]);
    }
  };

  const handleNextPost = () => {
    const currentIndex = posts.findIndex((post) => post === selectedPost);
    if (currentIndex < posts.length - 1) {
      setSelectedPost(posts[currentIndex + 1]);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(`http://localhost:8000/api/v1/comments/${postId}/comments`, {
        description: commentText,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      if (response.status === 200) {
        const newComment = response.data.post.comments.pop();

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { 
                  ...post, 
                  comments: [...post.comments, newComment] 
                }
              : post
          )
        );

        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost((prevSelectedPost) => ({
            ...prevSelectedPost,
            comments: [...prevSelectedPost.comments, newComment],
          }));
        }

        setCommentText(''); // Clear the comment input
      } else {
        console.error('Failed to submit comment:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      if (!accessToken) {
        console.error("No token found, please log in again.");
        return;
      }

      const response = await axios.put(`http://localhost:8000/api/v1/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, likes: post.likes.includes(accessToken) ? post.likes.filter((id) => id !== accessToken) : [...post.likes, accessToken] }
              : post
          )
        );

        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost((prevSelectedPost) => ({
            ...prevSelectedPost,
            likes: prevSelectedPost.likes.includes(accessToken)
              ? prevSelectedPost.likes.filter((id) => id !== accessToken)
              : [...prevSelectedPost.likes, accessToken],
          }));
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', padding: '16px', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <Grid container spacing={2} sx={{ marginLeft: 'auto', marginRight: 0 }}>
        <Grid size={{xs: 12, md: 8}}>
          <Typography variant="h6" sx={{ mb: 2 }}>Posts</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
              {posts.map((post, index) => (
                <Grid size={{xs:12, sm:6, md:4}} key={index}>
                  <Card sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => handlePostClick(post)}>
                    <CardMedia
                      component="img"
                      height="250"
                      image={post.imgurl}
                      alt="Post image"
                      onError={(e) => e.currentTarget.src = defaultAvatar}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.25)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <Box sx={{ position: 'absolute', bottom: 8, right: 8, color: 'white', display: 'flex', gap: 1 }}>
                        <IconButton onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering post click
                          handleLikePost(post._id);
                        }}>
                          <FavoriteIcon sx={{ color: post.likes.includes(accessToken) ? 'red' : 'white' }} />
                        </IconButton>
                        <Typography variant="body2">{post.likes.length}</Typography>
                        <CommentIcon fontSize="small" />
                        <Typography variant="body2">{post.comments?.length || 0}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Masonry>
          )}
        </Grid>

        <Grid size={{xs:12, md:4}} sx={{ position: 'sticky', top: '16px', right: '0px', ml: 'auto' }}>
          <UserSuggestion />
        </Grid>
      </Grid>

      {selectedPost && (
        <Modal open={isModalOpen} onClose={handleModalClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
              <img
                src={selectedPost?.imgurl}
                alt="Post"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => e.currentTarget.src = defaultAvatar}
              />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 2 }}>
                  <CardMedia
                    component="img"
                    height={48}
                    image={selectedPost?.user?.profilePicture || defaultAvatar}
                    alt={selectedPost?.user?.username || 'User'}
                    sx={{ width: 48, height: 48, borderRadius: '50%' }}
                    onError={(e) => e.currentTarget.src = defaultAvatar}
                  />
                  <Box>
                    <Typography variant="h6">{selectedPost?.user?.username || 'Anonymous'}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedPost?.user?.name || ''}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 2 }}>{selectedPost?.description}</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => handleLikePost(selectedPost._id)}>
                    <FavoriteIcon sx={{ color: selectedPost.likes?.includes(accessToken) ? 'red' : 'inherit' }} />
                  </IconButton>
                  <Typography variant="body2">{selectedPost.likes?.length || 0}</Typography>
                  <IconButton>
                    <CommentIcon />
                  </IconButton>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Box>
                <Box sx={{ mt: 2, maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedPost?.comments?.length ? selectedPost.comments.map((comment, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <CardMedia
                        component="img"
                        height={32}
                        image={comment.user?.profilePicture || defaultAvatar}
                        alt={comment.user?.username || 'User'}
                        sx={{ width: 32, height: 32, borderRadius: '50%' }}
                        onError={(e) => e.currentTarget.src = defaultAvatar}
                      />
                      <Typography variant="body2">
                        <strong>{comment.user?.username || 'Anonymous'}:</strong> {comment.description}
                      </Typography>
                    </Box>
                  )) : (
                    <Typography variant="body2" color="textSecondary">No comments yet</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    placeholder="Add a comment..."
                    variant="outlined"
                    fullWidth
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{ mt: 2 }}
                    InputProps={{
                      sx: {
                        borderRadius: '16px',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleCommentSubmit(selectedPost._id)}
                    sx={{ mt: 2, bgcolor: 'rgb(193, 39, 45)', color: 'white' }}
                    endIcon={<SendIcon />}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)' }}>
              <IconButton onClick={handlePreviousPost}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            <Box sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)' }}>
              <ChevronRightIcon />
              <IconButton onClick={handleNextPost}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default Feed;
