import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Grid, Card, CardContent, MenuItem, FormControl, Select, InputLabel, Modal, Backdrop, Fade } from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultProfile from '../assets/defaultProfile.jpg';

const getButtonStyle = (isImageUploaded) => ({
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#6a0dad', // Changed to purple
  borderColor: '#6a0dad', // Changed to purple
  '&:hover': {
    backgroundColor: '#59168b', // Darker purple for hover effect
    color: 'white',
    borderColor: '#6a0dad', // Changed to purple
  },
  width: '12rem',
});

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [gender, setGender] = useState('preferNotToSay');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const username = localStorage.getItem('username');
      const accessToken = localStorage.getItem('accessToken');

      if (!username || !accessToken) {
        console.error("No username or access token found");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/v1/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          const userData = response.data.data;
          setUser(userData);
          setGender(userData.gender || "preferNotToSay");
          localStorage.setItem('id', userData._id);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, []);

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); 
      setUser({ ...user, profilePicture: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const id = localStorage.getItem('id');

    if (!accessToken || !id || !user) {
      console.error("Missing required information");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('gender', gender);
      formData.append('description', user.description || '');
      formData.append('website', user.website || '');
      formData.append('location', user.location || '');

      if (selectedFile) {
        formData.append('profilePicture', selectedFile); 
      }

      const response = await axios.put(`http://localhost:8000/api/v1/users/user/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const updatedUser = response.data.data;

        toast.success("Profile updated successfully", {
          onClose: () => navigate('/profile/'),  // Redirect after toast notification
        });

        // Update local storage and navigate to the correct profile
        if (updatedUser.username) {
          localStorage.setItem('username', updatedUser.username);
        }
      } else {
        console.error("Failed to update profile");
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ minHeight: '85vh', backgroundColor: '#fff', p: 4 }}>
      <ToastContainer />
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', pb: 4, borderBottom: '1px solid #ccc' }}>
        <Box 
          sx={{ 
            width: 134, 
            height: 134, 
            borderRadius: '50%', 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handleOpenModal} 
        >
          <img
            src={user.profilePicture || defaultProfile}
            alt="Profile"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center' 
            }} 
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TextField variant="outlined" label="Name" value={user.name || ''} fullWidth sx={{ mb: 1 }} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <TextField variant="outlined" label="Username" value={user.username || ''} fullWidth sx={{ mb: 1 }} onChange={(e) => setUser({ ...user, username: e.target.value })} />
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={handleSave}
            sx={getButtonStyle(!!selectedFile)} // Change button style based on whether an image is uploaded
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box sx={{ pt: 4 }}>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField variant="outlined" label="Bio" multiline rows={4} value={user.description || ''} fullWidth onChange={(e) => setUser({ ...user, description: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField variant="outlined" label="Website" value={user.website || ''} fullWidth onChange={(e) => setUser({ ...user, website: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField variant="outlined" label="Location" value={user.location || ''} fullWidth onChange={(e) => setUser({ ...user, location: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select value={gender} onChange={handleGenderChange} label="Gender">
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="preferNotToSay">Prefer not to specify</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ pt: 4 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          style={{ display: 'none' }}
          id="profile-picture-input"
        />
        <label htmlFor="profile-picture-input">
          <Button variant="outlined" component="span" sx={getButtonStyle(!!selectedFile)}>
            Upload Profile
          </Button>
        </label>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: '10px',
              outline: 'none',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={user.profilePicture || defaultProfile}
              alt="Full Profile"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
