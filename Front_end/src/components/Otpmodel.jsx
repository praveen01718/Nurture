import React, { useState } from 'react';

const OtpModal = ({ isOpen, onClose, onVerify, email }) => {
    const [otp, setOtp] = useState("");

    if (!isOpen) return null;

    const handleVerifyClick = (e) => {
        e.preventDefault(); 
        if (otp.length === 4) {
            onVerify(otp);
        } else {
            alert("Please enter a 4-digit code");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="otp-modal">
                <h3>Verify OTP</h3>
                <p>Enter the 4-digit code sent to: <br/><strong>{email}</strong></p>
                
                <input 
                    type="text" 
                    maxLength="4" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                    placeholder="0000"
                    style={{
                        letterSpacing: '10px',
                        textAlign: 'center',
                        fontSize: '24px',
                        padding: '10px',
                        width: '150px',
                        margin: '20px 0'
                    }}
                />

                <div className="modal-actions">
                    <button 
                        onClick={onClose} 
                        style={{ backgroundColor: '#ccc', marginRight: '10px' }}
                    >
                        CANCEL
                    </button>
                    <button 
                        onClick={handleVerifyClick} 
                        style={{ backgroundColor: '#d93025', color: 'white' }}
                    >
                        VERIFY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpModal;