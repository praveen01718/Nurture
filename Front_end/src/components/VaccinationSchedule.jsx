import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Logo from "../assets/nurture-logo.png";
import Profile from "../Images/user-img7.png";
import {
  FaThLarge,
  FaUserFriends,
  FaChild,
  FaUserMd,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBell,
  FaHome,
  FaUser,
  FaSearch,
  FaPhoneAlt,
  FaEnvelope,
  FaAngleDown,
  FaTimes
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { BiInjection, BiSolidErrorCircle } from "react-icons/bi"
import { VACCINATION_SCHEDULE } from "../constants/vaccinationSchedule";
import "./VaccinationSchedule.css";

const API_BASE = "http://localhost:5000";

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const parseDate = (dateValue) => {
  if (!dateValue) return null;

  const normalizedDate =
    typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
      ? `${dateValue}T00:00:00`
      : dateValue;
  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "--";

  return dateValue.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatForInput = (dateValue) => {
  const parsedDate = new Date(dateValue);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateAgeText = (dob) => {
  const birthDate = parseDate(dob);
  if (!birthDate) return "--";

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
    months += 12;
  }

  return years < 1 ? `${months} Mons` : `${years} Yrs ${months} Mons`;
};

const addDuration = (baseDate, amount, unit) => {
  const targetDate = new Date(baseDate);

  if (unit.startsWith("week")) {
    targetDate.setDate(targetDate.getDate() + amount * 7);
  } else if (unit.startsWith("month")) {
    targetDate.setMonth(targetDate.getMonth() + amount);
  } else if (unit.startsWith("year")) {
    targetDate.setFullYear(targetDate.getFullYear() + amount);
  }

  return targetDate;
};

const getDueWindow = (dobValue, ageLabel) => {
  const dob = parseDate(dobValue);
  if (!dob || !ageLabel) return null;

  const normalizedAge = ageLabel.trim().toLowerCase();

  if (normalizedAge === "birth" || normalizedAge === "at birth") {
    return { startDate: dob, endDate: dob };
  }

  const rangeMatch = normalizedAge.match(/^(\d+)\s*-\s*(\d+)\s*(week|weeks|month|months|year|years)$/i);
  if (rangeMatch) {
    const minAmount = Number(rangeMatch[1]);
    const maxAmount = Number(rangeMatch[2]);
    const unit = rangeMatch[3].toLowerCase();

    return {
      startDate: addDuration(dob, minAmount, unit),
      endDate: addDuration(dob, maxAmount, unit)
    };
  }

  const singleMatch = normalizedAge.match(/^(\d+)\s*(week|weeks|month|months|year|years)$/i);
  if (singleMatch) {
    const amount = Number(singleMatch[1]);
    const unit = singleMatch[2].toLowerCase();
    const targetDate = addDuration(dob, amount, unit);

    return {
      startDate: targetDate,
      endDate: targetDate
    };
  }

  return null;
};

const getDoseText = (doseLabel) =>
  normalizeValue(doseLabel) === "booster" ? "Booster" : `${doseLabel} dose`;

const getVaccinationTitle = (vaccine) => {
  const typeText = vaccine.type ? ` - ${vaccine.type}` : "";
  return `${vaccine.name}${typeText} ${getDoseText(vaccine.dose)}`;
};

const getVaccineSequenceKey = (vaccine) =>
  `${normalizeValue(vaccine.name)}::${normalizeValue(vaccine.type || "")}`;

const toStartOfDay = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndOfDay = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(23, 59, 59, 999);
  return date;
};

const QUICK_RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "next7", label: "Next 7 Days" },
  { key: "next30", label: "Next 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "nextMonth", label: "Next Month" }
];

