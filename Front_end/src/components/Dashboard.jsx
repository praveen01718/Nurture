import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import { 
  FaThLarge, FaUserFriends, FaChild, FaUserMd, 
  FaCalendarAlt, FaSignOutAlt, FaBell, FaHome 
} from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import SidebarNav from "./SidebarNav";
import "../components/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <SidebarNav />

      <div className="content-area">
        <header className="top-nav">
          <div className="top-right">
            <div className="notif-box">
              <Link to="/Notifications" style={{ textDecoration:"none", color:"#90E3D8" }}>
                <FaBell /><span className="dot">18</span>
              </Link>
            </div>
            <div className="user-info">
              <Link to="/Profile"><img src={Profile} alt="profile" className="user-avatar" /></Link>
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="table-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', color: '#333', fontWeight: '700' }}>
              Welcome to my Dashboard
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
