import api from "./api";
import { UPLOAD_JOB_URL, POST_JOB_URL, GET_ALL_JOBS_URL, APPLY_FOR_JOB_URL, SAVE_JOB_URL, GET_SAVED_JOBS_URL, GET_JOBS_BY_CREATOR, UPDATE_JOBS_URL } from "../apiConstants/constants";

export const uploadJob = async(file) => {
    const formData = new FormData();
    formData.append('job', file);
    return api.post(UPLOAD_JOB_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const postJob = async (jobData) => {
  try {
    const response = await api.post(POST_JOB_URL, jobData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllJobs = async () => {
  try {
    const response = await api.get(GET_ALL_JOBS_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJobsByCreator = async () => {
  try {
    const response = await api.get(GET_JOBS_BY_CREATOR);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const applyForJob = async (matchId) => {
  try {
    const response = await api.post(APPLY_FOR_JOB_URL, { match_id: matchId });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const saveJob = async (matchId) => {
  try {
    const response = await api.post(SAVE_JOB_URL, {
      match_id: matchId
    });
    return response;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

export const getSavedJobs = async (resumeId, topN = 50) => {
  try {
    const response = await api.post(GET_SAVED_JOBS_URL, {
      resume_id: resumeId,
      top_n: topN
    });
    return response;
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }
};

export const updateJob = async (jobData) => {
  try {
    const response = await api.put(UPDATE_JOBS_URL, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to update job';
  }
};



