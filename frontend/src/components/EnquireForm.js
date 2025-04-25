import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import './Forms.css';
import { formService, imageService, setupStorageListener, startFormPolling, stopFormPolling } from '../services/api';

const EnquireForm = () => {
    const [childName, setChildName] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingImage, setLoadingImage] = useState({});
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch all pending forms when component mounts
    useEffect(() => {
        fetchAllFormsForSeekers();
    }, []);

    // Add real-time update feature
    useEffect(() => {
        console.log('Setting up real-time updates in EnquireForm');
        
        // Set up listener for database changes
        setupStorageListener();
        
        // Start polling for updates every 10 seconds
        const stopPolling = startFormPolling(10000);
        
        // Event handler for form updates
        const handleFormsUpdated = (event) => {
            console.log('Forms updated event received:', event.detail);
            // Refresh the forms data
            fetchAllFormsForSeekers();
        };
        
        // Listen for custom formsUpdated event
        window.addEventListener('formsUpdated', handleFormsUpdated);
        
        // Cleanup function
        return () => {
            window.removeEventListener('formsUpdated', handleFormsUpdated);
            if (typeof stopPolling === 'function') {
                stopPolling(); // Stop the polling when component unmounts
            }
            stopFormPolling(); // Ensure polling is stopped
        };
    }, []);

    const fetchAllFormsForSeekers = async () => {
        setLoading(true);
        try {
            console.log('Fetching all forms for seekers to view');
            // Fetch forms from database
            const response = await formService.getAllForms();
            console.log('API response for all forms:', response);
            
            // Handle both array and object responses
            const allForms = Array.isArray(response) ? response : (response?.data?.data || response?.data || response || []);
            
            // Filter to only show active forms
            const activeForms = allForms.filter(form => form.status === 'pending' || form.status === 'active');
            console.log('Active forms from database:', activeForms);
            
            if (!activeForms || activeForms.length === 0) {
                console.warn('No active forms found in the database response');
                setSearchResults([]);
                setError('No missing children reports available in the database.');
                setLoading(false);
                return;
            }
            
            // Sort by most recent first
            const sortedForms = [...activeForms].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
                return dateB - dateA;
            });
            
            console.log('Sorted forms to display:', sortedForms);
            setSearchResults(sortedForms);
            
            // Reset loading states for image loading
            const newLoadingStates = {};
            sortedForms.forEach(form => {
                newLoadingStates[form._id || form.id] = true;
            });
            
            setLoadingImage(newLoadingStates);
            setError(null);
        } catch (err) {
            console.error('Error fetching forms for seekers:', err);
            setError('Failed to load reports. Please try again later.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        
        try {
            // Search from database
            const searchParams = {
                name: childName || undefined,
                age: age || undefined,
                location: location || undefined
            };
            
            const results = await formService.searchForms(searchParams);
            
            // Sort by most recent first
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('Search results from database:', results);
            setSearchResults(results);
            
            // Reset loading states for image loading
            const newLoadingStates = {};
            results.forEach(form => {
                newLoadingStates[form._id || form.id] = true;
            });
            setLoadingImage(newLoadingStates);
            setError(null);
        } catch (err) {
            console.error('Error searching forms:', err);
            setError('Failed to search forms. Please try again later.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setChildName('');
        setLocation('');
        setAge('');
        setHasSearched(false);
        fetchAllFormsForSeekers();
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

    // Helper function to get the best available image URL
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
        // No fallback - if no image in database, nothing to show
        return null;
    };
    
    const handleImageLoad = (formId) => {
        setLoadingImage(prev => ({
            ...prev,
            [formId]: false
        }));
    };
    
    const handleImageError = (e, form) => {
        if (!form || (!form._id && !form.id)) {
            console.error('Image load error: Invalid form data');
            if (e && e.target) {
                e.target.style.display = 'none';
            }
            return;
        }
        
        console.error('Image load error for form:', form._id || form.id);
        // Hide the image if Cloudinary URL fails
        if (e && e.target) {
            e.target.style.display = 'none';
        }
        
        setLoadingImage(prev => ({
            ...prev,
            [form._id || form.id]: false
        }));
    };

    return (
        <div className="content-container">
            <h2 className="page-title">Search Missing Child Reports</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="search-container">
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="search-row">
                        <div className="form-group">
                            <label htmlFor="childName">Child's Name:</label>
                            <input
                                type="text"
                                id="childName"
                                value={childName}
                                onChange={(e) => setChildName(e.target.value)}
                                placeholder="Enter child's name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="age">Age:</label>
                            <input
                                type="number"
                                id="age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Enter age"
                                min="0"
                                max="18"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Last Seen Location:</label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter last seen location"
                            />
                        </div>
                    </div>
                    
                    <div className="search-buttons">
                        <button type="submit" className="submit-button">Search</button>
                        {hasSearched && (
                            <button type="button" className="reset-button" onClick={handleReset}>
                                Reset Search
                            </button>
                        )}
                    </div>
                </form>

                <div className="search-results-container">
                    {loading ? (
                        <div className="loading-spinner">Loading reports...</div>
                    ) : searchResults.length === 0 ? (
                        <div className="no-results">
                            <p>{hasSearched ? 'No matching reports found.' : 'No missing children reports available.'}</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="results-title">
                                {hasSearched ? `Search Results (${searchResults.length})` : `Current Missing Children (${searchResults.length})`}
                            </h3>
                            <div className="vertical-results">
                                {searchResults.map(form => (
                                    <div key={form._id || form.id} className="result-card">
                                        <div className="result-content">
                                            <div className="result-details">
                                                <h4>{getName(form)}, {getAge(form)}</h4>
                                                <p><strong>Description:</strong> {getDescription(form)}</p>
                                                <p><strong>Last seen:</strong> {getLocation(form)} on {new Date(getLastSeenDate(form)).toLocaleDateString()}</p>
                                                <p><strong>Contact Info:</strong> {getContactInfo(form)}</p>
                                                <p><strong>Status:</strong> <span className={`status-${form.status}`}>{form.status}</span></p>
                                            </div>
                                            {(form.photoUrl || form.childImageId || form.photoId) && (
                                                <div className="result-image-container">
                                                    {loadingImage[form._id || form.id] && <div className="image-loading">Loading image...</div>}
                                                    <img 
                                                        src={getImageUrl(form)} 
                                                        alt="Child" 
                                                        className="result-photo"
                                                        onLoad={() => handleImageLoad(form._id || form.id)}
                                                        onError={(e) => handleImageError(e, form)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnquireForm;
