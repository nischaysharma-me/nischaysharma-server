const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g;

export function findPromptVariables(template) {
    if (typeof template !== 'string') return [];
    return [...new Set([...template.matchAll(PLACEHOLDER_PATTERN)].map((match) => match[1]))];
}

export function validatePromptTemplate(definition, template) {
    const errors = [];

    if (typeof template !== 'string' || template.trim().length === 0) {
        errors.push('Prompt template cannot be empty');
        return errors;
    }

    if (template.length > 100000) {
        errors.push('Prompt template cannot exceed 100,000 characters');
    }

    const allowedVariables = new Set(definition.variables || []);
    const presentVariables = new Set(findPromptVariables(template));

    for (const variable of presentVariables) {
        if (!allowedVariables.has(variable)) {
            errors.push(`Unknown prompt variable: ${variable}`);
        }
    }

    for (const variable of definition.requiredVariables || []) {
        if (!presentVariables.has(variable)) {
            errors.push(`Required prompt variable is missing: ${variable}`);
        }
    }

    return errors;
}

export function renderPromptTemplate(definition, template, values = {}) {
    const errors = validatePromptTemplate(definition, template);
    if (errors.length > 0) {
        throw new Error(`Invalid prompt template: ${errors.join(', ')}`);
    }

    const missingValues = (definition.requiredVariables || [])
        .filter((variable) => values[variable] === undefined || values[variable] === null);

    if (missingValues.length > 0) {
        throw new Error(`Missing prompt values: ${missingValues.join(', ')}`);
    }

    return template.replace(PLACEHOLDER_PATTERN, (_match, variable) => {
        const value = values[variable];
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') return value;
        return JSON.stringify(value, null, 2);
    }).trim();
}
