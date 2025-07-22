import React, { useEffect, useRef, useState } from 'react';

import triangleImage from './triangle.svg'; // Import the triangle image
import { useCustomer } from '../CustomerContext'; // Import useCustomer
import { useNavigate } from 'react-router-dom';

const LivelinessTest = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [prompts, setPrompts] = useState('');
    const [videoBlob, setVideoBlob] = useState(null);
    const [result, setResult] = useState(null); // "success", "fail", or null
    const [livenessResult, setLivenessResult] = useState(null); // { isLive: bool, aadharMatch: bool, doc2Match: bool, message: string }
    const [error, setError] = useState('');
    const [detectionStatus, setDetectionStatus] = useState({
        blink: false,
        mouth: false,
        skin: false
    });
    const navigate = useNavigate();
    const { customerDetails } = useCustomer(); // Get customer details

    useEffect(() => {
        const loadCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('Camera access denied.');
            }
        };
        loadCamera();
    }, []);

    const startRecording = () => {
        setRecording(true);
        setResult(null);
        setLivenessResult(null); // Reset previous results
        const stream = videoRef.current.srcObject;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const videoFile = new Blob(chunks, { type: 'video/webm' });
            setVideoBlob(videoFile);
            uploadVideo(videoFile);
        };
        recorder.start();
        // Prompt sequencing
        setPrompts('👁️ Blink your eyes');
        setTimeout(() => setPrompts('↔️ Move face left & right'), 1500);
        setTimeout(() => setPrompts('👄 Move your mouth'), 3000);
        setTimeout(() => {
            setPrompts('⏳ Finishing...');
            recorder.stop();
            setRecording(false);
        }, 4000);
    };

    const uploadVideo = async (videoFile) => {
        if (!customerDetails._id) {
            setError('Customer ID not found. Please ensure customer details are filled.');
            setResult('fail');
            return;
        }

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('customerId', customerDetails._id);

        try {
            setError(null);
            const res = await fetch('http://localhost:5000/api/liveliness-test', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            console.log('Liveliness test response (raw data from backend):', data);
            console.log('Raw detectionDetails from backend:', data.detectionDetails);

            if (data.success) {
                setResult('success');
                setLivenessResult({
                    isLive: data.isLive,
                    aadharMatch: data.aadharMatch,
                    doc2Match: data.doc2Match,
                    message: data.message,
                    detectionDetails: data.detectionDetails
                });
                console.log('livenessResult state after success:', {
                    isLive: data.isLive,
                    aadharMatch: data.aadharMatch,
                    doc2Match: data.doc2Match,
                    message: data.message,
                    detectionDetails: data.detectionDetails
                });
                
                // Update detection status
                if (data.detectionDetails) {
                    setDetectionStatus({
                        blink: data.detectionDetails.blink_detected,
                        mouth: data.detectionDetails.mouth_movement,
                        skin: data.detectionDetails.skin_reflectance
                    });
                    console.log('detectionStatus state after success:', {
                        blink: data.detectionDetails.blink_detected,
                        mouth: data.detectionDetails.mouth_movement,
                        skin: data.detectionDetails.skin_reflectance
                    });
                }

                // Save the results to the database
                try {
                    console.log('Sending livelinessResult to backend:', {
                        customerId: customerDetails._id,
                        livelinessResult: {
                            isLive: data.isLive,
                            aadharMatch: data.aadharMatch,
                            doc2Match: data.doc2Match,
                            detectionDetails: data.detectionDetails
                        }
                    });
                    const saveResponse = await fetch('http://localhost:5000/api/customer/update-liveliness', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customerId: customerDetails._id,
                            livelinessResult: {
                                isLive: data.isLive,
                                aadharMatch: data.aadharMatch,
                                doc2Match: data.doc2Match,
                                detectionDetails: data.detectionDetails
                            }
                        })
                    });

                    if (saveResponse.ok) {
                        // Fetch latest customer data before navigating
                        try {
                            const customerRes = await fetch(`http://localhost:5000/api/customer/${customerDetails._id}`);
                            if (customerRes.ok) {
                                const customerData = await customerRes.json();
                                // Optionally update context or state here if needed
                            }
                        } catch (fetchErr) {
                            console.error('Error fetching latest customer data:', fetchErr);
                        }
                        // Navigate to review page on success
                        navigate('/custreview');
                    } else {
                        console.error('Failed to save liveliness results');
                    }
                } catch (saveError) {
                    console.error('Error saving liveliness results:', saveError);
                }
            } else {
                setResult('fail');
                setLivenessResult({
                    isLive: data.isLive,
                    aadharMatch: data.aadharMatch,
                    doc2Match: data.doc2Match,
                    message: data.message,
                    detectionDetails: data.detectionDetails
                });
                console.log('livenessResult state after fail:', {
                    isLive: data.isLive,
                    aadharMatch: data.aadharMatch,
                    doc2Match: data.doc2Match,
                    message: data.message,
                    detectionDetails: data.detectionDetails
                });
                setError(data.message || 'Liveliness test failed.');

                if (data.detectionDetails) {
                    setDetectionStatus({
                        blink: data.detectionDetails.blink_detected,
                        mouth: data.detectionDetails.mouth_movement,
                        skin: data.detectionDetails.skin_reflectance
                    });
                    console.log('detectionStatus state after fail:', {
                        blink: data.detectionDetails.blink_detected,
                        mouth: data.detectionDetails.mouth_movement,
                        skin: data.detectionDetails.skin_reflectance
                    });
                }
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError(err.message || 'Video upload failed.');
            setResult('fail');
        }
    };

    const handleProceed = () => {
        // Navigate to the next page only if liveness AND all face matches are detected
        if (livenessResult && livenessResult.isLive && livenessResult.aadharMatch && livenessResult.doc2Match) {
            navigate('/custreview'); // Or your desired next page
        }
    };

    const handleRetry = () => {
        setRecording(false);
        setPrompts('');
        setVideoBlob(null);
        setResult(null);
        setLivenessResult(null);
        setError('');
        // Optionally restart camera if needed
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.title}>NeoBlue Nexus</h2>
            </header>
            <div style={styles.contentArea}> {/* New flex container for panels */}
                <div style={styles.leftPanel}> {/* Left panel for the form */}
                    <h3 style={styles.heading}> LIVELINESS TEST</h3>
                    <div style={styles.videoWrapper}>
                        {error ? (
                            <div style={styles.error}>{error}</div>
                        ) : (
                            <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                        )}
                    </div>
                    <p style={styles.prompts}>{prompts}</p>
                    <button
                        style={{
                            ...styles.button,
                            ...styles.capture,
                            cursor: recording ? 'not-allowed' : 'pointer',
                        }}
                        onClick={startRecording}
                        disabled={recording}
                    >
                        {recording ? 'Recording...' : '🎥 Start Test'}
                    </button>

                    {livenessResult && (
                        <div style={{ marginTop: '30px' }}>
                            <h4 style={styles.resultText}>
                                {livenessResult.isLive ? '✅ Liveness Test Successful!' : '❌ Liveness Test Failed.'}
                            </h4>
                            <div style={styles.buttonGroup}>
                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.success,
                                        opacity: (livenessResult.isLive && livenessResult.aadharMatch && livenessResult.doc2Match) ? 1 : 0.5, // Enabled based on overall success
                                        cursor: (livenessResult.isLive && livenessResult.aadharMatch && livenessResult.doc2Match) ? 'pointer' : 'not-allowed', // Enabled based on overall success
                                    }}
                                    onClick={handleProceed}
                                    disabled={!(livenessResult.isLive && livenessResult.aadharMatch && livenessResult.doc2Match)} // Disabled based on overall success
                                >
                                    Proceed ✅
                                </button>
                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.failure,
                                        cursor: 'pointer',
                                    }}
                                    onClick={handleRetry}
                                >
                                    Retry ❌
                                </button>
                            </div>
                        </div>
                    )}
                </div> {/* Closing leftPanel */}
                <div style={styles.rightPanel}> {/* Right panel, intentionally empty */}
                    {/* This panel is intentionally empty for layout and background color */}
                    <img src={triangleImage} alt="Triangle Design" style={styles.triangleImage} /> {/* Add triangle image */}
                </div>
            </div> {/* Closing contentArea */}
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
        width: '30px',
        height: '30px',
        marginRight: '10px',
    },
    title: {
        fontSize: '18px',
        // This remains its original color (likely white from header background)
    },
    contentArea: { // New style for the main content area
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1, // Allows this div to take up remaining vertical space
        width: '100%',
    },
    leftPanel: { // New style for the left content panel
        flex: '0 0 40%',
        minWidth: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    rightPanel: { // New style for the right empty panel
        flex: '0 0 60%',
        minWidth: 0,
        backgroundColor: 'white',
        position: 'relative', // Make relative for absolute positioning of triangle
    },
    heading: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#021526', // Changed font color
    },
    videoWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        height: '300px',
        margin: '20px auto',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '10px',
    },
    prompts: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#021526', // Changed font color
        marginTop: '10px',
        minHeight: '25px', // To prevent layout shifts
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
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
    capture: {
        marginBottom: '20px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px',
    },
    success: {
        backgroundColor: '#28a745',
    },
    failure: {
        backgroundColor: '#dc3545',
    },
    resultText: {
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '20px 0',
        color: '#021526', // Changed font color
    },
    detectionDetails: {
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '20px',
        color: '#021526', // Changed font color
    },
    detectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#021526', // Changed font color
    },
    detectionItem: {
        fontSize: '14px',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        color: '#021526', // Changed font color
    },
    checkIcon: {
        color: 'green',
        marginRight: '5px',
    },
    crossIcon: {
        color: 'red',
        marginRight: '5px',
    },
    matchingResults: {
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '20px',
        color: '#021526', // Added font color
    },
    matchingTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#021526', // Added font color
    },
    triangleImage: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: 'auto',
        height: '90%',
    },
};

export default LivelinessTest;