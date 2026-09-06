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

test('rejects malformed and incomplete slide input', () => {
    assert.throws(() => parseSlides('{bad json'), /valid JSON/);
    assert.throws(() => renderSlidesPdf([{ headline: 'Only one', body: 'Not enough' }]), /between 2 and 10/);
});
