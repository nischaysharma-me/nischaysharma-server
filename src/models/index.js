import FirebaseModel from '../utils/firebaseModel.js';
import userProfileModel from './userProfileModel.js';
import articleModel from './articleModel.js';
import reviewModel from './reviewModel.js';
import tagModel from './tagModel.js';
import articleTemplateModel from './articleTemplateModel.js';
import jobModel from './jobModel.js';
import conversationModel from './conversationModel.js';
import bookModel from './bookModel.js';
import pageModel from './pageModel.js';
import eventModel from './eventModel.js';
import billboardModel from './billboardModel.js';
import projectModel from './projectModel.js';
import integrationModel from './integrationModel.js';
import experienceModel from './experienceModel.js';
import educationModel from './educationModel.js';

// Export specific models
export const User = userProfileModel;
export const Article = articleModel;
export const Review = reviewModel;
export const Tag = tagModel;
export const ArticleTemplate = articleTemplateModel;
export const Job = jobModel;
export const Conversation = conversationModel;
export const Book = bookModel;
export const Page = pageModel;
export const Event = eventModel;
export const Billboard = billboardModel;
export const Project = projectModel;
export const Integration = integrationModel;
export const Experience = experienceModel;
export const Education = educationModel;

// Helper to create simple models on the fly
export const createModel = (collectionName, schema = null) => {
    return new FirebaseModel(collectionName, schema);
};
