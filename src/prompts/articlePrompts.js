export const generateStructurePrompt = (topic, depth = 'standard', instructions = '') => {
  const isDeepDive = depth === 'deep-dive';
  const depthInstruction = isDeepDive 
    ? "Create an extensive, in-depth outline for a long-form technical guide. Aim for 8-12 comprehensive sections. Include advanced concepts, edge cases, real-world scenarios, and deep technical analysis." 
    : "Create a well-structured outline for a standard blog post. Aim for 4-6 sections.";

  const customInstruction = instructions ? `\n**User Instructions**: ${instructions}\n` : '';

  return `
You are an expert article writer and editor. Your task is to plan a comprehensive, engaging, and well-structured article on the topic: "${topic}".

**Mode: ${isDeepDive ? "DEEP DIVE / TECHNICAL GUIDE" : "Standard Article"}**
${depthInstruction}
${customInstruction}

Please provide the output in strict JSON format with the following structure:
{
  "title": "Catchy Article Title",
  "description": "A short, engaging summary (max 200 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": [
    {
      "heading": "Introduction",
      "contentBrief": "Briefly introduce the topic...",
      "imagePrompt": "A high-quality, photorealistic image describing..." (optional, null if no image needed),
      "imageAspectRatio": "16:9", // Optional: "1:1", "4:3", "16:9", "9:16"
      "layout": "standard" // Options: "standard", "two-column", "hero", "quote-block"
    },
    {
      "heading": "Core Concept",
      "contentBrief": "Details about section 1...",
      "imagePrompt": "Description of an image illustrating this section...",
      "imageAspectRatio": "4:3",
      "layout": "two-column"
    }
    // ... more sections
  ]
}

Ensure the image prompts are descriptive and suitable for an AI image generator. Vary the layout types and aspect ratios to create a visually engaging blog post.
`;
};

export const generateContentPrompt = (structure, imageUrls, depth = 'standard', templateInstructions = '') => {
  const isDeepDive = depth === 'deep-dive';
  const contentInstruction = isDeepDive
    ? `
    - **DEPTH REQUIREMENT**: This is a DEEP DIVE. Do not be superficial. 
    - Each section must be substantial (300-500 words minimum per section where appropriate).
    - Include code snippets, configuration examples, or mathematical proofs if relevant.
    - Discuss trade-offs, pros/cons, and performance implications.
    - Use "two-column" or "standard" layouts effectively to break up long text.
    `
    : `
    - Keep sections concise and engaging (150-300 words).
    - Focus on clarity and readability.
    `;

  return `
You are an expert web content creator. Write a full, detailed article in clean, semantic **HTML** based on the following structure.

Title: ${structure.title}
Description: ${structure.description}

**Template Instructions**: ${templateInstructions || 'None'}

Structure:
${JSON.stringify(structure.sections, null, 2)}

Image URLs (Map of Heading -> URL):
${JSON.stringify(imageUrls, null, 2)}

Instructions:
1. Output ONLY the HTML content that would go inside an <article> tag. Do not include <html>, <head>, or <body> tags.
2. Use semantic HTML5 tags.
3. **Layout Handling**:
   - **standard**: Standard flow. Image (if any) followed by text.
   - **two-column**: Use <div class="grid md:grid-cols-2 gap-8 items-center my-12">. Put text in one column and the image (figure) in the other.
   - **hero**: Full-width featured section. <div class="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden"> with image as background or covered img, and text overlaid or below.
   - **quote-block**: Stylish blockquote layout.
4. For images, use:
   <figure class="w-full">
     <img src="URL" alt="Description" class="rounded-xl shadow-lg w-full object-cover">
     <figcaption class="text-center text-sm text-gray-500 mt-2 italic">Figure: Description</figcaption>
   </figure>
5. Insert the corresponding image URL from the provided map based on the section heading.
6. Apply Tailwind-like classes for professional typography: <p class="mb-4 leading-relaxed text-gray-800">, <h2 class="text-3xl font-bold mt-12 mb-6 text-slate-900">.
7. **Styling Constraint**: Do NOT apply background colors (e.g., \`bg-white\`, \`bg-gray-50\`) to the main sections, divs, or the article container. The content must use the default background of the hosting application to support light/dark modes seamlessly.
${contentInstruction}
8. Do NOT output the JSON structure or any Markdown syntax.
`;
};

export const generateTemplatePrompt = (description) => `
You are an expert content strategist. Create a reusable **Article Template** based on the following description: "${description}".

The goal is to create a structure that can be used to generate multiple specific articles matching this description.

Please provide the output in strict JSON format matching this structure:
{
  "name": "Template Name (e.g., 'Ultimate Guide Template')",
  "description": "Short description of this template",
  "category": "blog-post", // or tutorial, case-study, etc.
  "aiInstructions": "General instructions for the AI when using this template (e.g., 'Tone should be professional', 'Focus on practical examples')",
  "structure": [
    {
      "heading": "Section Heading (Generic)",
      "contentBrief": "Instructions on what this section should cover (e.g., 'Explain the core concept of...')",
      "imagePrompt": "Description of a generic image for this section (optional)",
      "imageAspectRatio": "16:9", // "1:1", "4:3", "16:9", "9:16"
      "layout": "standard"
    }
    // ... 4-6 sections recommended
  ]
}
`;
