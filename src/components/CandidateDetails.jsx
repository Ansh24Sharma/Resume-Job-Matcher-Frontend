import React, { useState, useEffect } from "react";
import styles from "./CandidateDetails.module.css";
import { getMyCandidates, getCandidateStatistics, updateCandidateStatus, scheduleInterview } from "../api/candidates";
import { downloadResume } from "../api/resumes";
import { Notification } from "../assets/Notification";

const CandidateDetails = () => {
  const [candidates, setCandidates] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    experience: "",
    skills: "",
    location: "",
    score: "",
    status: ""
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewData, setInterviewData] = useState({
    interview_date: "",
    interview_time: "",
    interview_type: "video",
    meeting_link: "",
    additional_notes: ""
  });
  const [downloadingResume, setDownloadingResume] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadCandidates();
    loadStatistics();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getMyCandidates();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error("Error loading candidates:", error);
      setNotification({
        type: "error",
        message: "Failed to load candidates."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getCandidateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
      setNotification({
        type: "error",
        message: "Failed to load candidate statistics."
      });
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExperience = !filterCriteria.experience ||
      candidate.experience.length.toString().includes(filterCriteria.experience);
    
    const matchesSkills = !filterCriteria.skills ||
      candidate.skills.some(skill =>
        skill.toLowerCase().includes(filterCriteria.skills.toLowerCase())
      );
    
    const matchesLocation = !filterCriteria.location ||
      candidate.location?.toLowerCase().includes(filterCriteria.location.toLowerCase());
    
    const matchesScore = !filterCriteria.score || candidate.final_score >= parseInt(filterCriteria.score);
    const matchesStatus = !filterCriteria.status || candidate.status === filterCriteria.status;

    return matchesSearch && matchesExperience && matchesSkills && matchesLocation && matchesScore && matchesStatus;
  });

  const getScoreColor = (score) => {
    const formattedScore = formatScore(score);
    if (formattedScore >= 90) return styles.excellent;
    if (formattedScore >= 80) return styles.verygood;
    if (formattedScore >= 70) return styles.good;
    if (formattedScore >= 60) return styles.fair;
    return styles.poor;
  };

  const formatScore = (score) => {
    if (!score) return 0;
    return score > 1 ? Math.round(score) : Math.round(score * 100);
  };

  const handleDownloadResume = async (candidate) => {
    setDownloadingResume(candidate.candidate_id);
    try {
      const response = await downloadResume(candidate.user_id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidate.name}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setNotification({
        type: "success",
        message: "Resume downloaded successfully!"
      });
    } catch (error) {
      console.error("Error downloading resume:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.detail || "Failed to download resume."
      });
    } finally {
      setDownloadingResume(null);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setCandidates(prev =>
        prev.map(candidate =>
          candidate.candidate_id === candidateId ? { ...candidate, status: newStatus } : candidate
        )
      );
      loadStatistics();
      setNotification({
        type: "success",
        message: `Candidate status updated to ${newStatus.toUpperCase()}.`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setNotification({
        type: "error",
        message: "Failed to update candidate status."
      });
    }
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await scheduleInterview(selectedCandidate.candidate_id, interviewData);
      setNotification({
        type: "success",
        message: "Interview scheduled successfully! Email sent to candidate."
      });
      setShowScheduleModal(false);
      setInterviewData({
        interview_date: "",
        interview_time: "",
        interview_type: "video",
        meeting_link: "",
        additional_notes: ""
      });
      loadCandidates();
      loadStatistics();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      setNotification({
        type: "error",
        message: "Failed to schedule interview."
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Candidate Management</h2>
        <p className={styles.description}>Manage and track your candidate pipeline</p>
      </div>

      {statistics && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.total_candidates}</div>
            <div className={styles.statLabel}>Total Candidates</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.available}</div>
            <div className={styles.statLabel}>Available</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.interview_scheduled}</div>
            <div className={styles.statLabel}>Interviews Scheduled</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.under_review}</div>
            <div className={styles.statLabel}>Under Review</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{statistics.hired}</div>
            <div className={styles.statLabel}>Hired</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatScore(statistics.average_match_score)}%</div>
            <div className={styles.statLabel}>Avg Match Score</div>
          </div>
        </div>
      )}

      <div className={styles.searchSection}>
        <div className={styles.searchInput}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates by name, email, or skills..."
            className={styles.searchField}
          />
        </div>
        
        <div className={styles.filtersRow}>
          <select
            value={filterCriteria.status}
            onChange={(e) => setFilterCriteria(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="under_review">Under Review</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterCriteria.experience}
            onChange={(e) => setFilterCriteria(prev => ({ ...prev, experience: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">All Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5+">5+ years</option>
          </select>
          
          <input
            type="text"
            value={filterCriteria.skills}
            onChange={(e) => setFilterCriteria(prev => ({ ...prev, skills: e.target.value }))}
            placeholder="Filter by skills"
            className={styles.filterInput}
          />
          
          <input
            type="text"
            value={filterCriteria.location}
            onChange={(e) => setFilterCriteria(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Filter by location"
            className={styles.filterInput}
          />
          
          <input
            type="number"
            value={filterCriteria.score}
            onChange={(e) => setFilterCriteria(prev => ({ ...prev, score: e.target.value }))}
            placeholder="Min score"
            className={styles.filterInput}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className={styles.candidatesList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No candidates found matching your criteria</p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.candidate_id} className={styles.candidateCard}>
              <div className={styles.candidateHeader}>
                <div className={styles.candidateInfo}>
                  <h4 className={styles.candidateName}>{candidate.name}</h4>
                  <p className={styles.candidateEmail}>{candidate.email}</p>
                  <div className={styles.candidateMeta}>
                    <span className={styles.experience}>
                      {candidate.experience.length} years experience
                    </span>
                    <span className={styles.location}>
                      {candidate.location || "Location not specified"}
                    </span>
                    <span className={styles.uploadDate}>
                      Uploaded: {formatDate(candidate.upload_date)}
                    </span>
                  </div>
                  <div className={styles.jobInfo}>
                    <strong>Applied for:</strong> {candidate.job_title} at {candidate.company}
                  </div>
                </div>
                
                <div className={styles.candidateActions}>
                  <div className={`${styles.matchScore} ${getScoreColor(candidate.final_score)}`}>
                    <span className={styles.scoreNumber}>{formatScore(candidate.final_score)}%</span>
                    <span className={styles.scoreLabel}>Match</span>
                  </div>
                  
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.candidate_id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="available">Available</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="under_review">Under Review</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.candidateSkills}>
                <span className={styles.skillsLabel}>Skills:</span>
                <div className={styles.skillsTags}>
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.scoreBreakdown}>
                <div className={styles.scoreItem}>
                  <span>BERT Score:</span>
                  <span>{formatScore(candidate.bert_score)}%</span>
                </div>
                <div className={styles.scoreItem}>
                  <span>Skill Score:</span>
                  <span>{formatScore(candidate.skill_score)}%</span>
                </div>
                <div className={styles.scoreItem}>
                  <span>Education Score:</span>
                  <span>{formatScore(candidate.education_score)}%</span>
                </div>
                <div className={styles.scoreItem}>
                  <span>Experience Score:</span>
                  <span>{formatScore(candidate.experience_score)}%</span>
                </div>
              </div>
              
              <div className={styles.candidateFooter}>
                <button 
                  className={styles.downloadButton}
                  onClick={() => handleDownloadResume(candidate)}
                  disabled={downloadingResume === candidate.candidate_id}
                >
                  {downloadingResume === candidate.candidate_id ? "Downloading..." : "Download Resume"}
                </button>
                <button 
                  className={styles.scheduleButton}
                  onClick={() => handleScheduleInterview(candidate)}
                  disabled={candidate.status !== "available"}
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showScheduleModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Schedule Interview</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowScheduleModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className={styles.scheduleForm}>
              <div className={styles.candidatePreview}>
                <p><strong>Candidate:</strong> {selectedCandidate?.name}</p>
                <p><strong>Email:</strong> {selectedCandidate?.email}</p>
                <p><strong>Position:</strong> {selectedCandidate?.job_title}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Interview Date</label>
                <input
                  type="date"
                  value={interviewData.interview_date}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interview_date: e.target.value }))}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Interview Time</label>
                <input
                  type="time"
                  value={interviewData.interview_time}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interview_time: e.target.value }))}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Interview Type</label>
                <select
                  value={interviewData.interview_type}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, interview_type: e.target.value }))}
                  className={styles.formInput}
                  required
                >
                  <option value="video">Video Interview</option>
                  <option value="phone">Phone Interview</option>
                  <option value="in-person">In-Person Interview</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={interviewData.meeting_link}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={interviewData.additional_notes}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, additional_notes: e.target.value }))}
                  placeholder="Any additional information for the candidate..."
                  className={styles.formTextarea}
                  rows="4"
                />
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={styles.submitButton}
                >
                  Schedule & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetails;
