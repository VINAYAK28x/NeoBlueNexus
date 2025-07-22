import React, { useEffect, useState } from 'react';

import axios from 'axios';
const CustomerListPage = () => {
const [customerData, setCustomerData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
useEffect(() => {
axios.get('http://localhost:5000/api/customer/list') // Update endpoint if needed
.then((res) => {
setCustomerData(res.data);
setLoading(false);
})
.catch((err) => {
setError('Failed to fetch customer data');
setLoading(false);
});
}, []);
return (
<div style={styles.container}>
{/* Header */}
<div style={styles.header}>
<h2 style={styles.title}>NeoBlue Nexus</h2>
</div>
{/* Filters */}
<div style={styles.filterRow}>
<span style={styles.filterTitle}>CUSTOMER LIST</span>
<select style={styles.dropdown}><option>cname</option></select>
<select style={styles.dropdown}><option>cid</option></select>
<select style={styles.dropdown}><option>branch</option></select>
</div>
{/* Table or loading/error */}
{loading ? (
<p style={styles.statusText}>Loading...</p>
) : error ? (
<p style={{ ...styles.statusText, color: 'red' }}>{error}</p>
) : (
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>C.ID</th>
<th style={styles.th}>CNAME</th>
<th style={styles.th}>DOCUMENT</th>
<th style={styles.th}>BRANCH</th>
</tr>
</thead>
<tbody>
{customerData.map((item, index) => (
<tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
<td style={styles.td}>{item._id}</td>
<td style={styles.td}>{item.name}</td>
<td style={styles.td}>
<a
href={item.otherDocuments || '#'}
download
style={styles.downloadButton}
target="_blank"
rel="noopener noreferrer"
>
Download
</a>
</td>
<td style={styles.td}>TVM</td>
</tr>
))}
</tbody>
</table>
)}
</div>
);
};
const styles = {
container: {
fontFamily: 'sans-serif',
height: '100vh',
backgroundColor: '#f5f5f5',
overflowY: 'auto',
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
filterRow: {
display: 'flex',
alignItems: 'center',
padding: '15px 20px',
gap: '10px',
backgroundColor: 'white',
},
filterTitle: {
fontWeight: 'bold',
marginRight: 'auto',
},
dropdown: {
padding: '8px 12px',
borderRadius: '6px',
border: '1px solid #ccc',
},
table: {
width: '95%',
margin: '20px auto',
borderCollapse: 'collapse',
borderRadius: '8px',
overflow: 'hidden',
boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
},
th: {
backgroundColor: '#444',
color: 'white',
padding: '12px',
textAlign: 'left',
},
td: {
padding: '12px',
color: '#000',
textAlign: 'left',
},
evenRow: {
backgroundColor: '#e8e8e8',
},
oddRow: {
backgroundColor: '#dcdcdc',
},
downloadButton: {
backgroundColor: '#DCD6F7',
padding: '6px 12px',
borderRadius: '6px',
textDecoration: 'none',
color: '#000',
fontWeight: 'bold',
},
statusText: {
padding: '20px',
textAlign: 'center',
fontWeight: 'bold',
}
};
export default CustomerListPage;