import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png"
import { 
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaArrowRight,
  FaCalendarAlt, FaSyringe, FaSignOutAlt, FaHome, FaBell, FaImage, FaCheckDouble, FaTrashAlt 
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import "../components/AddParent.css";

function AddParent() {
  const [activeTab, setActiveTab] = useState("parent");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const [parentData, setParentData] = useState({
    firstName: "", lastName: "", childrenCount: "", email: "",
    phoneNumber: "", relation: "", address1: "", address2: "",
    city: "", state: "", zipCode: ""
  });

  const [children, setChildren] = useState([
    { childName: "", dob: "", premature: "no", expectedDeliveryDate: "", weeksPremature: 0, gender: "", bloodGroup: "", notes: "" }
  ]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (editData) {
      setParentData({
        firstName: editData.firstName || "",
        lastName: editData.lastName || "",
        childrenCount: editData.childrenCount || "",
        email: editData.email || "",
        phoneNumber: editData.phoneNumber || "",
        relation: editData.relation || "",
        address1: editData.address1 || "",
        address2: editData.address2 || "",
        city: editData.city || "",
        state: editData.state || "",
        zipCode: editData.zipCode || ""
      });

      const fetchChildren = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/parents/${editData.id}`);
          const data = await response.json();
          if (data.children && data.children.length > 0) {
            setChildren(data.children.map(c => ({
              ...c,
              premature: c.premature || "no",
              expectedDeliveryDate: c.expectedDeliveryDate ? c.expectedDeliveryDate.split('T')[0] : "",
              dob: c.dob ? c.dob.split('T')[0] : "",
              weeksPremature: c.weeksPremature || 0
            })));
          }
        } catch (error) {
          console.error("Error fetching children:", error);
        }
      };
      fetchChildren();
    }
  }, [editData]);

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentData({ ...parentData, [name]: value });
  };

  const calculateWeeks = (dob, edd) => {
    if (!dob || !edd) return 0;
    const birth = new Date(dob);
    const expected = new Date(edd);
    if (isNaN(birth.getTime()) || isNaN(expected.getTime())) return 0;
    
    const diffTime = expected - birth;
    const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Number.isFinite(weeks) && weeks > 0 ? weeks : 0;
  };

  const handleChildChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChildren = [...children];
    updatedChildren[index][name] = value;

    if (name === "dob" || name === "expectedDeliveryDate") {
      const weeks = calculateWeeks(
        name === "dob" ? value : updatedChildren[index].dob,
        name === "expectedDeliveryDate" ? value : updatedChildren[index].expectedDeliveryDate
      );
      updatedChildren[index].weeksPremature = weeks;
    }
    setChildren(updatedChildren);
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
  };

  const validateChild = (child) => {
    const baseValid = child.childName && child.dob && child.premature && child.gender;
    if (child.premature === "yes") {
      return baseValid && child.expectedDeliveryDate;
    }
    return baseValid;
  };

  const handleNext = () => {
    setIsSubmitted(true); 
    const { firstName, lastName, childrenCount, email, phoneNumber } = parentData;
    if (firstName && lastName && childrenCount && email && phoneNumber) {
      setActiveTab("child");
      setIsSubmitted(false);
    }
  };

  const handleAddMoreChildren = () => {
    setIsSubmitted(true);
    const lastChild = children[children.length - 1];
    if (validateChild(lastChild)) {
      setChildren([...children, { childName: "", dob: "", premature: "no", expectedDeliveryDate: "", weeksPremature: 0, gender: "", bloodGroup: "", notes: "" }]);
      setIsSubmitted(false); 
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    const allValid = children.every(validateChild);

    if (allValid) {
      const sanitizedChildren = children.map(child => {
        const isPremature = child.premature === "yes";
        
        const weeksParsed = parseInt(child.weeksPremature, 10);
        const finalWeeks = Number.isFinite(weeksParsed) ? weeksParsed : 0;

        return {
          ...child,
          expectedDeliveryDate: isPremature && child.expectedDeliveryDate ? child.expectedDeliveryDate : null,
          weeksPremature: isPremature ? finalWeeks : null,
          bloodGroup: child.bloodGroup || null,
          notes: child.notes || null
        };
      });

      const url = editData 
        ? `http://localhost:5000/api/parents/${editData.id}` 
        : "http://localhost:5000/api/parents/add";
      
      const method = editData ? "PUT" : "POST";

      try {
        const response = await fetch(url, {
          method: method,
          headers: { 
            "Accept": "application/json",
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            parentData: parentData, 
            children: sanitizedChildren    
          }),
        });

        if (response.ok) {
          showToast(editData ? "Parent updated successfully !" : "Parent added successfully !", "success");
          setTimeout(() => navigate("/Home/Parent"), 1500); 
        } else {
          const errorData = await response.json();
          showToast(`Server Error: ${errorData.message || "Failed to save"}`, "error");
        }
      } catch (error) {
        showToast("Network Error: Could not connect to the server.", "error");
      }
    } else {
      showToast("Please fill in all required fields.", "error");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="dashboard-wrapper">
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/dashboard" className="nav-link"><FaHome/> <span>Dashboard</span></Link>
          <Link to="/Home/parent" className="nav-link active"><FaUserFriends /> <span>Parents</span></Link>
          <Link to="/Home/children" className="nav-link"><FaChild /> <span>Children</span></Link>
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
              <Link to="/Notifications" style={{ textDecoration:"none", color:"#90E3D8" }}>
                <FaBell /><span className="dot">18</span>
              </Link>
            </div>
            <div className="user-info">
              <Link to="/Profile" style={{ textDecoration: 'none' }}>
                <img src={Profile} alt="profile" className="user-avatar" />
              </Link>
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="form-main-wrapper">
          <div className="table-header-bar">
            <div className="header-titles">
              <h2>{editData ? "Edit Parent Info" : "Add Parent Info"}</h2>
              <p className="breadcrumb">Home / Parents / {editData ? "Edit" : "Add"} Parent Info</p>
            </div>
            <div className="header-back-button" onClick={() => navigate(-1)}>
              <MdArrowBack size={30} />
            </div>
          </div>

          <div className="two-container-layout">
            <div className="upload-container">
              <div className="image-drop-box"><div className="Img-bg-box"><FaImage className="img-icon" /></div><p>Edit/Change<br/>(Drag and Drop)</p></div>
              <button className="upload-link-btn">Upload Picture</button>
            </div>

            <div className="form-data-container">
              <div className="tab-navigation">
                <button className={`tab-link ${activeTab === "parent" ? "active" : ""}`} onClick={() => setActiveTab("parent")}>Parent Info</button>
                <button className={`tab-link ${activeTab === "child" ? "active" : ""}`} onClick={() => setActiveTab("child")}>Child Info</button>
              </div>

              <div className="form-content-padding">
                {activeTab === "parent" ? (
                  <>
                    <div className="form-grid-head">
                      <div className="field-group span">
                        <label>First Name</label>
                        <input type="text" name="firstName" placeholder="First Name" value={parentData.firstName} onChange={handleParentChange} />
                        {isSubmitted && !parentData.firstName && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group span">
                        <label>Last Name</label>
                        <input type="text" name="lastName" placeholder="Last Name" value={parentData.lastName} onChange={handleParentChange} />
                        {isSubmitted && !parentData.lastName && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group span">
                        <label>Children</label>
                        <input type="text" name="childrenCount" placeholder="Ex. 2" value={parentData.childrenCount} onChange={handleParentChange} />
                        {isSubmitted && !parentData.childrenCount && <span className="err-msg">Field is Required</span>}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="field-group">
                        <label>Phone Number</label>
                        <input type="text" name="phoneNumber" placeholder="Enter number" value={parentData.phoneNumber} onChange={handleParentChange} />
                        {isSubmitted && !parentData.phoneNumber && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="youremail@mail.com" value={parentData.email} onChange={handleParentChange} />
                        {isSubmitted && !parentData.email && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group">
                        <label>Relation</label>
                        <select name="relation" value={parentData.relation} onChange={handleParentChange}>
                          <option value="">Select Relation</option>
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                        </select>
                      </div>
                      <div className="field-group"><label>Address line 1</label><input type="text" name="address1" placeholder="Enter the Address Line 1" value={parentData.address1} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>Address line 2</label><input type="text" name="address2" placeholder="Enter the Address Line 2" value={parentData.address2} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>City</label><input type="text" name="city" placeholder="Enter the City" value={parentData.city} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>State</label><input type="text" name="state" placeholder="Enter the State" value={parentData.state} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>Zip Code</label><input type="text" name="zipCode" placeholder="Enter the Zip Code" value={parentData.zipCode} onChange={handleParentChange} /></div>
                    </div>
                  </>
                ) : (
                  <div className="children-list">
                    {children.map((child, index) => (
                      <div key={index} className="child-form-section">
                        <div className="child-header-row">
                          <h4 className="child-count-header">Child {index + 1}</h4>
                          {children.length > 1 && (
                            <button type="button" className="remove-child-btn" onClick={() => handleRemoveChild(index)}>
                              <FaTrashAlt /> Remove
                            </button>
                          )}
                        </div>
                        <div className="form-grid">
                          <div className="field-group">
                            <label>Child Name</label>
                            <input type="text" name="childName" placeholder="Child Name" value={child.childName} onChange={(e) => handleChildChange(index, e)} />
                            {isSubmitted && !child.childName && <span className="err-msg">Field is Required</span>}
                          </div>
                          <div className="field-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={child.dob} onChange={(e) => handleChildChange(index, e)} max={today} />
                            {isSubmitted && !child.dob && <span className="err-msg">Field is Required</span>}
                          </div>
                          <div className="field-group span-2">
                            <label>Is your baby premature?</label>
                            <div className="radio-group">
                              <label>
                                <input type="radio" name={`premature-${index}`} value="yes" checked={child.premature === "yes"} 
                                  onChange={() => handleChildChange(index, {target: {name: 'premature', value: 'yes'}})} 
                                /> Yes
                              </label>
                              <label>
                                <input type="radio" name={`premature-${index}`} value="no" checked={child.premature === "no"} 
                                  onChange={() => {
                                    const updated = [...children];
                                    updated[index].premature = "no";
                                    updated[index].expectedDeliveryDate = "";
                                    updated[index].weeksPremature = 0;
                                    setChildren(updated);
                                  }} 
                                /> No
                              </label>
                            </div>
                            {isSubmitted && !child.premature && <span className="err-msg">Field is Required</span>}
                          </div>

                          {child.premature === "yes" && (
                            <>
                              <div className="field-group">
                                <label>Expected Date of Delivery</label>
                                <input type="date" name="expectedDeliveryDate" value={child.expectedDeliveryDate} onChange={(e) => handleChildChange(index, e)} min={child.dob} />
                                {isSubmitted && !child.expectedDeliveryDate && <span className="err-msg">Field is Required</span>}
                              </div>
                              <div className="field-group">
                                <label>Number of weeks premature</label>
                                <input type="number" name="weeksPremature" value={child.weeksPremature} readOnly className="readonly-input" />
                              </div>
                            </>
                          )}
                          <div className="field-group">
                            <label>Gender</label>
                            <select name="gender" value={child.gender} onChange={(e) => handleChildChange(index, e)}>
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            {isSubmitted && !child.gender && <span className="err-msg">Field is Required</span>}
                          </div>
                          <div className="field-group">
                            <label>Blood Group</label>
                            <select name="bloodGroup" value={child.bloodGroup} onChange={(e) => handleChildChange(index, e)}>
                              <option value="">Select Blood group</option>
                              <option value="A+">A+</option><option value="A-">A-</option>
                              <option value="B+">B+</option><option value="B-">B-</option>
                              <option value="AB+">AB+</option><option value="AB-">AB-</option>
                              <option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                          </div>
                          <div className="field-group full">
                            <label>Notes</label>
                            <textarea name="notes" value={child.notes} onChange={(e) => handleChildChange(index, e)} rows="2" />
                          </div>
                        </div>
                        {index !== children.length - 1 && <hr className="child-divider" />}
                      </div>
                    ))}
                    <div className="add-child-container">
                      <button className="add-child-btn-alt" type="button" onClick={handleAddMoreChildren}>+ Add Children</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions-row">
                {activeTab === "parent" ? (
                  <button className="next-btn-action" onClick={handleNext}><FaArrowRight/> Next</button>
                ) : (
                  <div className="final-actions">
                    <button className="prev-btn" onClick={() => setActiveTab("parent")}>&larr; Prev</button>
                    <button className="submit-btn-action" onClick={handleSubmit}><FaCheckDouble/> {editData ? "Update" : "Submit"}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddParent;

