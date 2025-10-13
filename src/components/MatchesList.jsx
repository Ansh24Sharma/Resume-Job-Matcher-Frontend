import React, { useState, useEffect } from "react";
import { getMatches, getMatchExplanation } from "../api/matches";
import styles from "./MatchesList.module.css";

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchExplanation, setMatchExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchExplanation = async (resumeId, jobId, jobSource = 'jobs') => {
    setLoadingExplanation(true);
    setError(null);
    try {
      const data = await getMatchExplanation(resumeId, jobId, jobSource);
      setMatchExplanation(data);
    } catch (err) {
      console.error("Error fetching match explanation:", err);
      setError(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleReviewMatch = (match) => {
    setSelectedMatch(match);
    setMatchExplanation(null);
    fetchMatchExplanation(match.resume_id, match.job_id, match.job_source || 'jobs');
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setMatchExplanation(null);
  };

  const getScoreColor = (score) => {
    const formattedScore = formatScore(score);
    if (formattedScore >= 90) return styles.excellent;
    if (formattedScore >= 80) return styles.verygood;
    if (formattedScore >= 70) return styles.good;
    if (formattedScore >= 60) return styles.fair;
    return styles.poor;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatScore = (score) => {
    if (!score) return 0;
    return score > 1 ? Math.round(score) : Math.round(score * 100);
  };

  const getMatchedSkills = (resumeSkills, jobSkills) => {
    if (!resumeSkills || !jobSkills) return [];
    return resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase() === skill.toLowerCase()
      )
    );
  };

  const getMissingSkills = (resumeSkills, jobSkills) => {
    if (!resumeSkills || !jobSkills) return jobSkills || [];
    return jobSkills.filter(jobSkill => 
      !resumeSkills.some(skill => 
        skill.toLowerCase() === jobSkill.toLowerCase()
      )
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedMatch) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>⚠️ {error}</p>
          <button onClick={fetchMatches} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Top Job-Candidate Matches</h3>
        <button onClick={fetchMatches} className={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {matches.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No matches found</p>
        </div>
      ) : (
        <div className={styles.matchesList}>
          {matches.map((match) => (
            <div key={match.id || `${match.resume_id}-${match.job_id}`} className={styles.matchCard}>
              <div className={styles.matchInfo}>
                <h4 className={styles.matchTitle}>{match.title}</h4>
                <p className={styles.candidateName}>
                  👤 {match.name}
                </p>
                <p className={styles.matchDate}>
                  📅 Matched on {formatDate(match.updated_at)}
                </p>
              </div>
              
              <div className={styles.matchScore}>
                <div className={`${styles.scoreCircle} ${getScoreColor(match.final_score)}`}>
                  {formatScore(match.final_score)}%
                </div>
              </div>
              
              <div className={styles.matchActions}>
                <button 
                  className={styles.reviewButton}
                  onClick={() => handleReviewMatch(match)}
                >
                  Review Match
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Match Details</h3>
              <button onClick={closeModal} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.modalContent}>
              {loadingExplanation ? (
                <div className={styles.modalLoading}>
                  <div className={styles.spinner}></div>
                  <p>Loading details...</p>
                </div>
              ) : error ? (
                <div className={styles.modalError}>
                  <p className={styles.errorMessage}>⚠️ {error}</p>
                  <button 
                    onClick={() => fetchMatchExplanation(selectedMatch.resume_id, selectedMatch.job_id, selectedMatch.job_source || 'jobs')} 
                    className={styles.retryButton}
                  >
                    Try Again
                  </button>
                </div>
              ) : matchExplanation ? (
                <div className={styles.explanationContent}>
                  <div className={styles.overviewSection}>
                    <div className={styles.explanationSection}>
                      <h4>Job Title</h4>
                      <p>{matchExplanation.job_title}</p>
                    </div>
                    
                    <div className={styles.explanationSection}>
                      <h4>Candidate</h4>
                      <p>{selectedMatch.name}</p>
                    </div>
                    
                    <div className={styles.explanationSection}>
                      <h4>Overall Match Score</h4>
                      <div className={`${styles.scoreCircleLarge} ${getScoreColor(matchExplanation.scores?.final_score)}`}>
                        {formatScore(matchExplanation.scores?.final_score)}%
                      </div>
                    </div>
                  </div>

                  <div className={styles.scoresBreakdown}>
                    <h4>Score Breakdown</h4>
                    <div className={styles.scoresList}>
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreLabel}>Skills Match</span>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreBarFill} 
                            style={{width: `${formatScore(matchExplanation.scores?.skill_score)}%`}}
                          ></div>
                        </div>
                        <span className={styles.scoreValue}>{formatScore(matchExplanation.scores?.skill_score)}%</span>
                      </div>
                      
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreLabel}>Education Match</span>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreBarFill} 
                            style={{width: `${formatScore(matchExplanation.scores?.education_score)}%`}}
                          ></div>
                        </div>
                        <span className={styles.scoreValue}>{formatScore(matchExplanation.scores?.education_score)}%</span>
                      </div>
                      
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreLabel}>Experience Match</span>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreBarFill} 
                            style={{width: `${formatScore(matchExplanation.scores?.experience_score)}%`}}
                          ></div>
                        </div>
                        <span className={styles.scoreValue}>{formatScore(matchExplanation.scores?.experience_score)}%</span>
                      </div>
                      
                      <div className={styles.scoreItem}>
                        <span className={styles.scoreLabel}>BERT Similarity</span>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreBarFill} 
                            style={{width: `${formatScore(matchExplanation.scores?.bert_score)}%`}}
                          ></div>
                        </div>
                        <span className={styles.scoreValue}>{formatScore(matchExplanation.scores?.bert_score)}%</span>
                      </div>
                    </div>
                  </div>

                  {matchExplanation.resume_skills && matchExplanation.job_skills && (
                    <div className={styles.skillsSection}>
                      <div className={styles.explanationSection}>
                        <h4>Matched Skills</h4>
                        {getMatchedSkills(matchExplanation.resume_skills, matchExplanation.job_skills).length > 0 ? (
                          <div className={styles.skillsGrid}>
                            {getMatchedSkills(matchExplanation.resume_skills, matchExplanation.job_skills).map((skill, index) => (
                              <span key={index} className={styles.skillBadgeMatched}>
                                ✅ {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.noData}>No matching skills found</p>
                        )}
                      </div>
                      
                      <div className={styles.explanationSection}>
                        <h4>Missing Skills</h4>
                        {getMissingSkills(matchExplanation.resume_skills, matchExplanation.job_skills).length > 0 ? (
                          <div className={styles.skillsGrid}>
                            {getMissingSkills(matchExplanation.resume_skills, matchExplanation.job_skills).map((skill, index) => (
                              <span key={index} className={styles.skillBadgeMissing}>
                                ⚠️ {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.noData}>All required skills present</p>
                        )}
                      </div>
                      
                      <div className={styles.explanationSection}>
                        <h4>All Candidate Skills</h4>
                        {matchExplanation.resume_skills && matchExplanation.resume_skills.length > 0 ? (
                          <div className={styles.skillsGrid}>
                            {matchExplanation.resume_skills.map((skill, index) => (
                              <span key={index} className={styles.skillBadge}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.noData}>No skills listed</p>
                        )}
                      </div>
                    </div>
                  )}

                  {matchExplanation.resume_education && matchExplanation.resume_education.length > 0 && (
                    <div className={styles.explanationSection}>
                      <h4>Candidate Education</h4>
                      <ul className={styles.educationList}>
                        {matchExplanation.resume_education.map((edu, index) => (
                          <li key={index}>🎓 {edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchExplanation.job_education && matchExplanation.job_education.length > 0 && (
                    <div className={styles.explanationSection}>
                      <h4>Required Education</h4>
                      <ul className={styles.educationList}>
                        {matchExplanation.job_education.map((edu, index) => (
                          <li key={index}>📋 {edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchExplanation.resume_experience && matchExplanation.resume_experience.length > 0 && (
                    <div className={styles.explanationSection}>
                      <h4>Candidate Experience</h4>
                      <ul className={styles.experienceList}>
                        {matchExplanation.resume_experience.map((exp, index) => (
                          <li key={index}>💼 {exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchExplanation.job_experience && matchExplanation.job_experience.length > 0 && (
                    <div className={styles.explanationSection}>
                      <h4>Required Experience</h4>
                      <ul className={styles.experienceList}>
                        {matchExplanation.job_experience.map((exp, index) => (
                          <li key={index}>📋 {exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.statusSection}>
                    <span className={styles.statusLabel}>Status:</span>
                    <span className={`${styles.statusBadgeLarge} ${styles[matchExplanation.status?.toLowerCase() || 'new']}`}>
                      {matchExplanation.status.replace(/_/g, " ").toUpperCase() || 'New'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className={styles.noData}>No explanation available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesList;