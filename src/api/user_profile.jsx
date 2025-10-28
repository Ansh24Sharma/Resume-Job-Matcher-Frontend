import api from "./api";
import { 
    GET_MY_PROFILE_URL, 
    UPDATE_PROFILE_URL 
} from "../constants/apiConstants";

export const getMyProfile = async () => {
    try {
        const response = await api.get(GET_MY_PROFILE_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    try {
        const response = await api.put(UPDATE_PROFILE_URL, profileData);
        return response;
    } catch (error) {
        throw error;
    }
};

