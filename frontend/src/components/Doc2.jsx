import React, { useState } from 'react';

import triangleImage from './triangle.svg';
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';

const Doc2 = () => {
    const navigate = useNavigate();
    const { docFile, setDocFile, customerDetails, uploadDoc2Image, uploadStatus, error } = useCustomer();
    const [file, setFile] = useState(null);
    const [matchResult, setMatchResult] = useState(null);

    const handledoc = async () => {
        if (!file) {
            alert('Please upload the document image first');
            return;
        }
        if (!customerDetails._id) {
            alert('Customer not created. Please fill customer details first.');
            return;
        }
        try {
            const response = await uploadDoc2Image(customerDetails._id, file);
            setMatchResult(response.match);
            if (response.match) {
                alert('Success: Faces matched!');
                navigate('/livetest');
            } else {
                alert('Warning: Faces do not match!');
            }
        } catch (err) {
            alert(error || 'Error processing document image');
        }
    };

    const handleUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setDocFile(URL.createObjectURL(uploadedFile));
        }
    };

    const handleDelete = () => {
        setDocFile(null);
        setFile(null);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>NEOBLUE NEXUS</h2>
            </div>
            <div style={styles.contentArea}>
                <div style={styles.leftPanel}>
                <div style={styles.card}>
                    <h2 style={styles.heading}>UPLOAD DOCUMENT #2 FOR VERIFICATION</h2>
                    <div style={styles.previewBox}>
                        {docFile ? (
                            <img src={docFile} alt="Doc2 Preview" style={styles.previewImage} />
                        ) : (
                            <span style={styles.placeholderText}>No file uploaded</span>
                        )}
                    </div>
                    <div style={styles.buttonGroup}>
                        <label style={styles.uploadButton}>
                            Upload
                            <input type="file" style={styles.hiddenInput} onChange={handleUpload} />
                        </label>
                        <button style={styles.deleteButton} onClick={handleDelete}>Delete</button>
                    </div>
                    {error && <div style={{ color: '#dc3545', marginBottom: '10px' }}>{error}</div>}
                    {uploadStatus === 'uploading' && (
                        <div style={{ color: '#007bff', marginBottom: '10px' }}>Processing document image...</div>
                    )}
                    {matchResult !== null && (
                        <div style={{ color: matchResult ? 'green' : 'red', marginBottom: '10px' }}>
                            {matchResult ? 'Faces Matched!' : 'Faces Do Not Match!'}
                        </div>
                    )}
                    <button style={styles.proceedButton} onClick={handledoc} disabled={uploadStatus === 'uploading'}>
                        {uploadStatus === 'uploading' ? 'Processing...' : 'Proceed'}
                    </button>
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
backgroundColor: '#028bd3',
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
previewBox: {
width: '100%',
height: '250px',
border: '2px dashed #ccc',
borderRadius: '10px',
marginBottom: '20px',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#fafafa',
},
previewImage: {
height: '100%',
borderRadius: '10px',
objectFit: 'cover',
},
placeholderText: {
color: '#999',
},
buttonGroup: {
display: 'flex',
justifyContent: 'center',
gap: '20px',
marginBottom: '20px',
},
uploadButton: {
backgroundColor: '#28a745',
color: 'white',
padding: '10px 20px',
borderRadius: '20px',
cursor: 'pointer',
},
deleteButton: {
backgroundColor: '#dc3545',
color: 'white',
padding: '10px 20px',
borderRadius: '20px',
border: 'none',
cursor: 'pointer',
},
proceedButton: {
backgroundColor: '#007bff',
color: 'white',
padding: '10px 30px',
borderRadius: '20px',
border: 'none',
cursor: 'pointer',
fontSize: '16px',
},
hiddenInput: {
display: 'none',
},
    triangleImage: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: 'auto',
        height: '90%',
    },
};
export default Doc2;