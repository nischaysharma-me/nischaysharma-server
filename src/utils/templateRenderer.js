import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Template Renderer Utility
 * Handles HTML template rendering
 */

const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * Render template with data
 * @param {string} templateName - Template file name (without .html)
 * @param {Object} data - Data to inject into template
 * @returns {Promise<string>} Rendered HTML
 */
async function renderTemplate(templateName, data = {}) {
    try {
        const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
        let template = await fs.readFile(templatePath, 'utf-8');

        // Template variable replacement
        // Replace {{variable}} with data.variable
        // Handles both simple variables and HTML content
        template = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            if (data[key] !== undefined) {
                // Return the value as-is (allows HTML content)
                return String(data[key]);
            }
            return match; // Keep original if not found
        });

        return template;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        throw new Error(`Template ${templateName} not found`);
    }
}

/**
 * Render documentation page
 * @param {Object} options - Rendering options
 * @param {string} options.title - Page title
 * @param {string} options.content - HTML content
 * @param {string} options.currentPath - Current path for navigation
 * @param {Array} options.navigation - Navigation structure
 * @returns {Promise<string>} Rendered HTML
 */
async function renderDocPage({ title, content, currentPath = '', navigation = [] }) {
    // Build navigation HTML
    const navHTML = buildNavigationHTML(navigation, currentPath);

    return renderTemplate('docs', {
        title: `${title}`,
        content,
        navigation: navHTML
    });
}

/**
 * Get icon for navigation section
 * @param {string} section - Section name
 * @returns {string} SVG icon HTML
 */
function getSectionIcon(section) {
    const icons = {
        'Guides': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
        'API': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>',
        'Architecture': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
        'Structure': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>',
        'Updates': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>',
        'Default': '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>'
    };
    return icons[section] || icons['Default'];
}

/**
 * Build navigation HTML from structure
 * @param {Array} navigation - Navigation structure
 * @param {string} currentPath - Current path
 * @returns {string} Navigation HTML
 */
function buildNavigationHTML(navigation, currentPath) {
    let html = '';

    for (const section of navigation) {
        const sectionIcon = getSectionIcon(section.section);
        html += `<div class="mb-6">`;
        html += `<div class="flex items-center gap-2 px-3 mb-2">
            <span class="text-gray-500">${sectionIcon}</span>
            <h3 class="nav-section-title !mb-0">${section.section}</h3>
        </div>`;
        html += `<ul class="space-y-0.5">`;

        for (const item of section.items) {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            html += `<li class="nav-item">`;
            html += `<a href="${item.path}" class="${isActive ? 'active' : ''}">
                <svg class="w-3.5 h-3.5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>${item.name}</span>
            </a>`;
            html += `</li>`;
        }

        html += `</ul>`;
        html += `</div>`;
    }

    return html;
}

export {
    renderTemplate,
    renderDocPage
};

