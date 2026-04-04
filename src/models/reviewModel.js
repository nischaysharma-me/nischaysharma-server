import FirebaseModel from '../utils/firebaseModel.js';

const reviewSchema = {
    articleId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    updatedAt: {
        type: Date,
        default: () => new Date()
    }
};

const Review = new FirebaseModel('reviews', reviewSchema);

Review.findByArticle = async function(articleId) {
    return this.find({ articleId }, { sort: { createdAt: 'desc' } });
};

export default Review;
