import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSocialPostPlan, parseSlides, renderSlidesPdf } from '../src/services/socialPostService.js';

test('normalizes structured AI output', () => {
    const plan = normalizeSocialPostPlan({
        text: '```json\n{"format":"document","commentary":"A useful post","slides":[{"headline":"First","body":"One idea"},{"headline":"Second","body":"Another idea"}]}\n```'
    }, { title: 'Example', format: 'document' });

    assert.equal(plan.format, 'document');
    assert.equal(plan.commentary, 'A useful post');
    assert.equal(plan.slides.length, 2);
});

test('creates fallback slides when a provider returns plain text', () => {
    const plan = normalizeSocialPostPlan('A plain caption', {
        title: 'Reliable systems',
        description: 'Observe failures. Recover safely.',
        format: 'document'
    });

    assert.equal(plan.commentary, 'A plain caption');
    assert.ok(plan.slides.length >= 2);
});

test('renders a valid multi-page PDF document', () => {
    const pdf = renderSlidesPdf([
        { headline: 'First slide', body: 'One clear idea.' },
        { headline: 'Second slide', body: 'A useful conclusion.' }
    ]);

    assert.equal(pdf.subarray(0, 8).toString(), '%PDF-1.4');
    assert.match(pdf.toString('ascii'), /\/Count 2/);
    assert.match(pdf.subarray(-12).toString('ascii'), /%%EOF/);
});

test('embeds an optional JPEG image in a slide', () => {
    const minimalRgbJpeg = Buffer.from([
        0xff, 0xd8,
        0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03,
        0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
        0xff, 0xd9
    ]);
    const pdf = renderSlidesPdf([
        { headline: 'Visual slide', body: 'A clear illustrated idea.' },
        { headline: 'Text slide', body: 'A useful conclusion.' }
    ], [minimalRgbJpeg]);

    assert.match(pdf.toString('ascii'), /\/Subtype \/Image/);
    assert.match(pdf.toString('ascii'), /\/DCTDecode/);
    assert.match(pdf.toString('ascii'), /\/SlideImage Do/);
});

test('rejects malformed and incomplete slide input', () => {
    assert.throws(() => parseSlides('{bad json'), /valid JSON/);
    assert.throws(() => renderSlidesPdf([{ headline: 'Only one', body: 'Not enough' }]), /between 2 and 10/);
});
