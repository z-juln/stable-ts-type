# stable-ts-type

根据多次api请求或者json的example，自动生成ts类型代码

## TODO

- 支持将基础模板内带的注释补进最终生成的代码（可能要改动quicktype源码）

## install

`npm i stable-ts-type`

## use1: Generator

```typescript
import fs from 'fs';
import path from 'path';
import { Generator } from 'stable-ts-type';
import type { Input } from 'stable-ts-type';

const inputs: Input[] = [
  {
    type: 'request',
    value: `curl 'https://www.npmjs.com/search?q=test&page=1&perPage=20' \
  -H 'x-spiferack: 1' \
  --compressed`,
    mock: {
      params: {
        q: 'test',
        'page|+1': 10000,
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
  // ms
  requestInterval: 500,
  // https://www.npmjs.com/package/quicktype
  quickTypeOpts: {
    rendererOptions: {
      'just-types': 'true', // 只生成类型
      'nice-property-names': 'false', // 更人性的属性名, 比如postId -> postID
      'explicit-unions': 'false', // 是否要把 unions 抽出来成为一个单独的类型
      'prefer-unions': 'false', // 使用 unions 或 enum
      'prefer-types': 'false', // 使用 types 或 interface
    },
    allPropertiesOptional: true, // 属性是否为可选
    indentation: '  ', // 缩进
    interMenu: true, // interMenu为true时, 列表中, 出现少量字符串会自动生成枚举, 多数才为string
  },
});

generator.generate();

```

output:

```typescript
export interface Response {
  test?:              boolean | string;
  formData?:          FormData;
  objects?:           Object[];
  total?:             number;
  time?:              string;
  pagination?:        Pagination;
  url?:               string;
  user?:              null;
  auditLogEnabled?:   boolean;
  userEmailVerified?: null;
  csrftoken?:         string;
  notifications?:     any[];
  npmExpansions?:     string[];
}

export interface FormData {
  search?: Search;
}

export interface Search {
  q?:       PerPage;
  page?:    Page;
  perPage?: PerPage;
// ...
// ...

```

## use2: simpleGenerate

```typescript
import { simpleGenerate } from 'stable-ts-type';
import type { Input } from 'stable-ts-type';

const inputs: Input[] = [{
  type: 'example-json',
  value: `
    {
      test: /** xxx */ 'hhh', // hhh
    }
  `,
}];

simpleGenerate(inputs, { requestInterval: 500 })
  .then(code => console.log(code))
  .catch(error => console.log(error));

```
