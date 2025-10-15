import React, { useState } from "react";
import styles from "./Recommendations.module.css";
import { getRecommendations } from "../api/recommendations";
import { saveJob } from "../api/jobs";
import { Notification } from "../assets/Notification";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    location: "",
    jobType: "",
    salaryMin: "",
    experience: "",
  });
  const [sortBy, setSortBy] = useState("final_score");
  const [saving, setSaving] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [notification, setNotification] = useState(null);

  const handleFetchRecommendations = async () => {
    setLoading(true);
    setNotification(null);

    try {
      const response = await getRecommendations(10);
      const recs = response.data.matches || response.data.recommendations || [];
      setRecommendations(recs);

      if (recs.length === 0) {
        setNotification({
          type: "error",
          message: "No job recommendations found.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Job recommendations loaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
      setNotification({
        type: "error",
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch recommendations. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredAndSortedRecommendations = recommendations
    .filter((rec) => {
      const job = rec.job || rec;
      if (
        filterCriteria.location &&
        !job.location?.toLowerCase().includes(filterCriteria.location.toLowerCase())
      ) {
        return false;
      }
      if (filterCriteria.jobType && job.job_type !== filterCriteria.jobType) {
        return false;
      }
      if (filterCriteria.salaryMin && job.salary_min < parseInt(filterCriteria.salaryMin)) {
        return false;
      }
      if (
        filterCriteria.experience &&
        !job.experience_level?.toLowerCase().includes(filterCriteria.experience.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "final_score":
          return (b.final_score || 0) - (a.final_score || 0);
        case "cosine_score":
          return (b.cosine_score || 0) - (a.cosine_score || 0);
        case "skill_score":
          return (b.skill_score || 0) - (a.skill_score || 0);
        case "salary": {
          const jobB = b.job || b;
          const jobA = a.job || a;
          return (jobB.salary_max || 0) - (jobA.salary_max || 0);
        }
        case "date": {
          const jobBDate = b.job || b;
          const jobADate = a.job || a;
          return (
            new Date(jobBDate.created_at || jobBDate.posted_date || 0) -
            new Date(jobADate.created_at || jobADate.posted_date || 0)
          );
        }
        default:
          return 0;
      }
    });

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

  const handleSaveJob = async (matchId) => {
    setSaving(true);
    try {
      await saveJob(matchId);
      setSavedJobIds((prev) => new Set([...prev, matchId]));
      setNotification({
        type: "success",
        message: "Job saved successfully!",
      });
    } catch (err) {
      console.error("Error saving job:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Failed to save job.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isJobSaved = (matchId) => savedJobIds.has(matchId);

  return (
    <div className={styles.recommendationsContainer}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Job Recommendations</h2>
        <p className={styles.description}>
          Find the best job matches based on your resume
        </p>
      </div>

      <div className={styles.searchSection}>
        <button
          onClick={handleFetchRecommendations}
          className={styles.searchButton}
          disabled={loading}
        >
          {loading ? "Searching..." : "Get Matches"}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className={styles.filtersSection}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Location</label>
              <input
                type="text"
                name="location"
                value={filterCriteria.location}
                onChange={handleFilterChange}
                placeholder="Any location"
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Job Type</label>
              <select
                name="jobType"
                value={filterCriteria.jobType}
                onChange={handleFilterChange}
                className={styles.filterSelect}
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Min Salary ($)</label>
              <input
                type="number"
                name="salaryMin"
                value={filterCriteria.salaryMin}
                onChange={handleFilterChange}
                placeholder="0"
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="final_score">Final Score</option>
                <option value="cosine_score">Cosine Score</option>
                <option value="skill_score">Skill Score</option>
                <option value="salary">Salary</option>
                <option value="date">Date Posted</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Finding your perfect job matches...</p>
        </div>
      )}

      {!loading && filteredAndSortedRecommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>
              {filteredAndSortedRecommendations.length} Job
              {filteredAndSortedRecommendations.length !== 1 ? "s" : ""} Found
            </h3>
          </div>

          <div className={styles.recommendationsList}>
            {filteredAndSortedRecommendations.map((match, index) => {
              const job = match.job || match;
              const matchId = match.id || match.match_id;

              return (
                <div key={matchId || index} className={styles.recommendationCard}>
                  <div
                    className={styles.cardHeader}
                    onClick={() =>
                      setSelectedJob(selectedJob === index ? null : index)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.jobInfo}>
                      <h4 className={styles.jobTitle}>
                        {job.title || job.job_title || `Job ${index + 1}`}
                      </h4>
                      <p className={styles.company}>
                        {job.company || "Company Name"}
                      </p>
                      <div className={styles.jobMeta}>
                        {job.location && (
                          <span className={styles.location}>📍 {job.location}</span>
                        )}
                        {job.job_type && <span className={styles.jobType}>{job.job_type}</span>}
                        {job.experience_level && (
                          <span className={styles.experience}>{job.experience_level}</span>
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

                  {job.salary_min && job.salary_max && (
                    <div className={styles.salaryInfo}>
                      💰 ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <button
                      className={`${styles.saveButton} ${
                        isJobSaved(matchId) ? styles.saved : ""
                      }`}
                      disabled={saving || isJobSaved(matchId)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveJob(matchId);
                      }}
                    >
                      {isJobSaved(matchId)
                        ? "✓ Saved"
                        : saving
                        ? "Saving..."
                        : "💾 Save Job"}
                    </button>

                    <span
                      className={styles.expandToggle}
                      onClick={() =>
                        setSelectedJob(selectedJob === index ? null : index)
                      }
                    >
                      {selectedJob === index ? "Show Less ▲" : "Show More ▼"}
                    </span>
                  </div>

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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !recommendations.length && (
        <div className={styles.initialState}>
          <div className={styles.initialIcon}>🎯</div>
          <h3>Find Your Perfect Job Match</h3>
          <p>Personalized job recommendations will appear here once available</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
