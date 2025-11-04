import React, { useState, useRef } from "react";
import styles from "./BulkJobUpload.module.css";
import { bulkUploadJobs } from "../../api/jobs";
import { Notification } from "../../assets/Notification";

const BulkJobUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [notification, setNotification] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const parseFileForPreview = async (selectedFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
          
          if (ext === '.csv') {
            // Parse CSV
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              reject(new Error('File is empty or has no data rows'));
              return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const rows = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
            
            resolve({ headers, rows, total: lines.length - 1 });
          } else {
            // For Excel files, we can't parse on frontend without a library
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(selectedFile);
    });
  };

  const handleFileSelect = async (selectedFile) => {
    if (selectedFile) {
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(ext)) {
        showNotification("error", "Please upload Excel (.xlsx, .xls) or CSV (.csv) files");
        setUploadStatus("error");
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        showNotification("error", "File size must be less than 10MB");
        setUploadStatus("error");
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus("idle");
      setBulkUploadResult(null);
      
      // Try to parse for preview
      if (ext === '.csv') {
        try {
          const preview = await parseFileForPreview(selectedFile);
          setPreviewData(preview);
          showNotification("success", `File "${selectedFile.name}" loaded with ${preview.total} rows`);
        } catch (error) {
          setPreviewData(null);
          showNotification("warning", `File selected but preview unavailable: ${error.message}`);
        }
      } else {
        setPreviewData(null);
        showNotification("info", `Excel file "${selectedFile.name}" selected. Preview available only for CSV files.`);
      }
    }
  };

  const handlePreviewClick = () => {
    if (!file) {
      showNotification("error", "Please select a file first");
      return;
    }
    
    if (!previewData) {
      showNotification("info", "Preview is only available for CSV files. Excel files can be previewed after upload.");
      return;
    }
    
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    }
    if (e.type === "dragleave") {
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

  const handleBulkUpload = async () => {
    if (!file) {
      showNotification("error", "Please select a file first");
      setUploadStatus("error");
      return;
    }
    
    setUploadStatus("uploading");
    setBulkUploadResult(null);

    try {
      const response = await bulkUploadJobs(file);

      setUploadStatus("success");
      setBulkUploadResult(response);

      if (response.status === "success") {
        showNotification(
          "success",
          `Bulk upload completed! ${response.successful_uploads} jobs uploaded successfully`
        );
      } else if (response.successful_uploads > 0) {
        showNotification(
          "warning",
          `Partially successful: ${response.successful_uploads} uploaded, ${response.failed_uploads} failed`
        );
      } else {
        showNotification("error", response.message || "Bulk upload failed");
      }

      setFile(null);
      setPreviewData(null);
    } catch (error) {
      setUploadStatus("error");
      let msg = "Bulk upload failed. Please try again.";
      
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.data?.detail) {
        msg = typeof error.response.data.detail === "string"
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail);
      }
      
      showNotification("error", msg);
      setBulkUploadResult(error.response?.data);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setBulkUploadResult(null);
    setPreviewData(null);
    setShowPreviewModal(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDropZoneClick = (e) => {
    if (file) return;
    if (e.target.closest('button')) return;
    triggerFileInput();
  };

  const downloadTemplate = () => {
    const csvContent = 
      "title,company,location,job_type,description,skills,education,experience,salary,status\n" +
      "Frontend Developer,Web Solutions,Bangalore,full-time,\"Build responsive and user-friendly web interfaces. Collaborate with designers and backend developers.\",\"React,JavaScript,CSS,TypeScript\",\"Bachelor's in CS or related field\",\"1-3 years\",\"₹700000-₹1000000\",active";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.bulkUploadContainer}>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>📊 Bulk Job Upload</h2>
        <p className={styles.description}>
          Upload multiple jobs at once using an Excel or CSV file
        </p>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoContent}>
          <div className={styles.infoIcon}>💡</div>
          <div className={styles.infoText}>
            <h3>How it works</h3>
            <p>Download our template, fill in your job details, and upload the Excel or CSV file to post multiple jobs instantly.</p>
          </div>
        </div>
        <button 
          type="button" 
          className={styles.downloadButton}
          onClick={downloadTemplate}
        >
          <span>📥</span> Download Template
        </button>
      </div>

      <div className={styles.uploadSection}>
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""} ${file ? styles.hasFile : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
          style={{ cursor: file ? 'default' : 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className={styles.fileInput}
            style={{ display: 'none' }}
          />
          
          {!file ? (
            <div className={styles.dropZoneContent}>
              <div className={styles.uploadIcon}>📊</div>
              <h3 className={styles.dropZoneTitle}>
                {dragActive ? "Drop your file here" : "Choose or drag Excel/CSV file"}
              </h3>
              <p className={styles.dropZoneSubtext}>
                Supports .xlsx, .xls, and .csv files up to 10MB
              </p>
              <button 
                type="button" 
                className={styles.browseButton}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <div className={styles.fileIcon}>📊</div>
                <div className={styles.fileDetails}>
                  <h4 className={styles.fileName}>{file.name}</h4>
                  <p className={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {previewData && ` • ${previewData.total} rows`}
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

        {file && uploadStatus !== "uploading" && (
          <div className={styles.uploadActions}>
            <button
              onClick={handlePreviewClick}
              className={styles.previewButton}
              disabled={!previewData}
            >
              👁️ Preview Data
            </button>
            <button
              onClick={handleBulkUpload}
              className={styles.uploadButton}
              disabled={uploadStatus === "uploading"}
            >
              {uploadStatus === "uploading" ? "Processing..." : "Upload Jobs"}
            </button>
          </div>
        )}
        
        {uploadStatus === "uploading" && (
          <div className={styles.uploadingIndicator}>
            <div className={styles.spinner}></div>
            <span>Processing bulk upload...</span>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <div className={styles.modalOverlay} onClick={closePreviewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Data Preview</h3>
                <p className={styles.modalSubtitle}>
                  Showing all {previewData.total} rows from {file.name}
                </p>
              </div>
              <button
                onClick={closePreviewModal}
                className={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.tableWrapper}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>#</th>
                      {previewData.headers.map((header, index) => (
                        <th key={index} className={styles.tableHeader}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={styles.tableRow}>
                        <td className={styles.tableCell}>{rowIndex + 1}</td>
                        {previewData.headers.map((header, colIndex) => (
                          <td key={colIndex} className={styles.tableCell}>
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                onClick={closePreviewModal}
                className={styles.modalCancelButton}
              >
                Close
              </button>
              <button
                onClick={() => {
                  closePreviewModal();
                  handleBulkUpload();
                }}
                className={styles.modalUploadButton}
              >
                Proceed to Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkUploadResult && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>📈 Upload Results</h3>
          
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{bulkUploadResult.successful_uploads}</span>
                <span className={styles.statLabel}>Successful</span>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>❌</div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{bulkUploadResult.failed_uploads}</span>
                <span className={styles.statLabel}>Failed</span>
              </div>
            </div>
          </div>

          {bulkUploadResult.errors && bulkUploadResult.errors.length > 0 && (
            <div className={styles.errorsSection}>
              <h4 className={styles.errorsTitle}>⚠️ Errors Found</h4>
              <div className={styles.errorsList}>
                {bulkUploadResult.errors.map((error, index) => (
                  <div key={index} className={styles.errorItem}>
                    <span className={styles.errorBullet}>•</span>
                    <span className={styles.errorText}>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.guideSection}>
        <h3 className={styles.guideTitle}>📋 Excel File Format Guide</h3>
        
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <h4 className={styles.guideCardTitle}>Required Columns</h4>
            <ul className={styles.guideList}>
              <li><span className={styles.guideBadge}>title</span> - Job title</li>
              <li><span className={styles.guideBadge}>company</span> - Company name</li>
              <li><span className={styles.guideBadge}>location</span> - Job location</li>
              <li><span className={styles.guideBadge}>job_type</span> - full-time, part-time, internship, remote</li>
            </ul>
          </div>

          <div className={styles.guideCard}>
            <h4 className={styles.guideCardTitle}>Optional Columns</h4>
            <ul className={styles.guideList}>
              <li><span className={styles.guideBadge}>description</span> - Job description</li>
              <li><span className={styles.guideBadge}>skills</span> - Comma-separated</li>
              <li><span className={styles.guideBadge}>education</span> - Comma-separated</li>
              <li><span className={styles.guideBadge}>experience</span> - Comma-separated</li>
              <li><span className={styles.guideBadge}>salary</span> - Salary range</li>
              <li><span className={styles.guideBadge}>status</span> - active or closed</li>
            </ul>
          </div>
        </div>

        <div className={styles.exampleSection}>
          <h4 className={styles.exampleTitle}>Example (use comma-separated values):</h4>
          <div className={styles.exampleCode}>
            <code>skills: "Python,FastAPI,Docker"</code>
            <code>education: "Bachelor's in CS,Master's preferred"</code>
            <code>experience: "2-3 years or 2,3"</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkJobUpload;