import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaArrowRight,
  FaCalendarAlt, FaSyringe, FaSignOutAlt, FaHome, FaBell, FaImage, FaCheckDouble
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import "./AddChild.css";

function AddChild() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState("child");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    childName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    isPremature: "no",
    expectedDate: "",
    weeksPremature: 0,
    firstName: "",
    lastName: "",
    childrenCount: "",
    phone: "",
    email: "",
    relation: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    note: ""
  });

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  useEffect(() => {
    if (formData.dob && formData.expectedDate && formData.isPremature === "yes") {
      const birth = new Date(formData.dob);
      const expected = new Date(formData.expectedDate);
      if (expected > birth) {
        const diffWeeks = Math.floor(Math.abs(expected - birth) / (1000 * 60 * 60 * 24 * 7));
        setFormData((prev) => ({ ...prev, weeksPremature: diffWeeks }));
      } else {
        setFormData((prev) => ({ ...prev, weeksPremature: 0 }));
      }
    }
  }, [formData.dob, formData.expectedDate, formData.isPremature]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateChildInfo = () => {
    let newErrors = {};
    if (!formData.childName) newErrors.childName = "Field is required";
    if (!formData.dob) newErrors.dob = "Field is required";
    if (!formData.gender) newErrors.gender = "Field is required";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Field is required";
    if (formData.isPremature === "yes" && !formData.expectedDate)
      newErrors.expectedDate = "Field is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateParentInfo = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Field is required";
    if (!formData.lastName) newErrors.lastName = "Field is required";
    if (!formData.phone) newErrors.phone = "Field is required";
    if (!formData.email) newErrors.email = "Field is required";
    if (!formData.relation) newErrors.relation = "Field is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateChildInfo()) setActiveTab("parent");
  };

  const handleSubmit = async () => {
    if (validateParentInfo()) {
      try {
        const submissionData = new FormData();

        Object.keys(formData).forEach((key) => {
          submissionData.append(key, formData[key]);
        });

        if (selectedFile) {
          submissionData.append("profileImage", selectedFile);
        }

        const response = await axios.post(
          "http://localhost:5000/api/children/add",
          submissionData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 201 || response.status === 200) {
          alert("Form Submitted Successfully!");
          navigate("/Home/children");
        }
      } catch (error) {
        console.error("Submission Error:", error);
        alert("An error occurred while submitting the form. Please try again.");
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon">
            <FaThLarge />
          </button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/Dashboard" className="nav-link">
            <FaHome /> <span>Dashboard</span>
          </Link>
          <Link to="/Home/Parent" className="nav-link ">
            <FaUserFriends /> <span>Parents</span>
          </Link>
          <Link to="/Home/children" className="nav-link active">
            <FaChild /> <span>Children</span>
          </Link>
          <Link to="/Home/physician" className="nav-link">
            <FaUserMd /> <span>Physician</span>
          </Link>
          <Link to="/Home/appointments" className="nav-link">
            <FaCalendarAlt /> <span>Appointments</span>
          </Link>
          <Link to="/Home/vaccination" className="nav-link">
            <FaSyringe /> <span>Vaccination Schedule</span>
          </Link>
          <Link to="/logout" className="nav-link logout-link">
            <FaSignOutAlt /> <span>Logout</span>
          </Link>
        </nav>
      </aside>

      <div className="content-area">
        <header className="top-nav">
          <div className="top-right">
            <div className="notif-box">
              <FaBell />
              <span className="dot">18</span>
            </div>
            <div className="user-info">
              <img src={Profile} alt="profile" className="user-avatar" />
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <div className="table-header-bar">
          <div className="header-titles">
            <h2>{activeTab === "child" ? "Child Info" : "Parent Info"}</h2>
            <p className="breadcrumb">
              Home / Children /{" "}
              {activeTab === "child" ? "Child Info" : "Parent Info"}
            </p>
          </div>
          <button className="header-back-button" onClick={() => navigate(-1)}>
            <MdArrowBack style={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="add-child-main-layout">
          <div className="upload-side-card">
            <div
              className={`upload-inner ${isDragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files[0])}
                hidden
                accept="image/*"
              />
              <div className="image-frame">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" />
                ) : (
                  <FaImage className="placeholder-img-icon" />
                )}
              </div>
              <p>
                Edit/Change
                <br />
                (Drag and Drop)
              </p>
            </div>
            <button
              className="upload-text-link"
              onClick={() => fileInputRef.current.click()}
            >
              Upload Picture
            </button>
          </div>

          <div className="form-side-container">
            <div className="tab-switcher">
              <button
                className={`tab-item ${activeTab === "child" ? "active" : ""}`}
                onClick={() => setActiveTab("child")}
              >
                Child Info
              </button>
              <button
                className={`tab-item ${activeTab === "parent" ? "active" : ""}`}
                onClick={() => setActiveTab("parent")}
              >
                Parent Info
              </button>
            </div>

            <div className="form-card-body">
              {activeTab === "child" ? (
                <div className="child-form-grid">
                  <div className="form-input-group">
                    <label>Child Name</label>
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      placeholder="Child Name"
                    />
                    {errors.childName && (
                      <span className="error-msg">{errors.childName}</span>
                    )}
                  </div>
                  <div className="form-input-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      max={today}
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                    {errors.dob && (
                      <span className="error-msg">{errors.dob}</span>
                    )}
                  </div>
                  <div className="form-input-group">
                    <label>Is your baby premature?</label>
                    <div className="premature-radios">
                      <label>
                        <input
                          type="radio"
                          name="isPremature"
                          value="yes"
                          checked={formData.isPremature === "yes"}
                          onChange={handleInputChange}
                        />{" "}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="isPremature"
                          value="no"
                          checked={formData.isPremature === "no"}
                          onChange={handleInputChange}
                        />{" "}
                        No
                      </label>
                    </div>
                  </div>
                  {formData.isPremature === "yes" && (
                    <>
                      <div className="form-input-group">
                        <label>Expected Date of Delivery</label>
                        <input
                          type="date"
                          name="expectedDate"
                          min={formData.dob || today}
                          value={formData.expectedDate}
                          onChange={handleInputChange}
                        />
                        {errors.expectedDate && (
                          <span className="error-msg">{errors.expectedDate}</span>
                        )}
                      </div>
                      <div className="form-input-group">
                        <label>Number of weeks Premature</label>
                        <input
                          type="text"
                          readOnly
                          value={`${formData.weeksPremature} Weeks`}
                          className="readonly-input"
                        />
                      </div>
                    </>
                  )}
                  <div className="form-input-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Boy">Boy</option>
                      <option value="Girl">Girl</option>
                    </select>
                    {errors.gender && (
                      <span className="error-msg">{errors.gender}</span>
                    )}
                  </div>
                  <div className="form-input-group">
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && (
                      <span className="error-msg">{errors.bloodGroup}</span>
                    )}
                  </div>
                  <div className="form-input-group full-width">
                    <label>Note</label>
                    <textarea
                      name="note"
                      className="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="form-footer-actions full-width">
                    <button className="next-action-btn" onClick={handleNext}>
                      Next <FaArrowRight />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="child-form-grid">
                  <div className="three-column-row">
                    <div className="form-input-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                      />
                      {errors.firstName && (
                        <span className="error-msg">{errors.firstName}</span>
                      )}
                    </div>
                    <div className="form-input-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                      />
                      {errors.lastName && (
                        <span className="error-msg">{errors.lastName}</span>
                      )}
                    </div>
                    <div className="form-input-group">
                      <label>Children</label>
                      <input
                        type="text"
                        name="childrenCount"
                        value={formData.childrenCount}
                        onChange={handleInputChange}
                        placeholder="Ex: 2"
                      />
                    </div>
                  </div>

                  <div className="form-input-group">
                    <label>Phone Number</label>
                    <div className="phone-input-wrapper">
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                      />
                    </div>
                    {errors.phone && (
                      <span className="error-msg">{errors.phone}</span>
                    )}
                  </div>
                  <div className="form-input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="youremail@mail.com"
                    />
                    {errors.email && (
                      <span className="error-msg">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-input-group">
                    <label>Relation</label>
                    <select
                      name="relation"
                      value={formData.relation}
                      onChange={handleInputChange}
                    >
                      <option value="">Select relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                    </select>
                    {errors.relation && (
                      <span className="error-msg">{errors.relation}</span>
                    )}
                  </div>
                  <div className="form-input-group">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      placeholder="Enter The Address Line 1"
                    />
                  </div>

                  <div className="form-input-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="Enter The Address Line 2"
                    />
                  </div>
                  <div className="form-input-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter The City"
                    />
                  </div>

                  <div className="form-input-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter The State"
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="Enter The Zip Code"
                    />
                  </div>

                  <div className="form-footer-actions full-width">
                    <button
                      className="prev-btn"
                      onClick={() => setActiveTab("child")}
                    >
                      ← Prev
                    </button>
                    <button className="submit-btn" onClick={handleSubmit}>
                      <FaCheckDouble /> Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddChild;