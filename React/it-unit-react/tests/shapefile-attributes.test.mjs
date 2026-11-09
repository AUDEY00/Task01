import test from 'node:test';
import assert from 'node:assert/strict';
import { attributeCategories, attributeKey, categoryColorExpression, categoryVisibilityExpression } from '../src/utils/shapefileAttributes.js';

const dataset = (values) => ({ features: values.map((DN) => ({ properties: { DN } })) });

test('visibility defaults to shown and can hide or restore every category', () => {
  const categories = attributeCategories(dataset([0, 9, 10, 19]), 'DN', 'ranges10');
  assert.equal(categoryVisibilityExpression(null), true);
  assert.equal(categoryVisibilityExpression({ field: 'DN', categories }), true);
  const hidden = categories.map((category) => ({ ...category, visible: false }));
  assert.equal(categoryVisibilityExpression({ field: 'DN', categories: hidden }), false);
  assert.equal(categoryVisibilityExpression({ field: 'DN', categories: hidden.map((category) => ({ ...category, visible: true })) }), true);
});

test('hiding a DN range matches all its values without altering colors or records', () => {
  const data = dataset([0, 9, 10, 19, null]);
  const original = JSON.stringify(data);
  const categories = attributeCategories(data, 'DN', 'ranges10');
  categories[0].color = '#123456';
  const before = categoryColorExpression({ field: 'DN', categories });
  categories[0].visible = false;
  const expression = categoryVisibilityExpression({ field: 'DN', categories });
  assert.deepEqual(expression[2], ['number:0', 'number:9']);
  assert.equal(expression[3], false);
  assert.equal(expression[4], true);
  assert.deepEqual(categoryColorExpression({ field: 'DN', categories }), before);
  assert.equal(JSON.stringify(data), original);
});

test('individual visibility separates number, text and missing values', () => {
  const categories = attributeCategories(dataset([1, '1', null]), 'DN');
  categories[0].visible = false;
  categories[2].visible = false;
  assert.deepEqual(categoryVisibilityExpression({ field: 'DN', categories })[2], ['number:1', 'null:']);
});

test('DN ranges use ten-wide boundaries, numeric order, and accurate counts', () => {
  const data = dataset([29, 0, 9, 10, 19, 20, -1, -10, -11, '10', null, '', 'bad']);
  const original = JSON.stringify(data);
  const groups = attributeCategories(data, 'DN', 'ranges10');
  assert.deepEqual(groups.map(({ label, count }) => [label, count]), [
    ['-20–-11', 1], ['-10–-1', 2], ['0–9', 2], ['10–19', 3], ['20–29', 2], ['(Missing or non-numeric)', 3],
  ]);
  assert.deepEqual(groups[3].keys, ['number:10', 'number:19', 'string:10']);
  assert.equal(JSON.stringify(data), original);
});

test('fractional values have precise labels and stay inside the correct range', () => {
  const groups = attributeCategories(dataset([9.99, 10, 19.99, 20]), 'DN', 'ranges10');
  assert.deepEqual(groups.map(({ label, count }) => [label, count]), [['0 ≤ value < 10', 1], ['10 ≤ value < 20', 2], ['20 ≤ value < 30', 1]]);
});

test('group color expression assigns the same chosen color to every value in the range', () => {
  const categories = attributeCategories(dataset([0, 9, 10, 19, null]), 'DN', 'ranges10');
  categories[0].color = '#123456';
  const expression = categoryColorExpression({ field: 'DN', mode: 'ranges10', categories });
  function colorFor(value) {
    const key = attributeKey(value);
    for (let i = 2; i < expression.length - 1; i += 2) {
      if ([].concat(expression[i]).includes(key)) return expression[i + 1];
    }
    return expression.at(-1);
  }
  assert.equal(colorFor(0), '#123456');
  assert.equal(colorFor(9), '#123456');
  assert.notEqual(colorFor(10), '#123456');
  assert.equal(colorFor(10), colorFor(19));
  assert.equal(colorFor(null), '#64748b');
});

test('individual mode preserves distinct values and types', () => {
  const categories = attributeCategories(dataset([1, '1', null, undefined, '']), 'DN');
  assert.equal(categories.length, 4);
  assert.equal(categories.find(({ key }) => key === 'null:').count, 2);
  assert.equal(categoryColorExpression(null), '#7c3aed');
});
