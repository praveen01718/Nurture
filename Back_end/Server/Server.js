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

const { 
    addParentWithChildren, 
    getParents, 
    deleteParent, 
    updateParent, 
    getParentById 
} = require('./controllers/parentController');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/api/auth/login', login);
app.post('/api/auth/validate-email', validateAndSendOTP);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/update-password', updatePassword);

app.get('/api/parents', getParents); 
app.get('/api/parents/:id', getParentById);
app.post('/api/parents/add', addParentWithChildren);
app.put('/api/parents/:id', updateParent);
app.delete('/api/parents/:id', deleteParent);

const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
    .then(() => {
        console.log("-----------------------------------------");
        console.log("Database Connected ON PORT 5050");
        
      
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("-----------------------------------------");
        });
    })
    .catch(err => {
        console.error("Database Connection Error: ", err);
        process.exit(1); 
    });