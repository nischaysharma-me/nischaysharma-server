import { StackItem } from '../models/index.js';
import * as aiService from './aiService.js';
import * as storageService from './storageService.js';
import logger from '../utils/logger.js';
import fetch from 'node-fetch';

export async function generateImageForStackItem(id, prompt) {
    const item = await StackItem.findById(id);
    if (!item) throw new Error('Stack item not found');

    let imagePrompt = prompt || item.description || `A beautiful, premium 3D graphic for ${item.title}`;
    if (!imagePrompt.includes('No text')) {
        imagePrompt += ". DO NOT include any text, typography, or words in the image.";
    }

    logger.info(`Generating image for stack item ${id} with prompt: ${imagePrompt}`);

    const imageResult = await aiService.generateImage(imagePrompt, {
        aspectRatio: '16:9',
        imageSize: '2K'
    });

    if (!imageResult.success || !imageResult.images || imageResult.images.length === 0) {
        throw new Error('Failed to generate image: ' + (imageResult.error || 'No images returned'));
    }

    const imgPart = imageResult.images[0];
    let buffer, mimeType;

    if (typeof imgPart === 'string') {
        const response = await fetch(imgPart);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        mimeType = response.headers.get('content-type') || 'image/png';
    } else if (imgPart.inlineData) {
        buffer = Buffer.from(imgPart.inlineData.data, 'base64');
        mimeType = imgPart.inlineData.mimeType;
    }

    if (!buffer) throw new Error('Could not process generated image buffer');

    const uploadResult = await storageService.uploadUserAsset(
        'system',
        buffer,
        mimeType,
        'stack_images'
    );

    const updated = await StackItem.findByIdAndUpdate(id, {
        imageUrl: uploadResult.url,
        updatedAt: new Date()
    }, { new: true });

    return updated;
}

const stackItemService = {
    generateImageForStackItem
};

export default stackItemService;
