import * as promptLibrary from '../services/promptLibraryService.js';
import logger from '../utils/logger.js';

const editorId = (req) => req.user?.uid || req.user?.id || null;

function sendError(res, error, fallbackMessage) {
    const clientError = /Unknown prompt key|Prompt revision not found|Prompt template|prompt variable|Missing prompt values/i.test(error.message);
    res.status(clientError ? 400 : 500).json({
        success: false,
        message: clientError ? error.message : fallbackMessage
    });
}

export async function listPrompts(req, res) {
    try {
        const prompts = await promptLibrary.listPrompts();
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.json({ success: true, data: prompts });
    } catch (error) {
        logger.error('PromptController: Unable to list prompts', error);
        sendError(res, error, 'Unable to load the prompt library');
    }
}

export async function updatePrompt(req, res) {
    try {
        const prompt = await promptLibrary.updatePrompt(req.params.key, req.body.template, editorId(req));
        res.json({ success: true, data: prompt });
    } catch (error) {
        logger.error(`PromptController: Unable to update ${req.params.key}`, error);
        sendError(res, error, 'Unable to update the prompt');
    }
}

export async function resetPrompt(req, res) {
    try {
        const prompt = await promptLibrary.resetPrompt(req.params.key, editorId(req));
        res.json({ success: true, data: prompt });
    } catch (error) {
        logger.error(`PromptController: Unable to reset ${req.params.key}`, error);
        sendError(res, error, 'Unable to reset the prompt');
    }
}

export async function resetAllPrompts(req, res) {
    try {
        const prompts = await promptLibrary.resetAllPrompts(editorId(req));
        res.json({ success: true, data: prompts });
    } catch (error) {
        logger.error('PromptController: Unable to reset all prompts', error);
        sendError(res, error, 'Unable to reset the prompt library');
    }
}

export async function previewPrompt(req, res) {
    try {
        const rendered = promptLibrary.previewPrompt(req.params.key, req.body.template, req.body.values || {});
        res.json({ success: true, data: { rendered } });
    } catch (error) {
        sendError(res, error, 'Unable to preview the prompt');
    }
}

export async function listRevisions(req, res) {
    try {
        const revisions = await promptLibrary.listPromptRevisions(req.params.key);
        res.json({ success: true, data: revisions });
    } catch (error) {
        logger.error(`PromptController: Unable to list revisions for ${req.params.key}`, error);
        sendError(res, error, 'Unable to load prompt history');
    }
}

export async function rollbackPrompt(req, res) {
    try {
        const prompt = await promptLibrary.rollbackPrompt(
            req.params.key,
            req.params.revisionId,
            editorId(req)
        );
        res.json({ success: true, data: prompt });
    } catch (error) {
        logger.error(`PromptController: Unable to roll back ${req.params.key}`, error);
        sendError(res, error, 'Unable to roll back the prompt');
    }
}
