import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaUser,
  FaCalendarAlt, FaSignOutAlt, FaBell, FaHome,  
  FaArrowLeft, FaCheckDouble
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

import { RiCalendarScheduleFill } from "react-icons/ri";
import "./AddMeasurement.css";

const getMeasurementSortValue = (measurement) => {
  if (!measurement?.measurement_date) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedDate = new Date(measurement.measurement_date);
  return Number.isNaN(parsedDate.getTime()) ? Number.NEGATIVE_INFINITY : parsedDate.getTime();
};

const getLatestMeasurementRecord = (measurements = []) =>
  measurements.reduce((latestMeasurement, currentMeasurement) => {
    const latestSortValue = getMeasurementSortValue(latestMeasurement);
    const currentSortValue = getMeasurementSortValue(currentMeasurement);

    if (currentSortValue > latestSortValue) {
      return currentMeasurement;
    }

    return latestMeasurement;
  }, null);

function AddMeasurement() {
  const navigate = useNavigate();
  const { childId } = useParams();

  const [childData, setChildData] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ageBy, setAgeBy] = useState("Date");
  const [bmi, setBmi] = useState("");
  const [displayAge, setDisplayAge] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const [childResponse, measurementsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/Child-datas/${childId}`),
          axios.get(`http://localhost:5000/api/medical-measurements/${childId}`)
        ]);

        setChildData(childResponse.data);
        setLatestMeasurement(getLatestMeasurementRecord(measurementsResponse.data));
        
        if (childResponse.data.dob) {
          calculateAge(childResponse.data.dob);
        }
      } catch (err) {
        console.error("Error fetching child data:", err);
      }
    };
    if (childId) fetchChild();
  }, [childId]);

  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    setDisplayAge(years < 1 ? `${months} Mons` : `${years} Yrs`);
  };

  const getChildAgeInMonths = (dobString) => {
    if (!dobString) return null;

    const dob = new Date(dobString);
    const today = new Date();

    if (Number.isNaN(dob.getTime())) return null;

    let months = (today.getFullYear() - dob.getFullYear()) * 12;
    months += today.getMonth() - dob.getMonth();

    if (today.getDate() < dob.getDate()) {
      months -= 1;
    }

    return Math.max(months, 0);
  };

  useEffect(() => {
    if (weight && length) {
      const weightNum = parseFloat(weight);
      const heightMtrs = parseFloat(length) / 100;
      if (heightMtrs > 0) {
        const calculatedBmi = (weightNum / (heightMtrs * heightMtrs)).toFixed(2);
        setBmi(calculatedBmi);
      }
    } else {
      setBmi("");
    }
  }, [weight, length]);

  const generateRangeOptions = () => {
    if (!childData?.dob) return [];
    const options = [];
    const dob = new Date(childData.dob);
    const today = new Date();

    for (let w = 1; w <= 13; w++) {
      const d = new Date(dob);
      d.setDate(d.getDate() + (w * 7));
      if (d > today) break;
      options.push({ label: `${w} Week${w > 1 ? 's' : ''}`, value: d.toISOString().split('T')[0] });
    }
    for (let m = 4; m <= 12; m++) {
      const d = new Date(dob);
      d.setMonth(d.getMonth() + m);
      if (d > today) break;
      options.push({ label: `${m} Months`, value: d.toISOString().split('T')[0] });
    }

    let year = 1;
    while (true) {
      const yearDate = new Date(dob);
      yearDate.setFullYear(yearDate.getFullYear() + year);
      if (yearDate > today) break;
      options.push({ label: `${year} Year${year > 1 ? 's' : ''}`, value: yearDate.toISOString().split('T')[0] });

      for (let m = 1; m < 12; m++) {
        const monthDate = new Date(yearDate);
        monthDate.setMonth(monthDate.getMonth() + m);
        if (monthDate > today) break;
        options.push({ label: `${year} Year ${m} Month`, value: monthDate.toISOString().split('T')[0] });
      }

      year++;
    }

    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !length || !selectedDate) {
      setMessage("Please fill in all required fields.");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const payload = {
      child_id: childId,
      weight: parseFloat(weight),
      length: parseFloat(length),
      head_circumference: isHeadCircumferenceApplicable
        ? (parseFloat(headCircumference) || 0)
        : 0,
      bmi: parseFloat(bmi),
      measurement_date: selectedDate,
      age_type: ageBy,
    };

    try {
      await axios.post("http://localhost:5000/api/medical-measurements/add", payload);
      setMessage("Measurement added successfully !");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        navigate("/Home/children");
      }, 1500);
    } catch (err) {
      console.error("Error saving measurement:", err);
      setMessage("Failed to save measurement.");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const fallbackMeasurement = getLatestMeasurementRecord(childData?.measurements || []) || {};
  const displayWeight =
    latestMeasurement?.weight ?? childData?.weight ?? fallbackMeasurement.weight;
  const displayLength =
    latestMeasurement?.length ?? childData?.length ?? fallbackMeasurement.length;
  const childAgeInMonths = getChildAgeInMonths(childData?.dob);
  const isHeadCircumferenceApplicable = childAgeInMonths !== null && childAgeInMonths <= 24;
  const genderText = childData?.gender?.toLowerCase();
  const isBoy = genderText?.includes("boy") || genderText === "male";
  const isGirl = genderText?.includes("girl") || genderText === "female";
  const genderLabel = isBoy ? "Boy" : isGirl ? "Girl" : childData?.gender || "N/A";
  const genderColor = isBoy ? "#87CEEB" : isGirl ? "#FFC0CB" : "#000";

  return (
    <div className="dashboard-wrapper">
      {showAlert && (
        <div className={`custom-alert ${alertType === "success" ? "success-bg" : "error-bg"}`}>
          <div className="alert-content">
            <span>{message}</span>
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
          <Link to="/Home/Parent" className="nav-link"><FaUserFriends /> <span>Parents</span></Link>
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

        <main className="measurement-main">
          <div className="breadcrumb-banner">
            <div className="breadcrumb-title-group">
              <h2>Add Measurement</h2>
              <p className="breadcrumb">Home / Add Measurement</p>
            </div>
            <div className="header-back-button" onClick={() => navigate("/Home/children")}><MdArrowBack size={20} /></div>
          </div>

          <div className="measurement-white-card">
            <div className="child-summary-bar">
              <div className="summary-profile">
                <div className="child-avatar" style={{ 
                  width: '50px', height: '50px', borderRadius: '50%', border: '3px solid',
                  borderColor: isBoy ? "#87CEEB" : isGirl ? "#FFC0CB" : "#ccc", background: '#9da9ae',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: '12px'
                }}>
                  {childData?.profileImage ? (
                    <img src={`http://localhost:5000/uploads/${childData.profileImage}`} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : ( <FaUser style={{ color: 'white', fontSize: '28px' }} /> )}
                </div>
                <div>
                  <h4 className="child-name">{childData?.childName || "Loading..."}</h4>
                  <span className="child-gender-age">
                    <span style={{ color: genderColor }}>{genderLabel}</span>
                    <span style={{ color: "#000", fontWeight: "lighter" }}> - {displayAge || "--"}</span>
                  </span>
                </div>
              </div>
              
              <div className="summary-item">
                <label>Parent</label>
                <p>{childData ? `${childData.firstName} ${childData.lastName}` : "---"}</p>
              </div>
              
              <div className="summary-item">
                <label>Blood Group</label>
                <p>{childData?.bloodGroup || "---"}</p>
              </div>
              
              <div className="summary-item">
                <label>Weight/Length</label>
                <p>{displayWeight ? `${displayWeight} kg` : "--"} / {displayLength ? `${displayLength} cm` : "--"}</p>
              </div>
            </div>

            <hr className="card-divider" />

            <form onSubmit={handleSubmit}>
              <div className="measurement-form-grid">
                <div className="form-field">
                  <label>Age by</label>
                  <div className="radio-container">
                    <label>
                      <input type="radio" name="ageBy" value="Range" checked={ageBy === "Range"} onChange={(e) => setAgeBy(e.target.value)} /> Range
                    </label>
                    <label>
                      <input type="radio" name="ageBy" value="Date" checked={ageBy === "Date"} onChange={(e) => setAgeBy(e.target.value)} /> Date
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>{ageBy === "Date" ? "Select Date" : "Select Range"}</label>
                  <div className="input-with-addon">
                    {ageBy === "Date" ? (
                      <input 
                        type="date" 
                        value={selectedDate} 
                        min={childData?.dob ? new Date(childData.dob).toISOString().split('T')[0] : ""}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="custom-date-input" 
                      />
                    ) : (
                      <select 
                        className="custom-date-input" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                      >
                        <option value=""> Choose a Range</option>
                        {generateRangeOptions().map((opt, i) => (
                          <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label>Weight</label>
                  <div className="input-with-addon">
                    <input type="number" placeholder="Enter weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    <span className="addon-text">kg</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Length</label>
                  <div className="input-with-addon">
                    <input type="number" placeholder="Enter length" value={length} onChange={(e) => setLength(e.target.value)} />
                    <span className="addon-text">cm</span>
                  </div>
                </div>
                {isHeadCircumferenceApplicable && (
                  <div className="form-field">
                    <label>Head Circumference</label>
                    <div className="input-with-addon">
                      <input
                        type="number"
                        placeholder="Enter head circumference"
                        value={headCircumference}
                        onChange={(e) => setHeadCircumference(e.target.value)}
                      />
                      <span className="addon-text">cm</span>
                    </div>
                  </div>
                )}
                <div className="form-field">
                  <label>Body Mass Index (BMI)</label>
                  <div className="input-with-addon">
                    <input type="text" readOnly value={bmi} placeholder="0" />
                    <span className="addon-text">kg/m²</span>
                  </div>
                </div>
              </div>

              <div className="measurement-actions">
                <button type="button" className="btn-reset" onClick={() => {setWeight(""); setLength(""); setHeadCircumference("");}}>
                  <FaArrowLeft /> Reset
                </button>
                <button type="submit" className="btn-submit">
                  <FaCheckDouble /> Submit
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddMeasurement;
