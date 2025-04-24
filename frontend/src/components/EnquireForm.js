import React, { useState } from 'react';
import { imageService } from '../services/api';
import './Forms.css';

const EnquireForm = () => {
    const [childName, setChildName] = useState('');
    const [location, setLocation] = useState('');
    const [age, setAge] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Search localStorage for matching forms
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        const results = storedForms.filter(form => {
            const nameMatch = childName && form.name.toLowerCase().includes(childName.toLowerCase());
            const ageMatch = age && form.age.toString() === age;
            const locationMatch = location && form.location.toLowerCase().includes(location.toLowerCase());
            
            return (!childName || nameMatch) && 
                   (!age || ageMatch) && 
                   (!location || locationMatch);
        });
        
        setSearchResults(results);
    };

    // Helper function to get the best available image URL
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
        <div className="content-container">
            <h2 className="page-title">Search Missing Child Report</h2>
            <div className="form-wrapper">
                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="submit-button">Search</button>
                </form>

                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Search Results ({searchResults.length})</h3>
                        {searchResults.map(form => (
                            <div key={form.id} className="result-card">
                                <h4>{form.name}, {form.age}</h4>
                                <p>Last seen: {form.location} on {new Date(form.lastSeenDate).toLocaleDateString()}</p>
                                <p>Status: <span className={`status-${form.status}`}>{form.status}</span></p>
                                {(form.photoPreview || form.photoUrl || form.photoId) && (
                                    <img 
                                        src={getImageUrl(form)} 
                                        alt="Child" 
                                        className="result-photo"
                                        onError={(e) => {
                                            // Fall back to photoPreview if Cloudinary URL fails
                                            e.target.src = form.photoPreview || '';
                                        }} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnquireForm;
