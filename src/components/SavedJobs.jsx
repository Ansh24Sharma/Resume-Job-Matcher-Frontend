import React, { useState } from "react";
import styles from "./SavedJobs.module.css";
import { getSavedJobs, applyForJob } from "../api/jobs";
import { Notification } from "../assets/Notification";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch saved jobs when button clicked
  const handleFetchSavedJobs = async () => {
    setLoading(true);
    setNotification(null);
    try {
      const response = await getSavedJobs(50);
      const jobs = response.data.recommendations || [];
      setSavedJobs(jobs);

      if (jobs.length === 0) {
        setNotification({
          type: "error",
          message: "No saved jobs found.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Saved jobs loaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs([]);
      setNotification({
        type: "error",
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch saved jobs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    const normalizedScore = score > 1 ? score : score * 100;
    if (normalizedScore >= 90) return styles.excellent;
    if (normalizedScore >= 80) return styles.verygood;
    if (normalizedScore >= 70) return styles.good;
    if (normalizedScore >= 60) return styles.fair;
    return styles.poor;
  };

  const getMatchScoreText = (score) => {
    const normalizedScore = score > 1 ? score : score * 100;
    if (normalizedScore >= 90) return "Excellent Match";
    if (normalizedScore >= 80) return "Very Good Match";
    if (normalizedScore >= 70) return "Good Match";
    if (normalizedScore >= 60) return "Fair Match";
    return "Poor Match";
  };

  const formatScore = (score) => {
    if (!score) return 0;
    return score > 1 ? Math.round(score) : Math.round(score * 100);
  };

  const handleApply = async (matchId) => {
    setApplying(true);
    setNotification(null);
    try {
      await applyForJob(matchId);
      setNotification({
        type: "success",
        message: "Successfully applied to the job!",
      });
    } catch (err) {
      console.error("Error applying for job:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Failed to apply for the job.",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={styles.savedJobsContainer}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Saved Jobs</h2>
        <p className={styles.description}>Your bookmarked job opportunities</p>
      </div>

      {/* Fetch Saved Jobs Button */}
      <div className={styles.searchSection}>
        <button
          onClick={handleFetchSavedJobs}
          className={styles.searchButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Saved Jobs"}
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your saved jobs...</p>
        </div>
      )}

      {/* Saved Jobs Display */}
      {!loading && savedJobs.length > 0 && (
        <div className={styles.savedJobsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>
              {savedJobs.length} Saved Job
              {savedJobs.length !== 1 ? "s" : ""}
            </h3>
          </div>

          <div className={styles.savedJobsList}>
            {savedJobs.map((match, index) => {
              const job = match.job || match;
              const matchId = match.id || match.match_id;

              return (
                <div key={matchId || index} className={styles.savedJobCard}>
                  <div
                    className={styles.cardHeader}
                    onClick={() => setSelectedJob(selectedJob === index ? null : index)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.jobInfo}>
                      <h4 className={styles.jobTitle}>
                        {job.title || job.job_title || `Job ${index + 1}`}
                      </h4>
                      <p className={styles.company}>{job.company || "Company Name"}</p>
                      <div className={styles.jobMeta}>
                        {job.location && (
                          <span className={styles.location}>📍 {job.location}</span>
                        )}
                        {job.job_type && (
                          <span className={styles.jobType}>{job.job_type}</span>
                        )}
                        {job.experience && (
                          <span className={styles.experience}>
                            📊 {JSON.parse(job.experience)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.matchInfo}>
                      <div
                        className={`${styles.matchScore} ${getMatchScoreColor(
                          match.final_score
                        )}`}
                      >
                        <span className={styles.scoreNumber}>
                          {formatScore(match.final_score)}%
                        </span>
                        <span className={styles.scoreText}>
                          {getMatchScoreText(match.final_score)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className={styles.scoresBreakdown}>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Skills:</span>
                      <span className={styles.scoreValue}>
                        {formatScore(match.skill_score)}%
                      </span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Education:</span>
                      <span className={styles.scoreValue}>
                        {formatScore(match.education_score)}%
                      </span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Experience:</span>
                      <span className={styles.scoreValue}>
                        {formatScore(match.experience_score)}%
                      </span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>BERT:</span>
                      <span className={styles.scoreValue}>
                        {formatScore(match.bert_score)}%
                      </span>
                    </div>
                  </div>

                  {/* Salary Info */}
                  {job.salary_min && job.salary_max && (
                    <div className={styles.salaryInfo}>
                      💰 ${job.salary_min?.toLocaleString()} - $
                      {job.salary_max?.toLocaleString()}
                    </div>
                  )}

                  {selectedJob === index && (
                    <div className={styles.expandedContent}>
                      {job.description && (
                        <div className={styles.jobDescription}>
                          <h5>Job Description:</h5>
                          <div
                            className={styles.formattedDescription}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                          />
                        </div>
                      )}

                      {job.education && (
                        <div className={styles.requirements}>
                          <h5>Requirements:</h5>
                          <p>{JSON.parse(job.education)}</p>
                        </div>
                      )}

                      {job.skills && (
                        <div className={styles.skills}>
                          <h5>Required Skills:</h5>
                          <div className={styles.skillsTags}>
                            {(Array.isArray(job.skills)
                              ? job.skills
                              : job.skills.split(",")
                            ).map((skill, i) => (
                              <span key={i} className={styles.skillTag}>
                                {typeof skill === "string" ? skill.trim() : skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Apply Button */}
                      <div className={styles.cardActions}>
                        <button
                          className={styles.applyButton}
                          disabled={applying}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(matchId);
                          }}
                        >
                          {applying ? "Applying..." : "Apply Now"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toggle Expand */}
                  <div className={styles.cardFooter}>
                    <span
                      className={styles.expandToggle}
                      onClick={() =>
                        setSelectedJob(selectedJob === index ? null : index)
                      }
                    >
                      {selectedJob === index ? "Show Less ▲" : "Show More ▼"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && savedJobs.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💼</div>
          <h3>No Saved Jobs Yet</h3>
          <p>Start saving jobs from the recommendations page to see them here</p>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
