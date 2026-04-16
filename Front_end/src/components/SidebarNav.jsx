import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/nurture-logo.png";
import {
  FaCalendarAlt,
  FaChild,
  FaHome,
  FaSignOutAlt,
  FaThLarge,
  FaUserFriends,
  FaUserMd
} from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import "./SidebarNav.css";

const normalizePath = (path) => String(path || "").toLowerCase();

function SidebarNav() {
  const location = useLocation();
  const pathname = normalizePath(location.pathname);
  const isDashboardSection = pathname === "/home/dashboard";
  const isParentSection = pathname === "/home/parent" || pathname.startsWith("/home/parents/");
  const isChildrenSection = pathname.startsWith("/home/children");
  const isVaccinationSection = pathname.startsWith("/home/vaccination");
  const activeVaccinationSubmenu = pathname.endsWith("/missed")
    ? "missed"
    : pathname.endsWith("/upcoming")
      ? "upcoming"
      : "";
  const hasActiveVaccinationSubmenu = Boolean(activeVaccinationSubmenu);

  const [isVaccinationMenuOpen, setIsVaccinationMenuOpen] = useState(isVaccinationSection);
  const shouldMuteOtherMenus = isVaccinationMenuOpen;
  const shouldHighlightVaccinationMenu =
    !hasActiveVaccinationSubmenu && (isVaccinationSection || isVaccinationMenuOpen);
  const closeVaccinationMenu = () => setIsVaccinationMenuOpen(false);

  useEffect(() => {
    if (isVaccinationSection) {
      setIsVaccinationMenuOpen(true);
    }
  }, [isVaccinationSection]);

  return (
    <aside className="nurture-sidebar shared-sidebar">
      <div className="sidebar-header">
        <img src={Logo} alt="Logo" className="main-logo" />
        <button type="button" className="header-grid-icon" aria-label="Sidebar menu">
          <FaThLarge />
        </button>
      </div>

      <nav className="sidebar-links">
        <Link
          to="/Home/dashboard"
          className={`nav-link ${isDashboardSection && !shouldMuteOtherMenus ? "active" : ""}`}
          onClick={closeVaccinationMenu}
        >
          <FaHome />
          <span className="nav-link-text">Dashboard</span>
        </Link>

        <Link
          to="/Home/parent"
          className={`nav-link ${isParentSection && !shouldMuteOtherMenus ? "active" : ""}`}
          onClick={closeVaccinationMenu}
        >
          <FaUserFriends />
          <span className="nav-link-text">Parents</span>
        </Link>

        <Link
          to="/Home/children"
          className={`nav-link ${isChildrenSection && !shouldMuteOtherMenus ? "active" : ""}`}
          onClick={closeVaccinationMenu}
        >
          <FaChild />
          <span className="nav-link-text">Children</span>
        </Link>

        <Link to="/Home/physician" className="nav-link" onClick={closeVaccinationMenu}>
          <FaUserMd />
          <span className="nav-link-text">Physician</span>
        </Link>

        <Link to="/Home/appointments" className="nav-link" onClick={closeVaccinationMenu}>
          <FaCalendarAlt />
          <span className="nav-link-text">Appointments</span>
        </Link>

        <div className="sidebar-vaccination-menu">
          <button
            type="button"
            className={`nav-link sidebar-vaccination-trigger ${shouldHighlightVaccinationMenu ? "active" : ""}`}
            onClick={() => setIsVaccinationMenuOpen((previousValue) => !previousValue)}
            aria-expanded={isVaccinationMenuOpen}
            aria-controls="vaccination-submenu"
          >
            <span className="sidebar-vaccination-label">
              <RiCalendarScheduleFill />
              <span className="nav-link-text">Vaccination Schedule</span>
            </span>
          </button>

          {isVaccinationMenuOpen ? (
            <div id="vaccination-submenu" className="sidebar-vaccination-submenu">
              <Link
                to="/Home/vaccination/upcoming"
                className={`sub-menu-link ${activeVaccinationSubmenu === "upcoming" ? "active" : ""}`}
              >
                Upcoming Vaccination
              </Link>
              <Link
                to="/Home/vaccination/missed"
                className={`sub-menu-link ${activeVaccinationSubmenu === "missed" ? "active" : ""}`}
              >
                Missed Vaccination
              </Link>
            </div>
          ) : null}
        </div>

        <Link to="/logout" className="nav-link logout-link" onClick={closeVaccinationMenu}>
          <FaSignOutAlt />
          <span className="nav-link-text">Logout</span>
        </Link>
      </nav>
    </aside>
  );
}

export default SidebarNav;
