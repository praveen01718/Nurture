import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge, FaUserFriends, FaChild, FaUserMd, FaCalendarAlt,
  FaSignOutAlt, FaBell, FaHome, FaUser, FaArrowLeft, FaCheckDouble, FaPlus
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { MdArrowBack } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import {
  VACCINATION_SCHEDULE_DATA,
  getVaccinationTypeOptions as getScheduleTypeOptions
} from "../constants/vaccinationSchedule";
import "./AddVaccination.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const formatDateForInput = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString().split("T")[0];
};

let vaccinationEntrySeed = 0;

const createVaccinationEntry = (initialValues = {}) => ({
  id: vaccinationEntrySeed += 1,
  vaccinationDate: initialValues.vaccinationDate || getTodayDate(),
  age: "",
  vaccinationName: "",
  vaccinationType: "",
  doseLabel: "",
  ...initialValues
});

const createDefaultForm = () => ({
  entries: [createVaccinationEntry()]
});

const createDefaultErrors = (entryCount = 1) => ({
  entries: Array.from({ length: entryCount }, () => ({}))
});

const DOSE_OPTIONS = ["0th", "1st", "2nd", "3rd", "Booster"];

const normalizeValue = (value) => value?.trim().toLowerCase() || "";

const getAgeSortValue = (ageLabel) => {
  const normalizedAge = ageLabel.toLowerCase().trim();

  if (normalizedAge === "at birth") {
    return 0;
  }

  const numericValue = Number.parseInt(normalizedAge, 10);

  if (normalizedAge.includes("week")) return 100 + numericValue;
  if (normalizedAge.includes("month")) return 200 + numericValue;
  if (normalizedAge.includes("year")) return 300 + numericValue;

  return 999;
};

