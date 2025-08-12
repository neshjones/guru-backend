const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const referralRoutes = require('./src/routes/referralRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Guru Freelancer API is running'));

module.exports = app;
