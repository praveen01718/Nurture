import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaCalendarAlt,
  FaSignOutAlt, FaBell, FaHome, FaUser, FaArrowLeft, FaCheckDouble, FaPlus
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { VACCINATION_SCHEDULE_DATA } from "../constants/vaccinationSchedule";
import "./AddVaccination.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString().split("T")[0];
};

const createDefaultForm = () => ({
  vaccinationDate: getTodayDate(),
  age: "",
  vaccinationName: "",
  vaccinationType: "",
  doseLabel: ""
});

const DOSE_OPTIONS = ["0th", "1st", "2nd", "3rd", "Booster"];

const getAgeSortValue = (ageLabel) => {
  if (ageLabel === "Birth") return 0;

  const normalizedAge = ageLabel.toLowerCase().trim();
  const numericValue = Number.parseInt(normalizedAge, 10);

  if (normalizedAge.includes("week")) return 100 + numericValue;
  if (normalizedAge.includes("month")) return 200 + numericValue;
  if (normalizedAge === "more than 2 years") return 400;
  if (normalizedAge.includes("year")) return 300 + numericValue;

  return 999;
};

const addDurationToDate = (baseDate, ageLabel) => {
  const comparisonDate = new Date(baseDate);
  const normalizedAge = ageLabel.toLowerCase().trim();
  const numericValue = Number.parseInt(normalizedAge, 10);

  if (ageLabel === "Birth") {
    return comparisonDate;
  }

  if (normalizedAge.includes("week")) {
    comparisonDate.setDate(comparisonDate.getDate() + (numericValue * 7));
    return comparisonDate;
  }

  if (normalizedAge.includes("month")) {
    comparisonDate.setMonth(comparisonDate.getMonth() + numericValue);
    return comparisonDate;
  }

  if (normalizedAge.includes("year")) {
    comparisonDate.setFullYear(comparisonDate.getFullYear() + numericValue);
    return comparisonDate;
  }

  return comparisonDate;
};

const getEligibleAgeOptions = (dobString, vaccinationDateString, allAgeLabels) => {
  if (!dobString || !vaccinationDateString) {
    return [];
  }

  const dob = new Date(dobString);
  const vaccinationDate = new Date(vaccinationDateString);

  if (Number.isNaN(dob.getTime()) || Number.isNaN(vaccinationDate.getTime()) || vaccinationDate < dob) {
    return [];
  }

  return allAgeLabels.filter((ageLabel) => {
    if (ageLabel === "more than 2 years") {
      const secondBirthday = addDurationToDate(dob, "2 years");
      return vaccinationDate > secondBirthday;
    }

    const milestoneDate = addDurationToDate(dob, ageLabel);
    return vaccinationDate >= milestoneDate;
  });
};

const calculateAge = (dobString) => {
  if (!dobString) return "--";
  const dob = new Date(dobString);
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years -= 1;
    months += 12;
  }
  return years < 1 ? `${months} Mos` : `${years} Yrs`;
};

const getVaccinationTypeOptions = (vaccinationName) => {
  const selectedVaccination = VACCINATION_SCHEDULE_DATA.find(
    (item) => item.vaccineName === vaccinationName
  );
  const typeValue = selectedVaccination?.types ?? selectedVaccination?.type;
  if (Array.isArray(typeValue)) return typeValue.filter(Boolean);
  if (typeof typeValue === "string" && typeValue.trim()) return [typeValue.trim()];
  return [];
};

