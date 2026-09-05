import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { findPromptVariables, renderPromptTemplate, validatePromptTemplate } from '../src/prompts/promptTemplate.js';

const definition = {
    variables: ['topic', 'outline'],
    requiredVariables: ['topic']
};

test('findPromptVariables returns unique placeholders', () => {
    assert.deepEqual(findPromptVariables('{{ topic }} / {{outline}} / {{topic}}'), ['topic', 'outline']);
});

test('validatePromptTemplate rejects unknown and missing variables', () => {
    assert.deepEqual(
        validatePromptTemplate(definition, 'Write about {{unknown}}'),
        ['Unknown prompt variable: unknown', 'Required prompt variable is missing: topic']
    );
});

test('renderPromptTemplate safely renders strings and structured values', () => {
    assert.equal(
        renderPromptTemplate(definition, 'Topic: {{topic}}\nOutline: {{outline}}', {
            topic: 'Reliable systems',
            outline: ['Observe', 'Recover']
        }),
        'Topic: Reliable systems\nOutline: [\n  "Observe",\n  "Recover"\n]'
    );
});

test('renderPromptTemplate requires values for required variables', () => {
    assert.throws(
        () => renderPromptTemplate(definition, 'Topic: {{topic}}'),
        /Missing prompt values: topic/
    );
});

test('all example catalog prompts are valid', () => {
    const catalog = JSON.parse(fs.readFileSync(new URL('../prompts.example.json', import.meta.url), 'utf8'));
    assert.equal(catalog.version, 1);

    for (const definitionEntry of Object.values(catalog.prompts)) {
        assert.deepEqual(validatePromptTemplate(definitionEntry, definitionEntry.template), []);
    }
});
