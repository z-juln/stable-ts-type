import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core';
import type { TypeOpts } from './type-opts';

const json2Type = async (modalName: string, jsonSamples: string[], opts: TypeOpts = {}) => {
  const jsonInput = jsonInputForTargetLanguage('ts');

  await jsonInput.addSource({
    name: modalName,
    samples: jsonSamples,
  });

  const inputData = new InputData();

  inputData.addInput(jsonInput);

  const result = await quicktype({
    ...opts as any,
    lang: 'ts',
    inputData,
  });

  return result.lines.join('\n');
};

export default json2Type;
