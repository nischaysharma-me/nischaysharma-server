import FirebaseModel from '../utils/firebaseModel.js';

const billboardSchema = {
    label: { type: String, required: true, trim: true },
    headline: { type: String, required: true, trim: true },
    summary: { type: String, trim: true, default: '' },
    href: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    layoutType: { type: String, enum: ['lead', 'middle', 'mini'], default: 'mini' },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
};

const Billboard = new FirebaseModel('billboards', billboardSchema);

export default Billboard;
