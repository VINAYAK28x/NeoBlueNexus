import React from 'react';
import triangle from '../components/triangle.svg'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
const navigate=useNavigate();
const HandleView=()=>{
navigate('/clist');
};
const HandleDetails=()=>{
navigate('/custdetails');
};
const HandleExistingCustomer=()=>{
navigate('/liveprompt');
};
return (
<div style={styles.homeContainer}>
{/* Header */}
<header style={styles.header}>
<div style={styles.logoSection}>
<span style={styles.title}>NEOBLUE NEXUS</span>
</div>
<a href="#" style={styles.logout}>Log Out</a>
</header>
{/* Body */}
<div style={styles.mainBody}>
<div style={styles.leftImage}>
<img src={triangle} alt="Decorative" style={styles.triangleImage} />
</div>
<div style={styles.textSection}>
<h1 style={styles.homeHeading}>
REDEFINING TRUST<br />
IN IDENTITY<br />
SECURE, SEAMLESS, SMART
</h1>
<div style={styles.btnGroup}>
<button style={styles.btn} onClick={HandleDetails}>New Customer</button>
<button style={styles.btn} onClick={HandleExistingCustomer}>Existing Customer</button>
<button style={styles.btn} onClick={HandleView}>View Customers</button>
</div>
</div>
</div>
</div>
);
};
const styles = {
homeContainer: {
position:'absolute',
bottom:0,
left:0,
height:'100vh',
overflow: 'hidden',
display: 'flex',
flexDirection: 'column',
background:'linear-gradient(to bottom,#02021A,#132250,#1C346F,#3665C3,#4786FA)',
z_index:0,
},
header: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
backgroundColor: '#028bd3',
padding: '10px 20px',
color: 'white',
},
logoSection: {
display: 'flex',
alignItems: 'center',
},
logo: {
width: '40px',
height: '40px',
marginRight: '10px',
},
title: {
fontSize: '20px',
fontWeight: 'bold',
},
logout: {
color: 'white',
textDecoration: 'underline',
cursor: 'pointer',
fontSize: '14px',
},
mainBody: {
display: 'flex',
flex: 1,
alignItems: 'center',
justifyContent: 'space-between',
padding: '0 40px',
},
leftImage: {
width: '50%',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
},
triangleImage: {
width: '80%',
height: 'auto',
paddingRight:'250px',
paddingTop:'150px',
},
textSection: {
width: '50%',
textAlign: 'left',
paddingLeft: '20px',
},
homeHeading: {
fontSize: '45px',
fontWeight: 'bold',
lineHeight: '1.5',
marginBottom: '30px',
color:'white',
},
btnGroup: {
display: 'flex',
gap: '20px',
},
btn: {
padding: '12px 24px',
backgroundColor: '#021526',
color: 'white',
border: 'none',
borderRadius: '20px',
fontSize: '16px',
cursor: 'pointer',
}
};
export default Homepage;