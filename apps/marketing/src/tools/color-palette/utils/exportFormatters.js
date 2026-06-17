import { getStopNames } from './naming';

export const generateExport = (format, baseColors, palettes, numStops, namingSystem, customIncrement) => {
  const stopNames = getStopNames(numStops, namingSystem, customIncrement);
  let output = '';

  switch (format) {
    case 'css':
      output = '/* CSS Variables */\n:root {\n';
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          palette.forEach((color, index) => {
            output += `  --${colorObj.name.toLowerCase()}-${stopNames[index]}: ${color.hex};\n`;
          });
        }
      });
      output += '}\n';
      break;

    case 'tailwind':
      output = '// Tailwind Config\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          output += `        '${colorObj.name.toLowerCase()}': {\n`;
          palette.forEach((color, index) => {
            output += `          '${stopNames[index]}': '${color.hex}',\n`;
          });
          output += `        },\n`;
        }
      });
      output += '      }\n    }\n  }\n}\n';
      break;

    case 'figma':
      const figmaTokens = {};
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          palette.forEach((color, index) => {
            figmaTokens[`${colorObj.name}/${stopNames[index]}`] = {
              value: color.hex,
              type: 'color'
            };
          });
        }
      });
      output = JSON.stringify({ colors: figmaTokens }, null, 2);
      break;

    case 'js':
      output = '// JavaScript/TypeScript\nexport const colors = {\n';
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          output += `  ${colorObj.name.toLowerCase()}: {\n`;
          palette.forEach((color, index) => {
            output += `    '${stopNames[index]}': '${color.hex}',\n`;
          });
          output += `  },\n`;
        }
      });
      output += '};\n';
      break;

    case 'scss':
      output = '// SCSS Variables\n';
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          palette.forEach((color, index) => {
            output += `$${colorObj.name.toLowerCase()}-${stopNames[index]}: ${color.hex};\n`;
          });
        }
      });
      break;

    case 'json':
      const jsonOutput = {};
      baseColors.forEach(colorObj => {
        const palette = palettes[colorObj.id];
        if (palette) {
          jsonOutput[colorObj.name.toLowerCase()] = {};
          palette.forEach((color, index) => {
            jsonOutput[colorObj.name.toLowerCase()][stopNames[index]] = color.hex;
          });
        }
      });
      output = JSON.stringify(jsonOutput, null, 2);
      break;

    default:
      output = '';
  }

  return output;
};

// Format a list of Figma variables (pulled from a collection) as code.
// `variables` is an array of { name, hex, ref } where `name` may be a slash
// path such as "Blue/100" or "Brand/Accent/500". When `ref` is set, the
// variable aliases another variable (named by `ref`) and the export emits a
// reference in the format's native syntax instead of the raw color.
export const generateVariableExport = (format, collectionName, variables) => {
  const cleaned = (variables || []).filter(v => v && v.name && (v.hex || v.ref));

  // "Brand/Blue/100" -> "brand-blue-100" for flat CSS/SCSS names and var() refs.
  const kebab = (s) =>
    s
      .toLowerCase()
      .replace(/[\s/]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  // "Brand/Blue/100" -> "Brand.Blue.100" for token-alias ({...}) references.
  const dotPath = (s) => s.split('/').map(p => p.trim()).filter(Boolean).join('.');

  // Render a reference to another variable in the format's native syntax.
  const refValue = (ref) => {
    switch (format) {
      case 'scss': return `$${kebab(ref)}`;
      case 'figma':
      case 'json': return `{${dotPath(ref)}}`;
      default: return `var(--${kebab(ref)})`; // css, tailwind, js
    }
  };

  // The emitted value for an item: a reference when it aliases another
  // variable, otherwise its raw hex.
  const leafValue = (item) => (item.ref ? refValue(item.ref) : item.hex);

  // Build a nested object tree by splitting each name on "/".
  const buildTree = () => {
    const tree = {};
    cleaned.forEach((item) => {
      const parts = item.name.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      let node = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
        node = node[key];
      }
      node[parts[parts.length - 1]] = leafValue(item);
    });
    return tree;
  };

  const label = collectionName || 'Variables';
  let output = '';

  switch (format) {
    case 'css':
      output = `/* ${label} */\n:root {\n`;
      cleaned.forEach((item) => {
        output += `  --${kebab(item.name)}: ${leafValue(item)};\n`;
      });
      output += '}\n';
      break;

    case 'scss':
      output = `// ${label}\n`;
      cleaned.forEach((item) => {
        output += `$${kebab(item.name)}: ${leafValue(item)};\n`;
      });
      break;

    case 'tailwind':
      output =
        `// Tailwind Config — ${label}\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ` +
        JSON.stringify(buildTree(), null, 2).replace(/\n/g, '\n      ') +
        `\n    }\n  }\n}\n`;
      break;

    case 'js':
      output = `// ${label}\nexport const colors = ${JSON.stringify(buildTree(), null, 2)};\n`;
      break;

    case 'figma':
      const figmaTokens = {};
      cleaned.forEach((item) => {
        figmaTokens[item.name] = { value: leafValue(item), type: 'color' };
      });
      output = JSON.stringify({ colors: figmaTokens }, null, 2);
      break;

    case 'json':
      output = JSON.stringify(buildTree(), null, 2);
      break;

    default:
      output = '';
  }

  return output;
};
