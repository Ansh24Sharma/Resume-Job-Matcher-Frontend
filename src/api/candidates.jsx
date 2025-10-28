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

export const updateCandidateStatus = async (candidateId, status) => {
    try {
        const response = await api.patch(UPDATE_CANDIDATE_STATUS_URL, {
            candidate_id: candidateId,
            status: status
        });
        return response.data;
    } catch (error) {
        throw error;
    }
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