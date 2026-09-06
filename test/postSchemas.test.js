import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostSchema, updatePostSchema } from '../src/validation/postSchemas.js';

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
