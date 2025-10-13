import React, { useState, useRef } from "react";
import styles from "./JobUpload.module.css";
import { uploadJob, postJob } from "../api/jobs";

const JobUpload = () => {
  const [uploadMethod, setUploadMethod] = useState("file"); // file or form
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [postedJobs, setPostedJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "full-time",
    experience: "",
    salary: "",
    description: "",
    education: "",
    skills: ""
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      if (!allowedTypes.includes(ext)) {
        setUploadMessage("Please upload only PDF, DOC, DOCX, or TXT files");
        setUploadStatus("error");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadMessage("File size must be less than 5MB");
        setUploadStatus("error");
        return;
      }
      setFile(selectedFile);
      setUploadStatus("idle");
      setUploadMessage("");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file first");
      setUploadStatus("error");
      return;
    }
    setUploadStatus("uploading");
    setUploadMessage("Uploading job description...");

    try {
      const response = await uploadJob(file);

      setUploadStatus("success");
      setUploadMessage(
        "Job posted successfully! Extracted entities: " +
          (response.entities ? Object.keys(response.entities).length : 0) +
          " categories found"
      );

      const newJob = {
        id: response.id || Date.now(),
        title: response.job || file.name,
        company: response.company || "Your Company",
        uploadDate: new Date().toLocaleDateString(),
        method: "file",
        entities: response.entities || {},
        status: "Active"
      };

      setPostedJobs((prev) => [newJob, ...prev]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadStatus("error");
      let msg = "Upload failed. Please try again.";
      if (error.response?.data?.detail) {
        msg =
          typeof error.response.data.detail === "string"
            ? error.response.data.detail
            : JSON.stringify(error.response.data.detail);
      }
      setUploadMessage(msg);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description) {
      setUploadMessage("Job title and description are required");
      setUploadStatus("error");
      return;
    }
    setUploadStatus("uploading");
    setUploadMessage("Creating job posting...");

    try {
      const jobData = {
          title: jobForm.title,
          company: jobForm.company || "Your Company",
          location: jobForm.location || "",
          job_type: jobForm.job_type,
          experience: jobForm.experience
            ? jobForm.experience.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          salary: jobForm.salary
            ? jobForm.salary.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          description: jobForm.description,
          education: jobForm.education
            ? jobForm.education.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          skills: jobForm.skills
            ? jobForm.skills.split(',').map(s => s.trim()).filter(Boolean)
            : []
      };


      const response = await postJob(jobData);

      setUploadStatus("success");
      setUploadMessage("Job posted successfully!");

      const newJob = {
        id: response.id || Date.now(),
        title: jobForm.title,
        company: jobForm.company || "Your Company",
        uploadDate: new Date().toLocaleDateString(),
        method: "form",
        location: jobForm.location,
        job_type: jobForm.job_type,
        status: "Active",
        entities: response.entities || {}
      };

      setPostedJobs((prev) => [newJob, ...prev]);

      setJobForm({
        title: "",
        company: "",
        location: "",
        job_type: "full-time",
        experience: "",
        salary: "",
        description: "",
        education: "",
        skills: ""
      });
    } catch (error) {
      setUploadStatus("error");
      let msg = "Failed to create job posting. Please try again.";
      if (error.response?.data?.detail) {
        msg =
          typeof error.response.data.detail === "string"
            ? error.response.data.detail
            : JSON.stringify(error.response.data.detail);
      }
      setUploadMessage(msg);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.jobUploadContainer}>
      <div className={styles.uploadHeader}>
        <h2 className={styles.title}>Post a Job</h2>
        <p className={styles.description}>
          Post job openings to find the best candidates for your organization
        </p>
      </div>

      <div className={styles.methodSelector}>
        <button
          onClick={() => setUploadMethod("file")}
          className={`${styles.methodButton} ${uploadMethod === "file" ? styles.active : ""}`}
        >
          <span className={styles.methodIcon}>📄</span> Upload File
        </button>
        <button
          onClick={() => setUploadMethod("form")}
          className={`${styles.methodButton} ${uploadMethod === "form" ? styles.active : ""}`}
        >
          <span className={styles.methodIcon}>✏️</span> Fill Form
        </button>
      </div>

      {uploadMethod === "file" ? (
        <div className={styles.uploadSection}>
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""} ${file ? styles.hasFile : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className={styles.fileInput}
            />
            {!file ? (
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>💼</div>
                <h3 className={styles.dropZoneTitle}>
                  {dragActive ? "Drop your job description here" : "Choose or drag job description"}
                </h3>
                <p className={styles.dropZoneSubtext}>
                  Supports PDF, DOC, DOCX, and TXT files up to 5MB
                </p>
                <button type="button" className={styles.browseButton}>
                  Browse Files
                </button>
              </div>
            ) : (
              <div className={styles.filePreview}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>💼</div>
                  <div className={styles.fileDetails}>
                    <h4 className={styles.fileName}>{file.name}</h4>
                    <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {file && uploadStatus !== "uploading" && (
            <div className={styles.uploadActions}>
              <button
                onClick={handleFileUpload}
                className={styles.uploadButton}
                disabled={uploadStatus === "uploading"}
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Post Job"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.formSection}>
          <form onSubmit={handleFormSubmit} className={styles.jobForm}>
            {/* Job Title */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="title" className={styles.label}>
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={jobForm.title}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="company" className={styles.label}>
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={jobForm.company}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. Tech Corp"
                />
              </div>
            </div>
            {/* Location and Job Type */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="location" className={styles.label}>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={jobForm.location}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. Remote, New York, NY"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="job_type" className={styles.label}>
                  Job Type
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={jobForm.job_type}
                  onChange={handleFormChange}
                  className={styles.select}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
            {/* Experience and Salary */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="experience" className={styles.label}>
                  Experience Level
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={jobForm.experience}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. 2-5 years, Entry Level, Senior"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="salary" className={styles.label}>
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={jobForm.salary}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. $80k - $120k"
                />
              </div>
            </div>
            {/* Education */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="education" className={styles.label}>
                  Education Requirements
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={jobForm.education}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. Bachelor's in Computer Science, Master's preferred"
                />
              </div>
            </div>
            {/* Description */}
            <div className={styles.inputGroup}>
              <label htmlFor="description" className={styles.label}>
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={jobForm.description}
                onChange={handleFormChange}
                className={styles.textarea}
                rows={6}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                required
              />
            </div>
            {/* Skills */}
            <div className={styles.inputGroup}>
              <label htmlFor="skills" className={styles.label}>
                Required Skills
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={jobForm.skills}
                onChange={handleFormChange}
                className={styles.input}
                placeholder="e.g. React, Node.js, Python, SQL (comma-separated)"
              />
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={uploadStatus === "uploading"}
              >
                {uploadStatus === "uploading" ? "Creating..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      )}

      {uploadMessage && (
        <div className={`${styles.statusMessage} ${styles[uploadStatus]}`}>
          {uploadStatus === "uploading" && <div className={styles.spinner}></div>}
          {uploadMessage}
        </div>
      )}

      {postedJobs.length > 0 && (
        <div className={styles.postedSection}>
          <h3 className={styles.sectionTitle}>Your Posted Jobs</h3>
          <div className={styles.jobsList}>
            {postedJobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobInfo}>
                  <div className={styles.jobIcon}>💼</div>
                  <div className={styles.jobDetails}>
                    <h4 className={styles.jobTitle}>{job.title}</h4>
                    <p className={styles.jobCompany}>{job.company}</p>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobDate}>Posted: {job.uploadDate}</span>
                      <span className={styles.jobMethod}>
                        {job.method === "file" ? "📄 File Upload" : "✏️ Form"}
                      </span>
                      {job.location && <span className={styles.jobLocation}>📍 {job.location}</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.jobStatus}>
                  <span className={styles.statusBadge}>{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.tipsSection}>
        <h3 className={styles.sectionTitle}>Tips for Better Job Postings</h3>
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Write clear, specific job titles</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Include salary range to attract more candidates</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>List specific skills and technologies required</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Mention company culture and benefits</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobUpload;
