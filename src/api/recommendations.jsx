import api from "./api";
import { GET_RECOMMENDATIONS_URL } from "../apiConstants/constants";

export const getRecommendations = (topN = 5) => {
    const response = api.post(GET_RECOMMENDATIONS_URL, 
        { 
           top_n: topN 
        }
    );
    return response;
}