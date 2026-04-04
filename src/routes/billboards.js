import express from 'express';
import * as billboardController from '../controllers/billboardController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBillboardSchema, updateBillboardSchema, generateBillboardImageSchema } from '../validation/billboardSchemas.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', billboardController.listBillboards);

router.post('/', 
    isAuthenticated,
    upload.single('image'), // Handle single image upload
    validateRequest(createBillboardSchema),
    billboardController.createBillboard
);

router.patch('/:id',
    isAuthenticated,
    upload.single('image'), // Handle single image upload
    validateRequest(updateBillboardSchema),
    billboardController.updateBillboard
);

router.delete('/:id',
    isAuthenticated,
    billboardController.deleteBillboard
);

router.post('/:id/generate-image',
    isAuthenticated,
    validateRequest(generateBillboardImageSchema),
    billboardController.generateImage
);

export default router;
