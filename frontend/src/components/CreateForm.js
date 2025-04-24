import React, { useState } from 'react';
import { useUserType } from '../UserTypeContext';
import { imageService } from '../services/api';
import './CreateForm.css';

const CreateForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        description: '',
        location: '',
        lastSeenDate: '',
        contactInfo: '',
        photo: null,
        photoPreview: null,
        photoUrl: null,
        photoId: null
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const { currentUser } = useUserType();
    const [errors, setErrors] = useState({});

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'photo' && files && files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    photo: files[0],
                    photoPreview: event.target.result
                }));
            };
            reader.readAsDataURL(files[0]);

            // Upload to Cloudinary
            try {
                setUploadingImage(true);
                const response = await imageService.uploadImage(files[0], currentUser?.uid);
                console.log('Cloudinary upload response:', response.data);
                
                if (response.data && response.data.success) {
                    const cloudinaryUrl = response.data.url || response.data.secure_url;
                    setFormData(prev => ({
                        ...prev,
                        photoId: response.data.fileId,
                        photoUrl: cloudinaryUrl
                    }));
                    
                    console.log('Image uploaded successfully to Cloudinary:', cloudinaryUrl);
                } else {
                    console.error('No success in response:', response.data);
                    setErrors(prev => ({
                        ...prev,
                        photo: 'Failed to upload image. The form will still work with a local image.'
                    }));
                }
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                // Keep the local preview but show error message
                setErrors(prev => ({
                    ...prev,
                    photo: 'Failed to upload image. The form will still work with a local image.'
                }));
            } finally {
                setUploadingImage(false);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    console.log('Current User Auth State:', {
      uid: currentUser?.uid,
      isAnonymous: currentUser?.isAnonymous,
      emailVerified: currentUser?.emailVerified
    });

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.age || formData.age < 0 || formData.age > 18) newErrors.age = 'Valid age required (0-18)';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.lastSeenDate) newErrors.lastSeenDate = 'Last seen date is required';
        if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const formWithUser = {
                ...formData,
                userId: currentUser?.uid,
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            
            // Save to localStorage with form data including Cloudinary info
            const existingForms = JSON.parse(localStorage.getItem('myForms')) || [];
            const newForm = {
              ...formWithUser,
              id: `local_${Date.now()}`, // Unique local ID
              photoPreview: formData.photoPreview, // Local preview
              photoUrl: formData.photoUrl, // Cloudinary URL
              photoId: formData.photoId, // Cloudinary ID
              status: 'pending'
            };
            
  

            localStorage.setItem('myForms', JSON.stringify([...existingForms, newForm]));
            
            // Redirect to View My Enquiries after successful submission
            window.location.href = '/my-enquiries';
            
            // Show styled success alert
            const alertDiv = document.createElement('div');
            alertDiv.className = 'form-alert success';
            alertDiv.innerHTML = `
              <div class="alert-content">
                <span class="alert-icon">✓</span>
                <div>
                  <h3>Submission Successful!</h3>
                  <p>Record ID: ${newForm.id}</p>
                  <p>Thank you for your report.</p>
                </div>
              </div>
            `;
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
              alertDiv.classList.add('fade-out');
              setTimeout(() => alertDiv.remove(), 500);
            }, 5000);
            
            // Reset form
            setFormData({
              name: '',
              age: '',
              description: '',
              location: '',
              lastSeenDate: '',
              contactInfo: '',
              photo: null,
              photoPreview: null,
              photoUrl: null,
              photoId: null
            });
              
            } catch (error) {
              console.error('Submission Error:', error);
              
              // Create error alert element
              const alertDiv = document.createElement('div');
              alertDiv.className = 'form-alert error';
              alertDiv.innerHTML = `
                <div class="alert-content">
                  <span class="alert-icon">✕</span>
                  <div>
                    <h3>Submission Failed</h3>
                    <p>${error.message}</p>
                    <p>Please try again.</p>
                  </div>
                </div>
              `;
              document.body.appendChild(alertDiv);
              
              // Remove alert after 5 seconds
              setTimeout(() => {
                alertDiv.classList.add('fade-out');
                setTimeout(() => alertDiv.remove(), 500);
              }, 5000);
            }
    };

    return (
        <div className="form-container">
            <h2>Report a Lost Child</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Child's Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                {errors.name && <span className="error">{errors.name}</span>}

                <label htmlFor="age">Age:</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                />
                {errors.age && <span className="error">{errors.age}</span>}

                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
                {errors.description && <span className="error">{errors.description}</span>}

                <label htmlFor="location">Last Seen Location:</label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />
                {errors.location && <span className="error">{errors.location}</span>}

                <label htmlFor="lastSeenDate">Last Seen Date:</label>
                <input
                    type="date"
                    id="lastSeenDate"
                    name="lastSeenDate"
                    value={formData.lastSeenDate}
                    onChange={handleChange}
                    required
                />
                {errors.lastSeenDate && <span className="error">{errors.lastSeenDate}</span>}

                <label htmlFor="contactInfo">Contact Information:</label>
                <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    required
                />
                {errors.contactInfo && <span className="error">{errors.contactInfo}</span>}

                <label htmlFor="photo">Upload Photo:</label>
                <input
                    type="file"
                    id="photo"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                    disabled={uploadingImage}
                />
                {errors.photo && <span className="error">{errors.photo}</span>}
                {uploadingImage && <span className="upload-status">Uploading image to cloud...</span>}

                {formData.photoPreview && (
                    <div className="file-upload-preview">
                        <img src={formData.photoPreview} alt="Preview" />
                        <p>Image Preview {formData.photoUrl ? '(Uploaded to Cloud)' : '(Local Only)'}</p>
                    </div>
                )}

                <button type="submit">Submit Report</button>
            </form>
        </div>
    );
};

export default CreateForm;
