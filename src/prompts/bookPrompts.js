/**
 * Prompts for generating book pages based on conversational context
 */

export const generatePageStructurePrompt = (topic, history) => {
    return `
You are an expert co-author and researcher. You are collaborating with a user on a "Threaded Book".
Your task is to plan a comprehensive, engaging, and well-structured page/chapter for this book on the topic: "${topic}".

Base your content structure on the following conversation history between you and the user:
---
${history}
---

The page should be a natural extension of the insights shared in this conversation, capturing the unique perspective and reasoning established.

Please provide the output in strict JSON format with the following structure:
{
  "title": "Clear, Descriptive Page Title",
  "sections": [
    {
      "heading": "Section Heading",
      "contentBrief": "Briefly describe what this section should cover based on the conversation history...",
      "imagePrompt": "A high-quality, photorealistic image describing this section. Focus on visual metaphors or technical diagrams as appropriate." (optional, null if no image needed),
      "imageAspectRatio": "16:9", // "1:1", "4:3", "16:9", "9:16"
      "layout": "standard" // "standard", "two-column", "hero", "quote-block"
    }
  ]
}

Ensure the image prompts are descriptive and suitable for an AI image generator. Vary the layout types to create a visually engaging page.
`;
};

export const generatePageContentPrompt = (structure, imageUrls, history) => {
    return `
You are an expert co-author. Write a full, detailed book page in clean, semantic **HTML** based on the following structure and conversation history.

Title: ${structure.title}

Conversation History (Context):
---
${history}
---

Structure:
${JSON.stringify(structure.sections, null, 2)}

Image URLs (Map of Heading -> URL):
${JSON.stringify(imageUrls, null, 2)}

Instructions:
1. Output ONLY the HTML content that would go inside a <div> or <article> tag. Do not include <html>, <head>, or <body> tags.
2. Use semantic HTML5 tags (<section>, <p>, <h2>, <figure>, etc.).
3. **Layout Handling**:
   - **standard**: Standard flow. Image (if any) followed by text.
   - **two-column**: Use <div class="grid md:grid-cols-2 gap-8 items-center my-12">. Put text in one column and the image (figure) in the other.
   - **hero**: Full-width featured section. <div class="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden"> with image as background or covered img.
   - **quote-block**: Stylish blockquote layout for key insights from the user.
4. For images, use:
   <figure class="w-full">
     <img src="URL" alt="Description" class="rounded-xl shadow-lg w-full object-cover">
     <figcaption class="text-center text-sm text-gray-500 mt-2 italic">Figure: Description</figcaption>
   </figure>
5. Insert the corresponding image URL from the provided map based on the section heading.
6. Apply Tailwind-like classes for professional typography: <p class="mb-4 leading-relaxed text-gray-800">, <h2 class="text-3xl font-bold mt-12 mb-6 text-slate-900">.
7. **Styling Constraint**: Do NOT apply background colors (e.g., \`bg-white\`) to the main sections.
8. Each section must be substantial (250-500 words) to ensure deep level of information.
9. Capture the nuance and reasoning from the conversation history.
10. Do NOT output Markdown syntax.
`;
};
