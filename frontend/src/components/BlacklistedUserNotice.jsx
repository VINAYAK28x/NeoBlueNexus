import { useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import axios from 'axios';

const BlacklistedUserNotice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { existingCustomer, currentCustomer, similarity } = location.state || {};

    const handleBlacklist = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/customer/blacklist-user', {
                customerId: existingCustomer._id
            });

            if (response.data.success) {
                alert('User has been blacklisted successfully');
                navigate('/home');
            }
        } catch (error) {
            console.error('Error blacklisting user:', error);
            alert('Error blacklisting user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleGoBack = () => {
        navigate('/home');
    };

return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NEOBLUE NEXUS</h2>
</div>
{/* Notification Box */}
<div style={styles.centerBox}>
<div style={styles.messageBox}>
                    <h3 style={styles.warningTitle}>Facial Identity Mismatch Detected</h3>
                    <div style={styles.similarityBox}>
                        <p style={styles.similarityText}>
                            Facial Similarity Score: {(similarity * 100).toFixed(2)}%
                        </p>
                    </div>
                    <div style={styles.userDetails}>
                        <h4>Existing User Details:</h4>
                        <p><strong>Name:</strong> {existingCustomer?.name}</p>
                        <p><strong>Aadhar Number:</strong> {existingCustomer?.aadharNumber}</p>
                        <p><strong>Date of Birth:</strong> {new Date(existingCustomer?.dob).toLocaleDateString()}</p>
                    </div>
                    <div style={styles.userDetails}>
                        <h4>Current User Details:</h4>
                        <p><strong>Name:</strong> {currentCustomer?.name}</p>
                        <p><strong>Aadhar Number:</strong> {currentCustomer?.aadharNumber}</p>
                        <p><strong>Date of Birth:</strong> {new Date(currentCustomer?.dob).toLocaleDateString()}</p>
                    </div>
<p style={styles.messageText}>
                        A facial recognition match has been detected with an existing user, but with different personal details.
                        This may indicate a potential identity fraud attempt.
                        Kindly verify the same and report to higher authorities and the appropriate bureau.
</p>
</div>
                <div style={styles.buttonGroup}>
                    <button style={styles.blacklistButton} onClick={handleBlacklist}>
                        Blacklist User
                    </button>
                    <button style={styles.goBackButton} onClick={handleGoBack}>
                        Go Back to Home
                    </button>
                </div>
</div>
</div>
);
};

const styles = {
container: {
fontFamily: 'sans-serif',
height: '100vh',
backgroundColor: '#fff',
overflow: 'hidden',
},
header: {
display: 'flex',
alignItems: 'center',
backgroundColor: '#3391ff',
color: 'white',
padding: '10px 20px',
},
logo: {
width: '30px',
height: '30px',
marginRight: '10px',
},
title: {
fontSize: '18px',
},
centerBox: {
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
        marginTop: '50px',
        padding: '0 20px',
},
messageBox: {
backgroundColor: '#d6ecff',
borderRadius: '15px',
padding: '25px 30px',
        maxWidth: '800px',
        width: '100%',
textAlign: 'center',
        marginBottom: '30px',
    },
    warningTitle: {
        color: '#e53935',
        fontSize: '24px',
        marginBottom: '20px',
    },
    userDetails: {
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'left',
},
messageText: {
        color: '#e53935',
fontSize: '18px',
lineHeight: '1.6',
        marginTop: '20px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '20px',
    },
    blacklistButton: {
        padding: '12px 30px',
        fontSize: '16px',
        backgroundColor: '#e53935',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
},
goBackButton: {
        padding: '12px 30px',
fontSize: '16px',
backgroundColor: '#3b83f6',
color: 'white',
border: 'none',
borderRadius: '25px',
cursor: 'pointer',
},
    similarityBox: {
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ffeeba',
    },
    similarityText: {
        color: '#856404',
        fontSize: '18px',
        fontWeight: 'bold',
        margin: 0,
        textAlign: 'center',
    },
};

export default BlacklistedUserNotice;