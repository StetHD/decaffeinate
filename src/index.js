import AddVariableDeclarationsStage from './stages/add-variable-declarations/index.js';
import EslintStage from './stages/eslint/index.js';
import MainStage from './stages/main/index.js';
import NormalizeStage from './stages/normalize/index.js';

export { default as run } from './cli';

type Options = {
  filename?: string
};

type ConversionResult = {
  code: string,
  maps: Array<Object>
};

type Stage = {
  run: (content: string, filename: string) => { code: string, map: Object }
};

/**
 * Convert CoffeeScript source code into modern JavaScript preserving comments
 * and formatting.
 */
export function convert(source: string, options: ?Options={}): ConversionResult {
  return runStages(source, options.filename || 'input.coffee', [
    NormalizeStage,
    MainStage,
    AddVariableDeclarationsStage,
    EslintStage
  ]);
}

function runStages(initialContent: string, initialFilename: string, stages: Array<Stage>): ConversionResult {
  let maps = [];
  let content = initialContent;
  let filename = initialFilename;
  stages.forEach(stage => {
    let { code, map } = stage.run(content, filename);
    if (code !== content) {
      maps.push(map);
      content = code;
      filename = map.file;
    }
  });
  return { code: content, maps };
}
