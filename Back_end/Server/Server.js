require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const parentRoutes = require('./routes/parentRoutes');
const { 
    login, 
    validateAndSendOTP, 
    verifyOTP, 
    updatePassword 
} = require('./controllers/authController');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/auth/login', login);
app.post('/api/auth/validate-email', validateAndSendOTP);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/update-password', updatePassword);

app.use('/api/parents', parentRoutes);

const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
    .then(() => {
        console.log("-----------------------------------------");
        console.log("Database Connected Successfully on port 5050");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("-----------------------------------------");
        });
    })
    .catch(err => {
        console.error("Database Connection Error: ", err);
        process.exit(1); 
    });