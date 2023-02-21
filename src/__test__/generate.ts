import { generate } from '../generate';

// type Nullable<Data extends Record<any, any>> = {
//   [K in keyof Data]?: Nullable<Data[K]> | null;
// };

generate([
  {
    type: 'request',
    value: {
      url: 'https://m.hupu.com/api/v2/bbs/walkingStreet/threads?page=1',
      method: 'GET',
    },
  },
  {
    type: 'request',
    value: 'curl https://m.hupu.com/api/v2/bbs/walkingStreet/threads?page=2',
  },
  {
    type: 'request',
    value: 'curl https://m.hupu.com/api/v2/bbs/walkingStreet/threads?page=3',
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
]).then(res => {
  console.log(res);
});
