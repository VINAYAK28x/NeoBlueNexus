import React, { useEffect, useState } from 'react';

import triangleImage from './triangle.svg'; // Make sure this is in the same directory
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';

const CustomerReviewPage = () => {
    const navigate = useNavigate();
    const { customerDetails } = useCustomer();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            try {
                if (!customerDetails._id) {
                    setError('No customer ID found');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5000/api/customer/${customerDetails._id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch customer details');
                }

                const data = await response.json();
                setCustomer(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [customerDetails._id]);

    const handlebte = () => {
navigate('/custdetails');
};

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NEOBLUE NEXUS</h2>
</div>
{/* Body */}
<div style={styles.body}>
{/* Left with Triangle Image */}
<div style={styles.leftPanel}>
<img src={triangleImage} alt="Triangle Design" style={styles.triangleImage} />
</div>
{/* Right Form Info */}
<div style={styles.rightPanel}>
<div style={styles.contentWrapper}>
<h2 style={styles.heading}>THE FOLLOWING DETAILS<br />HAVE BEEN ENTERED</h2>
<div style={styles.previewSection}>
<div style={styles.previewBox}>
                                {customer?.aadharImagePath ? (
                                    <img 
                                        src={`http://localhost:5000/${customer.aadharImagePath}`}
                                        alt="Aadhar Document"
                                        style={styles.uploadedImage}
                                    />
                                ) : (
<div style={styles.imagePlaceholder}></div>
                                )}
<p style={styles.previewLabel}>AADHAR</p>
</div>
<div style={styles.previewBox}>
                                {customer?.doc2ImagePath ? (
                                    <img 
                                        src={`http://localhost:5000/${customer.doc2ImagePath}`}
                                        alt="Doc2 Document"
                                        style={styles.uploadedImage}
                                    />
                                ) : (
<div style={styles.imagePlaceholder}></div>
                                )}
<p style={styles.previewLabel}>DOC#2</p>
</div>
</div>
<div style={styles.details}>
                            <p><strong>CUSTOMER NAME:</strong> {customer?.name || 'N/A'}</p>
                            <p><strong>AADHAR NUMBER:</strong> {customer?.aadharNumber || 'N/A'}</p>
                            <p><strong>DATE OF BIRTH:</strong> {customer?.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>DL/OTHER:</strong> {customer?.drivingLicense || 'N/A'}</p>
                        </div>
                        {customer?.livelinessTestCompleted && (
                            <div style={styles.livelinessResults}>
                                <h3 style={styles.subheading}>Liveliness Test Results</h3>
                                <p><strong>Test Date:</strong> {new Date(customer.livelinessTestDate).toLocaleString()}</p>
                                <p><strong>Liveness Detected:</strong> {customer.livelinessResult.isLive ? '✅' : '❌'}</p>
                                <p><strong>Aadhar Match:</strong> {customer.livelinessResult.aadharMatch ? '✅' : '❌'}</p>
                                <p><strong>Doc2 Match:</strong> {customer.livelinessResult.doc2Match ? '✅' : '❌'}</p>
                                <p style={styles.stylizedText}>jab zindagi badalni ho</p>
                            </div>
                        )}
<button style={styles.button} onClick={handlebte}>Back to Entry</button>
</div>
</div>
</div>
</div>
);
};

const styles = {
container: {
fontFamily: 'sans-serif',
height: '100vh',
display: 'flex',
flexDirection: 'column',
},
header: {
display: 'flex',
alignItems: 'center',
backgroundColor: '#4A90E2',
padding: '10px 20px',
color: 'white',
height: '60px',
flexShrink: 0,
},
logo: {
width: '40px',
height: '40px',
marginRight: '10px',
},
title: {//neoblue nexus//
fontSize: '30px',
margin: 0,
},
body: {
display: 'flex',
flex: 1,
overflow: 'hidden',
},
leftPanel: {
width: '40%',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'white',
},
triangleImage: {
width: '90%',
height: 'auto',
},
rightPanel: {
width: '60%',
        padding: '30px 30px',
backgroundColor: '#f9f9f9',
display: 'flex',
alignItems: 'center',
},
contentWrapper: {
        width: '90%',
},
heading: {
        fontSize: '24px',
fontWeight: 'bold',
        marginBottom: '15px',
        color: '#021526',
},
previewSection: {
display: 'flex',
        gap: '30px',
        marginBottom: '15px',
        justifyContent: 'flex-start',
},
previewBox: {
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
width: '120px',
},
imagePlaceholder: {
width: '100%',
height: '100px',
        backgroundColor: '#e0e0e0',
borderRadius: '8px',
marginBottom: '8px',
},
previewLabel: {
fontWeight: 'bold',
fontSize: '14px',
textAlign: 'center',
        color: '#021526',
},
details: {
lineHeight: '1.8',
marginBottom: '20px',
        color: '#021526',
        fontSize: '15px',
},
button: {
backgroundColor: '#4A90E2',
color: 'white',
padding: '10px 30px',
border: 'none',
borderRadius: '20px',
fontSize: '16px',
cursor: 'pointer',
},
    uploadedImage: {
        width: '100%',
        height: '100px',
        objectFit: 'contain',
        borderRadius: '8px',
        marginBottom: '8px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    error: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: 'red',
        fontWeight: 'bold',
    },
    livelinessResults: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#021526',
    },
    subheading: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#021526',
    },
    stylizedText: {
        color: '#123C62', // The blue color from the triangle.svg
        fontFamily: 'cursive', // A curvy beautiful font
        fontSize: '24px', // Adjust size as needed
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: '20px',
    },
};

export default CustomerReviewPage;