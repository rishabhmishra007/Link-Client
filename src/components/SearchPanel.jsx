import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Drawer, IconButton, Box, TextField, Divider, Typography, Button, CircularProgress, Avatar } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import defaultProfile from '../assets/defaultProfile.jpg'; // Import your default profile image

// Create a base Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Use the correct base URL here
  headers: {
    'Content-Type': 'application/json',
  },
});

const SearchPanel = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState(new Set()); // Track users followed
  const [userId, setUserId] = useState(null); // Track the userId after fetching it

  const loggedInUsername = localStorage.getItem('username'); // Assuming the logged-in username is stored here
  const accessToken = localStorage.getItem('accessToken');

  // Fetch userId and the list of followed users using the loggedInUsername
  useEffect(() => {
    const fetchUserData = async () => {
      if (loggedInUsername) {
        try {
          const response = await apiClient.get(`/users/${loggedInUsername}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.status === 200) {
            const userData = response.data.data;
            setUserId(userData._id); // Save the fetched userId

            // Fetch the list of followed users
            const followingsResponse = await apiClient.get(`/users/${loggedInUsername}/followings`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (followingsResponse.status === 200) {
              const followingsList = followingsResponse.data.data;
              const followedUsernames = new Set(followingsList.map(user => user.username)); // Store followed usernames in a Set
              setFollowedUsers(followedUsernames);
            }
          } else {
            console.error('Failed to fetch user ID and followings');
          }
        } catch (error) {
          console.error('Error fetching user data and followings:', error);
        }
      }
    };

    fetchUserData();
  }, [loggedInUsername, accessToken]); // Fetch when the component mounts or loggedInUsername changes

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const fetchProfilePicture = async (username) => {
    try {
      const response = await apiClient.get(`/users/${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        return response.data.data.profilePicture || defaultProfile;
      } else {
        return defaultProfile;
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return defaultProfile;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/users/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        const users = response.data.data || [];

        // Fetch profile pictures for each user
        const usersWithProfilePics = await Promise.all(
          users.map(async (user) => {
            const profilePicture = await fetchProfilePicture(user.username);
            return { ...user, profilePicture };
          })
        );

        setResults(usersWithProfilePics);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUnfollow = async (username) => {
    try {
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      // Send the PUT request with explicit body
      const response = await apiClient.put(
        `/users/${username}/follow`,  // Follow/unfollow endpoint
        { userId },  // Explicitly set userId in the body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,  // Include the auth token
          },
        }
      );

      if (response.status === 200) {
        setFollowedUsers((prev) => {
          const updated = new Set(prev);
          if (followedUsers.has(username)) {
            updated.delete(username);  // Unfollow
          } else {
            updated.add(username);  // Follow
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 333,
          height: '100%',
          position: 'fixed',
          top: 0,
          left: '5rem',
          backgroundColor: '#fff',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1300,
          border: 'none',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Search
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', marginBottom: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '1px',
                paddingRight: '2rem',
              },
            }}
            slotProps={{
              endAdornment: (
                <IconButton
                  edge="end"
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setQuery('')} // Clear search query
                >
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        <Divider sx={{ marginBottom: '2rem' }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : results.length > 0 ? (
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {results.map((user) => (
              <Box key={user._id} sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <Avatar
                  src={user.profilePicture || defaultProfile}
                  alt={user.username}
                  sx={{ width: 50, height: 50, marginRight: 1, borderRadius: '50%' }}
                />
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {user.username}
                </Typography>

                {/* Show button only if the user is not the logged-in user */}
                {user.username !== loggedInUsername && (
                  <Button
                    variant="outlined"
                    color={followedUsers.has(user.username) ? 'success' : 'primary'}
                    onClick={() => handleFollowUnfollow(user.username)}
                    sx={{
                      color: followedUsers.has(user.username) ? 'lightgrey' : 'inherit',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      textTransform: 'none',
                      minWidth: '80px',
                    }}
                  >
                    {followedUsers.has(user.username) ? 'Following' : 'Follow'}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No results
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default SearchPanel;
