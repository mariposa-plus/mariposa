export type TransformOperation =
  | 'extract-single'
  | 'extract-multiple'
  | 'format-text'
  | 'math'
  | 'compare'
  | 'rename-fields';

export interface TransformMeta {
  mode: 'simple';
  operation: TransformOperation;
  // extract-single
  fieldPath?: string;
  outputName?: string;
  // extract-multiple
  extractions?: Array<{ fieldPath: string; outputName: string }>;
  // format-text
  template?: string;
  // math
  mathField?: string;
  mathOp?: '+' | '-' | '*' | '/' | '%';
  mathValue?: string;
  mathOutputName?: string;
  // compare
  compareField?: string;
  compareOp?: '==' | '!=' | '>' | '<' | '>=' | '<=';
  compareValue?: string;
  compareOutputName?: string;
  // rename-fields
  renames?: Array<{ oldName: string; newName: string }>;
}

export interface TransformTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  expression: string;
  meta?: TransformMeta;
  sampleInput?: string;
}

const HEADER_PREFIX = '/* @mariposa-transform ';
const HEADER_SUFFIX = ' */\n';

export function serializeTransform(meta: TransformMeta): string {
  const expression = generateExpression(meta);
  return HEADER_PREFIX + JSON.stringify(meta) + HEADER_SUFFIX + expression;
}

export function parseTransform(value: string): { meta: TransformMeta | null; expression: string } {
  if (!value || typeof value !== 'string') {
    return { meta: null, expression: value || '' };
  }
  if (value.startsWith(HEADER_PREFIX)) {
    const headerEnd = value.indexOf(HEADER_SUFFIX);
    if (headerEnd !== -1) {
      const jsonStr = value.slice(HEADER_PREFIX.length, headerEnd);
      try {
        const meta = JSON.parse(jsonStr) as TransformMeta;
        const expression = value.slice(headerEnd + HEADER_SUFFIX.length);
        return { meta, expression };
      } catch {
        return { meta: null, expression: value };
      }
    }
  }
  return { meta: null, expression: value };
}

/** Convert a dot-separated path to safe JS property access.
 *  Segments with special chars use bracket notation; safe segments use dot notation.
 *  e.g. "body.usd-coin.usd" → 'data.body["usd-coin"].usd'
 */
function toSafePropertyAccess(baseName: string, path: string): string {
  return path.split('.').reduce((acc, seg) => {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
      return `${acc}.${seg}`;
    }
    return `${acc}["${seg}"]`;
  }, baseName);
}

export function generateExpression(meta: TransformMeta): string {
  switch (meta.operation) {
    case 'extract-single': {
      const path = meta.fieldPath || 'value';
      const name = meta.outputName || 'result';
      return `return { ${name}: ${toSafePropertyAccess('data', path)} };`;
    }
    case 'extract-multiple': {
      const extractions = meta.extractions || [];
      if (extractions.length === 0) return 'return {};';
      const fields = extractions
        .filter((e) => e.fieldPath && e.outputName)
        .map((e) => `  ${e.outputName}: ${toSafePropertyAccess('data', e.fieldPath)}`)
        .join(',\n');
      return `return {\n${fields}\n};`;
    }
    case 'format-text': {
      const template = meta.template || '';
      // Convert {{field}} placeholders to ${data.field} (with bracket notation for special chars)
      const expr = template.replace(/\{\{([\w][\w.\-]*)\}\}/g, (_, p) => '${' + toSafePropertyAccess('data', p) + '}');
      return 'return `' + expr + '`;';
    }
    case 'math': {
      const field = meta.mathField || 'value';
      const op = meta.mathOp || '+';
      const val = meta.mathValue || '0';
      const name = meta.mathOutputName || 'result';
      return `return { ${name}: ${toSafePropertyAccess('data', field)} ${op} ${val} };`;
    }
    case 'compare': {
      const field = meta.compareField || 'value';
      const op = meta.compareOp || '==';
      const val = meta.compareValue || '0';
      const name = meta.compareOutputName || 'result';
      // Use quotes around value if it doesn't look like a number
      const formattedVal = isNaN(Number(val)) ? `"${val}"` : val;
      return `return { ${name}: ${toSafePropertyAccess('data', field)} ${op} ${formattedVal} };`;
    }
    case 'rename-fields': {
      const renames = meta.renames || [];
      if (renames.length === 0) return 'return { ...data };';
      const lines = renames
        .filter((r) => r.oldName && r.newName)
        .map((r) => `  ${r.newName}: ${toSafePropertyAccess('data', r.oldName)}`)
        .join(',\n');
      return `return {\n${lines}\n};`;
    }
    default:
      return 'return data;';
  }
}

