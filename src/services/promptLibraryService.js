import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/firebase.js';
import logger from '../utils/logger.js';
import { renderPromptTemplate, validatePromptTemplate } from '../prompts/promptTemplate.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(currentDirectory, '../..');
const examplePath = path.join(serverRoot, 'prompts.example.json');
const runtimePath = process.env.PROMPTS_FILE_PATH || path.join(serverRoot, 'prompts.json');
const overridesCollection = db.collection('systemPrompts');
const FIRESTORE_CACHE_TTL_MS = 15000;

const defaultCatalog = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
let localCatalog = null;
let overrideCache = new Map();
let overrideCacheExpiresAt = 0;

function validateCatalog(catalog) {
    if (!catalog || catalog.version !== 1 || !catalog.prompts || typeof catalog.prompts !== 'object') {
        throw new Error('Prompt catalog must contain version 1 and a prompts object');
    }

    for (const [key, definition] of Object.entries(catalog.prompts)) {
        if (!definition.name || !definition.category || typeof definition.template !== 'string') {
            throw new Error(`Prompt definition is incomplete: ${key}`);
        }
        const errors = validatePromptTemplate(definition, definition.template);
        if (errors.length > 0) {
            throw new Error(`Invalid default prompt ${key}: ${errors.join(', ')}`);
        }
    }
}

validateCatalog(defaultCatalog);

async function writeJsonAtomically(targetPath, value) {
    const directory = path.dirname(targetPath);
    const temporaryPath = `${targetPath}.${process.pid}.tmp`;
    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    await fs.promises.rename(temporaryPath, targetPath);
}

function mergeWithDefaults(catalog) {
    const runtimePrompts = catalog?.prompts || {};
    const prompts = {};

    for (const [key, definition] of Object.entries(defaultCatalog.prompts)) {
        const runtimeTemplate = runtimePrompts[key]?.template;
        prompts[key] = {
            ...definition,
            template: typeof runtimeTemplate === 'string' ? runtimeTemplate : definition.template
        };
    }

    return { version: defaultCatalog.version, prompts };
}

async function loadLocalCatalog() {
    if (localCatalog) return localCatalog;

    try {
        const contents = await fs.promises.readFile(runtimePath, 'utf8');
        const parsed = JSON.parse(contents);
        localCatalog = mergeWithDefaults(parsed);
        validateCatalog(localCatalog);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            logger.error(`PromptLibrary: Invalid runtime prompt file; using defaults: ${error.message}`);
        }
        localCatalog = mergeWithDefaults(defaultCatalog);
        await writeJsonAtomically(runtimePath, localCatalog);
    }

    return localCatalog;
}

async function refreshOverrides(force = false) {
    if (!force && Date.now() < overrideCacheExpiresAt) return overrideCache;

    try {
        const snapshot = await overridesCollection.get();
        overrideCache = new Map(snapshot.docs.map((document) => [document.id, document.data()]));
        overrideCacheExpiresAt = Date.now() + FIRESTORE_CACHE_TTL_MS;
    } catch (error) {
        overrideCacheExpiresAt = Date.now() + FIRESTORE_CACHE_TTL_MS;
        logger.warn(`PromptLibrary: Firestore overrides unavailable; using local prompts: ${error.message}`);
    }

    return overrideCache;
}

function requireDefinition(key) {
    const definition = defaultCatalog.prompts[key];
    if (!definition) throw new Error(`Unknown prompt key: ${key}`);
    return definition;
}

async function syncLocalTemplate(key, template) {
    try {
        const catalog = await loadLocalCatalog();
        catalog.prompts[key] = { ...catalog.prompts[key], template };
        await writeJsonAtomically(runtimePath, catalog);
    } catch (error) {
        logger.warn(`PromptLibrary: Unable to update local prompt mirror: ${error.message}`);
    }
}

function normalizeTimestamp(timestamp) {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    return timestamp;
}

