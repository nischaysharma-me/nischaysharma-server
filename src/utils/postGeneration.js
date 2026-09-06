export function normalizeGeneratedPost(raw, topic) {
    const text = typeof raw === 'string' ? raw : raw?.text || '';
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let generated;

    try {
        generated = JSON.parse(cleaned);
    } catch {
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!objectMatch) throw new Error('AI did not return a valid post draft');
        generated = JSON.parse(objectMatch[0]);
    }

    const title = String(generated.title || topic).trim().slice(0, 160);
    const content = String(generated.content || '').trim().slice(0, 10000);
    const tags = Array.isArray(generated.tags)
        ? [...new Set(generated.tags.map((tag) => String(tag).trim().replace(/^#/, '').toLowerCase()).filter(Boolean))].slice(0, 12)
        : [];

    if (title.length < 3 || !content) throw new Error('AI returned an incomplete post draft');
    return { title, content, tags };
}
