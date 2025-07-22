import React, { useState } from 'react';

import axios from 'axios'; // ✅ Import axios
import triangleImage from './customs.svg';
import { useCustomer } from '../CustomerContext'; // Context must have liveVector + aadharVector
import { useNavigate } from 'react-router-dom';

const CustomerDetailsPage = () => {
    const navigate = useNavigate();
    const { customerDetails, setCustomerDetails } = useCustomer();
    const [errors, setErrors] = useState({});

    const validateFields = () => {
        const newErrors = {};
        
        if (!customerDetails.name?.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!customerDetails.aadhar?.trim()) {
            newErrors.aadhar = 'Aadhar number is required';
        } else if (!/^\d{12}$/.test(customerDetails.aadhar)) {
            newErrors.aadhar = 'Aadhar number must be 12 digits';
        }
        
        if (!customerDetails.dob) {
            newErrors.dob = 'Date of birth is required';
        }
        
        if (!customerDetails.doc?.trim()) {
            newErrors.doc = 'Document number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setCustomerDetails({ ...customerDetails, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const HandleLive = async () => {
        if (!validateFields()) return;

        // If we already have an _id, just navigate
        if (customerDetails._id) {
            navigate('/aadhar');
            return;
        }

        // Otherwise, create the customer first
        try {
            const payload = {
                name: customerDetails.name,
                dob: customerDetails.dob,
                aadharNumber: customerDetails.aadhar,
                drivingLicense: customerDetails.doc,
                otherDocuments: '',
                aadharVector: customerDetails.aadharVector,
                liveVector: customerDetails.liveVector,
            };
            const response = await axios.post('http://localhost:5000/api/customer/add', payload);
            setCustomerDetails(prev => ({
                ...prev,
                _id: response.data.customer?._id || response.data.customer?.id
            }));
            navigate('/aadhar');
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to create customer'));
        }
    };

    // ✅ Submit to MongoDB
    const handleSubmit = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const payload = {
                name: customerDetails.name,
                dob: customerDetails.dob,
                aadharNumber: customerDetails.aadhar,
                drivingLicense: customerDetails.doc,
                otherDocuments: '', // Can update later
                aadharVector: customerDetails.aadharVector,
                liveVector: customerDetails.liveVector,
            };
            const response = await axios.post('http://localhost:5000/api/customer/add', payload); // Adjust port if needed
            alert(response.data.message);
            navigate('/success'); // Optional success route
        } catch (error) {
            alert('Error: ' + error.response?.data?.message || 'Failed to submit data');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>NeoBlue Nexus</h2>
            </div>
            <div style={styles.body}>
                <div style={styles.leftPanel}>
                    <img src={triangleImage} alt="Triangle Design" style={styles.triangleImage} />
                </div>
                <div style={styles.formSection}>
                    <h2 style={styles.heading}>ENTER CUSTOMER DETAILS</h2>
                    <form style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>CUSTOMER NAME:</label>
                            <input 
                                type="text" 
                                style={{
                                    ...styles.input,
                                    borderColor: errors.name ? '#dc3545' : '#ccc'
                                }} 
                                value={customerDetails.name} 
                                onChange={(e) => handleChange('name', e.target.value)} 
                            />
                            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>AADHAR NUMBER:</label>
                            <input 
                                type="text" 
                                style={{
                                    ...styles.input,
                                    borderColor: errors.aadhar ? '#dc3545' : '#ccc'
                                }} 
                                value={customerDetails.aadhar} 
                                onChange={(e) => handleChange('aadhar', e.target.value)} 
                            />
                            {errors.aadhar && <span style={styles.errorText}>{errors.aadhar}</span>}
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>DATE OF BIRTH:</label>
                            <input 
                                type="date" 
                                style={{
                                    ...styles.input,
                                    borderColor: errors.dob ? '#dc3545' : '#ccc'
                                }} 
                                value={customerDetails.dob} 
                                onChange={(e) => handleChange('dob', e.target.value)} 
                            />
                            {errors.dob && <span style={styles.errorText}>{errors.dob}</span>}
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>DL/OTHER:</label>
                            <input 
                                type="text" 
                                style={{
                                    ...styles.input,
                                    borderColor: errors.doc ? '#dc3545' : '#ccc'
                                }} 
                                value={customerDetails.doc} 
                                onChange={(e) => handleChange('doc', e.target.value)} 
                            />
                            {errors.doc && <span style={styles.errorText}>{errors.doc}</span>}
                        </div>
                    </form>
                    <p style={styles.warning}>Kindly Proceed To Document Upload</p>
                    <div style={styles.buttonGroup}>
                        <button style={styles.buttonBlue} onClick={HandleLive}>Aadhar Upload →</button>
                        <button
                            style={styles.buttonGreen}
                            onClick={handleSubmit}
                        >
                            Submit to Database →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Poppins, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#028bd3',
        padding: '10px 20px',
        color: 'white',
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
        flexDirection: 'row',
        height: 'calc(100vh - 60px)',
    },
    leftPanel: {
        flex: 1,
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    triangleImage: {
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
    },
    formSection: {
        flex: 2,
        backgroundColor: '#fff',
        padding: '60px 50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderTopLeftRadius: '30px',
        borderBottomLeftRadius: '30px',
        boxShadow: '-10px 0 20px rgba(0,0,0,0.05)',
    },
    heading: {
        fontSize: '40px',
        fontWeight: '600',
        marginBottom: '40px',
        color: '#333',
        textAlign: 'left', // ✅ Text left-aligned
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        marginBottom: '20px',
        width: '100%',
        maxWidth: '400px',
        alignSelf: 'center',
    },
    label: {
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        padding: '12px 15px',
        borderRadius: '10px',
        border: '1.5px solid #ccc',
        fontSize: '15px',
        width: '100%',
        background: '#222',
        color: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    warning: {
        color: '#d9534f',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '15px',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        marginTop: '20px',
    },
    buttonBlue: {
        backgroundColor: '#4A90E2',
        color: 'white',
        padding: '12px 40px',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '260px',
        margin: '0 auto',
        transition: 'background-color 0.3s',
    },
    buttonGreen: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px 40px',
        border: 'none',
        borderRadius: '25px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '260px',
        margin: '0 auto',
        transition: 'background-color 0.3s',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '12px',
        marginTop: '2px',
    },
};

export default CustomerDetailsPage;