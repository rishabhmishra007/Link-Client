import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Divider, Link, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import defaultProfile from '../assets/defaultProfile.jpg'; // Use the same default avatar path as SearchPanel
import { GlobalContext } from '../context';

const accessToken = localStorage.getItem('accessToken');

const UserSuggestions = () => {
  const {suggestedUsers, setSuggestedUsers, setGlobalProfilePic} = useContext(GlobalContext)
  const [suggestions, setSuggestions] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserName, setLoggedInUserName] = useState(null);

  // Fetch the logged-in user's ID
  const fetchLoggedInUserId = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("user data", response.data);
      
      setLoggedInUserId(response.data.user._id);
      setLoggedInUserName(response.data.user.username)
      // console.log(loggedInUserId);
      
    } catch (error) {
      console.error('Error fetching logged-in user ID:', error);
    }
  }, []);

  // Fetch the list of followed users
  const fetchFollowedUsers = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/users/${loggedInUserName}/followings`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("following:",response.data.data);
      setSuggestedUsers(response.data.data);
      
      const followings = response.data.data.map(user => user.followings).flat(); // Flatten the array
        // console.log("Followings:", followings);

        const followedUserIds = new Set(followings);
        setFollowedUsers(followedUserIds);

      
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  }, [loggedInUserName]);

  // Fetch user suggestions, excluding followed users
  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/users/suggest/random', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const filteredSuggestions = response.data.data
        .filter(user => user._id !== loggedInUserId) // Exclude the logged-in user
        .filter(user => !followedUsers.has(user._id)); // Exclude followed users

      // Fetch profile pictures for the suggestions
      const usersWithProfilePics = await Promise.all(
        filteredSuggestions.map(async (user) => {
          const profilePicture = await fetchProfilePicture(user.username);
          return { ...user, profilePicture };
        })
      );

      setSuggestions(usersWithProfilePics);
      setGlobalProfilePic(usersWithProfilePics); // Set the global profile picture
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  }, [loggedInUserId, followedUsers]); // Add followedUsers as a dependency

  // Fetch a user's profile picture by username
  const fetchProfilePicture = async (username) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/users/${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.data.profilePicture || defaultProfile;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return defaultProfile;
    }
  };

  // Handle follow action
  const handleFollow = async (username) => {
    try {
      const userIdToFollow = await getUserIdByUsername(username);
      if (!userIdToFollow) return;

      await axios.put(`/api/v1/users/${username}/follow`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFollowedUsers(prev => new Set(prev).add(userIdToFollow));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Handle unfollow action
  const handleUnfollow = async (username) => {
    try {
      const userIdToUnfollow = await getUserIdByUsername(username);
      if (!userIdToUnfollow) return;

      await axios.put(`/api/v1/users/${username}/unfollow`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFollowedUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userIdToUnfollow);
        return updated;
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // Get the user ID by their username
  const getUserIdByUsername = useCallback(async (username) => {
    try {
      const response = await axios.get(`/api/v1/users/${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data._id;
      // console.log(response.data.data._id);
      
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }, []);

  useEffect(() => {
    fetchLoggedInUserId();
  }, [fetchLoggedInUserId]);

  useEffect(() => {
    if (loggedInUserId && loggedInUserName) {
      fetchFollowedUsers();
      fetchSuggestions();
    }
  }, [loggedInUserId, loggedInUserName]);

  // Auto-refresh suggestions every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSuggestions();
      fetchFollowedUsers();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchSuggestions, fetchFollowedUsers]);

  return (
    <Box sx={{ width: 300, padding: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <Typography variant="h6">Suggested for you</Typography>
        <IconButton onClick={() => {
          fetchSuggestions();
          fetchFollowedUsers();
        }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <List>
        {suggestions.length > 0 ? (
          suggestions.map(user => (
            <ListItem key={user._id} sx={{ paddingY: 1 }}>
              <ListItemAvatar>
                <Avatar 
                  src={user.profilePicture || defaultProfile} 
                  alt={user.username} 
                  onError={(e) => e.currentTarget.src = defaultProfile} // Handle error
                />
              </ListItemAvatar>
              <ListItemText primary={user.username} secondary={user.recommendation} />
              <Button
                variant="outlined"
                color={followedUsers.has(user._id) ? 'success' : 'primary'}
                onClick={() =>
                  followedUsers.has(user._id) ? handleUnfollow(user.username) : handleFollow(user.username)
                }
                sx={{
                  color: followedUsers.has(user._id) ? 'lightgrey' : 'inherit',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                  textTransform: 'none',
                  minWidth: '80px',
                }}
              >
                {followedUsers.has(user._id) ? 'Following' : 'Follow'}
              </Button>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No suggestions available
          </Typography>
        )}
      </List>

      <Divider sx={{ marginY: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>About</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Help</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Press</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>API</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Jobs</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Privacy</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Terms</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Locations</Link>
        <Link href="#" variant="caption" underline="hover" sx={{ color: 'grey.600' }}>Language</Link>
      </Box>

      <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', marginTop: 2 }}>
        © 2025 Link
      </Typography>
    </Box>
  );
};

export default UserSuggestions;
