import * as billboardService from '../services/billboardService.js';

export const createBillboard = async (req, res) => {
    try {
        const billboard = await billboardService.createBillboard(req.body, req.file);
        res.status(201).json({ success: true, data: billboard });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateBillboard = async (req, res) => {
    try {
        const billboard = await billboardService.updateBillboard(req.params.id, req.body, req.file);
        res.json({ success: true, data: billboard });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const deleteBillboard = async (req, res) => {
    try {
        await billboardService.deleteBillboard(req.params.id);
        res.json({ success: true, message: 'Billboard deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const listBillboards = async (req, res) => {
    try {
        const billboards = await billboardService.listBillboards(req.query);
        res.json({ success: true, data: billboards });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const generateImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { prompt } = req.body;
        const billboard = await billboardService.generateImageForBillboard(id, prompt);
        res.json({ success: true, data: billboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