export async function getPrompt(key) {
    const definition = requireDefinition(key);
    const catalog = await loadLocalCatalog();
    const overrides = await refreshOverrides();
    const override = overrides.get(key);
    const template = override?.template || catalog.prompts[key]?.template || definition.template;

    return {
        key,
        ...definition,
        template,
        defaultTemplate: definition.template,
        isOverridden: Boolean(override),
        source: override ? 'firestore' : template === definition.template ? 'default' : 'local',
        updatedAt: normalizeTimestamp(override?.updatedAt),
        updatedBy: override?.updatedBy || null
    };
}

export async function renderPrompt(key, values = {}) {
    const prompt = await getPrompt(key);
    return renderPromptTemplate(prompt, prompt.template, values);
}

export async function listPrompts() {
    await loadLocalCatalog();
    await refreshOverrides();
    return Promise.all(Object.keys(defaultCatalog.prompts).map((key) => getPrompt(key)));
}

export async function updatePrompt(key, template, updatedBy) {
    const definition = requireDefinition(key);
    const errors = validatePromptTemplate(definition, template);
    if (errors.length > 0) throw new Error(errors.join(', '));

    const current = await getPrompt(key);
    const reference = overridesCollection.doc(key);
    const revisionReference = reference.collection('revisions').doc();
    const batch = db.batch();
    const now = new Date();

    batch.set(revisionReference, {
        template: current.template,
        source: current.source,
        changedAt: now,
        changedBy: updatedBy || null
    });
    batch.set(reference, {
        key,
        template: template.trim(),
        updatedAt: now,
        updatedBy: updatedBy || null
    });
    await batch.commit();

    overrideCache.set(key, { template: template.trim(), updatedAt: now, updatedBy: updatedBy || null });
    overrideCacheExpiresAt = Date.now() + FIRESTORE_CACHE_TTL_MS;
    await syncLocalTemplate(key, template.trim());
    return getPrompt(key);
}

export async function resetPrompt(key, updatedBy) {
    const definition = requireDefinition(key);
    const current = await getPrompt(key);
    const reference = overridesCollection.doc(key);
    const revisionReference = reference.collection('revisions').doc();
    const batch = db.batch();

    batch.set(revisionReference, {
        template: current.template,
        source: current.source,
        changedAt: new Date(),
        changedBy: updatedBy || null
    });
    batch.delete(reference);
    await batch.commit();

    overrideCache.delete(key);
    overrideCacheExpiresAt = Date.now() + FIRESTORE_CACHE_TTL_MS;
    await syncLocalTemplate(key, definition.template);
    return getPrompt(key);
}

export async function resetAllPrompts(updatedBy) {
    const prompts = await listPrompts();
    const batch = db.batch();
    const now = new Date();

    for (const prompt of prompts) {
        const reference = overridesCollection.doc(prompt.key);
        batch.set(reference.collection('revisions').doc(), {
            template: prompt.template,
            source: prompt.source,
            changedAt: now,
            changedBy: updatedBy || null
        });
        batch.delete(reference);
    }

    await batch.commit();
    overrideCache = new Map();
    overrideCacheExpiresAt = Date.now() + FIRESTORE_CACHE_TTL_MS;
    localCatalog = mergeWithDefaults(defaultCatalog);
    await writeJsonAtomically(runtimePath, localCatalog);
    return listPrompts();
}

export async function listPromptRevisions(key) {
    requireDefinition(key);
    const snapshot = await overridesCollection.doc(key)
        .collection('revisions')
        .orderBy('changedAt', 'desc')
        .limit(20)
        .get();

    return snapshot.docs.map((document) => {
        const data = document.data();
        return {
            id: document.id,
            template: data.template,
            source: data.source,
            changedAt: normalizeTimestamp(data.changedAt),
            changedBy: data.changedBy || null
        };
    });
}

export async function rollbackPrompt(key, revisionId, updatedBy) {
    requireDefinition(key);
    const revision = await overridesCollection.doc(key).collection('revisions').doc(revisionId).get();
    if (!revision.exists) throw new Error('Prompt revision not found');
    return updatePrompt(key, revision.data().template, updatedBy);
}

export function previewPrompt(key, template, values = {}) {
    const definition = requireDefinition(key);
    return renderPromptTemplate(definition, template, values);
}
