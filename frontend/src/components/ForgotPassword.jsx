import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
const navigate = useNavigate();
const handleSubmit = () => {
// Demo action — you can add real logic later
alert("Reset link sent to your email!");
navigate('/'); // Redirect back to login page
};
return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NEOBLUE NEXUS</h2>
</div>
{/* Body */}
<div style={styles.body}>
<div style={styles.card}>
<h2 style={styles.heading}>Forgot Password</h2>
<input
type="text"
placeholder="Enter Employee ID"
style={styles.input}
/>
<input
type="email"
placeholder="Enter Registered Email"
style={styles.input}
/>
<button onClick={handleSubmit} style={styles.submitBtn}>Send Reset Link</button>
<button onClick={() => navigate('/')} style={styles.backBtn}>Back to Login</button>
</div>
</div>
</div>
);
};
const styles = {
container: {
fontFamily: 'sans-serif',
height: '100vh',
overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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
justifyContent: 'center',
alignItems: 'center',
height: 'calc(100% - 60px)',
backgroundColor: '#f5f5f5',
    width: '100%',
},
card: {
backgroundColor: '#ffffff',
padding: '40px',
borderRadius: '10px',
boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
width: '350px',
textAlign: 'center',
},
heading: {
marginBottom: '30px',
fontWeight: 'bold',
fontSize: '24px',
},
input: {
width: '100%',
padding: '12px',
marginBottom: '20px',
borderRadius: '20px',
border: '1px solid #ccc',
},
submitBtn: {
width: '100%',
padding: '12px',
backgroundColor: '#4A90E2',
color: 'white',
border: 'none',
borderRadius: '20px',
fontSize: '16px',
cursor: 'pointer',
marginBottom: '10px',
},
backBtn: {
background: 'none',
border: 'none',
color: '#4A90E2',
textDecoration: 'underline',
cursor: 'pointer',
fontSize: '14px',
},
};
export default ForgotPassword;