import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserType } from '../UserTypeContext';
import { imageService, formService } from '../services/api';
import { FaTrash, FaEdit, FaPlus, FaSearch, FaTimesCircle, FaTimes } from 'react-icons/fa';
import EditFormModal from './EditFormModal';
import './Forms.css';

const ViewMyEnquiries = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useUserType();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formToEdit, setFormToEdit] = useState(null);
    const [viewType, setViewType] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredForms, setFilteredForms] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

    

    const showNotification = (title, message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
          ${message}
          <button class="close-alert">&times;</button>
        `;
        
        // Add to DOM
        const container = document.querySelector('.content-container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            document.body.appendChild(alertDiv);
        }
        
        // Add click event to close button
        const closeBtn = alertDiv.querySelector('.close-alert');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alertDiv.remove();
            });
        }
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    };

    // Helper functions wrapped in useCallback
    const getName = useCallback((form) => {
        return form.childName || form.name || 'Unknown';
    }, []);

    const getDescription = useCallback((form) => {
        return form.description || 'No description provided';
    }, []);

    const getLocation = useCallback((form) => {
        return form.lastSeenLocation || form.location || 'Unknown location';
    }, []);

    // Apply filters to forms array
    const applyFilters = useCallback((formsArray, search, status) => {
        let result = [...formsArray];
        
        // Apply search term filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(form => 
                getName(form).toLowerCase().includes(searchLower) ||
                getDescription(form).toLowerCase().includes(searchLower) ||
                getLocation(form).toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status filter
        if (status && status !== 'all') {
            result = result.filter(form => form.status === status);
        }
        
        return result;
    }, [getName, getDescription, getLocation]);

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

    const openEditModal = (formId) => {
        const formData = forms.find(form => (form._id || form.id) === formId);
        if (formData) {
            setFormToEdit(formData);
            setShowEditModal(true);
        } else {
            showNotification('Error', 'Form data not found', 'error');
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setFormToEdit(null);
    };

    const handleFormUpdated = (updatedForm) => {
        // Update the local forms array with the updated form
        const updatedForms = forms.map(form => {
            const formId = form._id || form.id;
            const updatedFormId = updatedForm._id || updatedForm.id;
            
            if (formId === updatedFormId) {
                return { ...form, ...updatedForm };
            }
            return form;
        });
        
        setForms(updatedForms);
        setFilteredForms(applyFilters(updatedForms, searchTerm, statusFilter));
        showNotification('Success', 'Form updated successfully!', 'success');
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
                setFilteredForms(applyFilters(myForms, searchTerm, statusFilter));
                setError(null);
            } else {
                // No forms found in the database
                setForms([]);
                setFilteredForms([]);
                setError('You have not submitted any reports yet.');
            }
        } catch (err) {
            console.error('Error fetching forms:', err);
            setError('Failed to load your reports. Please try again later.');
            setForms([]);
            setFilteredForms([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser, searchTerm, statusFilter,applyFilters]);
    
    // Helper function to get the best image URL
    const getImageUrl = useCallback((form) => {
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
    }, []);
    
    // Helper function to get the age from different field structures
    const getAge = useCallback((form) => {
        return form.childAge || form.age || 'N/A';
    }, []);
    
    // Helper function to get the lastSeenDate from different field structures
    const getLastSeenDate = useCallback((form) => {
        return form.lastSeenDate || form.createdAt || new Date().toISOString();
    }, []);
    
    // Helper function to get contact info
    const getContactInfo = useCallback((form) => {
        return form.contactInfo || form.contactPhone || form.contactEmail || 'No contact info provided';
    }, []);

    // Helper function to get identifying features
    const getIdentifyingFeatures = useCallback((form) => {
        return form.identifyingFeatures || 'None specified';
    }, []);

    // Add this new function for deleting responses
    const handleDeleteResponse = async (formId, responseIndex) => {
        try {
            if (window.confirm('Are you sure you want to delete this response?')) {
                // Show loading notification
                showNotification('Processing', 'Deleting response...', 'info');
                
                // Find the form
                const form = forms.find(f => (f._id || f.id) === formId);
                if (!form || !form.responses) {
                    throw new Error('Form or responses not found');
                }
                
                // Create a new array of responses without the one to delete
                const updatedResponses = [...form.responses];
                updatedResponses.splice(responseIndex, 1);
                
                // Update the form in the database with the new responses array
                await formService.updateFormResponses(formId, updatedResponses);
                
                // Update local state
                const updatedForms = forms.map(f => {
                    if ((f._id || f.id) === formId) {
                        return { ...f, responses: updatedResponses };
                    }
                    return f;
                });
                
                setForms(updatedForms);
                setFilteredForms(applyFilters(updatedForms, searchTerm, statusFilter));
                
                // Show success notification
                showNotification('Success', 'Response deleted successfully.', 'success');
            }
        } catch (error) {
            console.error('Error deleting response:', error);
            showNotification('Error', 'Failed to delete response. Please try again.', 'error');
        }
    };

    // Function to handle status update
    const handleStatusChange = async (formId, newStatus) => {
        try {
            await formService.updateFormStatus(formId, newStatus);
            
            // Update local state
            const updatedForms = forms.map(form => {
                if ((form._id || form.id) === formId) {
                    return { ...form, status: newStatus };
                }
                return form;
            });
            
            setForms(updatedForms);
            setFilteredForms(applyFilters(updatedForms, searchTerm, statusFilter));
            
            showNotification('Status Updated', `Report status changed to ${newStatus}.`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Error', 'Failed to update status. Please try again.', 'error');
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredForms(applyFilters(forms, value, statusFilter));
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        setFilteredForms(applyFilters(forms, searchTerm, value));
    };

   

    // Add a report
    const handleAddReport = () => {
        navigate('/create');
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
            <h2 className="page-title">My Reports</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="filter-container">
                <div className="search-input">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name, description or location..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                
                <div className="filter-controls">
                    <div className="status-filter">
                        <label htmlFor="statusFilter">Status:</label>
                        <select 
                            id="statusFilter" 
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="all">All Reports</option>
                            <option value="active">Active</option>
                            <option value="investigating">Investigating</option>
                            <option value="found">Found</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    
                    <div className="view-toggle">
                        <button 
                            className={`view-button ${viewType === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewType('grid')}
                            title="Grid View"
                        >
                            <i className="grid-icon">⊞</i>
                        </button>
                        <button 
                            className={`view-button ${viewType === 'list' ? 'active' : ''}`}
                            onClick={() => setViewType('list')}
                            title="List View"
                        >
                            <i className="list-icon">≡</i>
                        </button>
                    </div>
                    
                    <button 
                        className="submit-button add-form-button"
                        onClick={handleAddReport}
                    >
                        <FaPlus /> New Report
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your reports...</p>
                </div>
            ) : filteredForms.length === 0 ? (
                <div className="no-results">
                    <FaSearch size={48} color="#aaa" />
                    <p>No reports found</p>
                    <p>
                        {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'You haven\'t submitted any reports yet'}
                    </p>
                    <button 
                        className="submit-button add-form-button"
                        onClick={handleAddReport}
                        style={{ marginTop: '20px' }}
                    >
                        <FaPlus /> Create New Report
                    </button>
                </div>
            ) : (
                <div className={`forms-container ${viewType}-view`}>
                    {filteredForms.map(form => (
                        <div key={form._id || form.id} className="form-card">
                            <div className="form-header">
                                <h3>{getName(form)}, {getAge(form)}</h3>
                                <div className={`status-badge status-${form.status}`}>{form.status}</div>
                            </div>
                            
                            <div className="form-content">
                                {getImageUrl(form) && (
                                    <div className="form-image">
                                        <img
                                            src={getImageUrl(form)} 
                                            height={100}
                                            width={100}
                                            alt="Child" 
                                            onError={(e) => e.target.src = `${process.env.PUBLIC_URL}/placeholder.png`}
                                        />
                                    </div>
                                )}
                                
                                <div className="form-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Description</span>
                                        <span className="detail-value">{getDescription(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Last Seen</span>
                                        <span className="detail-value">{getLocation(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Date</span>
                                        <span className="detail-value">{new Date(getLastSeenDate(form)).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Contact</span>
                                        <span className="detail-value">{getContactInfo(form)}</span>
                                    </div>
                                    
                                    <div className="detail-row full-width">
                                        <span className="detail-label">Identifying Features</span>
                                        <span className="detail-value">{getIdentifyingFeatures(form)}</span>
                                    </div>
                                </div>
                                
                                <div className="dates-row">
                                    <span><strong>Created:</strong> {new Date(form.createdAt).toLocaleDateString()}</span>
                                    <span><strong>Updated:</strong> {new Date(form.updatedAt || form.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <select 
                                    className="status-dropdown"
                                    value={form.status}
                                    onChange={(e) => handleStatusChange(form._id || form.id, e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="found">Found</option>
                                    <option value="closed">Closed</option>
                                </select>
                                
                                <div className="action-buttons">
                                    <button 
                                        className="action-button edit-button"
                                        onClick={() => openEditModal(form._id || form.id)}
                                        title="Edit Report"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="action-button delete-button"
                                        onClick={() => confirmDeleteForm(form._id || form.id)}
                                        title="Delete Report"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                            
                            {form.responses && form.responses.length > 0 && (
                                <div className="responses-section">
                                    <h4>Responses ({form.responses.length})</h4>
                                    <div className="responses-list">
                                        {form.responses.map((response, index) => (
                                            <div key={index} className="response-card">
                                                <div className="response-header">
                                                    <p><strong>From:</strong> {response.responderName || 'Anonymous'}</p>
                                                    <button 
                                                        className="delete-response-button"
                                                        onClick={() => handleDeleteResponse(form._id || form.id, index)}
                                                        title="Delete Response"
                                                    >
                                                        <FaTimesCircle />
                                                    </button>
                                                </div>
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
                <div className="form-detail-modal">
                    <div className="form-detail-modal-content">
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="modal-close-button" onClick={closeDeleteModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to delete the report for <strong>{formToDelete ? getName(formToDelete) : 'this child'}</strong>?</p>
                            <p>This action cannot be undone and will permanently remove all information about this report, including any responses received.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-button" onClick={closeDeleteModal}>
                                <FaTimes /> Cancel
                            </button>
                            <button className="delete-button" onClick={handleDeleteForm}>
                                <FaTrash /> Delete Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showEditModal && formToEdit && (
                <EditFormModal 
                    form={formToEdit} 
                    onClose={closeEditModal} 
                    onSuccess={handleFormUpdated} 
                />
            )}
        </div>
    );
};

export default ViewMyEnquiries;
