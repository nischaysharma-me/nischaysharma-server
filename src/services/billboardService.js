import { Billboard } from '../models/index.js';
import * as aiService from './aiService.js';
import * as storageService from './storageService.js';
import logger from '../utils/logger.js';

export async function createBillboard(data, file = null) {
    let imageUrl = data.imageUrl || '';

    if (file) {
        const uploadResult = await storageService.uploadUserAsset(
            'system',
            file.buffer,
            file.mimetype,
            'billboard_images'
        );
        imageUrl = uploadResult.url;
    }

    const payload = {
        ...data,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const billboard = await Billboard.create(payload);
    logger.info(`Billboard created: ${billboard.id}`);
    return billboard;
}

export async function updateBillboard(id, data, file = null) {
    let imageUrl = data.imageUrl;

    if (file) {
        const uploadResult = await storageService.uploadUserAsset(
            'system',
            file.buffer,
            file.mimetype,
            'billboard_images'
        );
        imageUrl = uploadResult.url;
    }

    const payload = {
        ...data,
        updatedAt: new Date()
    };
    
    if (imageUrl !== undefined) {
        payload.imageUrl = imageUrl;
    }

    // Safety: Firestore doesn't like id in the body
    delete payload.id;
    delete payload._id;

    logger.info(`BillboardService: Updating database for ${id}`, { payloadKeys: Object.keys(payload) });

    const updated = await Billboard.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) throw new Error('Billboard not found');
    logger.info(`Billboard updated in DB: ${id}`);
    return updated;
}

export async function deleteBillboard(id) {
    const deleted = await Billboard.findByIdAndDelete(id);
    if (!deleted) throw new Error('Billboard not found');
    logger.info(`Billboard deleted: ${id}`);
    return deleted;
}

export async function listBillboards(filters = {}) {
    const activeFilters = { ...filters };
    if (filters.isActive !== undefined) {
        activeFilters.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    const billboards = await Billboard.find(activeFilters);
    return billboards.sort((a, b) => (a.position || 0) - (b.position || 0));
}

export async function generateImageForBillboard(id, prompt) {
    const billboard = await Billboard.findById(id);
    if (!billboard) throw new Error('Billboard not found');

    const imagePrompt = prompt || billboard.imagePrompt || `A high quality newspaper illustration for ${billboard.headline}. No text or typography.`;
    
    let aspectRatio = '16:9';
    if (billboard.layoutType === 'middle') aspectRatio = '4:3';
    else if (billboard.layoutType === 'mini') aspectRatio = '1:1';

    logger.info(`BillboardService: Requesting AI image for ${id}`, { prompt: imagePrompt, aspectRatio });

    const imageResult = await aiService.generateImage(imagePrompt, { aspectRatio });
    if (!imageResult.success || !imageResult.images || imageResult.images.length === 0) {
        logger.error('BillboardService: AI generation failed', { result: imageResult });
        throw new Error('Failed to generate image: ' + (imageResult.error || 'No results from AI'));
    }

    const imgPart = imageResult.images[0];
    let buffer, mimeType;

    try {
        if (typeof imgPart === 'string') {
            logger.info(`BillboardService: Image returned as URL, fetching...`, { url: imgPart });
            const response = await fetch(imgPart);
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = response.headers.get('content-type') || 'image/png';
        } else if (imgPart.inlineData) {
            buffer = Buffer.from(imgPart.inlineData.data, 'base64');
            mimeType = imgPart.inlineData.mimeType;
        } else if (imgPart.fileData) {
            // If it's fileData (Google Cloud Storage URL usually)
            const fileUrl = imgPart.fileData.fileUri;
            logger.info(`BillboardService: Image returned as fileUri, fetching...`, { url: fileUrl });
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            mimeType = response.headers.get('content-type') || 'image/png';
        }

        if (!buffer) throw new Error('Could not process generated image buffer');

        logger.info(`BillboardService: Uploading generated image for ${id}`);

        const uploadResult = await storageService.uploadUserAsset(
            'system',
            buffer,
            mimeType,
            'billboard_images'
        );

        logger.info(`BillboardService: Image uploaded for ${id}`, { url: uploadResult.url });

        const updated = await updateBillboard(id, { imageUrl: uploadResult.url });
        return updated;
    } catch (err) {
        logger.error(`BillboardService: Failed to process/upload generated image: ${err.message}`);
        throw new Error(`Process failed: ${err.message}`);
    }
}
