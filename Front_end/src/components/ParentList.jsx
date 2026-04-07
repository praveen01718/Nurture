import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import { 
  FaThLarge, FaUserFriends, FaChild, FaUserMd, 
  FaCalendarAlt, FaSignOutAlt, FaSearch, 
  FaChartBar, FaEdit, FaTrash, FaPlusSquare, FaBell, FaHome, FaUser,
} from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { VscError } from "react-icons/vsc";
import { MdArrowBack, } from "react-icons/md";
import "../components/ParentList.css";

function ParentList() {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchParents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/parents");
      setParents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast("Failed to load parent records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (parent) => {
    navigate("/Home/Parents/Add_parent", { state: { editData: parent } });
  };

  const requestDelete = (parent) => {
    setSelectedParent(parent);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const response = await axios.delete(`http://localhost:5000/api/parents/${selectedParent.id}`);
      if (response.data.success) {
        showToast("Record deleted successfully !", "success");
        fetchParents();
      }
    } catch (error) {
      showToast("Server Error: Could not delete record.", "error");
    }
  };

  const filteredParents = parents.filter(parent => {
    const fullName = `${parent.firstName || ""} ${parent.lastName || ""}`.toLowerCase();
    const email = (parent.email || "").toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="dashboard-wrapper">
      {toast.show && <div className={`custom-toast ${toast.type}`}>{toast.message}</div>}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-icon">
              <VscError size={40} color="#ff4d4d" />
            </div>
            <h4>Are you sure?</h4>
            <p>Do you really want to delete these records? This process cannot be undone.</p>
            <hr className="modal-divider" />
            <div className="modal-buttons" id="model-btn">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="confirm-btn btn-red" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/Dashboard" className="nav-link"><FaHome/> <span>Dashboard</span></Link>
          <Link to="/Home/Parent" className="nav-link active"><FaUserFriends /> <span>Parents</span></Link>
          <Link to="/Home/children" className="nav-link"><FaChild /> <span>Children</span></Link>
          <Link to="/Home/physician" className="nav-link"><FaUserMd /> <span>Physician</span></Link>
          <Link to="/Home/appointments" className="nav-link"><FaCalendarAlt /> <span>Appointments</span></Link>
          <Link to="/Home/vaccination" className="nav-link"><RiCalendarScheduleFill /> <span>Vaccination Schedule</span></Link>
          <Link to="/logout" className="nav-link logout-link"><FaSignOutAlt /> <span>Logout</span></Link>
        </nav>
      </aside>

      <div className="content-area">
        <header className="top-nav">
          <div className="top-right">
            <div className="notif-box">
              <Link to="/Notifications"><FaBell className="Notifications" /><span className="dot">18</span></Link>
            </div>
            <div className="user-info">
              <Link to="/Profile"><img src={Profile} alt="profile" className="user-avatar" /></Link>
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="table-container">
          <div className="table-header-bar-parent">
            <div className="header-titles">
              <h2>Parents</h2>
              <p className="breadcrumb">Home / Parents</p>
            </div>
            <div className="header-back-button" onClick={() => navigate(-1)}><MdArrowBack size={30} /></div>
          </div>

          <div className="table-controls">
            <div className="search-box">
              <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className="search-btn"><FaSearch style={{marginBottom:'20px'}}/></button>
            </div>
            <div className="action-btns">
              <select className="sort-select">
                <option>Sort by</option>
                <option value="name">Name</option>
                <option value="newest">Newest</option>
              </select>
              <Link to="/Home/Parents/Add_parent" style={{ textDecoration: 'none' }}>
                <button className="add-btn"><FaPlusSquare /> Add Parent</button>
              </Link>
            </div>
          </div>

          <table className="nurture-table">
            <thead>
              <tr>
                <th>Parent Name</th>
                <th>Analytics</th>
                <th>Children</th>
                <th>Contact Number</th>
                <th>Email Address</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>Loading...</td></tr>
              ) : filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <tr key={parent.id}>
                    <td className="user-td">
                      <div className="avatar-circle">
                        {parent.profileImage ? (
                          <img 
                            src={`http://localhost:5000/${parent.profileImage}`} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <FaUser style={{color: 'white', fontSize: '18px', marginTop: '5px', marginLeft: '5px' }} />
                        )}
                      </div>
                      <span className="name-text">{parent.firstName} {parent.lastName}</span>
                    </td>
                    <td><FaChartBar className="analytic-icon"/></td>
                    <td>{parent.childrenCount || 0}</td>
                    <td>{parent.phoneNumber || '-'}</td>
                    <td className="email-link" style={{color:'#0000FF'}}>{parent.email}</td>
                    <td>{parent.city}, {parent.state}</td>
                    <td className="action-td">
                      <FaEdit className="edit-icon" onClick={() => handleEdit(parent)} />
                      <FaTrash className="delete-icon" onClick={() => requestDelete(parent)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ParentList;