import api from './api';
import { GET_MATCHES_URL, GET_EXPLATION_OF_MATCHES_URL } from '../apiConstants/constants';


export const getMatches = async () => {
  try {
    const response = await api.get(GET_MATCHES_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch matches';
  }
};

export const getMatchExplanation = async (resumeId, jobId, jobSource) => {
  try {
    const response = await api.post(GET_EXPLATION_OF_MATCHES_URL, {
      resume_id: resumeId,
      job_id: jobId,
      job_source: jobSource
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch match explanation';
  }
};
