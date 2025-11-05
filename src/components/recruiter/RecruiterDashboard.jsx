import React, { useState, useEffect } from "react";
import styles from "./RecruiterDashboard.module.css";
import JobUpload from "./JobUpload";
import DisplayAllJobs from "./DisplayAllJobs";
import CandidateDetails from "./CandidateDetails";
import MatchesList from "./MatchesList";
import DarkVeil from "../../animated_css/Darkviel";

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("candidates");
  const [jobs, setJobs] = useState([]);
  
  const handleJobPosted = (newJob) => {
    setJobs(prev => [...prev, { ...newJob, id: Date.now(), applications: 0, status: "Active" }]);
    setActiveTab("all-jobs");
  };

  const tabs = [
    { id: "candidates", label: "Candidates", icon: "👥" },
    { id: "matches", label: "All Matches", icon: "🎯" },
    { id: "all-jobs", label: "All Jobs", icon: "📋" },
    { id: "post-job", label: "Add New Job", icon: "➕" },
  ];

  return (
    <div className={styles.recruiterContainer}>
      <div className="container-fluid">
        <div className={`${styles.dashboardHeader} mb-4`}>
            <div className={styles.welcomeSection}>
              <div className={styles.darkVeilBgWrapper}>
                <DarkVeil />
              </div>
              {/* Foreground Text */}
              <div className={styles.welcomeContent}>
                <h1 className={styles.welcomeTitle}>
                  Recruiter Dashboard
                </h1>
                <p className={styles.welcomeSubtitle}>
                  Manage candidates, job postings, and track matches
                </p>
              </div>
            </div>
          </div>
        
        <div className={styles.dashboardContent}>
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

          <div className={styles.tabContent}>
            {activeTab === "candidates" && (
              <CandidateDetails />
            )}

            {activeTab === "matches" && (
              <MatchesList />
            )}

            {activeTab === "all-jobs" && (
              <div className={styles.allJobsSection}>
                <DisplayAllJobs />
              </div>
            )}

            {activeTab === "post-job" && (
              <div className={styles.jobUploadSection}>
                <JobUpload onJobPosted={handleJobPosted} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;