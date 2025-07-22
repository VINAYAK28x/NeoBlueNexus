const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const customerRoutes =require('./routes/customer');
const livelinessRoute=require('./routes/livelinessRoute');
dotenv.config();
const authRoutes = require('./routes/auth');
const app = express();

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));
app.use('/api/customer',customerRoutes);
app.use('/api',livelinessRoute);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))