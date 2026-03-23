import React, { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import logosrc from '/src/assets/nurture-logo.png';
import "../components/ResetPassword.css";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Session expired. Please start again.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Password updated successfully!");
                navigate('/login/Hospital Admin');
            } else {
                setError(data.message || "Failed to update password.");
            }
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
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
                <div className='forgot-content'>
                    <h2>SET NEW PASSWORD</h2>
                    <p>Enter a new password </p>
                    
                    <form onSubmit={handleUpdate}>
                        <div className='input-container'>
                            <input 
                                type={showPass ? 'text' : 'password'} 
                                placeholder='New Password' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className='eye-icon' onClick={() => setShowPass(!showPass)}>
                                {showPass ? <IoMdEyeOff /> : <IoMdEye />}
                            </div>
                        </div>

                        <div className='input-container'>
                            <input 
                                type={showConfirmPass ? 'text' : 'password'} 
                                placeholder='Confirm New Password' 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className='eye-icon' onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                {showConfirmPass ? <IoMdEyeOff /> : <IoMdEye />}
                            </div>
                        </div>

                        {error && <p className="error-msg" style={{ color: '#d93025', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}

                        <button type="submit" className='reset-btn' disabled={loading}>
                            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;