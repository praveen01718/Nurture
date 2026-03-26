require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const { 
    login, 
    validateAndSendOTP, 
    verifyOTP, 
    updatePassword 
} = require('./controllers/authController');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', login);
app.post('/api/auth/validate-email', validateAndSendOTP);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/update-password', updatePassword);

const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
    .then(() => {
        console.log("Database Connected (Port 5050)");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log("DB Error: " + err));