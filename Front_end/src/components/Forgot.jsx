import React, { useState } from 'react';
import './Forgot.css';
import logosrc from '/src/assets/nurture-logo.png';
import Forgotimg from '/src/Images/physician-login-img.jpg';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaRegUser } from "react-icons/fa6";
import OtpModal from '/src/components/Otp';

const Forgot = () => {
    const [userName, setUserName] = useState('');
    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleResetClick = async (e) => {
        if (e) e.preventDefault();
        setUsernameError("");
        
        if (userName.trim() === "") {
            setUsernameError("Email is required");
            return;
        } else if (!emailRegex.test(userName)) {
            setUsernameError("Enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/validate-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userName })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsOtpOpen(true); 
            } else {
                setUsernameError(data.message || "User not found");
            }
        } catch (err) {
            setUsernameError("Server is offline. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (otpCode) => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userName, otp: otpCode })
            });
            const data = await response.json();

            if (data.success) {
                setIsOtpOpen(false);
                navigate('/reset-password', { state: { email: userName } });
            } else {
                alert(data.message || "Invalid OTP");
            }
        } catch (err) {
            alert("Verification failed. Please try again.");
        }
    };

    return (
        <div className='forgot-page'>
            <div className='forgot-header'>
                <NavLink to='/'>
                    <img src={logosrc} alt='logo' className='forgot-logo'/>
                </NavLink>
            </div>
            <div className='forgot-card'>
                <div className='forgot-img'>
                    <img src={Forgotimg} alt='Forgot' />
                </div>
                <div className='forgot-content'>
                    <h2>FORGOT PASSWORD</h2>
                    <p>Enter the email address or mobile number associated with your account.</p>
                    
                    <div className='input-container'>
                        <FaRegUser className='input-icon' />
                        <input 
                            type='email' 
                            placeholder='Email Address' 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    
                    {usernameError && (
                        <p className="error-msg" style={{ color: '#d93025', fontSize: '13px', margin: '5px 0 15px 0', textAlign: 'left' }}>
                            {usernameError}
                        </p>
                    )}

                    <button className='reset-btn' onClick={handleResetClick} disabled={loading}>
                        {loading ? "SENDING..." : "RESET PASSWORD"}
                    </button>

                    <OtpModal 
                        isOpen={isOtpOpen} 
                        onClose={() => setIsOtpOpen(false)} 
                        onVerify={handleVerify} 
                        email={userName}
                    />

                    <button className='back-btn'>
                        <NavLink to='/login/Hospital Admin' className='back-to-login'> BACK TO LOGIN </NavLink>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Forgot;




