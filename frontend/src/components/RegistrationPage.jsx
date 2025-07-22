import React, { useState } from 'react';

import triangleImage from './triangle.svg';
import { useNavigate } from 'react-router-dom';

const RegistrationPage = () => {
const [employeeName, setEmployeeName] = useState('');
const [joiningDate, setJoiningDate] = useState('');
const [adminId, setAdminId] = useState('');
const [branchCode, setBranchCode] = useState('');
const [password, setPassword] = useState('');
const navigate = useNavigate();
const handleRegister = async (e) => {
e.preventDefault();
try {
const res = await fetch('http://localhost:5000/api/auth/register', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ employeeName, adminId, password, branchCode, joiningDate }),
});
const data = await res.json();
if (res.ok) {
alert('Registration Successful');
navigate('/');
} else {
alert(data.error || 'Registration Failed');
}
} catch (error) {
alert('Network Error');
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
<h2 style={styles.heading}>REGISTRATION PAGE</h2>
<form style={styles.form} onSubmit={handleRegister}>
<label style={styles.label}>EMPLOYEE NAME:</label>
<input
type="text"
value={employeeName}
onChange={(e) => setEmployeeName(e.target.value)}
style={styles.input}
required
/>
<label style={styles.label}>DATE OF JOINING:</label>
<input
type="date"
value={joiningDate}
onChange={(e) => setJoiningDate(e.target.value)}
style={styles.input}
required
/>
<label style={styles.label}>MPT ID:</label>
<input
type="text"
value={adminId}
onChange={(e) => setAdminId(e.target.value)}
style={styles.input}
required
/>
<label style={styles.label}>BRANCH CODE:</label>
<input
type="text"
value={branchCode}
onChange={(e) => setBranchCode(e.target.value)}
style={styles.input}
required
/>
<label style={styles.label}>PASSCODE:</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.input}
required
/>
<button type="submit" style={styles.button}>REGISTER</button>
</form>
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
formWrapper: {
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
},
heading: {
textAlign: 'center',
fontSize: '20px',
fontWeight: 'bold',
marginBottom: '30px',
color: '#333',
},
form: {
display: 'flex',
flexDirection: 'column',
gap: '20px',
},
label: {
fontWeight: 'bold',
marginBottom: '5px',
},
input: {
padding: '10px',
borderRadius: '20px',
border: '1px solid #ccc',
outline: 'none',
fontSize: '14px',
},
button: {
marginTop: '20px',
padding: '10px 30px',
backgroundColor: '#4A90E2',
color: 'white',
border: 'none',
borderRadius: '20px',
fontSize: '16px',
cursor: 'pointer',
alignSelf: 'center',
},
triangleImage: {
position: 'absolute',
bottom: '0',
right: '0',
width: 'auto',
height: '90%',
},
};
export default RegistrationPage;