import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaArrowRight,
  FaCalendarAlt, FaSignOutAlt, FaHome, FaBell, FaImage, FaCheckDouble
} from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { MdArrowBack } from "react-icons/md";
import "../components/AddParent.css";

function AddParent() {
  const [activeTab, setActiveTab] = useState("parent");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [allParents, setAllParents] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/parents");
        if (response.ok) {
          const data = await response.json();
          setAllParents(data);
        }
      } catch (error) {
        console.error("Validation fetch error:", error);
      }
    };
    fetchParents();
  }, []);

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
      
      if (editData.profileImage) {
        setPreviewUrl(`http://localhost:5000/${editData.profileImage}`);
        setUploadedImagePath(editData.profileImage);
      }

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

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleIconClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadButtonClick = async () => {
    if (!selectedImage) {
      showToast("Please select an image first.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("profileImage", selectedImage);
    try {
      const response = await fetch("http://localhost:5000/api/parents/upload-temp", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedImagePath(data.filePath);
        showToast("Image uploaded successfully !", "success");
      }
    } catch (error) {
      showToast("Error uploading image.", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
    return weeks > 0 ? weeks : 0;
  };

  const handleChildChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChildren = [...children];
    updatedChildren[index][name] = value;
    if (name === "dob" || name === "expectedDeliveryDate") {
      updatedChildren[index].weeksPremature = calculateWeeks(
        name === "dob" ? value : updatedChildren[index].dob,
        name === "expectedDeliveryDate" ? value : updatedChildren[index].expectedDeliveryDate
      );
    }
    setChildren(updatedChildren);
  };

  const validateChild = (child) => {
    const baseValid = child.childName && child.dob && child.premature && child.gender;
    return child.premature === "yes" ? (baseValid && child.expectedDeliveryDate) : baseValid;
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
    if (validateChild(children[children.length - 1])) {
      setChildren([...children, { childName: "", dob: "", premature: "no", expectedDeliveryDate: "", weeksPremature: 0, gender: "", bloodGroup: "", notes: "" }]);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    const isDuplicateEmail = allParents.some(p => p.email.toLowerCase() === parentData.email.toLowerCase() && p.id !== editData?.id);
    const isDuplicatePhone = allParents.some(p => p.phoneNumber === parentData.phoneNumber && p.id !== editData?.id);

    if (isDuplicateEmail) return alert("Email already exists for another parent.");
    if (isDuplicatePhone) return alert("Phone number already exists for another parent.");

    if (children.every(validateChild)) {
      const payload = {
        parentData: { ...parentData, profileImage: uploadedImagePath },
        children: children
      };

      const url = editData ? `http://localhost:5000/api/parents/${editData.id}` : "http://localhost:5000/api/parents/add";
      try {
        const response = await fetch(url, {
          method: editData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          showToast(editData ? "Parent updated successfully !" : "Parent added successfully !", "success");
          setTimeout(() => navigate("/Home/Parent"), 1500);
        }
      } catch (error) {
        showToast("Network Error.", "error");
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="dashboard-wrapper">
      {toast.show && <div className={`custom-toast ${toast.type}`}>{toast.message}</div>}

      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/dashboard" className="nav-link"><FaHome /> <span>Dashboard</span></Link>
          <Link to="/Home/parent" className="nav-link active"><FaUserFriends /> <span>Parents</span></Link>
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
              <Link to="/Notifications" className="Notifications">
                <FaBell /><span className="dot">18</span>
              </Link>
            </div>
            <div className="user-info">
              <Link to="/Profile"><img src={Profile} alt="profile" className="user-avatar" /></Link>
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="form-main-wrapper">
          <div className="table-header-bar-addParent">
            <div className="header-titles">
              <h2>{editData ? "Edit Parent Info" : "Add Parent Info"}</h2>
              <p className="breadcrumb">Home / Parents / {editData ? "Edit" : "Add"} Parent Info</p>
            </div>
            <div className="header-back-button" onClick={() => navigate("/Home/Parent")}>
              <MdArrowBack size={20} />
            </div>
          </div>

          <div className="two-container-layout">
            <div className="upload-container">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
              <div className="image-drop-box" onClick={handleIconClick} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                <div className="Img-bg-box">
                  {previewUrl ? <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <FaImage className="img-icon" />}
                </div>
                <p>Edit/Change<br />(Drag and Drop)</p>
              </div>
              <button className="upload-link-btn" onClick={handleUploadButtonClick}>Upload Picture</button>
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
                        <input type="text" placeholder="First Name" name="firstName" value={parentData.firstName} onChange={handleParentChange} />
                        {isSubmitted && !parentData.firstName && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group span">
                        <label>Last Name</label>
                        <input type="text" placeholder="Last Name" name="lastName" value={parentData.lastName} onChange={handleParentChange} />
                        {isSubmitted && !parentData.lastName && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group span">
                        <label>Children</label>
                        <input type="text" placeholder="Children" name="childrenCount" value={parentData.childrenCount} onChange={handleParentChange} />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="field-group">
                        <label>Phone Number</label>
                        <input type="text" placeholder="Enter the Phone Number" name="phoneNumber" value={parentData.phoneNumber} onChange={handleParentChange} />
                        {isSubmitted && !parentData.phoneNumber && <span className="err-msg">Field is Required</span>}
                      </div>
                      <div className="field-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="youremail@mail.com" name="email" value={parentData.email} onChange={handleParentChange} />
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
                      <div className="field-group"><label>Address 1</label><input type="text" placeholder="Enter the Address Line 1" name="address1" value={parentData.address1} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>Address 2</label><input type="text" placeholder="Enter the Address Line 2" name="address2" value={parentData.address2} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>City</label><input type="text" placeholder="Enter the City" name="city" value={parentData.city} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>State</label><input type="text" placeholder="Enter the State" name="state" value={parentData.state} onChange={handleParentChange} /></div>
                      <div className="field-group"><label>Zip Code</label><input type="text" placeholder="Enter the Zip Code" name="zipCode" value={parentData.zipCode} onChange={handleParentChange} /></div>
                    </div>
                  </>
                ) : (
                  <div className="children-list">
                    {children.map((child, index) => (
                      <div key={index} className="child-form-section">
                        <div className="form-grid">
                          <div className="field-group">
                            <label>Child Name</label>
                            <input type="text" placeholder="Child Name" name="childName" value={child.childName} onChange={(e) => handleChildChange(index, e)} />
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
                              <label><input type="radio" checked={child.premature === "yes"} onChange={() => handleChildChange(index, { target: { name: 'premature', value: 'yes' } })} /> Yes</label>
                              <label><input type="radio" checked={child.premature === "no"} onChange={() => {
                                const updated = [...children];
                                updated[index].premature = "no";
                                updated[index].expectedDeliveryDate = "";
                                updated[index].weeksPremature = 0;
                                setChildren(updated);
                              }} /> No</label>
                            </div>
                            {isSubmitted && !child.premature && <span className="err-msg">Field is Required</span>}
                          </div>
                          {child.premature === "yes" && (
                            <>
                              <div className="field-group">
                                <label>Expected Delivery of Date</label>
                                <input type="date" name="expectedDeliveryDate" value={child.expectedDeliveryDate} onChange={(e) => handleChildChange(index, e)} min={child.dob} />
                                {isSubmitted && !child.expectedDeliveryDate && <span className="err-msg">Field is Required</span>}
                              </div>
                              <div className="field-group">
                                <label>Number of weeks Premature</label>
                                <input type="number" value={child.weeksPremature} readOnly />
                              </div>
                            </>
                          )}
                          <div className="field-group">
                            <label>Gender</label>
                            <select name="gender" value={child.gender} onChange={(e) => handleChildChange(index, e)}>
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            {isSubmitted && !child.gender && <span className="err-msg">Field is Required</span>}
                          </div>
                          <div className="field-group">
                            <label>Blood Group</label>
                            <select name="bloodGroup" value={child.bloodGroup} onChange={(e) => handleChildChange(index, e)}>
                              <option value="">Select</option>
                              <option value="A+">A+</option><option value="A-">A-</option>
                              <option value="B+">B+</option><option value="B-">B-</option>
                              <option value="AB+">AB+</option><option value="AB-">AB-</option>
                              <option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                          </div>
                          <div className="field-group full"><label>Notes</label><textarea name="notes" value={child.notes} onChange={(e) => handleChildChange(index, e)} rows="2" /></div>
                        </div>
                        {index !== children.length - 1 && <hr className="child-divider" />}
                      </div>
                    ))}
                    <div className="add-child-container" style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                      {children.length > 1 && <button className="delete-child-btn" type="button" onClick={() => setChildren(children.slice(0, -1))}>× Delete Children</button>}
                      <button className="add-child-btn-alt" type="button" onClick={handleAddMoreChildren}>+ Add Children</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions-row">
                {activeTab === "parent" ? (
                  <button className="next-btn-action" onClick={handleNext}><FaArrowRight /> Next</button>
                ) : (
                  <div className="final-actions">
                    <button className="prev-btn" onClick={() => setActiveTab("parent")}>&larr; Prev</button>
                    <button className="submit-btn-action" onClick={handleSubmit}><FaCheckDouble /> {editData ? "Update" : "Submit"}</button>
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