export const TRANSFORM_TEMPLATES: TransformTemplate[] = [
  // Price Feeds
  {
    id: 'coingecko-price',
    name: 'Extract CoinGecko Price',
    category: 'Price Feeds',
    description: 'Extract price from CoinGecko API response',
    expression: 'const body = JSON.parse(data.body);\nreturn { price: body.ethereum.usd };',
    sampleInput: '{ "body": "{\\"ethereum\\":{\\"usd\\":2500.42}}" }',
  },
  {
    id: 'chainlink-price',
    name: 'Extract Chainlink Price',
    category: 'Price Feeds',
    description: 'Parse Chainlink oracle price (8 decimals)',
    expression: 'return { price: Number(data.answer) / 1e8 };',
    sampleInput: '{ "answer": "250042000000" }',
  },
  {
    id: 'wei-to-eth',
    name: 'Convert Wei to ETH',
    category: 'Price Feeds',
    description: 'Convert a value from wei to ETH',
    expression: 'return { eth: Number(data.value) / 1e18 };',
    meta: { mode: 'simple', operation: 'math', mathField: 'value', mathOp: '/', mathValue: '1e18', mathOutputName: 'eth' },
    sampleInput: '{ "value": "1000000000000000000" }',
  },

  // API Responses
  {
    id: 'parse-json-body',
    name: 'Parse JSON Body',
    category: 'API Responses',
    description: 'Parse a JSON string body into an object',
    expression: 'return JSON.parse(data.body);',
    sampleInput: '{ "body": "{\\"name\\":\\"Alice\\",\\"age\\":30}" }',
  },
  {
    id: 'extract-nested',
    name: 'Extract Nested Value',
    category: 'API Responses',
    description: 'Extract a deeply nested value from an API response',
    expression: 'const body = JSON.parse(data.body);\nreturn { result: body.data.results[0].value };',
    sampleInput: '{ "body": "{\\"data\\":{\\"results\\":[{\\"value\\":42}]}}" }',
  },
  {
    id: 'array-first-item',
    name: 'Get Array First Item',
    category: 'API Responses',
    description: 'Extract the first item from an array response',
    expression: 'const items = JSON.parse(data.body);\nreturn items[0];',
    sampleInput: '{ "body": "[{\\"id\\":1,\\"name\\":\\"first\\"},{\\"id\\":2,\\"name\\":\\"second\\"}]" }',
  },
  {
    id: 'filter-fields',
    name: 'Pick Specific Fields',
    category: 'API Responses',
    description: 'Select only the fields you need from the data',
    expression: 'return {\n  name: data.name,\n  email: data.email\n};',
    meta: { mode: 'simple', operation: 'extract-multiple', extractions: [{ fieldPath: 'name', outputName: 'name' }, { fieldPath: 'email', outputName: 'email' }] },
    sampleInput: '{ "name": "Alice", "email": "alice@example.com", "age": 30, "role": "admin" }',
  },

  // Calculations
  {
    id: 'multiply-value',
    name: 'Multiply Value',
    category: 'Calculations',
    description: 'Multiply a numeric field by a constant',
    expression: 'return { result: data.value * 100 };',
    meta: { mode: 'simple', operation: 'math', mathField: 'value', mathOp: '*', mathValue: '100', mathOutputName: 'result' },
    sampleInput: '{ "value": 25.5 }',
  },
  {
    id: 'percentage-change',
    name: 'Percentage Change',
    category: 'Calculations',
    description: 'Calculate percentage change between two values',
    expression: 'return { change: ((data.current - data.previous) / data.previous) * 100 };',
    sampleInput: '{ "current": 110, "previous": 100 }',
  },
  {
    id: 'round-decimals',
    name: 'Round to Decimals',
    category: 'Calculations',
    description: 'Round a number to 2 decimal places',
    expression: 'return { rounded: Math.round(data.value * 100) / 100 };',
    sampleInput: '{ "value": 3.14159 }',
  },

  // Formatting
  {
    id: 'format-currency',
    name: 'Format as Currency',
    category: 'Formatting',
    description: 'Format a number as USD currency string',
    expression: 'return { formatted: "$" + Number(data.price).toFixed(2) };',
    sampleInput: '{ "price": 2500.5 }',
  },
  {
    id: 'combine-fields',
    name: 'Combine Fields',
    category: 'Formatting',
    description: 'Concatenate multiple fields into one string',
    expression: 'return { display: `${data.firstName} ${data.lastName} (${data.role})` };',
    meta: { mode: 'simple', operation: 'format-text', template: '{{firstName}} {{lastName}} ({{role}})' },
    sampleInput: '{ "firstName": "Alice", "lastName": "Smith", "role": "admin" }',
  },
  {
    id: 'add-timestamp',
    name: 'Add Timestamp',
    category: 'Formatting',
    description: 'Add a current timestamp to the data',
    expression: 'return { ...data, timestamp: Date.now(), processedAt: new Date().toISOString() };',
    sampleInput: '{ "value": 42 }',
  },
  {
    id: 'boolean-flag',
    name: 'Boolean Threshold Check',
    category: 'Calculations',
    description: 'Return true/false based on a threshold comparison',
    expression: 'return { exceeded: data.value > 1000 };',
    meta: { mode: 'simple', operation: 'compare', compareField: 'value', compareOp: '>', compareValue: '1000', compareOutputName: 'exceeded' },
    sampleInput: '{ "value": 1500 }',
  },
];
