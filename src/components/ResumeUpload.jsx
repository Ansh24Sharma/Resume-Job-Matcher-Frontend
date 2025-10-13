import React, { useState, useRef } from "react";
import styles from "./ResumeUpload.module.css";
import { uploadResume } from "../api/resumes";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setUploadMessage("Please upload only PDF, DOC, or DOCX files");
        setUploadStatus("error");
        return;
      }

      // Validate file size (max 5MB)
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file first");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Uploading your resume...");

    try {
      const response = await uploadResume(file);
      
      setUploadStatus("success");
      setUploadMessage("Resume uploaded successfully! Extracted entities: " + 
        (response.data.entities?.length || 0) + " items found");
      
      // Add to uploaded resumes list
      const newResume = {
        id: response.data.id || Date.now(),
        fileName: file.name,
        uploadDate: new Date().toLocaleDateString(),
        entities: response.data.entities || [],
        status: "Processed"
      };
      
      setUploadedResumes(prev => [newResume, ...prev]);
      setFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadHeader}>
        <h2 className={styles.title}>Upload Resume</h2>
        <p className={styles.description}>
          Upload your resume to get matched with relevant job opportunities
        </p>
      </div>

      {/* File Upload Area */}
      <div className={styles.uploadSection}>
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${file ? styles.hasFile : ''}`}
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
            accept=".pdf,.doc,.docx"
            className={styles.fileInput}
          />
          
          {!file ? (
            <div className={styles.dropZoneContent}>
              <div className={styles.uploadIcon}>📄</div>
              <h3 className={styles.dropZoneTitle}>
                {dragActive ? "Drop your resume here" : "Choose or drag your resume"}
              </h3>
              <p className={styles.dropZoneSubtext}>
                Supports PDF, DOC, and DOCX files up to 5MB
              </p>
              <button type="button" className={styles.browseButton}>
                Browse Files
              </button>
            </div>
          ) : (
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileDetails}>
                  <h4 className={styles.fileName}>{file.name}</h4>
                  <p className={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
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

        {/* Upload Status */}
        {uploadMessage && (
          <div className={`${styles.statusMessage} ${styles[uploadStatus]}`}>
            {uploadStatus === "uploading" && <div className={styles.spinner}></div>}
            {uploadMessage}
          </div>
        )}

        {/* Upload Button */}
        {file && uploadStatus !== "uploading" && (
          <div className={styles.uploadActions}>
            <button 
              onClick={handleUpload} 
              className={styles.uploadButton}
              disabled={uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Resumes List */}
      {uploadedResumes.length > 0 && (
        <div className={styles.uploadedSection}>
          <h3 className={styles.sectionTitle}>Your Uploaded Resumes</h3>
          <div className={styles.resumesList}>
            {uploadedResumes.map((resume) => (
              <div key={resume.id} className={styles.resumeCard}>
                <div className={styles.resumeInfo}>
                  <div className={styles.resumeIcon}>📄</div>
                  <div className={styles.resumeDetails}>
                    <h4 className={styles.resumeFileName}>{resume.fileName}</h4>
                    <p className={styles.resumeDate}>Uploaded: {resume.uploadDate}</p>
                    <p className={styles.resumeEntities}>
                      {resume.entities.length} entities extracted
                    </p>
                  </div>
                </div>
                <div className={styles.resumeStatus}>
                  <span className={styles.statusBadge}>{resume.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className={styles.tipsSection}>
        <h3 className={styles.sectionTitle}>Tips for Better Results</h3>
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Use a clear, well-formatted resume</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Include relevant keywords for your industry</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Keep file size under 5MB</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>✅</span>
            <span>Use standard fonts and formatting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;