import React, { useState, useEffect } from 'react';
import './Forms.css';
import { FaSearch, FaRedo, FaTrash, FaThList, FaTh, FaCamera, FaChevronDown, FaTimes } from 'react-icons/fa';
import { formService } from '../services/api';
import { useUserType } from '../UserTypeContext';
import CameraCapture from './CameraCapture';

const ViewAllForms = () => {
    const [forms, setForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loadingImages, setLoadingImages] = useState({});
    const [error, setError] = useState(null);
    const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const { userType } = useUserType();
    const [showCamera, setShowCamera] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Fetch forms on component mount
    useEffect(() => {
        fetchForms();
    }, []);

    // Handle opening the detailed modal
    const openFormDetail = (form, e) => {
        // Prevent triggering when clicking on buttons, selects, etc.
        if (e.target.closest('button') || e.target.closest('select')) {
            return;
        }
        
        setSelectedForm(form);
        
        // Prevent scrolling on body when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Handle closing the detailed modal
    const closeFormDetail = () => {
        setSelectedForm(null);
        
        // Restore scrolling
        document.body.style.overflow = 'auto';
    };

    // Close modal when clicking outside
    const handleModalClick = (e) => {
        if (e.target.classList.contains('form-detail-modal')) {
            closeFormDetail();
        }
    };

    // Escape key to close modal
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && selectedForm) {
                closeFormDetail();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [selectedForm]);

    // Fetch all forms from database
    const fetchForms = async () => {
        try {
            // Temporarily show loading in the forms container instead of status message
            setFilteredForms([]);
            setForms([]);
            
            // Fetch from API instead of localStorage
            const response = await formService.getAllForms();
            
            // Handle different response formats
            let fetchedForms = [];
            if (response) {
                if (Array.isArray(response)) {
                    fetchedForms = response;
                } else if (response.data && Array.isArray(response.data)) {
                    fetchedForms = response.data;
                } else if (typeof response === 'object') {
                    fetchedForms = [response];
                }
            }
            
            // Ensure all forms have a created date and unique ID
            const formsWithDates = fetchedForms.map(form => ({
                ...form,
                created: form.createdAt || form.created || new Date().toISOString(),
                id: form._id || form.id || Math.random().toString(36).substr(2, 9) // Ensure ID exists
            }));
            
            // Sort by created date (newest first)
            formsWithDates.sort((a, b) => new Date(b.created) - new Date(a.created));
            
            setForms(formsWithDates);
            setFilteredForms(formsWithDates);
            
            // Only show message if there was an error - removed success message
        } catch (error) {
            console.error('Error fetching forms from database:', error);
            setError('Failed to load forms from database. Please try again.');
        }
    };

    // Filter forms based on search term and status
    useEffect(() => {
        if (forms.length > 0) {
            const filtered = forms.filter(form => {
                const matchesSearch = 
                    !searchTerm || 
                form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    form.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (typeof form.location === 'string' && form.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (typeof form.lastSeenLocation === 'string' && form.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    form.description?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesStatus = 
                    statusFilter === 'all' || 
                    form.status === statusFilter;

                return matchesSearch && matchesStatus;
            });

            setFilteredForms(filtered);
        }
    }, [searchTerm, statusFilter, forms]);

    // Handle searching
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle status filtering
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    };

    // Handle updating form status
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            // Update status in database via API
            await formService.updateFormStatus(id, newStatus);
            
            // Update local state after DB update
            const updatedForms = forms.map(form => {
                if ((form._id || form.id) === id) {
                    return { ...form, status: newStatus };
                }
                return form;
            });

            // Update local state only
            setForms(updatedForms);
        } catch (error) {
            console.error('Error updating status in database:', error);
            // Show error as an alert instead of status message
            alert('Error updating status. Please try again.');
        }
    };

    // Handle deleting a form
    const handleDeleteForm = async (id) => {
        // Only allow parents to delete reports
        if (userType !== 'parent') {
            alert('Only parents can delete reports.');
            return;
        }

        try {
            if (window.confirm('Are you sure you want to delete this report?')) {
                // Delete from database via API
                await formService.deleteForm(id);
                
                // Update local state after successful deletion
                const updatedForms = forms.filter(form => (form._id || form.id) !== id);
                setForms(updatedForms);
            }
        } catch (error) {
            console.error('Error deleting form from database:', error);
            alert('Error deleting report. Please try again.');
        }
    };

    // Handle image loading state
    const handleImageLoad = (id) => {
        setLoadingImages(prev => ({ ...prev, [id]: false }));
    };

    const handleImageError = (id) => {
        setLoadingImages(prev => ({ ...prev, [id]: false }));
    };

    const handleImageStart = (id) => {
        setLoadingImages(prev => ({ ...prev, [id]: true }));
    };
    
    // Helper function to get child name consistently
    const getChildName = (form) => {
        return form.childName || form.name || 'Unnamed';
    };
    
    // Helper function to get child age
    const getChildAge = (form) => {
        return form.childAge || form.age || 'Unknown';
    };
    
    // Helper function to get gender
    const getGender = (form) => {
        return form.childGender || form.gender || 'Unknown';
    };
    
    // Helper function to get location
    const getLocation = (form) => {
        // Display the location as a string directly
        if (form.lastSeenLocation) {
            return form.lastSeenLocation;
        }
        
        // If location is stored as a string, use it directly
        if (form.location && typeof form.location === 'string') {
            return form.location;
        }
        
        // If there's a locationName field
        if (form.locationName) {
            return form.locationName;
        }
        
        // If location is an object but has a name or place property
        if (form.location && typeof form.location === 'object') {
            if (form.location.name) return form.location.name;
            if (form.location.place) return form.location.place;
            if (form.location.city) return form.location.city;
            if (form.location.address) return form.location.address;
        }
        
        return 'Unknown location';
    };
    
    // Helper function to get contact information
    const getContact = (form) => {
        return form.contactInfo || form.contactPhone || form.contactEmail || 'Not provided';
    };
    
    // Helper function to get parent/guardian name
    const getParentName = (form) => {
        return form.contactName || form.parentName || form.reporterName || 'Not specified';
    };
    
    // Helper function to get description
    const getDescription = (form) => {
        return form.description || 'No description provided';
    };

    // Helper function to get identification marks
    const getIdentificationMarks = (form) => {
        // Check multiple possible field names for identification features
        return form.identificationMarks || form.identifyingFeatures || form.identifyingMarks || form.identificationFeatures || 'None specified';
    };

    // New function to handle response deletion
    const handleDeleteResponse = async (formId, responseIndex) => {
        // Only allow parents to delete responses
        if (userType !== 'parent') {
            alert('Only parents can delete responses.');
            return;
        }

        try {
            if (window.confirm('Are you sure you want to delete this response?')) {
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
                setFilteredForms(updatedForms);
            }
        } catch (error) {
            console.error('Error deleting response:', error);
            alert('Error deleting response. Please try again.');
        }
    };

    // Handle image upload from camera
    const handleImageUpload = async (imageData) => {
        try {
            // Here you can implement facial recognition search or other processing
            alert('Image uploaded successfully! Searching for matches...');
            
            // Hide the camera component
            setShowCamera(false);
            
            // In a real app, you would send the image to a backend API for processing
            // and then update the UI with the results
        } catch (error) {
            console.error('Error processing uploaded image:', error);
            alert('Error processing image. Please try again.');
        }
    };

    // Handle view mode toggle
    const toggleViewMode = () => {
        setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
    };

    return (
        <div className="content-container">
            <h2 className="page-title">View Reports</h2>
            
            {/* Search and Filter */}
            <div className="filter-container">
                <div className="search-input">
                    <FaSearch className="search-icon" />
                <input
                    type="text"
                        placeholder="Search by name, location, or description..." 
                    value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                
                <div className="filter-controls">
                    <div className="status-filter">
                        <label htmlFor="status-filter">Status:</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="investigating">Investigating</option>
                            <option value="found">Found</option>
                            <option value="active">Active</option>
                        </select>
                    </div>
                    
                    <div className="view-toggle">
                        <button 
                            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={toggleViewMode}
                            title={viewMode === 'list' ? "Switch to Grid View" : "Switch to List View"}
                        >
                            {viewMode === 'list' ? <FaTh className="grid-icon" /> : <FaThList className="list-icon" />}
                        </button>
                        <button 
                            className="camera-toggle-button"
                            onClick={() => setShowCamera(!showCamera)}
                            title="Search by Image"
                        >
                            <FaCamera />
                        </button>
                    </div>
                    
                    <button 
                        className="refresh-button" 
                        onClick={fetchForms}
                        title="Refresh Reports"
                    >
                        <FaRedo /> Refresh
                    </button>
                </div>
            </div>

            {/* Camera Component */}
            {showCamera && (
                <div className="camera-modal">
                    <div className="camera-modal-content">
                        <h3>Take or Upload a Photo</h3>
                        <p>Take a photo or upload an image to search for matching children.</p>
                        <CameraCapture onImageUpload={handleImageUpload} />
                        <button 
                            className="close-camera-button"
                            onClick={() => setShowCamera(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Display Forms */}
            <div className={`forms-container ${viewMode}-view`}>
                {filteredForms.length > 0 ? (
                    filteredForms.map(form => {
                        const formId = form._id || form.id;
                        
                        return (
                            <div 
                                key={formId} 
                                className="form-card"
                                onClick={(e) => openFormDetail(form, e)}
                            >
                                <div className="form-header">
                                    <h3>{getChildName(form)}</h3>
                                    <span className={`status-badge status-${form.status}`}>
                                        {form.status || 'Unknown'}
                                    </span>
                                </div>
                                
                                <div className={`form-content ${viewMode === 'list' ? 'list-content' : ''}`}>
                                    {(form.imageUrl || form.photoUrl) && (
                                        <div className="form-image">
                                            {loadingImages[formId] && (
                                                <div className="image-loading">
                                                    <div className="loading-spinner"></div>
                                                    <span>Loading image...</span>
                                                </div>
                                            )}
                                            <img 
                                                src={form.photoUrl || form.imageUrl} 
                                                alt={`Child ${getChildName(form)}`} 
                                                onLoad={() => handleImageLoad(formId)}
                                                onError={() => handleImageError(formId)}
                                                onLoadStart={() => handleImageStart(formId)}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="form-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Age</span>
                                            <span className="detail-value">{getChildAge(form)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Gender</span>
                                            <span className="detail-value">{getGender(form)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Last Seen</span>
                                            <span className="detail-value">{getLocation(form)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Contact</span>
                                            <span className="detail-value">{getContact(form)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="identification-section">
                                        <span className="detail-label">Identification Marks</span>
                                        <span className="detail-value">{getIdentificationMarks(form)}</span>
                                    </div>
                                    
                                    <div className="dates-row">
                                        <span><strong>Last seen:</strong> {form.lastSeenDate ? formatDate(form.lastSeenDate) : 'Unknown'}</span>
                                        <span><strong>Reported:</strong> {formatDate(form.created || form.createdAt || new Date())}</span>
                                    </div>
                                </div>
                                
                                {userType === 'parent' ? (
                                    <div className="form-actions">
                                        <select 
                                            className="status-dropdown"
                                            value={form.status || ''}
                                            onChange={(e) => {
                                                e.stopPropagation();  // Prevent card click
                                                handleStatusUpdate(formId, e.target.value);
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="found">Found</option>
                                            <option value="active">Active</option>
                                        </select>
                                        
                                        <button 
                                            className="delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();  // Prevent card click
                                                handleDeleteForm(formId);
                                            }}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results">
                        <FaSearch size={48} color="#cccccc" />
                        <p>No reports found</p>
                        <p>Try adjusting your search criteria or refresh the page</p>
                    </div>
                )}
            </div>
            
            {/* Form Detail Modal */}
            {selectedForm && (
                <div className="form-detail-modal" onClick={handleModalClick}>
                    <div className="form-detail-modal-content">
                        <button className="modal-close-button" onClick={closeFormDetail}>
                            <FaTimes />
                        </button>
                        
                        <div className="modal-header">
                            <h3>{getChildName(selectedForm)}</h3>
                            <span className={`status-badge status-${selectedForm.status}`}>
                                {selectedForm.status || 'Unknown'}
                            </span>
                        </div>
                        
                        <div className="modal-content">
                            {/* Image Section */}
                            {(selectedForm.imageUrl || selectedForm.photoUrl) && (
                                <div className="modal-image-container">
                                    <img 
                                        src={selectedForm.photoUrl || selectedForm.imageUrl} 
                                        alt={`Child ${getChildName(selectedForm)}`}
                                        className="modal-image"
                                    />
                                </div>
                            )}
                            
                            {/* Details Section */}
                            <div className="modal-details">
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Name</span>
                                    <div className="modal-detail-value">{getChildName(selectedForm)}</div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Age</span>
                                    <div className="modal-detail-value">{getChildAge(selectedForm)}</div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Gender</span>
                                    <div className="modal-detail-value">{getGender(selectedForm)}</div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Last Seen Location</span>
                                    <div className="modal-detail-value">{getLocation(selectedForm)}</div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Date Reported</span>
                                    <div className="modal-detail-value">
                                        {formatDate(selectedForm.created || selectedForm.createdAt || new Date())}
                                    </div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Last Seen Date</span>
                                    <div className="modal-detail-value">
                                        {selectedForm.lastSeenDate ? formatDate(selectedForm.lastSeenDate) : 'Unknown'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Contact Information */}
                            <div className="modal-contact-section">
                                <h4>Contact Information</h4>
                                <div className="modal-contact-details">
                                    <div className="modal-detail-section">
                                        <span className="modal-detail-label">Parent/Guardian Name</span>
                                        <div className="modal-detail-value">{getParentName(selectedForm)}</div>
                                    </div>
                                    
                                    <div className="modal-detail-section">
                                        <span className="modal-detail-label">Contact Phone</span>
                                        <div className="modal-detail-value">{selectedForm.contactPhone || selectedForm.phone || 'Not provided'}</div>
                                    </div>
                                    
                                    <div className="modal-detail-section">
                                        <span className="modal-detail-label">Contact Email</span>
                                        <div className="modal-detail-value">{selectedForm.contactEmail || selectedForm.email || 'Not provided'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Identification and Description Section */}
                            <div className="modal-id-section">
                                <h4>Identification & Description</h4>
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Identification Marks</span>
                                    <div className="modal-detail-value">{getIdentificationMarks(selectedForm)}</div>
                                </div>
                                
                                <div className="modal-detail-section">
                                    <span className="modal-detail-label">Description</span>
                                    <div className="modal-detail-value">{getDescription(selectedForm)}</div>
                                </div>
                                
                                {/* Additional Info */}
                                {selectedForm.additionalInfo && (
                                    <div className="modal-detail-section">
                                        <span className="modal-detail-label">Additional Information</span>
                                        <div className="modal-detail-value">{selectedForm.additionalInfo}</div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Responses Section */}
                            {selectedForm.responses && selectedForm.responses.length > 0 && (
                                <div className="modal-response-section">
                                    <h4>
                                        Responses 
                                        <span className="response-count">{selectedForm.responses.length}</span>
                                    </h4>
                                    <ul className="responses-list">
                                        {selectedForm.responses.map((response, index) => (
                                            <li key={`${selectedForm._id || selectedForm.id}-response-${index}`} className="response-item">
                                                <div className="response-header">
                                                    <span className="responder-name">{response.name}</span>
                                                    <span className="response-date">{formatDate(response.date)}</span>
                                                    
                                                    {/* Only show delete button for parent users */}
                                                    {userType === 'parent' && (
                                                        <button 
                                                            className="delete-response-button"
                                                            onClick={() => handleDeleteResponse(selectedForm._id || selectedForm.id, index)}
                                                            title="Delete Response"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                        </div>
                                                <p className="response-message">{response.message}</p>
                                                {response.contact && (
                                                    <p className="response-contact">
                                                        <span className="contact-label">Contact: </span>
                                                        {response.contact}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {userType === 'parent' ? (
                            <div className="modal-actions">
                                <select 
                                    className="status-dropdown"
                                    value={selectedForm.status || ''}
                                    onChange={(e) => handleStatusUpdate(selectedForm._id || selectedForm.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="found">Found</option>
                                    <option value="active">Active</option>
                                </select>
                                
                                <button 
                                    className="delete-button"
                                    onClick={() => {
                                        handleDeleteForm(selectedForm._id || selectedForm.id);
                                        closeFormDetail();
                                    }}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewAllForms;
