import React, { useState, useRef } from 'react';
import { FaCamera, FaUndo, FaUpload } from 'react-icons/fa';
import { imageService } from '../services/api';
import './CameraCapture.css';

const CameraCapture = ({ onImageUpload }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera access failed: ${err.message}. Try uploading an image instead.`);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob(blob => {
        const imageFile = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        
        // Auto upload the captured image
        uploadImage(imageFile);
      }, 'image/jpeg', 0.9);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError(`Failed to capture image: ${err.message}`);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
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
    setCapturedImage(URL.createObjectURL(file));
    
    // Upload the file
    uploadImage(file);
  };

  // Reset the component
  const resetCapture = () => {
    setCapturedImage(null);
    setUploadProgress(0);
    setError(null);
    setUploading(false);
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(10);
      
      const uploadResult = await imageService.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (uploadResult?.secure_url) {
        // Call the parent callback with the uploaded image data
        onImageUpload({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id || uploadResult.fileId
        });
        
        setUploadProgress(100);
      } else {
        throw new Error('Image upload failed - missing URL');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  return (
    <div className="camera-capture-container">
      {error && <div className="camera-error">{error}</div>}
      
      {!capturedImage && !cameraActive && (
        <div className="camera-actions">
          <button 
            className="camera-button" 
            onClick={startCamera}
            title="Take Photo"
          >
            <FaCamera /> Take Photo
          </button>
          <div className="or-divider">OR</div>
          <button 
            className="upload-button" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
          >
            <FaUpload /> Upload Image
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      {cameraActive && (
        <div className="camera-preview">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="video-preview"
          ></video>
          <div className="camera-controls">
            <button 
              className="capture-button" 
              onClick={captureImage}
              title="Capture"
            >
              <FaCamera />
            </button>
            <button 
              className="cancel-button" 
              onClick={stopCamera}
              title="Cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {capturedImage && (
        <div className="captured-image-container">
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="captured-image" 
          />
          
          {uploading && (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
          
          {!uploading && (
            <button 
              className="reset-button" 
              onClick={resetCapture}
              title="Take Another"
            >
              <FaUndo /> Take Another
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCapture; 