const buildQuickRange = (key) => {
  const today = toStartOfDay(new Date());
  const makeRange = (start, end) => ({
    startDate: toStartOfDay(start),
    endDate: toStartOfDay(end),
    key: "selection"
  });

  if (key === "today") {
    return makeRange(today, today);
  }

  if (key === "tomorrow") {
    const tomorrow = toStartOfDay(new Date(today));
    tomorrow.setDate(tomorrow.getDate() + 1);
    return makeRange(tomorrow, tomorrow);
  }

  if (key === "next7") {
    const endDate = toStartOfDay(new Date(today));
    endDate.setDate(endDate.getDate() + 6);
    return makeRange(today, endDate);
  }

  if (key === "next30") {
    const endDate = toStartOfDay(new Date(today));
    endDate.setDate(endDate.getDate() + 29);
    return makeRange(today, endDate);
  }

  if (key === "thisMonth") {
    const monthStart = toStartOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
    const monthEnd = toStartOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    return makeRange(monthStart, monthEnd);
  }

  if (key === "nextMonth") {
    const monthStart = toStartOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    const monthEnd = toStartOfDay(new Date(today.getFullYear(), today.getMonth() + 2, 0));
    return makeRange(monthStart, monthEnd);
  }

  return null;
};

const DEFAULT_THIS_MONTH_RANGE = buildQuickRange("thisMonth");

