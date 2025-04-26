import React, { useState, useEffect } from 'react';
import { formService } from '../services/api';
import { FaSave, FaTimes } from 'react-icons/fa';
import './Forms.css';

const EditFormModal = ({ form, onClose, onSuccess }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (form) {
            // Initialize form data with the provided form values
            setFormData({
                childName: form.childName || '',
                childAge: form.childAge || '',
                childGender: form.childGender || 'male',
                lastSeenDate: form.lastSeenDate ? new Date(form.lastSeenDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                lastSeenLocation: form.lastSeenLocation || '',
                description: form.description || '',
                contactName: form.contactName || '',
                contactPhone: form.contactPhone || '',
                contactEmail: form.contactEmail || '',
                additionalDetails: form.additionalDetails || '',
                identifyingFeatures: form.identifyingFeatures || '',
                status: form.status || 'active'
            });
        }
    }, [form]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validate form
            if (!formData.childName || !formData.childAge || !formData.lastSeenLocation) {
                throw new Error('Please fill in all required fields: Name, Age, and Last Seen Location');
            }

            // Prepare form data for submission to database
            const updatedFormData = {
                ...formData,
                updatedAt: new Date().toISOString()
            };

            // Don't update the photo information
            delete updatedFormData.photoUrl;
            delete updatedFormData.photoId;
            delete updatedFormData.childImageId;
            
            // Keep the original reporter ID
            delete updatedFormData.reporterUid;

            // Submit form to database
            console.log('Updating form in database:', updatedFormData);
            const formId = form._id || form.id;
            const response = await formService.updateForm(formId, updatedFormData);
            console.log('Form update response:', response);

            // Call success callback
            if (onSuccess) {
                onSuccess(response.data || response);
            }
            
            // Close modal
            onClose();
        } catch (err) {
            console.error('Error updating form:', err);
            setError(err.message || 'Failed to update form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-detail-modal">
            <div className="form-detail-modal-content">
                <div className="modal-header">
                    <h3>Edit Report</h3>
                    <button className="modal-close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="edit-form-container">
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
                                className="form-input"
                                placeholder="Enter child's full name"
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
                                    className="form-input"
                                    placeholder="Age in years"
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
                                className="form-input"
                                placeholder="Where was the child last seen? (City, Area, Landmark, etc.)"
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
                                rows="4"
                                className="form-textarea"
                                placeholder="Please provide details such as what the child was wearing, distinguishing features, circumstances of disappearance, etc."
                            />
                            <p className="field-help">Include details about clothing, appearance, and other helpful information.</p>
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="identifyingFeatures">Identifying Features</label>
                            <textarea
                                id="identifyingFeatures"
                                name="identifyingFeatures"
                                value={formData.identifyingFeatures}
                                onChange={handleInputChange}
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
                                className="form-input"
                            />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">Report Status</h3>
                        
                        <div className="form-field">
                            <label htmlFor="status">Current Status <span className="required">*</span></label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                                className="form-input"
                            >
                                <option value="active">Active - Child is still missing</option>
                                <option value="investigating">Investigating - Following leads</option>
                                <option value="found">Found - Child has been located</option>
                                <option value="closed">Closed - Search ended</option>
                            </select>
                            <p className="field-help">
                                This status will be visible to searchers. Update it when the situation changes.
                            </p>
                        </div>
                        
                        <div className="form-field">
                            <label htmlFor="additionalDetails">Additional Details</label>
                            <textarea
                                id="additionalDetails"
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleInputChange}
                                rows="3"
                                className="form-textarea"
                            />
                        </div>
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <FaTimes /> Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            <FaSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFormModal; 