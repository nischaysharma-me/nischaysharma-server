import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Documentation Service
 * Business logic for documentation operations
 */

const DOCS_DIR = path.join(__dirname, '../../docs');

// Cache for navigation structure (invalidated on file changes)
let navigationCache = null;
let navigationCacheTime = null;
// Shorter cache TTL in development, longer in production
const NAVIGATION_CACHE_TTL = process.env.NODE_ENV === 'production'
    ? 5 * 60 * 1000  // 5 minutes in production
    : 30 * 1000;     // 30 seconds in development

/**
 * Get documentation file content
 * @param {string} routePath - Route path (e.g., 'guides/quick-start')
 * @returns {Promise<Object>} File content and metadata
 */
async function getDocContent(routePath) {
    const filePath = routeToFilePath(routePath);

    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const docsResolved = path.resolve(DOCS_DIR);

    if (!resolvedPath.startsWith(docsResolved)) {
        throw new Error('Access denied');
    }

    // Check if file exists
    try {
        await fs.access(filePath);
    } catch (error) {
        throw new Error('File not found');
    }

    // Read markdown file
    const markdown = await fs.readFile(filePath, 'utf-8');

    // Extract title from markdown (first h1 or filename)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

    // Configure marked with custom renderer for mermaid diagrams
    const renderer = new marked.Renderer();
    const originalCodeRenderer = renderer.code.bind(renderer);
    
    renderer.code = (token) => {
        if (token.lang === 'mermaid') {
            return `<pre class="mermaid">${token.text}</pre>`;
        }
        return originalCodeRenderer(token);
    };

    // Parse markdown with the custom renderer
    const html = marked.parse(markdown, { renderer });

    return {
        title,
        content: html,
        path: routePath
    };
}

/**
 * Convert route path to file path
 * @param {string} routePath - Route path
 * @returns {string} File path
 */
function routeToFilePath(routePath) {
    const cleanPath = routePath.replace(/^\/docs\//, '').replace(/\/$/, '');
    return path.join(DOCS_DIR, `${cleanPath}.md`);
}

/**
 * Extract title from markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {Promise<string>} Title from file or filename
 */
async function extractTitleFromFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
        // Fallback to filename without extension
        return path.basename(filePath, '.md')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    } catch (error) {
        // If file can't be read, use filename
        return path.basename(filePath, '.md')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
}

/**
 * Scan directory for markdown files and build navigation items
 * @param {string} dirPath - Directory path to scan
 * @param {string} routePrefix - Route prefix (e.g., 'guides', 'architecture')
 * @returns {Promise<Array>} Array of navigation items
 */
async function scanDirectoryForDocs(dirPath, routePrefix) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const items = [];

        // Sort entries: directories first, then files, both alphabetically
        const sortedEntries = entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

        for (const entry of sortedEntries) {
            const fullPath = path.join(dirPath, entry.name);

            // Skip hidden files/directories and non-markdown files
            if (entry.name.startsWith('.')) continue;

            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                const subItems = await scanDirectoryForDocs(fullPath, `${routePrefix}/${entry.name}`);
                items.push(...subItems);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                // Get title from file
                const title = await extractTitleFromFile(fullPath);
                const routePath = `${routePrefix}/${entry.name.replace('.md', '')}`;

                items.push({
                    name: title,
                    path: `/docs/${routePath}`
                });
            }
        }

        return items;
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
        return [];
    }
}

/**
 * Build navigation tree structure dynamically
 * Scans the docs directory and builds navigation based on actual files
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Array>} Navigation structure
 */
async function getNavigationStructure(forceRefresh = false) {
    // If force refresh is requested, clear cache
    if (forceRefresh) {
        navigationCache = null;
        navigationCacheTime = null;
    }

    // Check cache (only if not forcing refresh)
    if (!forceRefresh && navigationCache && navigationCacheTime) {
        const cacheAge = Date.now() - navigationCacheTime;
        if (cacheAge < NAVIGATION_CACHE_TTL) {
            return navigationCache;
        }
        // Cache expired, clear it
        navigationCache = null;
        navigationCacheTime = null;
    }

    try {
        const navigation = [];
        const topLevelDirs = await fs.readdir(DOCS_DIR, { withFileTypes: true });

        // Process each top-level directory
        for (const dir of topLevelDirs) {
            if (!dir.isDirectory() || dir.name.startsWith('.')) {
                continue;
            }

            const dirPath = path.join(DOCS_DIR, dir.name);
            const items = await scanDirectoryForDocs(dirPath, dir.name);

            if (items.length > 0) {
                // Capitalize section name (e.g., 'guides' -> 'Guides')
                const sectionName = dir.name
                    .replace(/_/g, ' ')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());

                navigation.push({
                    section: sectionName,
                    items: items.sort((a, b) => a.name.localeCompare(b.name))
                });
            }
        }

        // Sort sections alphabetically
        navigation.sort((a, b) => a.section.localeCompare(b.section));

        // Update cache
        navigationCache = navigation;
        navigationCacheTime = Date.now();

        return navigation;
    } catch (error) {
        console.error('Error building navigation structure:', error);
        // Return empty structure on error
        return [];
    }
}

/**
 * Invalidate navigation cache
 * Call this when documentation files are added/removed/updated
 */
function invalidateNavigationCache() {
    navigationCache = null;
    navigationCacheTime = null;
}

/**
 * Get index page data
 * Dynamically builds quick links from available documentation
 * @returns {Promise<Object>} Index page data
 */
async function getIndexData() {
    const navigation = await getNavigationStructure();

    // Build quick links from first few items in each section
    const quickLinks = [];
    for (const section of navigation) {
        if (section.items && section.items.length > 0) {
            // Add first item from each section as a quick link
            quickLinks.push({
                section: section.section,
                items: section.items.slice(0, 3) // First 3 items per section
            });
        }
    }

    // Build HTML for quick links
    let quickLinksHTML = '';
    if (quickLinks.length > 0) {
        quickLinksHTML = '<h2>Quick Links</h2>';
        for (const section of quickLinks) {
            quickLinksHTML += `<h3>${section.section}</h3><ul>`;
            for (const item of section.items) {
                quickLinksHTML += `<li><a href="${item.path}">${item.name}</a></li>`;
            }
            quickLinksHTML += '</ul>';
        }
    }

    return {
        title: 'Documentation Index',
        content: `
      <h1>TaughtCode Documentation</h1>
      <p>Welcome to the TaughtCode documentation. Select a topic from the sidebar to get started.</p>
      ${quickLinksHTML}
      <p><em>Documentation is automatically updated. New files will appear in the navigation automatically.</em></p>
    `
    };
}

export {
    getDocContent,
    getNavigationStructure,
    getIndexData,
    invalidateNavigationCache
};

