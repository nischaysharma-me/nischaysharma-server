import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostSchema, updatePostSchema, generatePostSchema } from '../src/validation/postSchemas.js';
import { normalizeGeneratedPost } from '../src/utils/postGeneration.js';

test('accepts a valid short-form post', () => {
    const { error, value } = createPostSchema.validate({
        title: 'A useful observation',
        content: 'Small, focused posts make it easier to share work in progress.',
        tags: ['writing', 'building']
    });

    assert.equal(error, undefined);
    assert.equal(value.status, 'draft');
});

test('requires post title and content', () => {
    const { error } = createPostSchema.validate({ title: '', content: '' }, { abortEarly: false });
    assert.ok(error);
    assert.equal(error.details.length, 2);
});

test('rejects an empty post update', () => {
    const { error } = updatePostSchema.validate({});
    assert.ok(error);
});

test('validates AI post generation input', () => {
    const { error, value } = generatePostSchema.validate({ topic: 'Lessons from shipping small features' });
    assert.equal(error, undefined);
    assert.equal(value.tone, 'conversational');
});

test('normalizes a structured AI post response', () => {
    const draft = normalizeGeneratedPost({
        text: '```json\n{"title":"Ship the smaller version","content":"Small releases make feedback concrete.","tags":["Building","#Building","shipping"]}\n```'
    }, 'Shipping');

    assert.equal(draft.title, 'Ship the smaller version');
    assert.deepEqual(draft.tags, ['building', 'shipping']);
});
