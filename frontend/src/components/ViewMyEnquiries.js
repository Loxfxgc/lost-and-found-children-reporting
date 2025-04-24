import React, { useState, useEffect, useCallback } from 'react';
import { useUserType } from '../UserTypeContext';
import { imageService } from '../services/api';
import './Forms.css';

const ViewMyEnquiries = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useUserType();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);

    const handleMarkFound = (formId) => {
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        const updatedForms = storedForms.map(form => {
            if (form.id === formId) {
                return {
                    ...form,
                    status: 'found',
                    foundAt: new Date().toISOString()
                };
            }
            return form;
        });
        localStorage.setItem('myForms', JSON.stringify(updatedForms));
        
        // Show success notification instead of alert
        showNotification('Success', 'Child marked as found successfully!', 'success');
        
        fetchForms();
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
        const formData = forms.find(form => form.id === formId);
        setFormToDelete(formData);
        setShowDeleteModal(true);
    };

    const handleDeleteForm = () => {
        if (!formToDelete) return;
        
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        const updatedForms = storedForms.filter(form => form.id !== formToDelete.id);
        localStorage.setItem('myForms', JSON.stringify(updatedForms));
        
        // Show success notification
        showNotification('Form Deleted', 'The form has been deleted successfully.', 'success');
        
        // Close modal and reset form to delete
        setShowDeleteModal(false);
        setFormToDelete(null);
        
        fetchForms();
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setFormToDelete(null);
    };

    const fetchForms = useCallback(() => {
        if (!currentUser?.uid) return;
        
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        const myForms = storedForms.filter(form => 
            form.userId === currentUser.uid
        );
        setForms(myForms);
        setLoading(false);
    }, [currentUser]);
    
    // Helper function to get the best image URL
    const getImageUrl = (form) => {
        // First try to use Cloudinary URL if available
        if (form.photoUrl) {
            return form.photoUrl;
        }
        // Then try to use photoId with Cloudinary
        else if (form.photoId) {
            return imageService.getImageUrl(null, form.photoId);
        }
        // Fallback to local preview
        return form.photoPreview;
    };

    useEffect(() => {
        fetchForms();
    }, [currentUser, fetchForms]);

    return (
        <div className="forms-container">
            <h1>My Submitted Forms</h1>
            
            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : forms.length === 0 ? (
                <div className="no-forms-message">
                    <p>You haven't submitted any forms yet.</p>
                </div>
            ) : (
                <div className="forms-list">
                    {forms.map(form => (
                            <div key={form.id} className="form-card">
                                <h3>{form.name}</h3>
                                <p>Age: {form.age}</p>
                                <p>Description: {form.description}</p>
                                <p>Last Seen Location: {form.location}</p>
                                <p>Last Seen Date: {new Date(form.lastSeenDate).toLocaleDateString()}</p>
                                <p>Contact: {form.contactInfo}</p>
                                <p>Status: <span className={`status-${form.status}`}>{form.status}</span></p>
                                
                                <div className="form-actions">
                                    {form.status === 'pending' && (
                                        <button 
                                            className="found-btn"
                                            onClick={() => handleMarkFound(form.id)}
                                        >
                                            Mark as Found
                                        </button>
                                    )}
                                    <button 
                                        className="delete-btn"
                                        onClick={() => confirmDeleteForm(form.id)}
                                    >
                                        Delete Form
                                    </button>
                                </div>
                                
                                {(form.photoPreview || form.photoUrl || form.photoId) && (
                                    <img 
                                        src={getImageUrl(form)} 
                                        alt="Child" 
                                        className="form-photo-preview"
                                        onError={(e) => {
                                            // Fall back to photoPreview if Cloudinary URL fails
                                            if (form.photoPreview) {
                                                console.log('Falling back to local preview for', form.id);
                                                e.target.src = form.photoPreview;
                                            }
                                        }}
                                    />
                                )}
                                
                                {form.responses && form.responses.length > 0 && (
                                    <div className="responses-section">
                                        <h4>Responses ({form.responses.length})</h4>
                                        {form.responses.map((response, index) => (
                                            <div key={index} className="response-card">
                                                <p><strong>From:</strong> {response.responderName || 'Anonymous'}</p>
                                                <p><strong>Message:</strong> {response.message}</p>
                                                <p><strong>Contact:</strong> {response.contactInfo}</p>
                                                <p><strong>Date:</strong> {new Date(response.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                    ))}
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this form?</p>
                            {formToDelete && (
                                <div className="modal-form-details">
                                    <p><strong>Child Name:</strong> {formToDelete.name}</p>
                                    <p><strong>Age:</strong> {formToDelete.age}</p>
                                    <p><strong>Last Seen:</strong> {formToDelete.location}</p>
                                </div>
                            )}
                            <p className="modal-warning">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-cancel-btn" onClick={closeDeleteModal}>Cancel</button>
                            <button className="modal-delete-btn" onClick={handleDeleteForm}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewMyEnquiries;
