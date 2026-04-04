/**
 * Template Configurations
 * Defines available categories and metadata for AI template generation.
 */
export const TEMPLATE_CONFIG = {
    categories: [
        { 
            id: 'blog-post', 
            label: 'Blog Post', 
            description: 'Standard informational or personal blog article.' 
        },
        { 
            id: 'tutorial', 
            label: 'Tutorial / How-To', 
            description: 'Step-by-step guide explaining how to achieve a specific task.' 
        },
        { 
            id: 'technical-deep-dive', 
            label: 'Technical Deep-Dive', 
            description: 'In-depth analysis of architectural concepts or codebases.' 
        },
        { 
            id: 'case-study', 
            label: 'Case Study', 
            description: 'Analysis of a specific project, its challenges, and outcomes.' 
        },
        { 
            id: 'academic-research', 
            label: 'Academic Research', 
            description: 'Formal synthesis of research papers or theoretical concepts.' 
        },
        { 
            id: 'newsletter', 
            label: 'Newsletter', 
            description: 'Concise summary of updates, news, or curated links.' 
        }
    ]
};
