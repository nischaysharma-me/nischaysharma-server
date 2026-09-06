const ALLOWED_FORMATS = new Set(['text', 'image', 'document']);

function cleanString(value, maximumLength = 4000) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maximumLength);
}

function extractJson(text) {
    const source = cleanString(text, 50000)
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
    const start = source.indexOf('{');
    const end = source.lastIndexOf('}');
    if (start < 0 || end <= start) return null;

    try {
        return JSON.parse(source.slice(start, end + 1));
    } catch {
        return null;
    }
}

function fallbackSlides(title, description) {
    const ideas = cleanString(description, 1200)
        .split(/(?<=[.!?])\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4);

    const slides = [{
        headline: cleanString(title, 90) || 'A new perspective',
        body: 'A concise visual guide',
        altText: `Cover slide for ${cleanString(title, 120) || 'the post'}`
    }];

    for (const idea of ideas) {
        const words = idea.split(/\s+/);
        slides.push({
            headline: words.slice(0, 7).join(' ').replace(/[.,:;!?]+$/, ''),
            body: idea,
            altText: idea.slice(0, 180)
        });
    }

    slides.push({
        headline: 'Continue the conversation',
        body: 'Explore the complete piece and share what stood out to you.',
        altText: 'Closing slide inviting readers to continue the conversation'
    });
    return slides.slice(0, 8);
}

export function normalizeSocialPostPlan(providerResult, content = {}) {
    const rawText = typeof providerResult === 'string'
        ? providerResult
        : providerResult?.text || '';
    const parsed = extractJson(rawText);
    const requestedFormat = ALLOWED_FORMATS.has(content.format) ? content.format : 'text';
    const format = requestedFormat;
    const commentary = cleanString(parsed?.commentary || parsed?.text || rawText, 3000);
    const parsedSlides = Array.isArray(parsed?.slides) ? parsed.slides : [];
    const slides = parsedSlides
        .map((slide) => ({
            headline: cleanString(slide?.headline, 90),
            body: cleanString(slide?.body, 420),
            altText: cleanString(slide?.altText, 300)
        }))
        .filter((slide) => slide.headline && slide.body)
        .slice(0, 10);

    return {
        format,
        commentary: commentary || `I just published: ${cleanString(content.title, 200)}`,
        text: commentary || `I just published: ${cleanString(content.title, 200)}`,
        slides: format === 'document' && slides.length < 2
            ? fallbackSlides(content.title, content.description)
            : slides,
        imageAltText: cleanString(parsed?.imageAltText, 300),
        hashtags: Array.isArray(parsed?.hashtags)
            ? parsed.hashtags.map((tag) => cleanString(tag, 60)).filter(Boolean).slice(0, 5)
            : []
    };
}

function pdfSafe(value) {
    return cleanString(value, 1000)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function wrapText(value, maximumCharacters) {
    const words = pdfSafe(value).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maximumCharacters && line) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function textCommands(lines, { x, y, size, leading, color = '1 1 1' }) {
    if (!lines.length) return '';
    return [
        'BT',
        `/${size >= 36 ? 'F2' : 'F1'} ${size} Tf`,
        `${color} rg`,
        `${leading} TL`,
        `${x} ${y} Td`,
        ...lines.map((line, index) => `${index ? 'T* ' : ''}(${line}) Tj`),
        'ET'
    ].join('\n');
}

function createSlideStream(slide, index, total) {
    const palettes = [
        ['0.035 0.047 0.075', '0.176 0.835 0.749'],
        ['0.055 0.039 0.102', '0.655 0.443 0.937'],
        ['0.025 0.071 0.094', '0.220 0.749 0.937'],
        ['0.082 0.047 0.055', '0.984 0.443 0.522']
    ];
    const [background, accent] = palettes[index % palettes.length];
    const headline = wrapText(slide.headline, 25).slice(0, 4);
    const body = wrapText(slide.body, 54).slice(0, 9);

    return [
        `${background} rg 0 0 1080 1350 re f`,
        `${accent} rg 72 1188 160 10 re f`,
        `${accent} rg 840 -80 360 360 re f`,
        textCommands(['NISCHAY / FIELD NOTES'], { x: 72, y: 1230, size: 18, leading: 22, color: '0.82 0.84 0.88' }),
        textCommands(headline, { x: 72, y: 1025, size: 58, leading: 70 }),
        textCommands(body, { x: 72, y: 690, size: 25, leading: 38, color: '0.84 0.86 0.9' }),
        textCommands([`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`], { x: 72, y: 72, size: 17, leading: 20, color: '0.7 0.72 0.76' })
    ].filter(Boolean).join('\n');
}

export function renderSlidesPdf(slides) {
    if (!Array.isArray(slides) || slides.length < 2 || slides.length > 10) {
        throw new Error('Document posts require between 2 and 10 slides');
    }

    const normalizedSlides = slides.map((slide) => ({
        headline: cleanString(slide?.headline, 90),
        body: cleanString(slide?.body, 420)
    }));
    if (normalizedSlides.some((slide) => !slide.headline || !slide.body)) {
        throw new Error('Every slide requires a headline and body');
    }

    const fontRegularId = 3 + normalizedSlides.length * 2;
    const fontBoldId = fontRegularId + 1;
    const objects = [];
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    const pageIds = normalizedSlides.map((_, index) => 3 + index * 2);
    objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${normalizedSlides.length} >>`;

    normalizedSlides.forEach((slide, index) => {
        const pageId = pageIds[index];
        const contentId = pageId + 1;
        const stream = createSlideStream(slide, index, normalizedSlides.length);
        objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1080 1350] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`;
        objects[contentId] = `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`;
    });
    objects[fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    objects[fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

    const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary')];
    const offsets = [0];
    let offset = chunks[0].length;
    for (let id = 1; id < objects.length; id += 1) {
        const chunk = Buffer.from(`${id} 0 obj\n${objects[id]}\nendobj\n`, 'ascii');
        offsets[id] = offset;
        chunks.push(chunk);
        offset += chunk.length;
    }

    const xrefOffset = offset;
    const xref = [
        `xref\n0 ${objects.length}\n`,
        '0000000000 65535 f \n',
        ...offsets.slice(1).map((item) => `${String(item).padStart(10, '0')} 00000 n \n`),
        `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    ].join('');
    chunks.push(Buffer.from(xref, 'ascii'));
    return Buffer.concat(chunks);
}

export function parseSlides(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        throw new Error('Slides must be valid JSON');
    }
}