function VaccinationSchedule() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedModalRow, setSelectedModalRow] = useState(null);
  const [modalItemLimit, setModalItemLimit] = useState(5);

  const [startDate, setStartDate] = useState(() => formatForInput(DEFAULT_THIS_MONTH_RANGE.startDate));
  const [endDate, setEndDate] = useState(() => formatForInput(DEFAULT_THIS_MONTH_RANGE.endDate));
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [draftRange, setDraftRange] = useState({
    startDate: DEFAULT_THIS_MONTH_RANGE.startDate,
    endDate: DEFAULT_THIS_MONTH_RANGE.endDate,
    key: "selection"
  });
  const [activeQuickRange, setActiveQuickRange] = useState("");
  const dateSelectorRef = useRef(null);

  const formattedRangeText = useMemo(() => {
    const formatRangeDate = (dateString) => {
      const parsedDate = parseDate(dateString);

      if (!parsedDate) {
        return "--";
      }

      return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };

    const startFormatted = formatRangeDate(startDate);
    const endFormatted = formatRangeDate(endDate);
    
    if (startFormatted === "--" && endFormatted === "--") {
      return "Select Date Range";
    }
    
    return `${startFormatted} - ${endFormatted}`;
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchVaccinationScheduleData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await axios.get(`${API_BASE}/api/vaccinations/schedule`);
        setChildren(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setLoadError("Unable to load vaccination schedule right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationScheduleData();
  }, []);

  useEffect(() => {
    if (!isDateSelectorOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (dateSelectorRef.current && !dateSelectorRef.current.contains(event.target)) {
        setIsDateSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDateSelectorOpen]);

  const groupedRows = useMemo(() => {
    const startBoundary = startDate ? toStartOfDay(startDate) : null;
    const endBoundary = endDate ? toEndOfDay(endDate) : null;
    const now = toStartOfDay(new Date());
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const findDoneRecord = (records, vaccine, ageLabel) => {
      const targetName = normalizeValue(vaccine.name);
      const targetType = normalizeValue(vaccine.type || "");
      const targetDose = normalizeValue(vaccine.dose);
      const targetAge = normalizeValue(ageLabel);

      return records.find((record) => {
        const recordNameMatches = normalizeValue(record.vaccination_name) === targetName;
        const recordDoseMatches = normalizeValue(record.dose_label) === targetDose;
        const recordAgeMatches = normalizeValue(record.age_label) === targetAge;
        const recordTypeValue = normalizeValue(record.vaccination_type || "");

        const recordTypeMatches = targetType
          ? recordTypeValue === targetType
          : !recordTypeValue || recordTypeValue === targetType;

        return recordNameMatches && recordDoseMatches && recordAgeMatches && recordTypeMatches;
      });
    };

    const scheduleEntriesByVaccine = new Map();

    VACCINATION_SCHEDULE.forEach((section, sectionIndex) => {
      section.vaccines.forEach((vaccine, vaccineIndex) => {
        const sequenceKey = getVaccineSequenceKey(vaccine);
        const existingEntries = scheduleEntriesByVaccine.get(sequenceKey) || [];

        existingEntries.push({
          sectionAge: section.age,
          vaccine,
          orderIndex: sectionIndex * 100 + vaccineIndex
        });

        scheduleEntriesByVaccine.set(sequenceKey, existingEntries);
      });
    });

    const items = [];

    children.forEach((child) => {
      const childVaccinations = Array.isArray(child.vaccinations) ? child.vaccinations : [];

      scheduleEntriesByVaccine.forEach((sequenceEntries) => {
        const orderedEntries = [...sequenceEntries].sort((left, right) => left.orderIndex - right.orderIndex);

        const completionByEntry = orderedEntries.map((entry) =>
          findDoneRecord(childVaccinations, entry.vaccine, entry.sectionAge)
        );

        const nextPendingIndex = completionByEntry.findIndex((record) => !record);

        if (nextPendingIndex < 0) {
          return;
        }

        const pendingEntry = orderedEntries[nextPendingIndex];
        const pendingWindowFromDob = getDueWindow(child.dob, pendingEntry.sectionAge);

        if (!pendingWindowFromDob) {
          return;
        }

        let dueDate = pendingWindowFromDob.startDate;
        let missedCutoff = pendingWindowFromDob.endDate;

        if (nextPendingIndex > 0) {
          const previousEntry = orderedEntries[nextPendingIndex - 1];
          const previousCompletedRecord = completionByEntry[nextPendingIndex - 1];
          const previousVaccinatedDate = parseDate(previousCompletedRecord?.vaccination_date);
          const previousWindowFromDob = getDueWindow(child.dob, previousEntry.sectionAge);

          if (previousVaccinatedDate && previousWindowFromDob) {
            const startOffsetMs =
              pendingWindowFromDob.startDate.getTime() - previousWindowFromDob.startDate.getTime();
            const endOffsetMs =
              pendingWindowFromDob.endDate.getTime() - previousWindowFromDob.startDate.getTime();

            dueDate = toStartOfDay(previousVaccinatedDate.getTime() + startOffsetMs);
            missedCutoff = toEndOfDay(previousVaccinatedDate.getTime() + endOffsetMs);
          }
        }

        const isMissed = missedCutoff < now;
        const isUpcoming = !isMissed;

        // Skip date filtering if user hasn't selected dates yet
        if (startBoundary && endBoundary) {
          if (isUpcoming && (dueDate < startBoundary || dueDate > endBoundary)) {
            return;
          }

          if (isMissed && (missedCutoff < startBoundary || missedCutoff > endBoundary)) {
            return;
          }
        }

        items.push({
          status: isMissed ? "missed" : "upcoming",
          childId: child.id,
          childName: child.childName || "Unknown Child",
          childGender: child.gender || "--",
          childAgeText: calculateAgeText(child.dob),
          profileImage: child.profileImage || "",
          parentName: `${child.firstName || ""} ${child.lastName || ""}`.trim() || "--",
          parentPhone: child.phone || "--",
          parentEmail: child.email || "--",
          vaccineTitle: getVaccinationTitle(pendingEntry.vaccine),
          scheduleAge: pendingEntry.sectionAge,
          dueDate: isMissed ? missedCutoff : dueDate
        });
      });
    });

    const filteredItems = items
      .filter((item) => item.status === activeView)
      .sort((left, right) => {
        if (activeView === "upcoming") {
          return left.dueDate - right.dueDate;
        }

        return right.dueDate - left.dueDate;
      });

    const groupedByChild = filteredItems.reduce((accumulator, currentItem) => {
      const existingGroup = accumulator.get(currentItem.childId) || [];
      existingGroup.push(currentItem);
      accumulator.set(currentItem.childId, existingGroup);
      return accumulator;
    }, new Map());

    const rows = children.map((child) => {
      const childItems = groupedByChild.get(child.id) || [];
      const primaryItem = childItems[0];

      return {
        status: activeView,
        childId: child.id,
        childName: child.childName || "Unknown Child",
        childGender: child.gender || "--",
        childAgeText: calculateAgeText(child.dob),
        profileImage: child.profileImage || "",
        parentName: `${child.firstName || ""} ${child.lastName || ""}`.trim() || "--",
        parentPhone: child.phone || "--",
        parentEmail: child.email || "--",
        vaccineTitle: primaryItem
          ? primaryItem.vaccineTitle
          : activeView === "upcoming"
            ? "No upcoming vaccination in selected range"
            : "No missed vaccination in selected range",
        scheduleAge: primaryItem?.scheduleAge || "",
        dueDate: primaryItem?.dueDate || null,
        extraItems: childItems.slice(1),
        vaccinationItems: childItems
      };
    })
    .filter((row) => row.vaccinationItems.length > 0);

    return rows
      .filter((row) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        const childInfoText = [
          row.childName,
          row.childGender,
          row.childAgeText,
          row.parentName,
          row.parentPhone,
          row.parentEmail
        ]
          .join(" ")
          .toLowerCase();

        const vaccinationInfoText = [
          row.vaccineTitle,
          row.scheduleAge,
          ...row.extraItems.map((item) => `${item.vaccineTitle} ${item.scheduleAge}`)
        ]
          .join(" ")
          .toLowerCase();

        return (
          childInfoText.includes(normalizedSearchTerm) ||
          vaccinationInfoText.includes(normalizedSearchTerm)
        );
      })
      .sort((leftRow, rightRow) => {
        const leftHasDate = Boolean(leftRow.dueDate);
        const rightHasDate = Boolean(rightRow.dueDate);

        if (leftHasDate !== rightHasDate) {
          return leftHasDate ? -1 : 1;
        }

        if (leftHasDate && rightHasDate) {
          if (activeView === "upcoming") {
            return leftRow.dueDate - rightRow.dueDate;
          }

          return rightRow.dueDate - leftRow.dueDate;
        }

        return leftRow.childName.localeCompare(rightRow.childName);
      });
  }, [activeView, children, endDate, searchTerm, startDate]);

  const openMoreModal = (row) => {
    if (!row?.vaccinationItems?.length) {
      return;
    }

    setSelectedModalRow(row);
    setModalItemLimit(5);
  };

  const closeMoreModal = () => {
    setSelectedModalRow(null);
  };

  const openDateSelector = () => {
    const thisMonthRange = buildQuickRange("thisMonth");
    const selectedStart = parseDate(startDate);
    const selectedEnd = parseDate(endDate);

    const initialStart = selectedStart || thisMonthRange.startDate;
    const initialEnd = selectedEnd && selectedEnd >= initialStart ? selectedEnd : selectedStart || thisMonthRange.endDate;

    setDraftRange({
      startDate: toStartOfDay(initialStart),
      endDate: toStartOfDay(initialEnd),
      key: "selection"
    });

    const isCurrentThisMonth =
      Boolean(selectedStart) &&
      Boolean(selectedEnd) &&
      formatForInput(selectedStart) === formatForInput(thisMonthRange.startDate) &&
      formatForInput(selectedEnd) === formatForInput(thisMonthRange.endDate);

    setActiveQuickRange(isCurrentThisMonth ? "thisMonth" : "");
    setIsDateSelectorOpen(true);
  };

  const handleDateSelectorCancel = () => {
    setActiveQuickRange("");
    setIsDateSelectorOpen(false);
  };

  const handleDateSelectorApply = () => {
    const normalizedStart = toStartOfDay(draftRange.startDate);
    const normalizedEnd = toStartOfDay(draftRange.endDate || draftRange.startDate);

    setStartDate(formatForInput(normalizedStart));
    setEndDate(formatForInput(normalizedEnd));
    setIsDateSelectorOpen(false);
  };

  const handleQuickRangeSelect = (key) => {
    const nextRange = buildQuickRange(key);
    if (!nextRange) {
      return;
    }

    setDraftRange(nextRange);
    setActiveQuickRange(key);
  };

  const modalVaccinations = selectedModalRow?.vaccinationItems || [];

  useEffect(() => {
    if (!selectedModalRow) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMoreModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedModalRow]);

  return (
    <div className="vaccination-schedule-page dashboard-wrapper">
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

          <div className="vaccination-menu-block">
            <Link to="/Home/vaccination" className="nav-link active"><RiCalendarScheduleFill /> <span>Vaccination Schedule</span></Link>
            <button
              type="button"
              className={`sub-menu-link ${activeView === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveView("upcoming")}
            >
              Upcoming Vaccination
            </button>
            <button
              type="button"
              className={`sub-menu-link ${activeView === "missed" ? "active" : ""}`}
              onClick={() => setActiveView("missed")}
            >
              Missed Vaccination
            </button>
          </div>

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
          <div className="table-header-bar-vaccination">
            <div className="header-titles">
              <h2>{activeView === "upcoming" ? "Upcoming Vaccination" : "Missed Vaccination"}</h2>
              <p className="breadcrumb">Home / Vaccination Schedule</p>
            </div>
            <div className="header-back-button" onClick={() => navigate("/Home/dashboard")}><MdArrowBack size={20} /></div>
          </div>

          <div className="vaccination-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button className="search-btn" type="button"><FaSearch /></button>
            </div>

            <div className="date-filter-wrap" ref={dateSelectorRef}>
              <button
                type="button"
                className={`date-range-toggle ${isDateSelectorOpen ? "open" : ""}`}
                onClick={() => (isDateSelectorOpen ? handleDateSelectorCancel() : openDateSelector())}
                aria-haspopup="dialog"
                aria-expanded={isDateSelectorOpen}
              >
                <span className="date-range-display">
                  <FaCalendarAlt />
                  <span>{formattedRangeText}</span>
                </span>
                <span className="date-range-caret"><FaAngleDown /></span>
              </button>

              {isDateSelectorOpen ? (
                <div className="date-selector-popover" role="dialog" aria-label="Select date range">
                  <div className="date-selector-quick-panel">
                    <p className="date-selector-quick-title">Quick Select</p>
                    {QUICK_RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`quick-range-btn ${activeQuickRange === option.key ? "active" : ""}`}
                        onClick={() => handleQuickRangeSelect(option.key)}
                      >
                        {option.label}
                      </button>
                    ))}

                    <div className="date-selector-actions">
                      <button type="button" className="date-action-btn cancel" onClick={handleDateSelectorCancel}>
                        Cancel
                      </button>
                      <button type="button" className="date-action-btn apply" onClick={handleDateSelectorApply}>
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="date-selector-calendar-panel">
                    <div className="date-selector-range-inputs">
                      <div className="date-selector-range-box">
                        <strong>{formatDate(draftRange.startDate)}</strong>
                      </div>
                      <div className="date-selector-range-box">
                        <strong>{formatDate(draftRange.endDate || draftRange.startDate)}</strong>
                      </div>
                    </div>

                    <div className="date-selector-calendar-grid">
                      <DateRange
                        editableDateInputs
                        moveRangeOnFirstSelection={false}
                        ranges={[draftRange]}
                        onChange={(item) => {
                          const selection = item.selection;
                          setDraftRange({
                            startDate: toStartOfDay(selection.startDate),
                            endDate: toStartOfDay(selection.endDate || selection.startDate),
                            key: "selection"
                          });
                          setActiveQuickRange("");
                        }}
                        months={2}
                        direction="horizontal"
                        showDateDisplay={false}
                        showMonthAndYearPickers
                        rangeColors={["#3d91ff"]}
                      />    
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="vaccination-table-card">
            <div className="vaccination-table-head">
              <span>Children Details</span>
              <span>{activeView === "upcoming" ? "Upcoming Vaccination & Date" : "Missed Vaccination & Date"}</span>
              <span>Parent</span>
            </div>

            {loading ? (
              <div className="state-block">Loading vaccination schedule...</div>
            ) : loadError ? (
              <div className="state-block error">{loadError}</div>
            ) : groupedRows.length === 0 ? (
              <div className="state-block">No records found for selected Date Range.</div>
            ) : (
              groupedRows.map((row) => {
                const isBoy = normalizeValue(row.childGender) === "boy";

                return (
                  <div className="vaccination-table-row" key={`${row.status}-${row.childId}`}>
                    <div className="child-cell">
                      <div
                        className="child-avatar"
                        style={{ borderColor: isBoy ? "#87ceeb" : "#f6a2c8" }}
                      >
                        {row.profileImage ? (
                          <img src={`${API_BASE}/uploads/${row.profileImage}`} alt={row.childName} />
                        ) : (
                          <FaUser />
                        )}
                      </div>

                      <div className="child-text-stack">
                        <p className="child-name">{row.childName}</p>
                        <p className="child-meta">
                          <span className={isBoy ? "boy" : "girl"}>{row.childGender}</span>
                          <span> - {row.childAgeText}</span>
                        </p>
                      </div>
                    </div>

                    <div className="vaccination-cell">
                      <p className={`vaccine-title ${row.dueDate ? "" : "empty"}`}>{row.vaccineTitle}</p>
                      {row.dueDate ? (
                        <span className="vaccine-date-tag">{formatDate(row.dueDate)}</span>
                      ) : null}
                      {row.vaccinationItems.length > 0 ? (
                        <div className="view-more-wrap">
                          <button
                            type="button"
                            className="view-more-btn"
                            onClick={() => openMoreModal(row)}
                          >
                            {row.extraItems.length > 0
                              ? `+${row.extraItems.length} View More`
                              : "View More"}
                          </button>
                          <button
                            type="button"
                            className="view-more-arrow"
                            aria-label="Open more vaccinations"
                            onClick={() => openMoreModal(row)}
                          >
                            &gt;
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="parent-cell">
                      <p className="parent-name">{row.parentName}</p>
                      <p className="parent-phone"><FaPhoneAlt /> {row.parentPhone}</p>
                      <p className="parent-email"><FaEnvelope /> {row.parentEmail}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedModalRow ? (
        <div className="vaccination-modal-overlay" onClick={closeMoreModal}>
          <div className="vaccination-modal" onClick={(event) => event.stopPropagation()}>
            <div className="vaccination-modal-header">
              <h3>
                <BiInjection/> {selectedModalRow.childName}'s {selectedModalRow.status === "upcoming" ? "Upcoming" : "Missed"} Vaccination
              </h3>
              <button
                type="button"
                className="vaccination-modal-close"
                onClick={closeMoreModal}
                aria-label="Close vaccination details"
              >
                <FaTimes />
              </button>
            </div>

            <div className="vaccination-modal-body">
              <div className="vaccination-modal-child-card">
                <div
                  className="vaccination-modal-avatar"
                  style={{ borderColor: normalizeValue(selectedModalRow.childGender) === "boy" ? "#87ceeb" : "#f6a2c8" }}
                >
                  {selectedModalRow.profileImage ? (
                    <img src={`${API_BASE}/uploads/${selectedModalRow.profileImage}`} alt={selectedModalRow.childName} />
                  ) : (
                    <FaUser />
                  )}
                </div>

                <div className="vaccination-modal-child-meta">
                  <p className="vaccination-modal-child-name">{selectedModalRow.childName}</p>
                  <p className="vaccination-modal-child-line">Age: {selectedModalRow.childAgeText}</p>
                  <p className="vaccination-modal-child-line">Parent: {selectedModalRow.parentName}</p>
                </div>
              </div>

              <div className="vaccination-modal-section-divider" />

              <div className="vaccination-modal-section-header">
                <div className="vaccination-modal-section-title">
                  <BiInjection /> <BiSolidErrorCircle/>
                  <span>
                    {selectedModalRow.status === "upcoming" ? "Upcoming Vaccination" : "Missed Vaccination"} ({modalVaccinations.length} Vaccinations)
                  </span>
                </div>

                <label className="vaccination-modal-count-picker">
                  <select
                    value={modalItemLimit}
                    onChange={(event) => setModalItemLimit(Number(event.target.value))}
                    aria-label="Number of vaccinations to show"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                </label>
              </div>

              <div className="vaccination-modal-list">
                {modalVaccinations.slice(0, modalItemLimit).map((item, index) => (
                  <div className="vaccination-modal-item" key={`${item.vaccineTitle}-${item.scheduleAge}-${index}`}>
                    <div className="vaccination-modal-item-content">
                      <p className="vaccination-modal-item-title">{item.vaccineTitle}</p>
                      <p className="vaccination-modal-item-label">
                        {selectedModalRow.status === "upcoming" ? "Scheduled Date" : "Scheduled Date"}
                      </p>
                    </div>
                    <span className="vaccination-modal-item-date">{formatDate(item.dueDate)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="vaccination-modal-section-footer-divider" />

            <div className="vaccination-modal-footer">
              <button type="button" className="vaccination-modal-close-btn" onClick={closeMoreModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default VaccinationSchedule;
