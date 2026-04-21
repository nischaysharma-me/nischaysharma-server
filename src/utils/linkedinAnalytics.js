/**
 * LinkedIn Analytics Utilities
 */

/**
 * Normalizes LinkedIn positions into a clean timeline
 * @param {Array} positions - Raw positions from LinkedIn API
 * @returns {Array} Formatted work history
 */
export function formatPositions(positions) {
    if (!Array.isArray(positions)) return [];

    return positions.map(pos => ({
        company: pos.companyName || pos.company?.name,
        title: pos.title,
        startDate: pos.startedOn ? `${pos.startedOn.month}/${pos.startedOn.year}` : null,
        endDate: pos.endedOn ? `${pos.endedOn.month}/${pos.endedOn.year}` : 'Present',
        description: pos.description || '',
        isCurrent: !pos.endedOn
    }));
}

/**
 * Extracts and prioritizes skills for display
 * @param {Array} skills - Raw skills list
 * @returns {Array} Clean list of skill names
 */
export function extractTopSkills(skills) {
    if (!Array.isArray(skills)) return [];
    
    // LinkedIn might return complex objects; we simplify to just names
    return skills.map(s => typeof s === 'string' ? s : (s.name || s.skill?.name)).filter(Boolean);
}

/**
 * Normalizes LinkedIn education into a clean format
 * @param {Array} education - Raw education from LinkedIn API
 * @returns {Array} Formatted education history
 */
export function formatEducation(education) {
    if (!Array.isArray(education)) return [];

    return education.map(edu => ({
        school: edu.schoolName || edu.school?.name,
        degree: edu.degreeName,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startedOn ? `${edu.startedOn.month}/${edu.startedOn.year}` : null,
        endDate: edu.endedOn ? `${edu.endedOn.month}/${edu.endedOn.year}` : null
    }));
}
