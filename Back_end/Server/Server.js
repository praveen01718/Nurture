require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./models');

const parentRoutes = require('./routes/parentRoutes');
const childProfileRoutes = require('./routes/childProfileRoutes');
const measurementRoutes = require('./routes/measurementRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const { 
    login, 
    validateAndSendOTP, 
    verifyOTP, 
    updatePassword 
} = require('./controllers/authController');

const app = express();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(uploadDir));

app.post('/api/auth/login', login);
app.post('/api/auth/validate-email', validateAndSendOTP);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/update-password', updatePassword);

app.use('/api/parents', parentRoutes);
app.use('/api/Child-datas', childProfileRoutes);
app.use('/api/medical-measurements', measurementRoutes);
app.use('/api/vaccinations', vaccinationRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error' 
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("-----------------------------------------");
        console.log("Database Connected successfully");
        
        await db.sequelize.sync({ alter: true });
        console.log("Database Synchronized");
        console.log("-----------------------------------------");
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("-----------------------------------------");
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();
