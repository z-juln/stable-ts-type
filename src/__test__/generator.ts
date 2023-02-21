import fs from 'fs';
import path from 'path';
import { Generator } from '..';
import type { Input } from '..';

const inputs: Input[] = [
  {
    type: 'request',
    value: `curl 'https://www.npmjs.com/search?q=test&page=1&perPage=20' \
  -H 'x-spiferack: 1' \
  --compressed`,
    mock: {
      params: {
        q: 'test',
        'page|+1': 1,
        perPage: 10,
      },
    },
    mockCount: 5,
  },
  {
    type: 'request',
    value: {
      url: 'https://www.npmjs.com/search?q=test',
      headers: {
        'x-spiferack': 1,
      },
      method: 'GET',
    },
    mock: {
      params: {
        q: 'test',
        'page|+1': 0,
        perPage: 10,
      },
    },
    mockCount: 5,
  },
  {
    type: 'example-json',
    value: {
      test: true,
    },
  },
  {
    type: 'example-json',
    value: `
      {
        test: /** xxx */ 'hhh', // hhh
      }
    `,
  },
];

const generator = new Generator(inputs, {
  on(event, codeOrError) {
    switch (event) {
      case 'CHUNK_DONE':
        console.log('-----CHUNK_DONE');
        fs.writeFileSync(path.resolve(__dirname, './build.ts'), codeOrError as string);
        break;
      case 'DONE':
        console.log('-----done');
        break;
      case 'ERROR':
        console.log('-----error');
        // console.log('-----error', codeOrError);
        break;
    }
  },
  requestInterval: 500,
});

generator.generate();
