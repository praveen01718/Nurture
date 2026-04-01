import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import { 
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaUser,
  FaCalendarAlt, FaSyringe, FaSignOutAlt, FaBell, FaHome,
  FaSearch, FaFilter, FaPlusSquare, FaHospitalUser, FaPlus, FaFileAlt
} from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { TbVaccine } from "react-icons/tb";
import { MdArrowBack } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import "./ChildrenList.css";

function ChildrenList() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/children");
        const data = response.data.success ? response.data.data : response.data;
        setChildren(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch children data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const filteredChildren = children.filter(child => 
    child.childName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age < 1 ? "Infant" : `${age} Yrs`;
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/Dashboard" className="nav-link"><FaHome/> <span>Dashboard</span></Link>
          <Link to="/Home/Parent" className="nav-link "><FaUserFriends /> <span>Parents</span></Link>
          <Link to="/Home/children" className="nav-link active"><FaChild /> <span>Children</span></Link>
          <Link to="/Home/physician" className="nav-link"><FaUserMd /> <span>Physician</span></Link>
          <Link to="/Home/appointments" className="nav-link"><FaCalendarAlt /> <span>Appointments</span></Link>
          <Link to="/Home/vaccination" className="nav-link"><FaSyringe /> <span>Vaccination Schedule</span></Link>
          <Link to="/logout" className="nav-link logout-link"><FaSignOutAlt /> <span>Logout</span></Link>
        </nav>
      </aside>

      <div className="content-area">
        <header className="top-nav">
          <div className="top-right">
            <div className="notif-box">
              <Link to="/Notifications" className="Notifications"><FaBell /><span className="dot">18</span></Link>
            </div>
            <div className="user-info">
              <Link to="/Profile"><img src={Profile} alt="profile" className="user-avatar" /></Link>
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="table-container">
          <div className="table-header-bar-children">
            <div className="header-titles">
              <h2>Children</h2>
              <p className="breadcrumb">Home / Children</p>
            </div>
            <div className="header-back-button" onClick={() => navigate(-1)}><MdArrowBack size={20} /></div>
          </div>

          <div className="table-controls">
            <div className="search-side">
                <div className="search-box">
                    <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className="search-btn-child"><FaSearch className="icon-search"/></button>
                <button className="filter-btn"><FaFilter/> Filter</button>
                </div>  
            </div>
            <div className="action-btns">
              <select className="sort-select"><option>Sort by</option></select>
              <Link to="/Home/children/add_child" className="add-btn"><FaPlusSquare /> Add Child</Link>
            </div>
          </div>

          <table className="nurture-table">
            <thead>
              <tr>
                <th>Children Details</th>
                <th>Weight</th>
                <th>Device Name</th>
                <th>Length</th>
                <th>Head Circumference</th>
                <th>Blood Group</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="loading-row">Loading...</td></tr>
              ) : filteredChildren.length > 0 ? (
                filteredChildren.map((child) => (
                  <tr key={child.id}>
                    <td className="child-info-cell">
                      <div className="child-avatar">
                        {child.profileImage ? (
                          <img src={`http://localhost:5000/${child.profileImage}`} alt="child" className="avatar-img" />
                        ) : (
                          <FaUser style={{ color: 'white', fontSize: '18px' }} />
                        )}
                      </div>
                      <div className="child-details-stack">
                        <span className="child-name-text">{child.childName}</span>
                        <span className={`gender-age-text ${child.gender?.toLowerCase()}`}>
                          {child.gender} - {calculateAge(child.dob)}
                        </span>
                        <div className="child-action-row">
                          <VscGraph className="action-icon icon-analysis" />
                          <TbVaccine className="action-icon icon-vaccine" />
                          <FaHospitalUser className="action-icon icon-patient" />
                          <SlCalender className="action-icon icon-date" />
                          <button className="btn-mini-add"><FaPlus /> Add</button>
                        </div>
                      </div>
                    </td>
                    <td className="centered-muted">{child.weight || "-"}</td>
                    <td className="centered-muted">{child.device || "-"}</td>
                    <td className="centered-muted">{child.length || "-"}</td>
                    <td className="centered-muted">{child.head || "-"}</td>
                    <td className="blood-cell">{child.bloodGroup || "-"}</td>
                    <td><FaFileAlt className="description-icon" /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="loading-row">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ChildrenList;