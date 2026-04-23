import billboardSvc from '../services/billboardService.js';
import logger from '../utils/logger.js';

export const createBillboard = async (req, res) => {
    try {
        const billboard = await billboardSvc.createBillboard(req.body, req.file);
        res.status(201).json({ success: true, data: billboard });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateBillboard = async (req, res) => {
    try {
        logger.info(`BillboardController: Updating billboard ${req.params.id}`, { body: req.body });
        const billboard = await billboardSvc.updateBillboard(req.params.id, req.body, req.file);
        res.json({ success: true, data: billboard });
    } catch (error) {
        logger.error(`BillboardController Error (update): ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteBillboard = async (req, res) => {
    try {
        await billboardSvc.deleteBillboard(req.params.id);
        res.json({ success: true, message: 'Billboard deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const listBillboards = async (req, res) => {
    try {
        const billboards = await billboardSvc.listBillboards(req.query);
        res.json({ success: true, data: billboards });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const generateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { prompt } = req.body;
        logger.info(`BillboardController: Generating image for billboard ${id}`, { prompt });
        const billboard = await billboardSvc.generateImageForBillboard(id, prompt);
        res.json({ success: true, data: billboard });
    } catch (error) {
        logger.error(`BillboardController Error (generateImage): ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};
