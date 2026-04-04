/**
 * Simple HTML Minifier
 * Removes comments, whitespace between tags, and collapses multiple spaces.
 * @param {string} html 
 * @returns {string} Minified HTML
 */
export function minifyHTML(html) {
    if (!html) return '';
    
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/>\s+</g, '><') // Remove whitespace between tags
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim();
}
