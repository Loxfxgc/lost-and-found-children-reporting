import React, { useState, useEffect } from 'react';
import './Forms.css';
import { FaSearch, FaRedo, FaTrash, FaThList, FaTh } from 'react-icons/fa';
import { formService } from '../services/api';
import { useUserType } from '../UserTypeContext';

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

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Fetch forms on component mount
    useEffect(() => {
        fetchForms();
    }, []);

    // Fetch all forms from database
    const fetchForms = async () => {
        try {
            setActionStatus({ message: 'Loading forms...', type: 'info' });
            
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
            setActionStatus({ 
                message: `${formsWithDates.length} forms loaded successfully.`, 
                type: 'success' 
            });
            
            // Clear message after 3 seconds
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
            
        } catch (error) {
            console.error('Error fetching forms from database:', error);
            setError('Failed to load forms from database. Please try again.');
            setActionStatus({ message: 'Error loading forms.', type: 'error' });
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
                    form.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    form.lastSeenLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            setActionStatus({ message: 'Updating status...', type: 'info' });
            
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
            setActionStatus({ message: 'Status updated successfully.', type: 'success' });
            
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error updating status in database:', error);
            setActionStatus({ message: 'Error updating status.', type: 'error' });
        }
    };

    // Handle deleting a form
    const handleDeleteForm = async (id) => {
        // Only allow parents to delete reports
        if (userType !== 'parent') {
            setActionStatus({ 
                message: 'Only parents can delete reports.', 
                type: 'error' 
            });
            
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
            return;
        }

        try {
            if (window.confirm('Are you sure you want to delete this report?')) {
                setActionStatus({ message: 'Deleting report...', type: 'info' });
                
                // Delete from database via API
                await formService.deleteForm(id);
                
                // Update local state after successful deletion
                const updatedForms = forms.filter(form => (form._id || form.id) !== id);
                setForms(updatedForms);
                
                setActionStatus({ message: 'Report deleted successfully.', type: 'success' });
                
                setTimeout(() => {
                    setActionStatus({ message: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Error deleting form from database:', error);
            setActionStatus({ message: 'Error deleting report.', type: 'error' });
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
        // Check for location object (with type and coordinates)
        if (form.location && typeof form.location === 'object' && form.location.type) {
            // Return a more readable format
            return "Location coordinates recorded";
        }
        
        return form.lastSeenLocation || form.location || 'Unknown location';
    };
    
    // Helper function to get contact information
    const getContact = (form) => {
        return form.contactInfo || form.contactPhone || form.contactEmail || 'Not provided';
    };
    
    // Helper function to get description
    const getDescription = (form) => {
        return form.description || 'No description provided';
    };

    // New function to handle response deletion
    const handleDeleteResponse = async (formId, responseIndex) => {
        // Only allow parents to delete responses
        if (userType !== 'parent') {
            setActionStatus({ 
                message: 'Only parents can delete responses.', 
                type: 'error' 
            });
            
            setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
            return;
        }

        try {
            if (window.confirm('Are you sure you want to delete this response?')) {
                setActionStatus({ message: 'Deleting response...', type: 'info' });
                
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
                
                setActionStatus({ message: 'Response deleted successfully.', type: 'success' });
                
                setTimeout(() => {
                    setActionStatus({ message: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Error deleting response:', error);
            setActionStatus({ message: 'Error deleting response.', type: 'error' });
        }
    };

    return (
        <div className="content-container">
            <h1 className="page-title">All Missing Children Reports</h1>
            
            {/* Action Status Message */}
            {actionStatus.message && (
                <div className={`action-message ${actionStatus.type}`}>
                    {actionStatus.message}
                </div>
            )}
            
            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Search and Filter Container */}
            <div className="filter-container">
                <div className="search-input">
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
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <FaTh className="grid-icon" />
                        </button>
                        <button 
                            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FaThList className="list-icon" />
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

            {/* Display Forms */}
            <div className={`forms-container ${viewMode}-view`}>
                {filteredForms.length > 0 ? (
                    filteredForms.map(form => (
                        <div key={form._id || form.id} className="form-card">
                            <div className="form-header">
                                <h3>{getChildName(form)}</h3>
                                <span className={`status-badge status-${form.status}`}>
                                    {form.status || 'Unknown'}
                                </span>
                            </div>
                            
                            <div className={`form-content ${viewMode === 'list' ? 'list-content' : ''}`}>
                                <div className="form-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Age:</span>
                                        <span className="detail-value">{getChildAge(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Gender:</span>
                                        <span className="detail-value">{getGender(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Last Seen:</span>
                                        <span className="detail-value">{getLocation(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Contact:</span>
                                        <span className="detail-value">{getContact(form)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Date Reported:</span>
                                        <span className="detail-value">{formatDate(form.created || form.createdAt || new Date())}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Description:</span>
                                        <p className="detail-value">{getDescription(form)}</p>
                                    </div>
                                </div>
                                
                                {(form.imageUrl || form.photoUrl) && (
                                    <div className="form-image">
                                        {loadingImages[form._id || form.id] && (
                                            <div className="image-loading">
                                                <div className="loading-spinner"></div>
                                                <span>Loading image...</span>
                                            </div>
                                        )}
                                        <img 
                                            src={form.photoUrl || form.imageUrl} 
                                            alt={`Child ${getChildName(form)}`} 
                                            onLoad={() => handleImageLoad(form._id || form.id)}
                                            onError={() => handleImageError(form._id || form.id)}
                                            onLoadStart={() => handleImageStart(form._id || form.id)}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Responses Section */}
                            {form.responses && form.responses.length > 0 && (
                                <div className="response-section">
                                    <h4>
                                        Responses 
                                        <span className="response-count">{form.responses.length}</span>
                                    </h4>
                                    <ul className="responses-list">
                                        {form.responses.map((response, index) => (
                                            <li key={`${form._id || form.id}-response-${index}`} className="response-item">
                                                <div className="response-header">
                                                    <span className="responder-name">{response.name}</span>
                                                    <span className="response-date">{formatDate(response.date)}</span>
                                                    
                                                    {/* Only show delete button for parent users */}
                                                    {userType === 'parent' && (
                                                        <button 
                                                            className="delete-response-button"
                                                            onClick={() => handleDeleteResponse(form._id || form.id, index)}
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
                            
                            <div className="form-actions">
                                <select 
                                    className="status-dropdown"
                                    value={form.status || ''}
                                    onChange={(e) => handleStatusUpdate(form._id || form.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="found">Found</option>
                                    <option value="active">Active</option>
                                </select>
                                
                                {/* Only show delete button for parent users */}
                                {userType === 'parent' && (
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDeleteForm(form._id || form.id)}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <FaSearch size={48} color="#cccccc" />
                        <p>No reports found</p>
                        <p>Try adjusting your search criteria or refresh the page</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewAllForms;
