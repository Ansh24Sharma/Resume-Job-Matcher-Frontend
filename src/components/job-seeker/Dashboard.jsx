import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import DarkVeil from "../../animated_css/Darkviel";
import ResumeUpload from "./ResumeUpload";
import Recommendations from "./Recommendations";
import UserProfile from "./UserProfile";
import SavedJobs from "./SavedJobs";
import Chatbot from "./Chatbot";
import { getUserData } from "../../utils/storage";
import { getMyProfile } from "../../api/user_profile";
import { getAllJobs } from "../../api/jobs";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [resumeData, setResumeData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const userData = getUserData();

  // Fetch user's resume and available jobs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch resume data
        const profileResponse = await getMyProfile();
        console.log("Profile data:", profileResponse);
        setResumeData(profileResponse);

        // Fetch jobs data
        const jobsResponse = await getAllJobs();
        console.log("Jobs data:", jobsResponse);
        setJobsData(jobsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

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
        <div className={`${styles.dashboardHeader} mb-4`}>
          <div className={styles.welcomeSection}>
            <div className={styles.darkVeilBgWrapper}>
              <DarkVeil />
            </div>
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
          
          <div className={styles.tabContent}>{renderTabContent()}</div>
        </div>
      </div>

      {/* Pass resume and jobs data to chatbot */}
      {!isLoadingData && (
        <Chatbot resumeData={resumeData} jobsData={jobsData} />
      )}
    </div>
  );
};

export default Dashboard;