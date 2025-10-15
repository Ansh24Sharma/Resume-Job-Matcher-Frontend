import React, { useState, useEffect } from 'react';
import { getMyProfile, updateProfile } from '../api/user_profile';
import { Notification } from '../assets/Notification';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    skills: [],
    experience: [],
  });

  const [tempInput, setTempInput] = useState({
    skill: '',
    experience: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileRes = await getMyProfile();
      setProfile(profileRes);
      setFormData({
        name: profileRes.name || '',
        email: profileRes.email || '',
        location: profileRes.location || '',
        skills: profileRes.skills || [],
        experience: profileRes.experience || [],
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to load profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTempInputChange = (e) => {
    const { name, value } = e.target;
    setTempInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (tempInput.skill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, tempInput.skill.trim()],
      }));
      setTempInput((prev) => ({ ...prev, skill: '' }));
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    if (tempInput.experience.trim()) {
      setFormData((prev) => ({
        ...prev,
        experience: [...prev.experience, tempInput.experience.trim()],
      }));
      setTempInput((prev) => ({ ...prev, experience: '' }));
    }
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await updateProfile(formData);
      setProfile(response.data);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err) {
      console.error('Save error:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to save profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        location: profile.location || '',
        skills: profile.skills || [],
        experience: profile.experience || [],
      });
      setTempInput({ skill: '', experience: '' });
      setNotification(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
            duration={3000}
          />
        )}
        <div className={styles.error}>No profile data available.</div>
      </div>
    );
  }

  const completionPercentage = profile?.completion_percentage || 0;
  const isProfileComplete = completionPercentage === 100;

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <span
          className={`${styles.completionBadge} ${
            isProfileComplete ? styles.complete : styles.incomplete
          }`}
        >
          {isProfileComplete ? '✓ Complete' : 'Incomplete'}
        </span>
      </div>

      <div className={styles.progressSection}>
        <h3>Profile Completion</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className={styles.progressText}>
          {completionPercentage}% complete
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Location <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter your location"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Skills <span className={styles.required}>*</span>
          </label>
          <div className={styles.arrayInput}>
            <input
              type="text"
              name="skill"
              value={tempInput.skill}
              onChange={handleTempInputChange}
              className={styles.input}
              placeholder="Enter a skill"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={addSkill}
              className={styles.addButton}
              disabled={!tempInput.skill.trim()}
            >
              Add
            </button>
          </div>
          {formData.skills.length > 0 && (
            <div className={styles.arrayItemsList}>
              {formData.skills.map((skill, index) => (
                <div key={index} className={styles.arrayItem}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Experience <span className={styles.required}>*</span>
          </label>
          <div className={styles.arrayInput}>
            <input
              type="text"
              name="experience"
              value={tempInput.experience}
              onChange={handleTempInputChange}
              className={styles.input}
              placeholder="Enter experience (e.g., Software Engineer at XYZ Corp)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExperience();
                }
              }}
            />
            <button
              type="button"
              onClick={addExperience}
              className={styles.addButton}
              disabled={!tempInput.experience.trim()}
            >
              Add
            </button>
          </div>
          {formData.experience.length > 0 && (
            <div className={styles.arrayItemsList}>
              {formData.experience.map((exp, index) => (
                <div key={index} className={styles.arrayItem}>
                  {exp}
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {profile?.resume_filename && (
          <div className={styles.resumeSection}>
            <label className={styles.label}>Resume</label>
            <div className={styles.resumeInfo}>
              <span className={styles.resumeIcon}>📄</span>
              <div className={styles.resumeDetails}>
                <div className={styles.resumeFilename}>
                  {profile.resume_filename}
                </div>
                {profile.upload_date && (
                  <div className={styles.resumeDate}>
                    Uploaded:{' '}
                    {new Date(profile.upload_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.cancelButton}
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
