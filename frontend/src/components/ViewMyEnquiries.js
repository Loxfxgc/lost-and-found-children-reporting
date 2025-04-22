import React, { useState, useEffect, useCallback } from 'react';
import { useUserType } from './UserTypeContext';
import './Forms.css';

const ViewMyEnquiries = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useUserType();

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
        alert('Child marked as found successfully!');
        fetchForms();
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

    useEffect(() => {
        fetchForms();
    }, [currentUser, fetchForms]);

    return (
        <div className="forms-container">
            <h1>My Submitted Forms</h1>
            
            {loading ? (
                <div className="loading-spinner">Loading...</div>
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
                                {form.status === 'pending' && (
                                    <button 
                                        className="found-btn"
                                        onClick={() => handleMarkFound(form.id)}
                                    >
                                        Mark as Found
                                    </button>
                                )}
                                {form.photoPreview && (
                                    <img 
                                        src={form.photoPreview} 
                                        alt="Child" 
                                        className="form-photo-preview"
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

export default ViewMyEnquiries;
