import React, { useState } from "react";
import styles from "./SavedJobs.module.css";
import { getSavedJobs, applyForJob } from "../api/jobs";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  // Fetch saved jobs on button click only
  const handleFetchSavedJobs = async () => {
    setLoading(true);
    setError("");
    setApplyError("");
    setApplySuccess("");
    try {
      // Backend internally uses auth user info to fetch saved jobs
      const response = await getSavedJobs(50); // pass only limit/count
      const jobs = response.data.recommendations || [];
      setSavedJobs(jobs);

      if (jobs.length === 0) {
        setError("No saved jobs found");
      }
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to fetch saved jobs. Please try again."
      );
      setSavedJobs([]);
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
    setApplyError("");
    setApplySuccess("");
    try {
      await applyForJob(matchId);
      setApplySuccess("Successfully applied to the job!");

      setTimeout(() => {
        setApplySuccess("");
      }, 3000);
    } catch (err) {
      setApplyError(err.response?.data?.detail || "Failed to apply for job");
      setTimeout(() => {
        setApplyError("");
      }, 5000);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={styles.savedJobsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Saved Jobs</h2>
        <p className={styles.description}>
          Your bookmarked job opportunities
        </p>
      </div>

      {/* Button to load saved jobs */}
      <div className={styles.searchSection}>
        <button 
          onClick={handleFetchSavedJobs}
          className={styles.searchButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Saved Jobs"}
        </button>
      </div>

      {/* Error Messages */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {applyError && <div className={styles.errorMessage}>{applyError}</div>}
      {applySuccess && <div className={styles.successMessage}>{applySuccess}</div>}

      {/* Loading Spinner */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your saved jobs...</p>
        </div>
      )}

      {/* Saved Jobs List */}
      {!loading && savedJobs.length > 0 && (
        <div className={styles.savedJobsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>
              {savedJobs.length} Saved Job{savedJobs.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <div className={styles.savedJobsList}>
            {savedJobs.map((match, index) => {
              const job = match.job || match;
              const matchId = match.id || match.match_id;

              return (
                <div 
                  key={matchId || index} 
                  className={styles.savedJobCard}
                >
                  <div 
                    className={styles.cardHeader}
                    onClick={() => setSelectedJob(selectedJob === index ? null : index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.jobInfo}>
                      <h4 className={styles.jobTitle}>
                        {job.title || job.job_title || `Job ${index + 1}`}
                      </h4>
                      <p className={styles.company}>
                        {job.company || "Company Name"}
                      </p>
                      <div className={styles.jobMeta}>
                        {job.location && <span className={styles.location}>📍 {job.location}</span>}
                        {job.job_type && <span className={styles.jobType}>{job.job_type}</span>}
                        {job.experience_level && <span className={styles.experience}>{job.experience_level}</span>}
                      </div>
                    </div>

                    <div className={styles.matchInfo}>
                      <div className={`${styles.matchScore} ${getMatchScoreColor(match.final_score)}`}>
                        <span className={styles.scoreNumber}>{formatScore(match.final_score)}%</span>
                        <span className={styles.scoreText}>{getMatchScoreText(match.final_score)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Breakdown */}
                  <div className={styles.scoresBreakdown}>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Skills:</span>
                      <span className={styles.scoreValue}>{formatScore(match.skill_score)}%</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Education:</span>
                      <span className={styles.scoreValue}>{formatScore(match.education_score)}%</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Experience:</span>
                      <span className={styles.scoreValue}>{formatScore(match.experience_score)}%</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>BERT:</span>
                      <span className={styles.scoreValue}>{formatScore(match.bert_score)}%</span>
                    </div>
                  </div>

                  {job.salary_min && job.salary_max && (
                    <div className={styles.salaryInfo}>
                      💰 ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                    </div>
                  )}

                  {selectedJob === index && (
                    <div className={styles.expandedContent}>
                      {job.description && (
                        <div className={styles.description}>
                          <h5>Job Description:</h5>
                          <p>{job.description}</p>
                        </div>
                      )}

                      {job.requirements && (
                        <div className={styles.requirements}>
                          <h5>Requirements:</h5>
                          <p>{job.requirements}</p>
                        </div>
                      )}

                      {job.skills && (
                        <div className={styles.skills}>
                          <h5>Required Skills:</h5>
                          <div className={styles.skillsTags}>
                            {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).map((skill, i) => (
                              <span key={i} className={styles.skillTag}>
                                {typeof skill === 'string' ? skill.trim() : skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Match Analysis */}
                      <div className={styles.matchAnalysis}>
                        <h5>Match Analysis:</h5>
                        <div className={styles.analysisGrid}>
                          <div className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>Final Score:</span>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreBarFill} 
                                style={{width: `${formatScore(match.final_score)}%`}}
                              ></div>
                              <span className={styles.scoreBarText}>{formatScore(match.final_score)}%</span>
                            </div>
                          </div>
                          <div className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>Skill Match:</span>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreBarFill} 
                                style={{width: `${formatScore(match.skill_score)}%`}}
                              ></div>
                              <span className={styles.scoreBarText}>{formatScore(match.skill_score)}%</span>
                            </div>
                          </div>
                          <div className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>Education Match:</span>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreBarFill} 
                                style={{width: `${formatScore(match.education_score)}%`}}
                              ></div>
                              <span className={styles.scoreBarText}>{formatScore(match.education_score)}%</span>
                            </div>
                          </div>
                          <div className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>Experience Match:</span>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreBarFill} 
                                style={{width: `${formatScore(match.experience_score)}%`}}
                              ></div>
                              <span className={styles.scoreBarText}>{formatScore(match.experience_score)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

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

                  <div className={styles.cardFooter}>
                    <span 
                      className={styles.expandToggle}
                      onClick={() => setSelectedJob(selectedJob === index ? null : index)}
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
      {!loading && !error && savedJobs.length === 0 && (
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