import React from 'react';

const DocumentDisplayPage = () => {
return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NEOBLUE NEXUS</h2>
<div style={styles.logout}>Log Out</div>
</div>
{/* Body */}
<div style={styles.body}>
<div style={styles.nameSection}>
<label style={styles.nameLabel}>NAME:</label>
<input type="text" value="KUMAR" readOnly style={styles.nameInput} />
</div>
<div style={styles.documentsContainer}>
<div style={styles.documentBox}>
<h3 style={styles.docTitle}>AADHAR</h3>
<div style={styles.docPlaceholder}></div>
</div>
<div style={styles.documentBox}>
<h3 style={styles.docTitle}>DOCUMENT#2</h3>
<div style={styles.docPlaceholder}></div>
</div>
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
justifyContent: 'space-between',
backgroundColor: '#2196f3',
padding: '10px 20px',
color: 'white',
},
logo: {
width: '30px',
height: '30px',
},
title: {
marginLeft: '10px',
fontSize: '18px',
flexGrow: 1,
},
logout: {
cursor: 'pointer',
fontWeight: 'bold',
},
body: {
padding: '30px',
},
nameSection: {
marginBottom: '30px',
display: 'flex',
alignItems: 'center',
gap: '10px',
},
nameLabel: {
fontWeight: 'bold',
fontSize: '18px',
},
nameInput: {
borderRadius: '15px',
padding: '5px 10px',
fontSize: '16px',
border: '1px solid #ccc',
},
documentsContainer: {
display: 'flex',
justifyContent: 'space-around',
marginTop: '20px',
},
documentBox: {
width: '40%',
textAlign: 'center',
},
docTitle: {
marginBottom: '10px',
},
docPlaceholder: {
width: '100%',
height: '200px',
backgroundColor: '#e0e0e0',
borderRadius: '10px',
},
};
export default DocumentDisplayPage;