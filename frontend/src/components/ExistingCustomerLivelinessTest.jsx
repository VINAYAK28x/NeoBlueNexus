import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import triangleImage from './triangle.svg'; // Import the triangle image
import { useNavigate } from 'react-router-dom';

const ExistingCustomerLivelinessTest = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('Click Start to begin liveliness test');
    const [testComplete, setTestComplete] = useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const navigate = useNavigate();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            setIsRecording(true);
            setMessage('Please blink once to verify liveliness...');
        } catch (err) {
            setMessage('Error accessing camera: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const handleTestComplete = async () => {
        try {
            // Get the video frame
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Convert to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const formData = new FormData();
            formData.append('image', blob, 'liveliness.jpg');

            // Send to backend for verification
            const response = await axios.post('http://localhost:5000/api/customer/verify-existing', formData);
            
            if (response.data.match) {
                // Navigate to existing customer page with customer details
                navigate('/ecp', { state: { customer: response.data.customer } });
            } else {
                setMessage('Face verification failed. Please try again.');
            }
        } catch (error) {
            setMessage('Error during verification: ' + error.message);
        }
    };

    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>NEOBLUE NEXUS</h2>
            </div>
            
            <div style={styles.contentArea}>
                <div style={styles.leftPanel}>
                    <div style={styles.content}>
                        <div style={styles.videoContainer}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={styles.video}
                            />
                        </div>

                        <div style={styles.controls}>
                            {!isRecording ? (
                                <button 
                                    onClick={startRecording}
                                    style={styles.button}
                                >
                                    Start Test
                                </button>
                            ) : (
                                <button 
                                    onClick={handleTestComplete}
                                    style={styles.button}
                                >
                                    Complete Test
                                </button>
                            )}
                        </div>

                        <p style={styles.message}>{message}</p>

                        {testComplete && customerDetails && (
                            <div style={styles.details}>
                                <h3>Customer Details</h3>
                                <p>Name: {customerDetails.name}</p>
                                <p>Aadhar: {customerDetails.aadharNumber}</p>
                                <p>DOB: {customerDetails.dob}</p>
                                <button 
                                    onClick={() => navigate('/docdisplay')}
                                    style={styles.button}
                                >
                                    View Documents
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div style={styles.rightPanel}>
                    {/* This panel is intentionally empty for layout and background color */}
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
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    videoContainer: {
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto 20px',
        backgroundColor: '#000',
        borderRadius: '10px',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: 'auto',
    },
    controls: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    button: {
        padding: '12px 30px',
        backgroundColor: '#028bd3',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    message: {
        textAlign: 'center',
        fontSize: '18px',
        marginBottom: '20px',
        color: '#333',
    },
    details: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        textAlign: 'center',
    },
    triangleImage: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: 'auto',
        height: '90%',
    },
};

export default ExistingCustomerLivelinessTest; 