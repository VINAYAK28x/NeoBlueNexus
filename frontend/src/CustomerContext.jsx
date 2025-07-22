// CustomerContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
const [customerDetails, setCustomerDetails] = useState({
name: '',
aadhar: '',
dob: '',
doc: '',
faceVector: '',
        aadharVector: null,
});
const [aadharFile, setAadharFile] = useState(null);
const [docFile, setDocFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [error, setError] = useState(null);

    const uploadAadharImage = async (customerId) => {
        try {
            setUploadStatus('uploading');
            setError(null);

            const formData = new FormData();
            formData.append('aadharImage', aadharFile);
            formData.append('customerId', customerId);

            const response = await axios.post('/api/customer/upload-aadhar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setCustomerDetails(prev => ({
                ...prev,
                aadharVector: response.data.customer.aadharVector
            }));
            setUploadStatus('success');
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading Aadhar image');
            setUploadStatus('error');
            throw err;
        }
    };

    const uploadDoc2Image = async (customerId, doc2File) => {
        try {
            setUploadStatus('uploading');
            setError(null);

            const formData = new FormData();
            formData.append('doc2Image', doc2File);
            formData.append('customerId', customerId);

            const response = await axios.post('http://localhost:5000/api/customer/upload-doc2', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setCustomerDetails(prev => ({
                ...prev,
                faceVector: response.data.customer.facialVector
            }));
            setUploadStatus('success');
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading Doc2 image');
            setUploadStatus('error');
            throw err;
        }
    };

return (
<CustomerContext.Provider value={{
customerDetails,
setCustomerDetails,
aadharFile,
setAadharFile,
docFile,
setDocFile,
            uploadAadharImage,
            uploadDoc2Image,
            uploadStatus,
            error,
}}>
{children}
</CustomerContext.Provider>
);
};