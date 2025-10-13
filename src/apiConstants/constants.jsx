export const API_BASE_URL = 'http://localhost:8000';

export const LOGIN_URL = `${API_BASE_URL}/auth/login`;
export const SIGNUP_URL = `${API_BASE_URL}/auth/signup`;
export const UPLOAD_RESUME_URL = `${API_BASE_URL}/resume/uploadResume`;
export const UPLOAD_JOB_URL = `${API_BASE_URL}/job/uploadJob`;
export const GET_RECOMMENDATIONS_URL = `${API_BASE_URL}/recommendation/getRecommendations`;
export const APPLY_FOR_JOB_URL = `${API_BASE_URL}/recommendation/applyJob`;
export const POST_JOB_URL = `${API_BASE_URL}/job/postJob`;
export const GET_ALL_JOBS_URL = `${API_BASE_URL}/job/getAllJobs`;
export const GET_JOBS_BY_CREATOR = `${API_BASE_URL}/job/getJobsByCreator`;
export const SAVE_JOB_URL = `${API_BASE_URL}/recommendation/saveJob`;
export const GET_SAVED_JOBS_URL = `${API_BASE_URL}/recommendation/getSavedJobs`;
export const UPDATE_JOBS_URL = `${API_BASE_URL}/job/updateJob`;

// User Profile API URLs
export const GET_MY_PROFILE_URL = `${API_BASE_URL}/profile/myProfile`;
export const UPDATE_PROFILE_URL = `${API_BASE_URL}/profile/update`;
export const DOWNLOAD_RESUME_URL = `${API_BASE_URL}/resume/download`;

// Candidate Management API URLs
export const GET_MY_CANDIDATES_URL = `${API_BASE_URL}/candidates/my-candidates`;
export const GET_CANDIDATE_STATISTICS_URL = `${API_BASE_URL}/candidates/statistics`;
export const GET_CANDIDATE_DETAIL_URL = (candidateId) => `${API_BASE_URL}/candidates/${candidateId}`;
export const UPDATE_CANDIDATE_STATUS_URL = `${API_BASE_URL}/candidates/updateStatus`;
export const SCHEDULE_INTERVIEW_URL = `${API_BASE_URL}/candidates/schedule-interview`;

export const GET_MATCHES_URL = `${API_BASE_URL}/matches/getMatches`;
export const GET_EXPLATION_OF_MATCHES_URL = `${API_BASE_URL}/matches/getDetailedMatches`;