import api from './api';
import {
    GET_MY_CANDIDATES_URL,
    GET_CANDIDATE_STATISTICS_URL,
    GET_CANDIDATE_DETAIL_URL,
    UPDATE_CANDIDATE_STATUS_URL,
    SCHEDULE_INTERVIEW_URL
} from '../constants/apiConstants';

export const getMyCandidates = async () => {
    try {
        const response = await api.get(GET_MY_CANDIDATES_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCandidateStatistics = async () => {
    try {
        const response = await api.get(GET_CANDIDATE_STATISTICS_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCandidateDetail = async (candidateId) => {
    try {
        const response = await api.get(GET_CANDIDATE_DETAIL_URL(candidateId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateCandidateStatus = async (candidateId, newStatus, emailData = null) => {
  const payload = {
    candidate_id: candidateId,
    status: newStatus
  };
  
  // Add email data for hired/rejected statuses
  if (emailData) {
    payload.candidate_email = emailData.candidate_email;
    payload.candidate_name = emailData.candidate_name;
    payload.job_title = emailData.job_title;
    payload.company = emailData.company;
    if (emailData.additional_notes) {
      payload.additional_notes = emailData.additional_notes;
    }
  }
  
  const response = await api.patch(UPDATE_CANDIDATE_STATUS_URL, payload);
  return response.data;
};

export const scheduleInterview = async (candidateId, interviewData) => {
    try {
        const response = await api.post(SCHEDULE_INTERVIEW_URL, {
            candidate_id: candidateId,
            ...interviewData
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};