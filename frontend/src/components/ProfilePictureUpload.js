import React, { useState } from 'react';
import { userService } from '../services/api';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ userId, currentProfileUrl, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(currentProfileUrl || null);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
      setUploading(true);
      setError(null);
      
      const response = await userService.updateProfilePicture(userId, file);
      
      if (response.data.success) {
        // Update with the Cloudinary URL
        setImagePreview(response.data.data.profilePictureUrl);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data.profilePictureUrl);
        }
      }
    } catch (err) {
      console.error('Profile picture upload error:', err);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="profile-picture-upload">
      <div className="profile-picture-container">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Profile Preview" 
            className="profile-picture-preview" 
          />
        ) : (
          <div className="profile-picture-placeholder">
            <span>No Image</span>
          </div>
        )}
        
        <div className="upload-overlay">
          <label htmlFor="profile-upload" className="upload-button">
            {uploading ? 'Uploading...' : 'Change Photo'}
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};

export default ProfilePictureUpload; 