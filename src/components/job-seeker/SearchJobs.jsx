import React, { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import styles from './SearchJobs.module.css';

const SearchJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs();
      
      // Merge jobs and posted_jobs arrays
      const allJobs = [
        ...(data.jobs || []),
        ...(data.posted_jobs || [])
      ];
      
      setJobs(allJobs);
      setFilteredJobs(allJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(job =>
        job.jobType?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }
    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      jobType: '',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchJobs} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Search and Filter Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>

          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
          </select>

          {(searchTerm || filters.location || filters.jobType) && (
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        <p className={styles.resultsText}>
          Found <strong>{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Jobs List */}
      <div className={styles.jobsList}>
        {filteredJobs.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>😕</span>
            <p>No jobs found matching your criteria</p>
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{job.title || 'Job Title'}</h3>
                <button className={styles.saveButton}>💾</button>
              </div>
              
              <div className={styles.jobCompany}>
                <span className={styles.companyIcon}>🏢</span>
                {job.company || 'Company Name'}
              </div>

              <div className={styles.jobDetails}>
                {job.location && (
                  <span className={styles.jobDetail}>
                    <span>📍</span> {job.location}
                  </span>
                )}
                {job.jobType && (
                  <span className={styles.jobDetail}>
                    <span>💼</span> {job.jobType}
                  </span>
                )}
                {job.experience && (
                  <span className={styles.jobDetail}>
                    <span>📊</span> {job.experience}
                  </span>
                )}
                {job.salary && (
                  <span className={styles.jobDetail}>
                    <span>💰</span> {job.salary}
                  </span>
                )}
              </div>

              {job.description && (
                <p className={styles.jobDescription}>
                  {job.description.length > 200 
                    ? `${job.description.substring(0, 200)}...` 
                    : job.description}
                </p>
              )}

              {job.skills && job.skills.length > 0 && (
                <div className={styles.skillsContainer}>
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className={styles.moreSkills}>+{job.skills.length - 5} more</span>
                  )}
                </div>
              )}

              <div className={styles.jobFooter}>
                {job.postedDate && (
                  <span className={styles.postedDate}>
                    Posted {job.postedDate}
                  </span>
                )}
                <button className={styles.applyButton}>
                  Apply Now →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchJobs;