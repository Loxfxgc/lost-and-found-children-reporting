import React, { useState, useEffect, useCallback } from 'react';
import { useUserType } from '../UserTypeContext';
import { imageService, formService } from '../services/api';
import './Forms.css';

const ViewMyEnquiries = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useUserType();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);

    const handleMarkFound = async (formId) => {
        try {
            // Update form status in the database
            await formService.updateFormStatus(formId, 'found');
            
            // Show success notification
            showNotification('Success', 'Child marked as found successfully!', 'success');
            
            // Fetch updated forms
            fetchForms();
        } catch (err) {
            console.error('Error marking form as found:', err);
            showNotification('Error', 'Failed to update form status. Please try again.', 'error');
        }
    };

    const showNotification = (title, message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `form-alert ${type}`;
        alertDiv.innerHTML = `
          <div class="alert-content">
            <span class="alert-icon">${type === 'success' ? '✓' : '✕'}</span>
            <div>
              <h3>${title}</h3>
              <p>${message}</p>
            </div>
          </div>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
          alertDiv.classList.add('fade-out');
          setTimeout(() => alertDiv.remove(), 500);
        }, 3000);
    };

    const confirmDeleteForm = (formId) => {
        // Find the form to be deleted for display in the modal
        const formData = forms.find(form => form._id === formId || form.id === formId);
        setFormToDelete(formData);
        setShowDeleteModal(true);
    };

    const handleDeleteForm = async () => {
        if (!formToDelete) return;
        
        try {
            // Delete the form from the database
            const formId = formToDelete._id || formToDelete.id;
            
            // Try to delete the form from the database
            try {
                await formService.deleteForm(formId);
                console.log('Form successfully deleted from database');
            } catch (deleteError) {
                console.error('Could not delete form from database, trying fallback:', deleteError);
                
                // Fallback to updating status to deleted
                await formService.updateFormStatus(formId, 'deleted');
                console.log('Form marked as deleted in database');
            }
            
            // Show success notification
            showNotification('Form Deleted', 'The form has been deleted successfully.', 'success');
            
            // Close modal and reset form to delete
            setShowDeleteModal(false);
            setFormToDelete(null);
            
            // Fetch updated forms
            fetchForms();
        } catch (err) {
            console.error('Error deleting form:', err);
            showNotification('Error', 'Failed to delete form. Please try again.', 'error');
            
            // Close modal and reset form to delete
            setShowDeleteModal(false);
            setFormToDelete(null);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setFormToDelete(null);
    };

    const fetchForms = useCallback(async () => {
        if (!currentUser?.uid) {
            console.log('No currentUser.uid available, skipping form fetch');
            return;
        }
        
        console.log('Fetching forms for user:', currentUser.uid);
        setLoading(true);
        try {
            // Fetch user's forms from database
            const response = await formService.getMyForms(currentUser.uid);
            // Extract the actual data array from the API response
            const myForms = response.data || response;
            console.log('Fetched user forms from database:', myForms);
            console.log('Number of forms found:', myForms ? myForms.length : 0);
            
            // If we got forms, show them
            if (myForms && myForms.length > 0) {
                setForms(myForms);
                setError(null);
            } else {
                // No forms found in the database
                setForms([]);
                setError('You have not submitted any reports yet.');
            }
        } catch (err) {
            console.error('Error fetching forms:', err);
            setError('Failed to load your reports. Please try again later.');
            setForms([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);
    
    // Helper function to get the best image URL
    const getImageUrl = (form) => {
        // First try to use Cloudinary URL if available
        if (form.photoUrl) {
            return form.photoUrl;
        }
        // Then try to use photoId or childImageId with Cloudinary
        else if (form.photoId) {
            return imageService.getImageUrl(null, form.photoId);
        }
        else if (form.childImageId) {
            return imageService.getImageUrl(null, form.childImageId);
        }
        // Fallback to local preview
        return form.photoPreview;
    };

    // Helper function to get the name from different field structures
    const getName = (form) => {
        return form.childName || form.name || 'Unknown';
    };
    
    // Helper function to get the age from different field structures
    const getAge = (form) => {
        return form.childAge || form.age || 'N/A';
    };
    
    // Helper function to get the description
    const getDescription = (form) => {
        return form.description || 'No description provided';
    };
    
    // Helper function to get the location from different field structures
    const getLocation = (form) => {
        return form.lastSeenLocation || form.location || 'Unknown location';
    };
    
    // Helper function to get the lastSeenDate from different field structures
    const getLastSeenDate = (form) => {
        return form.lastSeenDate || form.createdAt || new Date().toISOString();
    };
    
    // Helper function to get contact info
    const getContactInfo = (form) => {
        return form.contactInfo || form.contactPhone || form.contactEmail || 'No contact info provided';
    };

    useEffect(() => {
        console.log('ViewMyEnquiries mounting with currentUser:', currentUser);
        if (currentUser) {
            fetchForms();
        }
    }, [currentUser, fetchForms]);

    if (!currentUser) {
        return (
            <div className="content-container">
                <h2>Please log in to view your enquiries.</h2>
            </div>
        );
    }

    return (
        <div className="content-container">
            <h2 className="page-title">My Enquiries</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your forms...</p>
                </div>
            ) : forms.length === 0 ? (
                <div className="no-forms">
                    <p>You haven't submitted any enquiries yet.</p>
                </div>
            ) : (
                <div className="forms-list">
                    {forms.map(form => (
                        <div key={form._id || form.id} className="form-card">
                            <div className="form-header">
                                <h3>{getName(form)}, {getAge(form)}</h3>
                                <div className={`status-badge status-${form.status}`}>{form.status}</div>
                            </div>
                            
                            <div className="form-content">
                                <div className="form-details">
                                    <p><strong>Description:</strong> {getDescription(form)}</p>
                                    <p><strong>Last seen:</strong> {getLocation(form)} on {new Date(getLastSeenDate(form)).toLocaleDateString()}</p>
                                    <p><strong>Contact:</strong> {getContactInfo(form)}</p>
                                    <p><strong>Created:</strong> {new Date(form.createdAt).toLocaleString()}</p>
                                    {form.status === 'found' && (
                                        <p><strong>Found at:</strong> {new Date(form.foundAt).toLocaleString()}</p>
                                    )}
                                </div>
                                
                                {(form.photoPreview || form.photoUrl || form.childImageId || form.photoId) && (
                                    <div className="form-image-container">
                                        <img 
                                            src={getImageUrl(form)}
                                            alt="Child"
                                            className="form-photo"
                                            onError={(e) => {
                                                if (form.photoPreview) e.target.src = form.photoPreview;
                                                else e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="form-actions">
                                {form.status === 'pending' && (
                                    <button 
                                        className="mark-found-button"
                                        onClick={() => handleMarkFound(form._id || form.id)}
                                    >
                                        Mark as Found
                                    </button>
                                )}
                                <button 
                                    className="delete-form-button"
                                    onClick={() => confirmDeleteForm(form._id || form.id)}
                                >
                                    Delete
                                </button>
                            </div>
                            
                            {form.responses && form.responses.length > 0 && (
                                <div className="responses-section">
                                    <h4>Responses ({form.responses.length})</h4>
                                    <div className="responses-list">
                                        {form.responses.map((response, index) => (
                                            <div key={index} className="response-card">
                                                <p><strong>From:</strong> {response.responderName || 'Anonymous'}</p>
                                                <p><strong>Message:</strong> {response.message}</p>
                                                <p><strong>Contact:</strong> {response.contactInfo}</p>
                                                <p><strong>Date:</strong> {new Date(response.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Delete Form</h3>
                        <p>Are you sure you want to delete the form for {formToDelete.name}?</p>
                        <p>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-button"
                                onClick={handleDeleteForm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewMyEnquiries;
