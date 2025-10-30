import React, { useState, useEffect } from "react";
import styles from "./RecruiterDashboard.module.css";
import JobUpload from "./JobUpload";
import DisplayAllJobs from "./DisplayAllJobs";
import CandidateDetails from "./CandidateDetails";
import MatchesList from "./MatchesList";
import DarkVeil from "../animated_css/Darkviel";

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
    { id: "analytics", label: "Analytics", icon: "📈" }
  ];

  return (
    <div className={styles.recruiterContainer}>
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

      <div className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
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

        {activeTab === "analytics" && (
          <div className={styles.analyticsSection}>
            <h3 className={styles.sectionTitle}>Analytics Overview</h3>
            <div className={styles.chartPlaceholder}>
              <div className={styles.chartCard}>
                <h4>Application Trends</h4>
                <div className={styles.chartContent}>
                  <p>📈 Chart visualization will be implemented here</p>
                  <p>Track application volumes over time</p>
                </div>
              </div>
              
              <div className={styles.chartCard}>
                <h4>Skills Demand</h4>
                <div className={styles.chartContent}>
                  <p>📊 Chart visualization will be implemented here</p>
                  <p>Most requested skills in job postings</p>
                </div>
              </div>
              
              <div className={styles.chartCard}>
                <h4>Match Success Rate</h4>
                <div className={styles.chartContent}>
                  <p>🎯 Chart visualization will be implemented here</p>
                  <p>Percentage of successful matches</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;