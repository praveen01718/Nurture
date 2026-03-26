const { User } = require('../models');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

let otpStore = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, type: "email", message: "Email not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, type: "password", message: "Incorrect password" });
        }

        res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.validateAndSendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: "Email not found" });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`
        });
        res.status(200).json({ success: true, message: "OTP sent" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Email failed" });
    }
};

exports.verifyOTP = (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (record && record.code === otp && Date.now() < record.expiresAt) {
        delete otpStore[email];
        return res.status(200).json({ success: true });
    }
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
};

exports.updatePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update({ password: hashedPassword }, { where: { email } });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};