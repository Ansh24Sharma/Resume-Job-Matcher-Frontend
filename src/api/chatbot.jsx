import api from './api';
import { CHATBOT_MESSAGE_URL } from '../apiConstants/constants';

export const sendMessage = async (message, systemPrompt = null, context = null) => {
    try {
        const response = await api.post(CHATBOT_MESSAGE_URL, {
            message: message,
            system_prompt: systemPrompt || "You are a helpful assistant for a dashboard.",
            context: context
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};