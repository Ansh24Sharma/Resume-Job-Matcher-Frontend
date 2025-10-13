import React, { useState, useEffect } from 'react';
import { getJobsByCreator, updateJob } from '../api/jobs';
import styles from './DisplayAllJobs.module.css';

const DisplayAllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    jobSource: 'all',
    location: '',
    department: '',
    status: 'all'
  });

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobsByCreator();
      const regularJobs = data.jobs || [];
      const postedJobs = data.posted_jobs || [];
      const combinedJobs = [...regularJobs, ...postedJobs];
      setJobs(combinedJobs);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (job) => {
    setEditingJob({
      job_id: job.id,
      job_source: job.job_source || 'jobs',
      title: job.title || '',
      description: job.description || '',
      // Store as strings for editing
      skillsStr: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      educationStr: Array.isArray(job.education) ? job.education.join(', ') : '',
      experienceStr: Array.isArray(job.experience) ? job.experience.join(', ') : '',
      company: job.company || '',
      location: job.location || '',
      job_type: job.job_type || 'full-time',
      salary: job.salary || job.salary_range || '',
      status: job.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditingJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    setUpdateLoading(true);
    try {
      const updateData = {
        job_id: editingJob.job_id,
        job_source: editingJob.job_source
      };
      
      if (editingJob.title) updateData.title = editingJob.title;
      if (editingJob.description) updateData.description = editingJob.description;
      
      // Convert string inputs to arrays
      if (editingJob.skillsStr) {
        const skillsArray = editingJob.skillsStr.split(',').map(skill => skill.trim()).filter(skill => skill);
        if (skillsArray.length > 0) updateData.skills = skillsArray;
      }
      
      if (editingJob.educationStr) {
        const educationArray = editingJob.educationStr.split(',').map(edu => edu.trim()).filter(edu => edu);
        if (educationArray.length > 0) updateData.education = educationArray;
      }
      
      if (editingJob.experienceStr) {
        const experienceArray = editingJob.experienceStr.split(',').map(exp => exp.trim()).filter(exp => exp);
        if (experienceArray.length > 0) updateData.experience = experienceArray;
      }
      
      if (editingJob.company) updateData.company = editingJob.company;
      if (editingJob.location) updateData.location = editingJob.location;
      if (editingJob.job_type) updateData.job_type = editingJob.job_type;
      if (editingJob.salary) updateData.salary = editingJob.salary;
      if (editingJob.status) updateData.status = editingJob.status;

      await updateJob(updateData);
      await fetchAllJobs();

      setIsEditModalOpen(false);
      setEditingJob(null);

      alert('Job updated successfully!');
    } catch (err) {
      console.error('Error updating job:', err);
      alert(err || 'Failed to update job');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource =
      filterCriteria.jobSource === 'all' ||
      job.job_source === filterCriteria.jobSource;

    const matchesLocation =
      !filterCriteria.location ||
      job.location?.toLowerCase().includes(filterCriteria.location.toLowerCase());

    const matchesDepartment =
      !filterCriteria.department ||
      job.department?.toLowerCase().includes(filterCriteria.department.toLowerCase());

    const matchesStatus =
      filterCriteria.status === 'all' ||
      job.status?.toLowerCase() === filterCriteria.status.toLowerCase();

    return matchesSearch && matchesSource && matchesLocation && matchesDepartment && matchesStatus;
  });

  const getJobSourceBadge = (source) => (source === 'posted_jobs' ? 'Posted Job' : 'Regular Job');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return styles.active;
      case 'closed': return styles.closed;
      default: return styles.default;
    }
  };

  const getJobSourceColor = (source) => (source === 'posted_jobs' ? styles.postedJob : styles.regularJob);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading all jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button onClick={fetchAllJobs} className={styles.retryButton}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.displayAllJobsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>All Jobs</h2>
          <p className={styles.subtitle}>
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>
        <button onClick={fetchAllJobs} className={styles.refreshButton}>🔄 Refresh</button>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchFilterSection}>
        <div className={styles.searchInput}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search jobs by title, description, or skills..."
            className={styles.searchField}
          />
        </div>
        <div className={styles.filtersRow}>
          <select
            value={filterCriteria.jobSource}
            onChange={e => setFilterCriteria(prev => ({ ...prev, jobSource: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Sources</option>
            <option value="jobs">Regular Jobs</option>
            <option value="posted_jobs">Posted Jobs</option>
          </select>
          <input
            type="text"
            value={filterCriteria.location}
            onChange={e => setFilterCriteria(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Filter by location"
            className={styles.filterInput}
          />
          <input
            type="text"
            value={filterCriteria.department}
            onChange={e => setFilterCriteria(prev => ({ ...prev, department: e.target.value }))}
            placeholder="Filter by department"
            className={styles.filterInput}
          />
          <select
            value={filterCriteria.status}
            onChange={e => setFilterCriteria(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCriteria({
                jobSource: 'all',
                location: '',
                department: '',
                status: 'all'
              });
            }}
            className={styles.clearFiltersButton}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className={styles.jobsGrid}>
        {filteredJobs.length === 0 ? (
          <div className={styles.noJobsMessage}>
            <div className={styles.noJobsContent}>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div className={styles.jobTitleSection}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <div className={styles.jobBadges}>
                    <span className={`${styles.sourceBadge} ${getJobSourceColor(job.job_source)}`}>
                      {getJobSourceBadge(job.job_source)}
                    </span>
                    <span className={`${styles.statusBadge} ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.jobMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>🏢</span>
                  <span>{job.company}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📍</span>
                  <span>{job.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📅</span>
                  <span>Posted {job.created_at}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>💼</span>
                  <span>
                    {(!job.experience || (Array.isArray(job.experience) && job.experience.length === 0))
                      ? "None"
                      : Array.isArray(job.experience)
                        ? job.experience.join(', ')
                        : job.experience}
                  </span>
                </div>
              </div>

              {job.description && (
                <div className={styles.jobDescription}>
                  <p>{job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}</p>
                </div>
              )}

              {job.skills && job.skills.length > 0 && (
                <div className={styles.skillsSection}>
                  <span className={styles.skillsLabel}>Skills:</span>
                  <div className={styles.skillsTags}>
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className={styles.moreSkills}>
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.jobFooter}>
                <div className={styles.jobStats}>
                  {job.salary_range && (
                    <div className={styles.salary}>
                      <span className={styles.salaryIcon}>💰</span>
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                <div className={styles.jobActions}>
                  <button className={styles.viewButton}>👁️ View Details</button>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(job)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingJob && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Job</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Job Source Read-only */}
              <div className={styles.infoGroup}>
                <div className={styles.jobSource}>
                <label>Job Source (Read-only)</label>
                <div className={styles.readOnlyField}>
                  <span className={`${styles.sourceBadge} ${getJobSourceColor(editingJob.job_source)}`}>
                    {getJobSourceBadge(editingJob.job_source)}
                  </span>
                </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={e => handleEditChange('title', e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={e => handleEditChange('description', e.target.value)}
                  className={styles.formTextarea}
                  rows="4"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input
                    type="text"
                    value={editingJob.company}
                    onChange={e => handleEditChange('company', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={e => handleEditChange('location', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Job Type</label>
                  <select
                    value={editingJob.job_type}
                    onChange={e => handleEditChange('job_type', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={editingJob.status}
                    onChange={e => handleEditChange('status', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Experience (comma-separated)</label>
                <input
                  type="text"
                  value={editingJob.experienceStr}
                  onChange={e => handleEditChange('experienceStr', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., 2-4 years, Mid-level"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Salary</label>
                <input
                  type="text"
                  value={editingJob.salary}
                  onChange={e => handleEditChange('salary', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editingJob.skillsStr}
                  onChange={e => handleEditChange('skillsStr', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Python, React, SQL"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Education (comma-separated)</label>
                <input
                  type="text"
                  value={editingJob.educationStr}
                  onChange={e => handleEditChange('educationStr', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Bachelor's, Master's"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                className={styles.saveButton}
                onClick={handleUpdateJob}
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{jobs.filter(j => j.job_source === 'jobs').length}</span>
          <span className={styles.statLabel}>Regular Jobs</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{jobs.filter(j => j.job_source === 'posted_jobs').length}</span>
          <span className={styles.statLabel}>Posted Jobs</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{jobs.filter(j => j.status === 'active').length}</span>
          <span className={styles.statLabel}>Active Jobs</span>
        </div>
      </div>
    </div>
  );
};

export default DisplayAllJobs;