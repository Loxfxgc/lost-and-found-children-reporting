import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { imageService } from '../services/api';
import './Forms.css';

const ViewAllForms = () => {
    const [forms, setForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const filter = location.state?.filter || '';

    useEffect(() => {
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        setForms(storedForms);
        setLoading(false);
    }, []);

    useEffect(() => {
        let result = forms;
        if (filter) {
            result = result.filter(form => form.status === filter);
        }
        if (searchTerm) {
            result = result.filter(form => 
                form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredForms(result);
    }, [forms, filter, searchTerm]);
    
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

    return (
        <div className="forms-container">
            <h1>{filter === 'pending' ? 'Pending Forms' : 'All Forms'}</h1>
            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <div className="forms-list">
                    {filteredForms.map(form => (
                        <div key={form.id} className="form-card">
                            <h3>{form.name}, {form.age}</h3>
                            <p>Last seen: {form.location} on {new Date(form.lastSeenDate).toLocaleDateString()}</p>
                            <p>Status: <span className={`status-${form.status}`}>{form.status}</span></p>
                            {(form.photoPreview || form.photoUrl || form.photoId) && (
                                <img 
                                    src={getImageUrl(form)} 
                                    alt="Child" 
                                    className="form-photo-preview"
                                    onError={(e) => {
                                        // Fall back to photoPreview if Cloudinary URL fails
                                        if (form.photoPreview) {
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
        </div>
    );
};

export default ViewAllForms;
