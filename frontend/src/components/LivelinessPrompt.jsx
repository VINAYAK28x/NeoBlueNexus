import React from 'react';
import triangleImage from './triangle.svg'; // Import the triangle image
import { useNavigate } from 'react-router-dom';

const LivelinessPrompt = () => {
    const navigate = useNavigate();

    const handleStartTest = () => {
        navigate('/existing-livetest');
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>NEOBLUE NEXUS</h2>
            </div>
            {/* Main Content with two panels */}
            <div style={styles.contentArea}>
                <div style={styles.leftPanel}>
            <div style={styles.content}>
                <p style={styles.message}>
                            Kindly proceed to liveliness test for user authentication
                </p>
                <button style={styles.button} onClick={handleStartTest}>Liveliness Test</button>
                    </div>
                </div>
                <div style={styles.rightPanel}>
                    {/* This panel is intentionally empty for layout and background color */}
                    <img src={triangleImage} alt="Triangle Design" style={styles.triangleImage} /> {/* Add triangle image */}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'sans-serif',
        minHeight: '100vh',
        width:'100vw',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#028bd3',
        color: 'white',
        padding: '10px 20px',
        width: '100%',
    },
    logo: {
        width: '30px',
        height: '30px',
        marginRight: '10px',
    },
    title: {
        fontSize: '18px',
        margin: 0,
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        width: '100%',
    },
    leftPanel: {
        flex: '0 0 40%',
        minWidth: 0,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    rightPanel: {
        flex: '0 0 60%',
        minWidth: 0,
        backgroundColor: 'white',
        position: 'relative', // Make relative for absolute positioning of triangle
    },
    content: {
        marginTop: '0px', // Adjusted for new layout
        textAlign: 'center',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
    },
    message: {
        color: 'red',
        fontSize: '18px',
        marginBottom: '40px',
    },
    button: {
        padding: '10px 30px',
        fontSize: '16px',
        backgroundColor: '#3b83f6',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
    },
    triangleImage: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: 'auto',
        height: '90%',
    },
};

export default LivelinessPrompt;