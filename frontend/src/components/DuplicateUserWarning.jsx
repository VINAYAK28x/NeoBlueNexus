import React from 'react';

const DuplicateUserWarning = () => {
return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NEOBLUE NEXUS</h2>
</div>
{/* Main Content */}
<div style={styles.content}>
{/* Left Warning Message */}
<div style={styles.warningBox}>
<p style={styles.warningText}>
User has previously registered at the same or a different branch
under different confidentials. Kindly verify the same and report to higher authorities.
</p>
</div>
{/* Right Action Buttons */}
<div style={styles.buttonBox}>
<button style={styles.buttonBlue}>Navigate to credential entry</button>
<button style={styles.buttonBlue}>View mapped duplicate entry</button>
<button style={styles.buttonRed}>Blacklist User</button>
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
backgroundColor: '#fff',
},
header: {
display: 'flex',
alignItems: 'center',
backgroundColor: '#3391ff',
color: 'white',
padding: '10px 20px',
},
logo: {
width: '30px',
height: '30px',
marginRight: '10px',
},
title: {
fontSize: '18px',
},
content: {
display: 'flex',
height: 'calc(100% - 60px)',
},
warningBox: {
flex: 1,
display: 'flex',
alignItems: 'center',
padding: '40px',
},
warningText: {
color: 'red',
fontSize: '20px',
lineHeight: '1.6',
fontWeight: 'bold',
},
buttonBox: {
flex: 1,
backgroundColor: '#001f33',
display: 'flex',
flexDirection: 'column',
justifyContent: 'center',
alignItems: 'center',
gap: '20px',
},
buttonBlue: {
padding: '12px 30px',
fontSize: '16px',
borderRadius: '20px',
backgroundColor: '#5fa8ff',
color: 'white',
border: 'none',
cursor: 'pointer',
},
buttonRed: {
padding: '12px 30px',
fontSize: '16px',
borderRadius: '20px',
backgroundColor: '#e53935',
color: 'white',
border: 'none',
cursor: 'pointer',
},
};
export default DuplicateUserWarning;