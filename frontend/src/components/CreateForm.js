import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formService, imageService } from '../services/api';
import cloudinary from '../services/cloudinary';
import { useUserType } from '../UserTypeContext';
import { FaCamera, FaUpload, FaSpinner } from 'react-icons/fa';
import './Forms.css';

const CreateForm = () => {
    const navigate = useNavigate();
    const { currentUser } = useUserType();
    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'male',
        lastSeenDate: new Date().toISOString().split('T')[0],
        lastSeenLocation: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        additionalDetails: '',
        identifyingFeatures: '',
        status: 'active'
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoId, setPhotoId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formVisible, setFormVisible] = useState(false);

    useEffect(() => {
        // Animation effect when component mounts
        setTimeout(() => setFormVisible(true), 100);
        
        // Verify Cloudinary connection when component mounts
        const checkCloudinary = async () => {
            try {
                const status = await cloudinary.checkHealth();
                console.log('Cloudinary health check:', status);
            } catch (err) {
                console.error('Cloudinary health check failed:', err);
                setUploadError('Warning: Image upload service may be unavailable');
            }
        };
        
        checkCloudinary();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Reset previous uploads
            setPhotoUrl('');
            setPhotoId('');
            setUploadProgress(0);
            setUploadError('');
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                // Just store the file for upload during submission
                setPhotoFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setUploadError('');
        setSuccess(false);

        try {
            // Validate form
            if (!formData.childName || !formData.childAge || !formData.lastSeenLocation) {
                throw new Error('Please fill in all required fields: Name, Age, and Last Seen Location');
            }

            let imageData = null;

            // Upload image if one was selected
            if (photoFile) {
                setUploadProgress(10);
                console.log('Uploading image to Cloudinary...');
                
                try {
                    // Upload to Cloudinary using our service
                    const uploadResult = await imageService.uploadImage(photoFile, (progress) => {
                        setUploadProgress(progress);
                    });
                    console.log('Image upload result:', uploadResult);
                    
                    if (uploadResult?.secure_url) {
                        imageData = {
                            url: uploadResult.secure_url,
                            publicId: uploadResult.public_id
                        };
                        setPhotoUrl(uploadResult.secure_url);
                        setPhotoId(uploadResult.public_id);
                    } else {
                        throw new Error('Image upload failed - missing URL');
                    }
                } catch (uploadErr) {
                    console.error('Error uploading image:', uploadErr);
                    setUploadError(`Image upload failed: ${uploadErr.message || 'Unknown error'}`);
                    // Continue with form submission even if image upload fails
                }
            }

            // Prepare form data for submission to database
            const completeFormData = {
                ...formData,
                reporterUid: currentUser?.uid || '',
                childImageId: imageData?.publicId || '',
                photoUrl: imageData?.url || '',
                photoId: imageData?.publicId || '',
                // Fill in any missing required fields from the model
                contactName: formData.contactName || currentUser?.displayName || 'Anonymous',
                contactPhone: formData.contactPhone || currentUser?.phoneNumber || 'Not provided',
                contactEmail: formData.contactEmail || currentUser?.email || 'Not provided',
                childGender: formData.childGender || 'other',
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            // Submit form to database
            console.log('Submitting form to MongoDB:', completeFormData);
            const response = await formService.createForm(completeFormData);
            console.log('Form submission response:', response);

            // Show success message
            setSuccess(true);
            
            // Reset form after successful submission
            setFormData({
                childName: '',
                childAge: '',
                childGender: 'male',
                lastSeenDate: new Date().toISOString().split('T')[0],
                lastSeenLocation: '',
                description: '',
                contactName: '',
                contactPhone: '',
                contactEmail: '',
                additionalDetails: '',
                identifyingFeatures: '',
                status: 'active'
            });
            setPhotoFile(null);
            setPhotoUrl('');
            setPhotoId('');
            setUploadProgress(0);
            
            // Navigate after a short delay to show success message
            setTimeout(() => {
                navigate('/view');
            }, 2000);
            
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content-container">
            <div className={`form-container ${formVisible ? 'visible' : ''}`} style={{
                opacity: formVisible ? 1 : 0,
                transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.4s ease-in-out'
            }}>
                <div className="form-header">
                    <h2 className="page-title">Report Missing Child</h2>
                    <p className="form-subtitle">Please provide as much information as possible to help in the search.</p>
                </div>
                
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {uploadError && (
                    <div className="error-message">
                        <strong>Upload Error:</strong> {uploadError}
                    </div>
                )}
                
                {success && (
                    <div className="success-message">
                        <strong>Success!</strong> Your report has been submitted successfully. Redirecting...
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="section-title">Child Information</h3>
                        
                        <div className="form-field">
                            <label htmlFor="childName">Child's Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="childName"
                                name="childName"
                                value={formData.childName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter child's full name"
                                className="form-input"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-field">
                                <label htmlFor="childAge">Child's Age <span className="required">*</span></label>
                                <input
                                    type="number"
                                    id="childAge"
                                    name="childAge"
                                    value={formData.childAge}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    max="18"
                                    placeholder="Age in years"
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-field">
                                <label htmlFor="childGender">Child's Gender <span className="required">*</span></label>
                                <select
                                    id="childGender"
                                    name="childGender"
                                    value={formData.childGender}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="lastSeenDate">Last Seen Date <span className="required">*</span></label>
                            <input
                                type="date"
                                id="lastSeenDate"
                                name="lastSeenDate"
                                value={formData.lastSeenDate}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="lastSeenLocation">Last Seen Location <span className="required">*</span></label>
                            <input
                                type="text"
                                id="lastSeenLocation"
                                name="lastSeenLocation"
                                value={formData.lastSeenLocation}
                                onChange={handleInputChange}
                                required
                                placeholder="Where was the child last seen? (City, Area, Landmark, etc.)"
                                className="form-input"
                            />
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="description">Description <span className="required">*</span></label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                placeholder="Please provide details such as what the child was wearing, distinguishing features, circumstances of disappearance, etc."
                                rows="4"
                                className="form-textarea"
                            />
                            <p className="field-help">Include details about the child's appearance, clothing, and any other information that might help in identification.</p>
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="identifyingFeatures">Identifying Features</label>
                            <textarea
                                id="identifyingFeatures"
                                name="identifyingFeatures"
                                value={formData.identifyingFeatures}
                                onChange={handleInputChange}
                                placeholder="Any birthmarks, scars, or unique physical features that could help identify the child"
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">Contact Information</h3>
                        
                        <div className="form-field">
                            <label htmlFor="contactName">Your Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="contactName"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                required
                                placeholder="Your full name"
                                className="form-input"
                            />
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="contactPhone">Your Phone Number <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleInputChange}
                                required
                                placeholder="Your phone number"
                                className="form-input"
                            />
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="contactEmail">Your Email <span className="required">*</span></label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleInputChange}
                                required
                                placeholder="Your email address"
                                className="form-input"
                            />
                            <p className="field-help">This information will be used by authorities to contact you if needed.</p>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">Photo Upload</h3>
                        
                        <div className="form-field">
                            <label htmlFor="photo">Upload Child's Photo</label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    id="photo"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="file-input"
                                />
                                <button type="button" className="browse-button" onClick={() => document.getElementById('photo').click()}>
                                    <FaCamera className="icon" /> Choose Photo
                                </button>
                                <span className="file-name">{photoFile ? photoFile.name : 'No file selected'}</span>
                            </div>
                            <p className="field-help">
                                Uploading a recent photo will help in identification. Max file size: 5MB.
                            </p>
                        </div>
                        
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="upload-progress">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <p>Uploading: {uploadProgress}%</p>
                            </div>
                        )}
                        
                        {photoUrl && (
                            <div className="image-preview">
                                <img src={photoUrl} alt="Preview" className="preview-image" />
                                <p className="success-text">Image uploaded successfully!</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">Additional Information</h3>
                        
                        <div className="form-field">
                            <label htmlFor="additionalDetails">Additional Details</label>
                            <textarea
                                id="additionalDetails"
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleInputChange}
                                placeholder="Any other information that might be helpful in the search"
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="spinner-icon" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FaUpload className="icon" />
                                    Submit Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateForm;