const addDurationToDate = (baseDate, ageLabel) => {
  const comparisonDate = new Date(baseDate);
  const normalizedAge = ageLabel.toLowerCase().trim();
  const numericValue = Number.parseInt(normalizedAge, 10);

  if (normalizedAge === "at birth") {
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

  return allAgeLabels.filter((ageLabel) => vaccinationDate >= addDurationToDate(dob, ageLabel));
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

const getUniqueValues = (values) => [...new Set(values.filter(Boolean))];

const getEntryKey = (entry) => [
  normalizeValue(entry.vaccinationName),
  normalizeValue(entry.vaccinationType),
  normalizeValue(entry.doseLabel)
].join("::");

function AddVaccination() {
  const navigate = useNavigate();
  const { childId } = useParams();

  const [childData, setChildData] = useState(null);
  const [existingVaccinations, setExistingVaccinations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(createDefaultForm);
  const [errors, setErrors] = useState(createDefaultErrors);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const allAgeOptions = useMemo(
    () =>
      getUniqueValues(
        VACCINATION_SCHEDULE_DATA.flatMap((item) => item.schedule.map((dose) => dose.age))
      ).sort((leftAge, rightAge) => getAgeSortValue(leftAge) - getAgeSortValue(rightAge)),
    []
  );

  const allVaccinationNames = useMemo(
    () =>
      getUniqueValues(
        VACCINATION_SCHEDULE_DATA.map((item) => item.vaccineName)
      ).sort((leftName, rightName) => leftName.localeCompare(rightName)),
    []
  );

  const getEligibleAgeOptionsForEntry = (vaccinationDate) =>
    getEligibleAgeOptions(childData?.dob, vaccinationDate, allAgeOptions);

  const getVaccinationTypeOptions = (entry) => {
    if (!entry.vaccinationName) {
      return [];
    }

    const ageBasedTypeOptions = getScheduleTypeOptions(entry.vaccinationName, entry.age);

    return ageBasedTypeOptions.length > 0
      ? ageBasedTypeOptions
      : getScheduleTypeOptions(entry.vaccinationName);
  };

  const getManualDoseOptions = () => DOSE_OPTIONS;

  const isEntryCompleteForDuplicateCheck = (entry) => {
    const requiresVaccinationType = getVaccinationTypeOptions(entry).length > 0;

    if (!entry.age || !entry.vaccinationName || !entry.doseLabel) {
      return false;
    }

    if (requiresVaccinationType && !entry.vaccinationType) {
      return false;
    }

    return true;
  };

  const hasDuplicateVaccination = (entry) => {
    if (!isEntryCompleteForDuplicateCheck(entry)) {
      return false;
    }

    return existingVaccinations.some((vaccination) => {
      const recordType = vaccination.vaccination_type || "";
      const selectedType = entry.vaccinationType || "";

      return (
        normalizeValue(vaccination.vaccination_name) === normalizeValue(entry.vaccinationName) &&
        (!recordType || !selectedType || normalizeValue(recordType) === normalizeValue(selectedType)) &&
        normalizeValue(vaccination.dose_label) === normalizeValue(entry.doseLabel)
      );
    });
  };

  const hasDuplicateEntry = (entryIndex) => {
    const currentEntry = formValues.entries[entryIndex];

    if (!currentEntry || !isEntryCompleteForDuplicateCheck(currentEntry)) {
      return false;
    }

    return formValues.entries.some((entry, index) => (
      index !== entryIndex &&
      isEntryCompleteForDuplicateCheck(entry) &&
      getEntryKey(entry) === getEntryKey(currentEntry)
    ));
  };

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

    if (childId) {
      fetchVaccinationPageData();
    }
  }, [childId]);

  useEffect(() => {
    setFormValues((prev) => {
      let hasChanges = false;

      const nextEntries = prev.entries.map((entry) => {
        const eligibleAgeOptions = getEligibleAgeOptionsForEntry(entry.vaccinationDate);

        if (entry.age && !eligibleAgeOptions.includes(entry.age)) {
          hasChanges = true;

          return {
            ...entry,
            age: "",
            vaccinationName: "",
            vaccinationType: "",
            doseLabel: ""
          };
        }

        return entry;
      });

      return hasChanges ? { ...prev, entries: nextEntries } : prev;
    });
  }, [allAgeOptions, childData?.dob]);

  const showPageAlert = (message, type, navigateAfter = false) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);

      if (navigateAfter) {
        navigate("/Home/children");
      }
    }, navigateAfter ? 1500 : 3000);
  };

  const getEntryValidationErrors = (entry) => {
    const entryErrors = {};
    const vaccinationTypeOptions = getVaccinationTypeOptions(entry);

    if (!entry.vaccinationDate) entryErrors.vaccinationDate = "Field is Required";
    if (!entry.age) entryErrors.age = "Field is Required";
    if (!entry.vaccinationName) entryErrors.vaccinationName = "Field is Required";
    if (vaccinationTypeOptions.length > 0 && !entry.vaccinationType) {
      entryErrors.vaccinationType = "Field is Required";
    }
    if (!entry.doseLabel) entryErrors.doseLabel = "Field is Required";

    return entryErrors;
  };

  const validateForm = () => {
    const nextErrors = {
      entries: formValues.entries.map((entry) => getEntryValidationErrors(entry))
    };

    const hasFieldErrors = nextErrors.entries.some((entryErrors) => Object.keys(entryErrors).length > 0);

    const hasDuplicateSelections = formValues.entries.some(
      (entry, index) => hasDuplicateVaccination(entry) || hasDuplicateEntry(index)
    );

    setErrors(nextErrors);
    return !hasFieldErrors && !hasDuplicateSelections;
  };

  const handleEntryChange = (entryIndex, { target: { name, value } }) => {
    setErrors((prev) => ({
      ...prev,
      entries: (prev.entries || []).map((entryErrors, index) => {
        if (index !== entryIndex) {
          return entryErrors;
        }

        const nextEntryErrors = { ...entryErrors };
        delete nextEntryErrors[name];

        if (name === "vaccinationDate") {
          delete nextEntryErrors.age;
          delete nextEntryErrors.vaccinationName;
          delete nextEntryErrors.vaccinationType;
          delete nextEntryErrors.doseLabel;
        }

        if (name === "age") {
          delete nextEntryErrors.vaccinationName;
          delete nextEntryErrors.vaccinationType;
          delete nextEntryErrors.doseLabel;
        }

        if (name === "vaccinationName") {
          delete nextEntryErrors.vaccinationType;
          delete nextEntryErrors.doseLabel;
        }

        if (name === "vaccinationType") {
          delete nextEntryErrors.doseLabel;
        }

        return nextEntryErrors;
      })
    }));

    setFormValues((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, index) => {
        if (index !== entryIndex) {
          return entry;
        }

        if (name === "vaccinationDate") {
          return {
            ...entry,
            vaccinationDate: value,
            age: "",
            vaccinationName: "",
            vaccinationType: "",
            doseLabel: ""
          };
        }

        if (name === "age") {
          return {
            ...entry,
            age: value,
            vaccinationName: "",
            vaccinationType: "",
            doseLabel: ""
          };
        }

        if (name === "vaccinationName") {
          const nextTypeOptions = getScheduleTypeOptions(value, entry.age);

          return {
            ...entry,
            vaccinationName: value,
            vaccinationType: nextTypeOptions.length === 1 ? nextTypeOptions[0] : "",
            doseLabel: ""
          };
        }

        if (name === "vaccinationType") {
          return {
            ...entry,
            vaccinationType: value,
            doseLabel: ""
          };
        }

        return { ...entry, [name]: value };
      })
    }));
  };

  const handleAddVaccinationEntry = (entryIndex) => {
    const currentEntry = formValues.entries[entryIndex];
    const entryErrors = getEntryValidationErrors(currentEntry);
    const hasEntryErrors = Object.keys(entryErrors).length > 0;
    const hasDuplicateSelection =
      hasDuplicateVaccination(currentEntry) || hasDuplicateEntry(entryIndex);

    setErrors((prev) => ({
      ...prev,
      entries: formValues.entries.map((_, index) => (
        index === entryIndex ? entryErrors : (prev.entries?.[index] || {})
      ))
    }));

    if (hasEntryErrors || hasDuplicateSelection) {
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        createVaccinationEntry({
          vaccinationDate: prev.entries[entryIndex]?.vaccinationDate || getTodayDate(),
          age: prev.entries[entryIndex]?.age || ""
        })
      ]
    }));

    setErrors((prev) => ({
      ...prev,
      entries: [...(prev.entries || []), {}]
    }));
  };

  const handleRemoveVaccinationEntry = (entryIndex) => {
    if (formValues.entries.length === 1) {
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      entries: prev.entries.filter((_, index) => index !== entryIndex)
    }));

    setErrors((prev) => ({
      ...prev,
      entries: (prev.entries || []).filter((_, index) => index !== entryIndex)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      for (const entry of formValues.entries) {
        const payload = {
          child_id: Number(childId),
          vaccination_name: entry.vaccinationName,
          vaccination_type: entry.vaccinationType,
          age_label: entry.age,
          dose_label: entry.doseLabel,
          vaccination_date: entry.vaccinationDate
        };

        await axios.post("http://localhost:5000/api/vaccinations/add", payload);
      }

      showPageAlert("Vaccination saved successfully !", "success", true);
    } catch {
      showPageAlert("Error saving vaccination.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormValues(createDefaultForm());
    setErrors(createDefaultErrors());
  };

  const latestMeasurement = childData?.measurements?.[0] || {};
  const displayWeight = childData?.weight ?? latestMeasurement.weight;
  const displayLength = childData?.length ?? latestMeasurement.length;
  const isBoy =
    childData?.gender?.toLowerCase().includes("male") ||
    childData?.gender?.toLowerCase().includes("boy");
  const isGirl =
    childData?.gender?.toLowerCase().includes("female") ||
    childData?.gender?.toLowerCase().includes("girl");
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
                    <FaUser style={{ fontSize: "30px" }} />
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
              {formValues.entries.map((entry, entryIndex) => {
                const entryErrors = errors.entries?.[entryIndex] || {};
                const eligibleAgeOptions = getEligibleAgeOptionsForEntry(entry.vaccinationDate);
                const vaccinationTypeOptions = getVaccinationTypeOptions(entry);
                const manualDoseOptions = getManualDoseOptions();
                const duplicateVaccination = hasDuplicateVaccination(entry);
                const duplicateEntry = hasDuplicateEntry(entryIndex);
                const isLastEntry = entryIndex === formValues.entries.length - 1;

                return (
                  <div
                    key={entry.id}
                    className={`vaccination-entry-block ${entryIndex > 0 ? "additional-entry" : ""}`}
                  >
                    <div className="form-row row-70">
                      <div className="form-field">
                        <label>Vaccination Date</label>
                        <input
                          type="date"
                          name="vaccinationDate"
                          value={entry.vaccinationDate}
                          min={formatDateForInput(childData?.dob)}
                          max={getTodayDate()}
                          onChange={(event) => handleEntryChange(entryIndex, event)}
                          className={entryErrors.vaccinationDate ? "input-error" : ""}
                        />
                        {entryErrors.vaccinationDate && <span className="error-msg">{entryErrors.vaccinationDate}</span>}
                      </div>
                      <div className="form-field">
                        <label>Age</label>
                        <select
                          name="age"
                          value={entry.age}
                          onChange={(event) => handleEntryChange(entryIndex, event)}
                          disabled={eligibleAgeOptions.length === 0}
                          className={entryErrors.age ? "input-error" : ""}
                        >
                          <option value="">-- Select Age --</option>
                          {eligibleAgeOptions.map((age) => <option key={age} value={age}>{age}</option>)}
                        </select>
                        {entryErrors.age && <span className="error-msg">{entryErrors.age}</span>}
                      </div>
                    </div>

                    <div className="form-row row-60-40">
                      <div className="form-field">
                        <label>Vaccination Name</label>
                        <select
                          name="vaccinationName"
                          value={entry.vaccinationName}
                          onChange={(event) => handleEntryChange(entryIndex, event)}
                          disabled={!entry.age}
                          className={entryErrors.vaccinationName ? "input-error" : ""}
                        >
                          <option value="">-- Select Vaccination Name --</option>
                          {allVaccinationNames.map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                        {entryErrors.vaccinationName && <span className="error-msg">{entryErrors.vaccinationName}</span>}
                      </div>
                      {entry.vaccinationName && vaccinationTypeOptions.length > 0 && (
                        <div className="form-field">
                          <label>Vaccination Type</label>
                          <select
                            name="vaccinationType"
                            value={entry.vaccinationType}
                            onChange={(event) => handleEntryChange(entryIndex, event)}
                            className={entryErrors.vaccinationType ? "input-error" : ""}
                          >
                            <option value="">Select</option>
                            {vaccinationTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                          {entryErrors.vaccinationType && <span className="error-msg">{entryErrors.vaccinationType}</span>}
                        </div>
                      )}
                    </div>

                    <div className="form-row full-width-row">
                      <div className="form-field">
                        <label>Select Dose</label>
                        <div className="dose-selection-row">
                          <div className={`dose-radio-container ${entryErrors.doseLabel ? "input-error" : ""}`}>
                            <div className="dose-options-list">
                              {manualDoseOptions.map((dose) => (
                                <label key={dose} className={`dose-card ${entry.doseLabel === dose ? "selected" : ""}`}>
                                  <input
                                    type="radio"
                                    name={`doseSelection-${entry.id}`}
                                    value={dose}
                                    checked={entry.doseLabel === dose}
                                    onChange={() => handleEntryChange(entryIndex, {
                                      target: {
                                        name: "doseLabel",
                                        value: dose
                                      }
                                    })}
                                  />
                                  <span>{dose}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="dose-action-buttons">
                            {formValues.entries.length > 1 && (
                              <button
                                type="button"
                                className="dose-remove-btn"
                                onClick={() => handleRemoveVaccinationEntry(entryIndex)}
                              >
                                <RxCross2/>
                              </button>
                            )}
                            
                            {isLastEntry && (
                              <button
                                type="button"
                                className="dose-add-btn"
                                onClick={() => handleAddVaccinationEntry(entryIndex)}
                              >
                                <FaPlus />
                              </button>
                            )}
                          </div>
                        </div>
                        {entryErrors.doseLabel && <span className="error-msg">{entryErrors.doseLabel}</span>}
                        {!entryErrors.doseLabel && duplicateVaccination && (
                          <span className="error-msg">Vaccine already injected</span>
                        )}
                        {!entryErrors.doseLabel && !duplicateVaccination && duplicateEntry && (
                          <span className="error-msg">This vaccination is already added.</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="measurement-actions">
                <button type="button" className="btn-reset" onClick={handleReset}>
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
