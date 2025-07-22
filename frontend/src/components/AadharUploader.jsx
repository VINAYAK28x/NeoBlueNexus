import React, { useState } from 'react';
import { useCustomer } from '../CustomerContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AadharUploader = ({ onSuccess }) => {
    const { 
        aadharFile, 
        setAadharFile,  
        uploadStatus, 
        error,
        customerDetails 
    } = useCustomer();

    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setAadharFile(URL.createObjectURL(uploadedFile));
        }
    };

    const handleDelete = () => {
        setAadharFile(null);
        setFile(null);
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('Please upload an Aadhar image first');
            return;
        }
        if (!customerDetails._id) {
            alert('Customer not created. Please fill customer details first.');
            return;
        }
        // Log customerDetails to check for _id
        console.log('Uploading Aadhar for customerDetails:', customerDetails);
        try {
            const formData = new FormData();
            formData.append('aadharImage', file);
            formData.append('customerId', customerDetails._id || customerDetails.id);

            const response = await axios.post('http://localhost:5000/api/customer/upload-aadhar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);

            if (response.data.success) {
                console.log('Upload successful, calling onSuccess callback');
                if (onSuccess) {
                    onSuccess();
                } else {
                    console.error('onSuccess callback is not provided');
                }
            } else {
                alert(response.data.message || 'Error processing Aadhar image');
            }
        } catch (err) {
            console.error('Error uploading Aadhar:', err);
            if (err.response?.status === 409) {
                const { type, existingCustomer, similarity } = err.response.data;
                if (type === 'duplicate') {
                    const message = `Customer "${existingCustomer.name}" already exists in the system.\nFacial similarity: ${(similarity * 100).toFixed(2)}%\n\nPlease verify if this is the same customer.`;
                    alert(message);
                    navigate('/home');
                } else if (type === 'blacklist') {
                    navigate('/blacklist', { 
                        state: { 
                            existingCustomer,
                            currentCustomer: customerDetails,
                            similarity
                        }
                    });
                }
            } else {
            alert(err.response?.data?.message || 'Error uploading Aadhar image');
            }
        }
    };

    return (
        <div className="aadhar-uploader">
            <div className="preview-container">
                {aadharFile ? (
                    <img src={aadharFile} alt="Aadhaar Preview" className="preview-image" />
                ) : (
                    <span className="placeholder-text">No file uploaded</span>
                )}
            </div>
            
            <div className="button-group">
                <label className="upload-button">
                    Upload
                    <input 
                        type="file" 
                        className="hidden-input" 
                        onChange={handleUpload}
                        accept="image/*"
                    />
                </label>
                <button className="delete-button" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {uploadStatus === 'uploading' && (
                <div className="status-message">Processing Aadhar image...</div>
            )}

            <button 
                className={`submit-button ${(!file || uploadStatus === 'uploading') ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!file || uploadStatus === 'uploading'}
            >
                {uploadStatus === 'uploading' ? 'Processing...' : 'Proceed'}
            </button>

            <style>{`
                .aadhar-uploader {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .preview-container {
                    width: 100%;
                    height: 250px;
                    border: 2px dashed #ccc;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #fafafa;
                    overflow: hidden;
                }

                .preview-image {
                    height: 100%;
                    width: 100%;
                    object-fit: cover;
                }

                .placeholder-text {
                    color: #999;
                }

                .button-group {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .upload-button {
                    background-color: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                }

                .delete-button {
                    background-color: #dc3545;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    border: none;
                    cursor: pointer;
                }

                .submit-button {
                    background-color: #007bff;
                    color: white;
                    padding: 10px 30px;
                    border-radius: 20px;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    width: 100%;
                }

                .submit-button.disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .hidden-input {
                    display: none;
                }

                .error-message {
                    color: #dc3545;
                    margin-bottom: 15px;
                    font-size: 14px;
                    text-align: center;
                }

                .status-message {
                    color: #007bff;
                    margin-bottom: 15px;
                    font-size: 14px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default AadharUploader; 