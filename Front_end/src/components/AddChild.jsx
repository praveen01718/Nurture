import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaArrowRight,
  FaCalendarAlt, FaSignOutAlt, FaHome, FaBell, FaImage, FaCheckDouble
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import SidebarNav from "./SidebarNav";
import "./AddChild.css";

const COUNTRY_OPTIONS = [
  { code: "+1", iso: "us", label: "United States" },
  { code: "+91", iso: "in", label: "India" },
  { code: "+44", iso: "gb", label: "United Kingdom" },
  { code: "+61", iso: "au", label: "Australia" },
  { code: "+971", iso: "ae", label: "UAE" }
];

function AddChild() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const phoneCountryDropdownRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState("child");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_OPTIONS[0].code);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

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
    "address Line 1": "",
    "address Line 2": "",
    city: "",
    state: "",
    zip: "",
    note: ""
  });

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const calculateGestationalAgeAtBirth = (dob, expectedDate) => {
    if (!dob || !expectedDate) {
      return 0;
    }

    const birth = new Date(dob);
    const expected = new Date(expectedDate);

    if (isNaN(birth.getTime()) || isNaN(expected.getTime())) {
      return 0;
    }

    if (birth >= expected) {
      return 40;
    }

    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    const prematureWeeks = Math.floor((expected - birth) / millisecondsPerWeek);
    const gestationalAgeAtBirth = 40 - prematureWeeks;

    return Math.max(0, Math.min(40, gestationalAgeAtBirth));
  };

  useEffect(() => {
    if (formData.isPremature === "yes") {
      const gestationalAgeAtBirth = calculateGestationalAgeAtBirth(
        formData.dob,
        formData.expectedDate
      );

      setFormData((prev) => ({ ...prev, weeksPremature: gestationalAgeAtBirth }));
      return;
    }

    setFormData((prev) => ({ ...prev, weeksPremature: 0 }));
  }, [formData.dob, formData.expectedDate, formData.isPremature]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!phoneCountryDropdownRef.current?.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const formatPhoneNumberWithCountry = (countryCode, phoneNumber) => {
    const sanitizedPhone = String(phoneNumber || "").replace(/\D/g, "");
    return sanitizedPhone ? `${countryCode} ${sanitizedPhone}` : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateTab = (tab) => {
    let newErrors = {};
    if (tab === "child") {
      if (!formData.childName) newErrors.childName = "Field is Required";
      if (!formData.dob) newErrors.dob = "Field is Required";
      if (!formData.gender) newErrors.gender = "Field is Required";
      if (!formData.bloodGroup) newErrors.bloodGroup = "Field is Required";
      if (formData.isPremature === "yes" && !formData.expectedDate) newErrors.expectedDate = "Field is Required";
    } else {
      if (!formData.firstName) newErrors.firstName = "Field is Required";
      if (!formData.lastName) newErrors.lastName = "Field is Required";
      if (!formData.childrenCount) newErrors.childrenCount = "Field is Required";
      if (!formData.phone) newErrors.phone = "Field is Required";
      if (!formData.email) newErrors.email = "Field is Required";
      if (!formData.relation) newErrors.relation = "Field is Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const childValid = validateTab("child");
    const parentValid = validateTab("parent");
    const formattedPhoneNumber = formatPhoneNumberWithCountry(selectedCountryCode, formData.phone);
    
    if (childValid && parentValid && formattedPhoneNumber) {
      try {
        const submissionData = new FormData();
        Object.keys(formData).forEach(key => {
          if (key !== "phone") {
            submissionData.append(key, formData[key]);
          }
        });
        submissionData.append("phone", formattedPhoneNumber);
        if (selectedFile) submissionData.append("profileImage", selectedFile);

        const response = await axios.post("http://localhost:5000/api/Child-datas/add", submissionData);
        if (response.status === 201 || response.status === 200) {
          showToast("Child Added Successfully !", "success");
          setTimeout(() => navigate("/Home/children"), 1500);
        }
      } catch (error) {
        showToast(error.response?.data?.message || "Submission failed.", "error");
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      {toast.show && <div className={`custom-toast ${toast.type}`}>{toast.message}</div>}

      {showAlert && (
        <div className={`custom-alert ${alertType === "success" ? "success-bg" : "error-bg"}`}>
          <div className="alert-content">
            <span>{alertMessage}</span>
          </div>
        </div>
      )}

      <SidebarNav />

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

        <div className="table-header-bar">
          <div className="header-titles">
            <h2>{activeTab === "child" ? "Child Info" : "Parent Info"}</h2>
            <p className="breadcrumb">Home / Children / {activeTab === "child" ? "Child Info" : "Parent Info"}</p>
          </div>
            <div className="header-back-button" onClick={() => navigate("/Home/children")}><MdArrowBack size={20} /></div>
        </div>

        <div className="add-child-main-layout">
          <div className="upload-side-card">
            <div className={`upload-inner ${isDragging ? "dragging" : ""}`} 
                 onClick={() => fileInputRef.current.click()} 
                 onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
              <input type="file" ref={fileInputRef} onChange={(e) => handleFile(e.target.files[0])} hidden accept="image/*" />
              <div className="image-frame">
                {previewUrl ? <img src={previewUrl} alt="Preview" /> : <FaImage className="placeholder-img-icon" />}
              </div>
              <p>Edit/Change<br />(Drag and Drop)</p>
            </div>
            <button className="upload-text-link-child" onClick={() => {
              if (!selectedFile) {
                setAlertMessage("Please select an image first.");
                setAlertType("error");
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                return;
              }
              setAlertMessage("Image uploaded successfully !");
              setAlertType("success");
              setShowAlert(true);
              setTimeout(() => setShowAlert(false), 3000);
            }}>Upload Picture</button>
          </div>

          <div className="form-side-container">
            <div className="tab-switcher">
              <button className={`tab-item ${activeTab === "child" ? "active" : ""}`} onClick={() => setActiveTab("child")}>Child Info</button>
              <button className={`tab-item ${activeTab === "parent" ? "active" : ""}`} onClick={() => setActiveTab("parent")}>Parent Info</button>
            </div>

          <div className="border-divider-child"><hr/></div>

            <div className="form-card-body">
              {activeTab === "child" ? (
                <div className="child-form-grid">
                  <div className="form-input-group">
                    <label>Child Name</label>
                    <input type="text" name="childName" value={formData.childName} onChange={handleInputChange} placeholder="Child Name" />
                    {errors.childName && <span className="error-msg">{errors.childName}</span>}
                  </div>
                  <div className="form-input-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" max={today} value={formData.dob} onChange={handleInputChange} />
                    {errors.dob && <span className="error-msg">{errors.dob}</span>}
                  </div>
                  <div className="form-input-group">
                    <label>Is your baby premature?</label>
                    <div className="premature-radios">
                      <label><input type="radio" name="isPremature" value="yes" checked={formData.isPremature === "yes"} onChange={handleInputChange} /> Yes</label>
                      <label><input type="radio" name="isPremature" value="no" checked={formData.isPremature === "no"} onChange={handleInputChange} /> No</label>
                    </div>
                  </div>
                  {formData.isPremature === "yes" && (
                    <>
                      <div className="form-input-group">
                        <label>Expected Date of Delivery</label>
                        <input type="date" name="expectedDate" min={formData.dob || today} value={formData.expectedDate} onChange={handleInputChange} />
                        {errors.expectedDate && <span className="error-msg">{errors.expectedDate}</span>}
                      </div>
                      <div className="form-input-group">
                        <label>Number of Weeks Premature</label>
                        <input type="text" readOnly value={`${formData.weeksPremature} Weeks`} className="readonly-input" />
                      </div>
                    </>
                  )}
                  <div className="form-input-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="Boy">Boy</option>
                      <option value="Girl">Girl</option>
                    </select>
                    {errors.gender && <span className="error-msg">{errors.gender}</span>}
                  </div>
                  <div className="form-input-group">
                    <label>Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}>
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    {errors.bloodGroup && <span className="error-msg">{errors.bloodGroup}</span>}
                  </div>
                  <div className="form-input-group full-width">
                    <label>Note</label>
                    <textarea className="form-control" name="note" value={formData.note} onChange={handleInputChange} rows="3"></textarea>
                  </div>
                  <div className="form-footer-actions full-width">
                    <button className="next-action-btn" onClick={() => { if (validateTab("child")) setActiveTab("parent"); }}>Next <FaArrowRight /></button>
                  </div>
                </div>
              ) : (
                <div className="child-form-grid">
                  <div className="three-column-row">
                    <div className="form-input-group"><label>First Name</label><input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} />{errors.firstName && <span className="error-msg">{errors.firstName}</span>}</div>
                    <div className="form-input-group"><label>Last Name</label><input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} />{errors.lastName && <span className="error-msg">{errors.lastName}</span>}</div>
                    <div className="form-input-group"><label>Children</label><input type="text" name="childrenCount" placeholder="Ex. 2" value={formData.childrenCount} onChange={handleInputChange} />{errors.childrenCount && <span className="error-msg">{errors.childrenCount}</span>}</div>
                  </div>
                  <div className="form-input-group">
                    <label>Phone</label>
                    <div className="phone-input-wrapper child-phone-wrapper">
                      <div className="country-code-dropdown" ref={phoneCountryDropdownRef}>
                        <button
                          type="button"
                          className="country-code-trigger"
                          onClick={() => setIsCountryDropdownOpen((previousState) => !previousState)}
                        >
                          <img
                            src={`https://flagcdn.com/20x15/${COUNTRY_OPTIONS.find((country) => country.code === selectedCountryCode)?.iso || "us"}.png`}
                            alt="Selected country"
                            className="country-flag"
                          />
                          <span className="country-arrow">▾</span>
                        </button>

                        {isCountryDropdownOpen && (
                          <ul className="country-code-menu">
                            {COUNTRY_OPTIONS.map((country) => (
                              <li key={country.code}>
                                <button
                                  type="button"
                                  className="country-code-option"
                                  onClick={() => {
                                    setSelectedCountryCode(country.code);
                                    setIsCountryDropdownOpen(false);
                                  }}
                                >
                                  <img
                                    src={`https://flagcdn.com/20x15/${country.iso}.png`}
                                    alt={country.label}
                                    className="country-flag"
                                  />
                                  <span>{country.code}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <span className="phone-code-prefix">{selectedCountryCode}</span>
                      <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} inputMode="numeric" maxLength={15} />
                    </div>
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                  <div className="form-input-group"><label>Email</label><input type="email" name="email" placeholder="youremail@mail.com" value={formData.email} onChange={handleInputChange} />{errors.email && <span className="error-msg">{errors.email}</span>}</div>
                  <div className="form-input-group">
                    <label>Relation</label>
                    <select name="relation" value={formData.relation} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="Father">Father</option><option value="Mother">Mother</option>
                    </select>
                    {errors.relation && <span className="error-msg">{errors.relation}</span>}
                  </div>
                  {['address Line 1', 'address Line 2', 'city', 'state', 'zip'].map(field => (
                    <div className="form-input-group" key={field}>
                      <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input type="text" name={field} value={formData[field]} onChange={handleInputChange} placeholder={`Enter the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`} />
                    </div>
                  ))}
                  <div className="form-footer-actions full-width">
                    <button className="prev-btn" onClick={() => setActiveTab("child")}>← Prev</button>
                    <button className="submit-btn" onClick={handleSubmit}><FaCheckDouble /> Submit</button>
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
