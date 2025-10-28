import api from './api';
import { CHATBOT_MESSAGE_URL } from '../constants/apiConstants';

export const sendMessage = async (
    message, 
    systemPrompt = null, 
    context = null
) => {
    try {
        const response = await api.post(CHATBOT_MESSAGE_URL, {
            message: message,
            system_prompt: systemPrompt,
            context: context
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

const flattenJobsData = (jobsData) => {
    if (!jobsData) return [];
    
    let allJobs = [];
    
    // Handle if jobsData is an array of objects with jobs/posted_jobs
    if (Array.isArray(jobsData)) {
        jobsData.forEach(item => {
            // Extract from 'jobs' array
            if (item.jobs && Array.isArray(item.jobs)) {
                allJobs = allJobs.concat(item.jobs);
            }
            // Extract from 'posted_jobs' array
            if (item.posted_jobs && Array.isArray(item.posted_jobs)) {
                allJobs = allJobs.concat(item.posted_jobs);
            }
        });
    }
    // Handle if jobsData is a single object with jobs/posted_jobs
    else if (typeof jobsData === 'object') {
        if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
            allJobs = allJobs.concat(jobsData.jobs);
        }
        if (jobsData.posted_jobs && Array.isArray(jobsData.posted_jobs)) {
            allJobs = allJobs.concat(jobsData.posted_jobs);
        }
    }
    
    return allJobs;
};

// Helper to create COMPACT context from API data
export const createChatContext = (userData, resumeData, jobsData) => {
    const context = {};
    
    // Add user info
    if (userData) {
        context.user_info = {
            name: userData.username,
            email: userData.email,
        };
    }
    
    // Add resume/profile data - COMPACT VERSION
    if (resumeData) {
        context.resume = {};
        
        // Extract skills - limit to 15
        if (resumeData.skills) {
            let skillsArray = Array.isArray(resumeData.skills) 
                ? resumeData.skills 
                : resumeData.skills.split(',').map(s => s.trim());
            context.resume.skills = skillsArray.slice(0, 15);
        }
        
        // Extract experience - compact format
        if (resumeData.experience) {
            if (Array.isArray(resumeData.experience)) {
                context.resume.experience = resumeData.experience.slice(0, 3).map(exp => ({
                    title: exp.title || exp.position,
                    company: exp.company,
                }));
            }
        }
        
        // Add summary fields only
        if (resumeData.total_experience) {
            context.resume.total_experience = resumeData.total_experience;
        }
        
        if (resumeData.current_position) {
            context.resume.current_position = resumeData.current_position;
        }
    }
    
    // Flatten and add jobs data
    const flattenedJobs = flattenJobsData(jobsData);
    
    if (flattenedJobs.length > 0) {
        // Map jobs to a clean format
        context.available_jobs = flattenedJobs.map(job => {
            // Handle skills array or string
            let skillsStr = 'Not specified';
            if (job.skills) {
                if (Array.isArray(job.skills)) {
                    skillsStr = job.skills.join(', ');
                } else if (typeof job.skills === 'string') {
                    skillsStr = job.skills;
                }
            } else if (job.required_skills) {
                if (Array.isArray(job.required_skills)) {
                    skillsStr = job.required_skills.join(', ');
                } else if (typeof job.required_skills === 'string') {
                    skillsStr = job.required_skills;
                }
            }
            
            // Handle education array or string
            let educationStr = '';
            if (job.education) {
                if (Array.isArray(job.education)) {
                    educationStr = job.education.join(', ');
                } else if (typeof job.education === 'string') {
                    educationStr = job.education;
                }
            }
            
            return {
                id: job.id,
                title: job.title || 'Unknown Position',
                company: job.company || job.company_name || 'Company',
                location: job.location || 'Not specified',
                skills: skillsStr,
                experience: job.experience || job.experience_level || job.years_of_experience || 'Not specified',
                description: job.description ? job.description.substring(0, 150) : '',
                salary: job.salary || job.salary_range || 'Not disclosed',
                job_type: job.job_type || job.type || 'Full-time',
                education: educationStr
            };
        });
        
        context.total_jobs_count = flattenedJobs.length;
    } else {
        context.available_jobs = [];
        context.total_jobs_count = 0;
    }
    
    return context;
};