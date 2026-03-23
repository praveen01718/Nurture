import React, { useState, useRef, useEffect } from 'react';
import './Otp.css';

const OtpModal = ({ isOpen, onClose, onVerify }) => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [timerActive, setTimerActive] = useState(0); 
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      setTimer(60);
      setCanResend(false);

      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timerActive]); 

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.join("").length === 4) {
      onVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, index) => {
      if (index < 4) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    const nextIndex = data.length < 4 ? data.length : 3;
    inputRefs.current[nextIndex].focus();
    
    if (data.length === 4) onVerify(data);
  };

  const handleResend = () => {
    setOtp(new Array(4).fill(""));
    setTimer(60);
    setCanResend(false);
    setTimerActive(prev => prev + 1); 
    inputRefs.current[0]?.focus();
    console.log("OTP Resent");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="otp-card" onClick={(e) => e.stopPropagation()}>
        <div className="reset-header">
          <h2>Enter OTP</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="otp-inputs">
          {otp.map((data, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[i] = el)}
              value={data}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <div className="timer-section">
          {canResend ? (
            <button className="resend-link" onClick={handleResend}>
              Resend OTP
            </button>
          ) : (
            <p>00:<span>{timer}</span></p>
          )}
        </div>

        <button 
          className="verify-btn" 
          disabled={otp.join("").length !== 4}
          onClick={() => onVerify(otp.join(""))}
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default OtpModal;