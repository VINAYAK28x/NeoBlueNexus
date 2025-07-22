import './Login.css';

import React, { useState } from 'react';

import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
const Login = () => {
const navigate = useNavigate();
const [adminId, setAdminId] = useState('');
const [password, setPassword] = useState('');
const { login } = useAuth();

const handleLogin = async (e) => {
e.preventDefault(); // Prevent default form submission
try {
const res = await fetch('http://localhost:5000/api/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ adminId, password }),
});
const data = await res.json();

console.log('Login API response data:', data);

if (res.ok) {
login(data.token);
navigate('/home');
} else {
alert(data.error || 'Login Failed');
}
} catch (err) {
alert('Login error');
}
};
const handleRegister = () => {
navigate('/register');
};
const handleReset = () => {
navigate('/forgotpass');
};
return (
<div className="login-container">
<div className="header-bar">
<span className="app-title">NeoBlue Nexus</span>
</div>
<div className="left-panel">
<h1>
WELCOME <br /> BACK
</h1>
</div>
<div className="right-panel">
<div className="login-form-box">
<div className="login-heading">Login</div>
<form onSubmit={handleLogin}>
<label htmlFor="mptid">MPT ID</label>
<input
id="mptid"
type="text"
placeholder="MPT ID"
value={adminId}
onChange={(e) => setAdminId(e.target.value)}
required
style={{ fontSize: '14px', padding: '6px 10px', marginBottom: '10px' }}
/>
<label htmlFor="passcode">PASSCODE</label>
<input
id="passcode"
type="password"
placeholder="Passcode"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
style={{ fontSize: '14px', padding: '6px 10px', marginBottom: '10px' }}
/>
<button type="button" className="forgot" style={{ fontSize: '13px', padding: '7px 0', margin: '5px 0' }} onClick={handleReset}>
Forgot Password?
</button>
<button type="submit" className="login-btn" style={{ fontSize: '14px', padding: '8px 0', margin: '6px 0' }}>
LOGIN
</button>
<button type="button" className="new-user-btn" style={{ fontSize: '14px', padding: '8px 0', margin: '6px 0' }} onClick={handleRegister}>
NEW USER
</button>
</form>
</div>
</div>
</div>
);
};
export default Login;