import { useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import triangleImage from './triangle.svg'; // Make sure this is in the same directory

const ExistingCustomerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const customer = location.state?.customer;

    const handleStartTest = () => {
        navigate('/existing-livetest');
    };

    if (!customer) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>NEOBLUE NEXUS</h2>
                </div>
                <div style={styles.content}>
                    <p style={styles.errorMessage}>No customer data found. Please complete the liveliness test first.</p>
                    <button 
                        onClick={handleStartTest}
                        style={styles.button}
                    >
                        Start Liveliness Test
                    </button>
                </div>
            </div>
        );
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
                        <h2 style={styles.heading}>EXISTING CUSTOMER<br />DETAILS</h2>
                        <div style={styles.details}>
                            <p><strong>CUSTOMER NAME:</strong> {customer.name}</p>
                            <p><strong>AADHAR NUMBER:</strong> {customer.aadharNumber}</p>
                            <p><strong>DATE OF BIRTH:</strong> {customer.dob}</p>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button 
                                onClick={() => navigate('/docdisplay')}
                                style={styles.button}
                            >
                                View Documents
                            </button>
                            <button 
                                onClick={() => navigate('/home')}
                                style={{...styles.button, backgroundColor: '#666'}}
                            >
                                Back to Home
                            </button>
                        </div>
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
    title: {
        fontSize: '20px',
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
        padding: '30px 40px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
    },
    contentWrapper: {
        width: '100%',
    },
    heading: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#001f3f',
    },
    details: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        color: '#001f3f',
    },
    buttonGroup: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#001f3f',
        color: 'white',
        padding: '12px 30px',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 60px)',
    },
    errorMessage: {
        color: '#001f3f',
        fontSize: '18px',
        marginBottom: '20px',
    },
};

export default ExistingCustomerPage;