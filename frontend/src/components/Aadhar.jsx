import AadharUploader from './AadharUploader';
import React from 'react';
import triangleImage from './triangle.svg';
import { useNavigate } from 'react-router-dom';

const AadharUpload = () => {
    const navigate = useNavigate();
    
    const handleSuccess = () => {
        console.log('handleSuccess called, navigating to /doc2');
        try {
            navigate('/doc');
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>NEOBLUE NEXUS</h2>
            </div>
            <div style={styles.contentArea}>
                <div style={styles.leftPanel}>
                <div style={styles.card}>
                    <h2 style={styles.heading}>UPLOAD AADHAAR FOR VERIFICATION</h2>
                    <AadharUploader onSuccess={handleSuccess} />
                    </div>
                </div>
                <div style={styles.rightPanel}>
                    <img src={triangleImage} alt="Triangle Design" style={styles.triangleImage} />
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
        backgroundColor: '#4A90E2',
        padding: '10px 20px',
        color: 'white',
        width: '100%',
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
        position: 'relative',
    },
    uploadSection: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 20px',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
    },
    heading: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#333',
    },
    triangleImage: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: 'auto',
        height: '90%',
    },
};

export default AadharUpload;