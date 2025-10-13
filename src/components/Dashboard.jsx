import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import DarkVeil from "../animated_css/Darkviel";
import ResumeUpload from "./ResumeUpload";
import Recommendations from "./Recommendations";
import UserProfile from "./UserProfile";
import SavedJobs from "./SavedJobs";
import { getUserData } from "../utils/storage";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("recommendations");
  const userData = getUserData();


  const tabs = [
    { id: "recommendations", label: "Job Matches", icon: "🎯" },
    { id: "resume-upload", label: "Upload Resume", icon: "📄" },
    { id: "user-profile", label: "User Profile", icon: "📝" },
    { id: "saved-jobs", label: "Saved Jobs", icon: "💾" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "recommendations":
        return <Recommendations />;
      case "resume-upload":
        return <ResumeUpload />;
      case "user-profile":
        return <UserProfile />;
      case "saved-jobs":
        return <SavedJobs />;
      default:
        return <Recommendations />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className="container-fluid">
        {/* Dashboard Header */}
        <div className={`${styles.dashboardHeader} mb-4`}>
          <div className={styles.welcomeSection}>
            <div className={styles.darkVeilBgWrapper}>
              <DarkVeil />
            </div>
            {/* Foreground Text */}
            <div className={styles.welcomeContent}>
              <h1 className={styles.welcomeTitle}>
                Welcome back, {userData?.username || "User"}!
              </h1>
              <p className={styles.welcomeSubtitle}>
                Find your perfect job match with AI-powered recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className={styles.dashboardContent}>
          {/* Navigation Tabs */}
          <div className={`${styles.tabNavigation} mb-4`}>
            <div className="row g-2 w-100">
              {tabs.map((tab) => (
                <div key={tab.id} className="col-lg-3 col-md-6 col-sm-6">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.tabButton} ${
                      activeTab === tab.id ? styles.activeTab : ""
                    } w-100`}
                  >
                    <span className={styles.tabIcon}>{tab.icon}</span>
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className={styles.tabContent}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
