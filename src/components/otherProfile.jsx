import React, { useState } from 'react';
import { Avatar, Box, Button, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const buttonStyle = {
  fontSize: '1rem',
  fontWeight: 'bold',
  width: '12rem',
};

const followButtonStyle = (isFollowing) => ({
  ...buttonStyle,
  color: isFollowing ? '#a81434' : 'white', // Ruby color text when followed, white otherwise
  borderColor: '#a81434',
  backgroundColor: isFollowing ? 'white' : '#a81434',
  '&:hover': {
    backgroundColor: isFollowing ? '#a81434' : '#a81434',
    color: 'white',
  },
});

const messageButtonStyle = {
  ...buttonStyle,
  color: 'black',
  borderColor: 'gray',
  backgroundColor: 'lightgray',
  '&:hover': {
    backgroundColor: 'gray',
    color: 'white',
  },
};

export default function OtherProfile() {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <Box sx={{ minHeight: '85vh', backgroundColor: '#fffff', p: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', pb: 4, borderBottom: '1px solid #ccc' }}>
        <Avatar 
          sx={{ width: 128, height: 128 }} 
          src="/placeholder-user.jpg" 
          alt="Sample User"
        >
          SU
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">Sample User</Typography>
          <Typography variant="subtitle1" color="textSecondary">@Sample</Typography>
          <Typography variant="body2" color="textSecondary">
            hello this is the test bio this is how the bio will turn out
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography>100 Followers</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            <Typography>25 Following</Typography>
          </Box>
          <Button 
            variant={isFollowing ? "outlined" : "contained"} // Conditionally use "outlined" when followed
            onClick={handleFollowClick}
            sx={followButtonStyle(isFollowing)}
          >
            {isFollowing ? 'Followed' : 'Follow'}
          </Button>
          <Button 
            variant="contained" 
            sx={messageButtonStyle}
            component={Link} 
            to="/message"
          >
            Message
          </Button>
        </Box>
      </Box>

      <Box sx={{ pt: 4 }}>
        <Typography variant="h5" component="h2">Posts</Typography>
        <Grid container spacing={4} sx={{ pt: 2 }}>
          {['100', '80', '120'].map((likes, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image="/placeholder.svg"
                  alt={`Post ${index + 1}`}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FavoriteIcon fontSize="small" />
                    <Typography>{likes} Likes</Typography>
                    <CommentIcon fontSize="small" />
                    <Typography>{index * 10 + 25} Comments</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
