import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import './Forms.css';

const ViewResponses = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

import { ref, onValue } from 'firebase/database';
import { database } from './firebase';

    useEffect(() => {
        const responsesRef = ref(database, 'responses');
        onValue(responsesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedResponses = data ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })) : [];
            setResponses(loadedResponses);
            setLoading(false);
        });
        
        return () => {
            // Cleanup listener when component unmounts
            onValue(responsesRef, () => {});
        };
    }, []);

    if (loading) return <div className="form-container">Loading...</div>;

    return (
        <div className="form-container">
            <h2>All Missing Child Reports</h2>
            <div className="responses-list">
                {responses.map((response) => (
                    <div key={response._id} className="response-card">
                        <h3>{response.responses.name}</h3>
                        <p>Age: {response.responses.age}</p>
                        <p>Last Seen: {response.responses.location}</p>
                        <p>Description: {response.responses.description}</p>
                        <p>Reported on: {new Date(response.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewResponses;
