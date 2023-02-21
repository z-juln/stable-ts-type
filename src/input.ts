import shuffleSeed from 'shuffle-seed';
import type { AxiosRequestConfig } from "axios";

export type Input = RequestInput | ExampleJSONInput;

export type RequestMock = Partial<Record<'data' | 'params', any>>;

export type RequestInput = {
  type: 'request';
  value: AxiosRequestConfig | string;
  mockCount?: number;
  mock?: RequestMock;
};
export type ExampleJSONInput = {
  type: 'example-json';
  value: Record<string, any> | string;
};

/** 多次mock的Input拆成多个一次的Input */
export const getOnceMockInputList = <InnerInput extends Input>(inputs: InnerInput[], sort: 'random' | 'regular' = 'random'): InnerInput[] => {
  const resultInputs: InnerInput[] = [];
  for (const input of inputs) {
    if (input.type === 'example-json') {
      resultInputs.push(input);
    } else {
      const mockCount = input.mockCount ?? 1;
      for (let i = 0; i < mockCount; i++) {
        resultInputs.push({
          ...input,
          mockCount: 1,
        });
      }
    }
  }

  if (sort === 'random') {
    return shuffleSeed.shuffle(resultInputs, Date.now());
  }
  return resultInputs;
};
