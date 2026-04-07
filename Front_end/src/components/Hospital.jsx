import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/nurture-logo.png";
import log_img from "../Images/admin-login-img.jpg";
import { FaUser, FaLock } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import '../components/Hospital.css';

function Hospital() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    setShowAlert(false);

    if (!username) return setUsernameError("Email is required");
    if (!password) return setPasswordError("Password is required");

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Login Successfully !");
        setAlertType("success");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          navigate("/Home/Dashboard"); 
        }, 1500);
      } else {
        if (data.type === "email") setUsernameError(data.message);
        else if (data.type === "password") setPasswordError(data.message);
        setMessage(data.message);
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (err) {
      setMessage("Server connection failed");
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-cover">
      {showAlert && (
        <div className={`custom-alert ${alertType === "success" ? "success-bg" : "error-bg"}`}>
          <div className="alert-content">
            <span>{message}</span>
            <button className="alert-close-btn" onClick={() => setShowAlert(false)}>×</button>
          </div>
        </div>
      )}

      <div className="log-logo"><Link to="/"><img src={Logo} alt="logo" /></Link></div>

      <div className="log-container">
        <div className="log-img"><img src={log_img} alt="Login" /></div>
        <div className="log-details">
          <div className="log-details-header">
            <h2>SUPER ADMIN</h2>
            <p>Sign into your Account</p>
          </div>
          <form onSubmit={handle} className="log-details-input">
            <div className="input-box">
              <label>User Name</label>
              <div className="input-field">
                <FaUser className="icon" />
                <input type="text" placeholder="User Name" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              {usernameError && <p className="error">{usernameError}</p>}
            </div>
            <div className="input-box">
              <label>Password</label>
              <div className="input-field">
                <FaLock className="icon" />
                <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="eye-icon" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <IoMdEyeOff /> : <IoMdEye />}
                </div>
              </div>
              {passwordError && <p className="error">{passwordError}</p>}
            </div>
            <div className="options">
              <label><input type="checkbox" /> Remember Me</label>
              <Link to="/login/Hospital Admin/forgot-password">Forgot Password?</Link>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Hospital;