function AddVaccination() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [childData, setChildData] = useState(null);
  const [existingVaccinations, setExistingVaccinations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(createDefaultForm);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [customDoseOptions, setCustomDoseOptions] = useState([]);

  const allAgeOptions = [...new Set(
    VACCINATION_SCHEDULE_DATA.flatMap((item) => item.schedule.map((dose) => dose.age))
  )].sort((leftAge, rightAge) => getAgeSortValue(leftAge) - getAgeSortValue(rightAge));

  const eligibleAgeOptions = getEligibleAgeOptions(
    childData?.dob,
    formValues.vaccinationDate,
    allAgeOptions
  );

  const filteredVaccineNames = VACCINATION_SCHEDULE_DATA
    .filter((item) => item.schedule.some((dose) => dose.age === formValues.age))
    .map((item) => item.vaccineName);

  const manualDoseOptions = [...new Set([...DOSE_OPTIONS, ...customDoseOptions])];

  const vaccinationTypeOptions = getVaccinationTypeOptions(formValues.vaccinationName);
  const hasDuplicateVaccination = existingVaccinations.some(
    (vaccination) =>
      vaccination.vaccination_name === formValues.vaccinationName &&
      vaccination.dose_label === formValues.doseLabel
  );

  useEffect(() => {
    const fetchVaccinationPageData = async () => {
      try {
        const [childResponse, vaccinationsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/Child-datas/${childId}`),
          axios.get(`http://localhost:5000/api/vaccinations/child/${childId}`)
        ]);

        setChildData(childResponse.data);
        setExistingVaccinations(vaccinationsResponse.data);
      } catch {
        setAlertMessage("Unable to load child details.");
        setAlertType("error");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };

    if (childId) fetchVaccinationPageData();
  }, [childId]);

  useEffect(() => {
    if (formValues.age && !eligibleAgeOptions.includes(formValues.age)) {
      setFormValues((prev) => ({
        ...prev,
        age: "",
        vaccinationName: "",
        vaccinationType: "",
        doseLabel: ""
      }));
    }
  }, [eligibleAgeOptions, formValues.age]);

  const showPageAlert = (message, type, navigateAfter = false) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      if (navigateAfter) navigate("/Home/children");
    }, navigateAfter ? 1500 : 3000);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formValues.vaccinationDate) nextErrors.vaccinationDate = "Field is Required";
    if (!formValues.age) nextErrors.age = "Field is Required";
    if (!formValues.vaccinationName) nextErrors.vaccinationName = "Field is Required";
    if (vaccinationTypeOptions.length > 0 && !formValues.vaccinationType) {
      nextErrors.vaccinationType = "Field is Required";
    }
    if (!formValues.doseLabel) nextErrors.doseLabel = "Field is Required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && !hasDuplicateVaccination;
  };

  const handleChange = ({ target: { name, value } }) => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "vaccinationDate") {
      setFormValues((prev) => ({
        ...prev,
        vaccinationDate: value,
        age: "",
        vaccinationName: "",
        vaccinationType: "",
        doseLabel: ""
      }));
      setErrors((prev) => ({
        ...prev,
        vaccinationDate: "",
        age: "",
        vaccinationName: "",
        vaccinationType: "",
        doseLabel: ""
      }));
      return;
    }

    if (name === "age") {
      setFormValues((prev) => ({ ...prev, age: value, vaccinationName: "", vaccinationType: "", doseLabel: "" }));
      return;
    }
    if (name === "vaccinationName") {
      const typeOptions = getVaccinationTypeOptions(value);
      setFormValues((prev) => ({
        ...prev,
        vaccinationName: value,
        vaccinationType: typeOptions.length === 1 ? typeOptions[0] : "",
        doseLabel: ""
      }));
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        child_id: Number(childId),
        vaccination_name: formValues.vaccinationName,
        age_label: formValues.age,
        dose_label: formValues.doseLabel,
        vaccination_date: formValues.vaccinationDate
      };
      await axios.post("http://localhost:5000/api/vaccinations/add", payload);
      showPageAlert("Vaccination saved successfully !", "success", true);
    } catch {
      showPageAlert("Error saving vaccination.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDoseOption = () => {
    const enteredDose = window.prompt("Enter the dose label");
    const trimmedDose = enteredDose?.trim();

    if (!trimmedDose) {
      return;
    }

    if (manualDoseOptions.some((dose) => dose.toLowerCase() === trimmedDose.toLowerCase())) {
      showPageAlert("That dose option already exists.", "error");
      return;
    }

    setCustomDoseOptions((prev) => [...prev, trimmedDose]);
    setFormValues((prev) => ({ ...prev, doseLabel: trimmedDose }));
    setErrors((prev) => ({ ...prev, doseLabel: "" }));
  };

  const latestMeasurement = childData?.measurements?.[0] || {};
  const displayWeight = childData?.weight ?? latestMeasurement.weight;
  const displayLength = childData?.length ?? latestMeasurement.length;
  const isBoy = childData?.gender?.toLowerCase().includes("male") || childData?.gender?.toLowerCase().includes("boy");
  const isGirl = childData?.gender?.toLowerCase().includes("female") || childData?.gender?.toLowerCase().includes("girl");
  const genderColor = isBoy ? "#87CEEB" : isGirl ? "#FFC0CB" : "#ccc";

  return (
    <div className="dashboard-wrapper">
      {showAlert && (
        <div className={`custom-alert ${alertType === "success" ? "success-bg" : "error-bg"}`}>
          <span>{alertMessage}</span>
        </div>
      )}

      <aside className="nurture-sidebar">
        <div className="sidebar-header">
          <img src={Logo} alt="Logo" className="main-logo" />
          <button className="header-grid-icon"><FaThLarge /></button>
        </div>
        <nav className="sidebar-links">
          <Link to="/Home/Dashboard" className="nav-link"><FaHome /> <span>Dashboard</span></Link>
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
            <div className="notif-box"><FaBell /><span className="dot">18</span></div>
            <div className="user-info">
              <img src={Profile} alt="profile" className="user-avatar" />
              <p className="user-name">Kalai Arasan</p>
            </div>
          </div>
        </header>

        <main className="measurement-main">
          <div className="breadcrumb-banner">
            <div className="breadcrumb-title-group">
              <h2>Add Vaccination</h2>
              <p className="breadcrumb">Home / Add Vaccination</p>
            </div>
            <div className="header-back-button" onClick={() => navigate("/Home/children")}>
              <MdArrowBack size={20} />
            </div>
          </div>

          <div className="measurement-white-card">
            <div className="child-summary-bar">
              <div className="summary-profile">
                <div className="child-avatar" style={{ borderColor: genderColor }}>
                  {childData?.profileImage ? (
                    <img src={`http://localhost:5000/uploads/${childData.profileImage}`} alt="profile" />
                  ) : (
                    <FaUser style={{ fontSize: "28px" }} />
                  )}
                </div>
                <div>
                  <h4 className="child-name">{childData?.childName || "Loading..."}</h4>
                  <span className="child-gender-age">
                    <span style={{ color: genderColor }}>{isBoy ? "Boy" : isGirl ? "Girl" : "N/A"}</span>
                    <span style={{ color: "#000" }}> - {calculateAge(childData?.dob)}</span>
                  </span>
                </div>
              </div>
              <div className="summary-item"><label>Parent</label><p>{childData ? `${childData.firstName || ""} ${childData.lastName || ""}` : "---"}</p></div>
              <div className="summary-item"><label>Blood Group</label><p>{childData?.bloodGroup || "---"}</p></div>
              <div className="summary-item"><label>Weight/Length</label><p>{displayWeight ? `${displayWeight} kg` : "--"} / {displayLength ? `${displayLength} cm` : "--"}</p></div>
            </div>

            <hr className="card-divider" />

            <form onSubmit={handleSubmit} className="vaccination-form-container">
              <div className="form-row row-80">
                <div className="form-field">
                  <label>Vaccination Date</label>
                  <input
                    type="date"
                    name="vaccinationDate"
                    value={formValues.vaccinationDate}
                    min={formatDateForInput(childData?.dob)}
                    max={getTodayDate()}
                    onChange={handleChange}
                    className={errors.vaccinationDate ? "input-error" : ""}
                  />
                  {errors.vaccinationDate && <span className="error-msg">{errors.vaccinationDate}</span>}
                </div>
                <div className="form-field">
                  <label>Age</label>
                  <select
                    name="age"
                    value={formValues.age}
                    onChange={handleChange}
                    disabled={eligibleAgeOptions.length === 0}
                    className={errors.age ? "input-error" : ""}
                  >
                    <option value="">-- Select Age --</option>
                    {eligibleAgeOptions.map(age => <option key={age} value={age}>{age}</option>)}
                  </select>
                  {errors.age && <span className="error-msg">{errors.age}</span>}
                </div>
              </div>

              <div className="form-row row-60-40">
                <div className="form-field">
                  <label>Vaccination Name</label>
                  <select
                    name="vaccinationName"
                    value={formValues.vaccinationName}
                    onChange={handleChange}
                    disabled={!formValues.age}
                    className={errors.vaccinationName ? "input-error" : ""}
                  >
                    <option value="">-- Select Vaccination Name --</option>
                    {filteredVaccineNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {errors.vaccinationName && <span className="error-msg">{errors.vaccinationName}</span>}
                  {!errors.vaccinationName && hasDuplicateVaccination && (
                    <span className="error-msg">Vaccine already injected</span>
                  )}
                </div>
                {formValues.vaccinationName && vaccinationTypeOptions.length > 0 && (
                  <div className="form-field">
                    <label>Vaccination Type</label>
                    <select
                      name="vaccinationType"
                      value={formValues.vaccinationType}
                      onChange={handleChange}
                      className={errors.vaccinationType ? "input-error" : ""}
                    >
                      <option value="">Select</option>
                      {vaccinationTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    {errors.vaccinationType && <span className="error-msg">{errors.vaccinationType}</span>}
                  </div>
                )}
              </div>

              <div className="form-row full-width-row">
                <div className="form-field">
                  <label>Select Dose</label>
                  <div className="dose-selection-row">
                    <div className={`dose-radio-container ${errors.doseLabel ? "input-error" : ""}`}>
                      {manualDoseOptions.length > 0 ? (
                        <div className="dose-options-list">
                          {manualDoseOptions.map(dose => (
                            <label key={dose} className={`dose-card ${formValues.doseLabel === dose ? "selected" : ""}`}>
                              <input
                                type="radio"
                                name="doseLabel"
                                value={dose}
                                checked={formValues.doseLabel === dose}
                                onChange={handleChange}
                              />
                              <span>{dose}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <span className="vaccination-form-note">Dose options will appear here.</span>
                      )}
                    </div>
                    <button type="button" className="dose-add-btn" onClick={handleAddDoseOption}>
                              <FaPlus />
                    </button>
                  </div>
                  {errors.doseLabel && <span className="error-msg">{errors.doseLabel}</span>}
                </div>
              </div>

              <div className="measurement-actions">
                <button type="button" className="btn-reset" onClick={() => setFormValues(createDefaultForm())}>
                  <FaArrowLeft /> Reset
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
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

export default AddVaccination;
