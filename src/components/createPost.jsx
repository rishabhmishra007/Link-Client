import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Box,
  Button,
  Snackbar,
} from '@mui/material';
import { AddAPhoto, Close } from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CreatePost({ open, onClose }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const fileInputRef = useRef(null);

  const handleClose = () => {
    onClose();
    setImage(null);
    setCaption('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handlePost = async () => {
    if (!image) {
      setToastMessage('Please upload an image.');
      setToastSeverity('error');
      setShowToast(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('imgurl', image); // 'imgurl' should match the backend's multer setup
      formData.append('description', caption);

      const accessToken = localStorage.getItem('accessToken');

      await axios.post('http://localhost:8000/api/v1/posts', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setToastMessage('Post created successfully!');
      setToastSeverity('success');
      setShowToast(true);
      handleClose();
    } catch (error) {
      setToastMessage(`Failed to create post: ${error.response?.data?.message || error.message}`);
      setToastSeverity('error');
      setShowToast(true);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowToast(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create Post
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {!image ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                border: '2px dashed grey',
                borderRadius: 2,
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current.click()}
              aria-describedby="upload-description"
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                aria-label="Upload Image"
              />
              <AddAPhoto sx={{ fontSize: 60, color: 'grey' }} />
              <Button>Upload from device</Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain' }}
              />
              <TextField
                autoFocus
                margin="dense"
                id="caption"
                label="Add a caption"
                type="text"
                fullWidth
                variant="standard"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handlePost} disabled={!image} variant="contained">
            Post
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showToast}
        autoHideDuration={2000} // 2-second timer
        onClose={handleCloseToast}
      >
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
