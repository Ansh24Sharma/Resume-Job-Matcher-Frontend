import api from "./api";
import { UPLOAD_RESUME_URL, DOWNLOAD_RESUME_URL } from "../apiConstants/constants";

export const uploadResume = async(file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post(UPLOAD_RESUME_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const downloadResume = async (userId) => {
    const response = await api.post(DOWNLOAD_RESUME_URL, 
        { user_id: userId },
        { responseType: 'blob' }
    );
    return response;
};