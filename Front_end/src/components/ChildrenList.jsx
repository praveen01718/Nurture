import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import { 
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaUser,
  FaCalendarAlt, FaSignOutAlt, FaBell, FaHome,
  FaSearch, FaFilter, FaPlusSquare, FaHospitalUser, FaPlus, FaFileAlt,
  FaTimes, FaChartLine, FaWeight, FaSyringe, FaCheck
} from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { VscGraph } from "react-icons/vsc";
import { TbVaccine } from "react-icons/tb";
import { MdArrowBack } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import {
  VACCINATION_HEADERS,
  buildVaccinationScheduleRows,
  formatDoseText
} from "../constants/vaccinationSchedule";
import "./ChildrenList.css";

const VaccinationScheduleModal = ({ isOpen, onClose, childName, childId }) => {
  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchVaccinations = async () => {
      if (!isOpen || !childId) {
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await axios.get(`http://localhost:5000/api/vaccinations/child/${childId}`);
        setVaccinations(response.data);
      } catch (error) {
        console.error("Error fetching vaccination records:", error);
        setVaccinations([]);
        setLoadError("Unable to load vaccination records right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaccinations();
  }, [isOpen, childId]);

  if (!isOpen) return null;

  const scheduleRows = buildVaccinationScheduleRows(vaccinations);

  return (
    <div className="vax-modal-overlay" onClick={onClose}>
      <div className="vax-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="vax-modal-header">
          <h3>{childName}'s Vaccination</h3>
          <button className="vax-close-btn" onClick={onClose}><FaTimes size={16} /></button>
        </div>
        <div className="vax-scroll-viewport">
          <table className="vax-table">
            <thead>
              <tr>
                {VACCINATION_HEADERS.map((h, i) => (
                  <th key={i} className={i === 0 ? "vax-sticky-col" : ""}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="vax-table-state" colSpan={VACCINATION_HEADERS.length}>
                    Loading vaccination records...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td className="vax-table-state" colSpan={VACCINATION_HEADERS.length}>
                    {loadError}
                  </td>
                </tr>
              ) : (
                scheduleRows.map((vaccine, i) => (
                  <tr key={i}>
                    <td className="vax-name-cell vax-sticky-col">{vaccine.name}</td>
                    {VACCINATION_HEADERS.slice(1).map((headerLabel, idx) => {
                      const dose = vaccine.doses.find((item) => item.age === headerLabel) || null;

                      return (
                        <td key={idx}>
                          {dose && (
                            <div className={`vax-dose-card ${dose.status}-bg`}>
                              <span className="vax-dose-text">{formatDoseText(dose.label)}</span>
                              <div className={`vax-status-indicator ${dose.status}`}>
                                {dose.status === "done" ? <FaCheck size={8} /> : <FaTimes size={8} />}
                              </div>
                              {dose.date && <span className="vax-date-text">{dose.date}</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MedicalInfoModal = ({ isOpen, onClose, childName, childId }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleItemClick = (label) => {
    if (label === "Add Measurement") navigate(`/Home/children/${childId}/add_measurement`);
    else if (label === "Add Vaccination") navigate(`/Home/children/${childId}/add_vaccination`);
    else onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{childName}'s Add Medical Info</span>
          <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-grid">
          {[
            { label: "Add Development", icon: <FaChartLine /> },
            { label: "Add Measurement", icon: <FaWeight /> },
            { label: "Add Medical Issues", icon: <FaHospitalUser /> },
            { label: "Add Vaccination", icon: <FaSyringe /> },
          ].map((item, index) => (
            <div key={index} className="modal-card" onClick={() => handleItemClick(item.label)}>
              <div className="modal-card-icon">{item.icon}</div>
              <span className="modal-card-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function ChildrenList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaxModalOpen, setIsVaxModalOpen] = useState(false);
  const [selectedChildName, setSelectedChildName] = useState("");
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Child-datas/list");
        setChildren(response.data);
      } catch (error) { console.error(error); }
    };
    fetchChildren();
  }, []);

  const openMedicalModal = (id, name) => {
    setSelectedChildId(id);
    setSelectedChildName(name);
    setIsModalOpen(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--; months += 12;
    }
    return years < 1 ? `${months} Mos` : `${years} Yrs`;
  };

  const filteredChildren = children.filter(child =>
    child.childName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/Dashboard" className="nav-link"><FaHome /> <span>Dashboard</span></Link>
          <Link to="/Home/Parent" className="nav-link"><FaUserFriends /> <span>Parents</span></Link>
          <Link to="/Home/children" className="nav-link active"><FaChild /> <span>Children</span></Link>
          <Link to="/Home/physician" className="nav-link"><FaUserMd /> <span>Physician</span></Link>
          <Link to="/Home/appointments" className="nav-link"><FaCalendarAlt /> <span>Appointments</span></Link>
          <Link to="/Home/vaccination" className="nav-link"><RiCalendarScheduleFill /> <span>Vaccination Schedule</span></Link>
          <Link to="/logout" className="nav-link logout-link"><FaSignOutAlt /> <span>Logout</span></Link>
        </nav>
      </aside>

      <div className="content-area">
        <header className="top-nav">
          <div className="top-right">
            <div className="notif-box"><FaBell /><span className="dot">18</span></div>
            <div className="user-info">
              <img src={Profile} alt="profile" className="user-avatar" />
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
            <div className="header-back-button" onClick={() => navigate("/Home/Dashboard")}><MdArrowBack size={20} /></div>
          </div>

          <div className="table-controls">
            <div className="search-side">
              <div className="search-box">
                <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="search-btn-child"><FaSearch className="icon-search" /></button>
                <button className="filter-btn"><FaFilter /> Filter</button>
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
              {filteredChildren.map((child) => {
                const stats = child.measurements?.[0] || {};
                const isBoy = child.gender?.toLowerCase() === "boy";
                return (
                  <tr key={child.id}>
                    <td className="child-info-cell">
                      <div className="child-avatar" style={{ borderColor: isBoy ? "#87CEEB" : "#FFC0CB" }}>
                        {child.profileImage ? (
                          <img src={`http://localhost:5000/uploads/${child.profileImage}`} alt="profile" />
                        ) : ( <FaUser style={{ color: 'white', fontSize: '24px' }} /> )}
                      </div>
                      <div className="child-details-stack">
                        <span className="child-name-text">{child.childName}</span>
                        <span className="gender-age-text">
                          <span style={{ color: isBoy ? "#87CEEB" : "#FFC0CB" }}>{child.gender}</span>
                          <span style={{ color: "#000" }}> - {calculateAge(child.dob)}</span>
                        </span>
                        <div className="child-action-row">
                          <VscGraph className="action-icon icon-analysis" />
                          <TbVaccine 
                            className="action-icon icon-vaccine" 
                            onClick={() => {
                              setSelectedChildId(child.id);
                              setSelectedChildName(child.childName);
                              setIsVaxModalOpen(true);
                            }} 
                          />
                          <FaHospitalUser className="action-icon icon-patient" />
                          <SlCalender className="action-icon icon-date" />
                          <button className="btn-mini-add" onClick={() => openMedicalModal(child.id, child.childName)}>
                            <FaPlus /> Add
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="centered-muted">{stats.weight ? `${stats.weight}kg` : "-"}</td>
                    <td className="centered-muted">{stats.deviceName || "--"}</td>
                    <td className="centered-muted">{stats.length ? `${stats.length}cm` : "-"}</td>
                    <td className="centered-muted">{stats.head_circumference ? `${stats.head_circumference}cm` : "-"}</td>
                    <td className="blood-cell">{child.bloodGroup}</td>
                    <td><FaFileAlt className="description-icon" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MedicalInfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        childName={selectedChildName} 
        childId={selectedChildId} 
      />
      
      <VaccinationScheduleModal 
        isOpen={isVaxModalOpen} 
        onClose={() => setIsVaxModalOpen(false)} 
        childName={selectedChildName} 
        childId={selectedChildId}
      />
    </div>
  );
}

export default ChildrenList;
