import axios from 'axios';
import { promiseDelay } from 'prefer-delay';
import EventEmitter from 'eventemitter2';
import merge from 'merge';
import json2Type from './json2type';
import fetch from './fetch';
import { defaultTypeOpts } from './type-opts';
import { easyJSONParse, simpleError, isValidJSON } from './utils';
import type { TypeOpts } from './type-opts';
import { Input, ExampleJSONInput, RequestInput, getOnceMockInputList } from './input';

const TOP_TYPE_NAME = 'Response'; // quicktype@21.0.13的ts转换直接定死了大驼峰，没法改风格

interface GenerateOpts {
  topTypeName?: string;
  quickTypeOpts?: TypeOpts;
  requestInterval?: number;
  requireMockSort?: 'random' | 'regular';
  on?: (event: `${GenerateEvent}`, codeOrError: string | Error) => void;
}

const defaultGenerateOpts: GenerateOpts = {
  requestInterval: 0,
  topTypeName: TOP_TYPE_NAME,
  quickTypeOpts: defaultTypeOpts,
  requireMockSort: 'random',
};

enum GenerateEvent {
  CHUNK_DONE_EVENT = 'CHUNK_DONE',
  DONE_EVENT = 'DONE',
  ERROR_EVENT = 'ERROR',
}

export class Generator {
  public static CHUNK_DONE_EVENT = GenerateEvent.CHUNK_DONE_EVENT;
  public static DONE_EVENT = GenerateEvent.DONE_EVENT;
  public static ERROR_EVENT = GenerateEvent.ERROR_EVENT;

  private opts: GenerateOpts = {};
  private jsonExamples: any[] = [];
  private requestInputs: RequestInput[] = [];
  public eventEmitter = new EventEmitter();
  private stopped = false;
  private fetch: typeof fetch;
  private fetchCancel: () => void;

  // status
  private code = '';
  private jsonList: any[] = [];

  constructor(input: Input | Input[], opts: GenerateOpts = {}) {
    this.opts = merge.recursive(true, defaultGenerateOpts, opts);

    const easyInputs = Generator.getEasyInputs(Array.isArray(input) ? input : [input]);
    this.jsonExamples = easyInputs.jsonExamples;
    this.requestInputs = getOnceMockInputList(easyInputs.requestInputs, opts.requireMockSort);

    if (this.opts.on) {
      // @ts-ignore
      this.eventEmitter.onAny(this.opts.on);
    }

    const CancelToken = axios.CancelToken;
    const { token: fetchCancelToken, cancel: fetchCancel } = CancelToken.source();
    this.fetch = promiseDelay(
      (request, requestConfig, requestMock) => fetch(request, { ...requestConfig, cancelToken: fetchCancelToken }, requestMock),
      opts.requestInterval!
    );
    this.fetchCancel = () => fetchCancel('the stable-ts-type generator has been interrupted');
  }

  private async onGenerateChunk(jsonList: any[]) {
    const { opts, eventEmitter, stopped } = this;

    if (stopped) return;

    this.jsonList.push(...jsonList);

    const code = await json2Type(
      opts.topTypeName!,
      [JSON.stringify(this.jsonList)],
      opts.quickTypeOpts,
    );

    this.code = code;
    eventEmitter.emit(GenerateEvent.CHUNK_DONE_EVENT, code);
  }

  async generate() {
    const { jsonExamples, requestInputs, eventEmitter, fetch } = this;

    const promises: Promise<void>[] = [];

    const p = this.onGenerateChunk(jsonExamples)
      .catch((error) => {
        this.eventEmitter.emit(GenerateEvent.ERROR_EVENT, error);
      });
    promises.push(p);
    
    for (const fetchInput of requestInputs) {
      // @ts-ignore
      const p = fetch(fetchInput.value, {}, fetchInput.mock)
        .then(data => {
          if (isValidJSON(data)) {
            return data;
          }
          const showFetchInput = {
            type: fetchInput.type,
            value: fetchInput.value,
          };
          throw simpleError(`json conversion failed, from fetchInput: ${JSON.stringify(showFetchInput, null, 2)}`);
        })
        .then(json => this.onGenerateChunk([json]))
        .catch((error) => {
          this.eventEmitter.emit(GenerateEvent.ERROR_EVENT, error);
        });
      promises.push(p);
    }

    await Promise.all(promises);
    eventEmitter.emit(GenerateEvent.DONE_EVENT, this.code);
  }

  stop() {
    this.stopped = true;
    this.eventEmitter.removeAllListeners();
    this.fetchCancel();
  }

  private static getEasyInputs(inputs: Input[]) {
    const jsonExamplesInput = (inputs
      .filter(input => input.type === 'example-json') as ExampleJSONInput[]);
    const jsonExamples = jsonExamplesInput
      .map(input =>
        typeof input.value === 'string'
          ? easyJSONParse(input.value)
          : input.value
      );
    
    const requestInputs = inputs
      .filter(input => input.type !== 'example-json') as RequestInput[];

    return {
      jsonExamples,
      requestInputs,
    };
  }
}

/** @deprecated */
export const generate = async (input: Input | Input[], opts: GenerateOpts = {}): Promise<string> => {
  const inputs = Array.isArray(input) ? input : [input];
  const quickTypeOpts = Object.assign({}, defaultTypeOpts, opts.quickTypeOpts);

  const jsonExamplesInput = (inputs
    .filter(input => input.type === 'example-json') as ExampleJSONInput[]);
  const jsonExamples = jsonExamplesInput
    .map(input =>
      typeof input.value === 'string'
        ? easyJSONParse(input.value)
        : JSON.stringify(input.value)
    ) as string[];
  const requiredFetchInputs = inputs
    .filter(input => input.type !== 'example-json') as RequestInput[];

  // @ts-ignore
  const fetches = requiredFetchInputs.map(input => fetch(input.value));
  const respDataList = await Promise.all(fetches);
  try {
    const respDataStrList = respDataList.map(data => JSON.stringify(data));
    const typeCode = await json2Type(opts.topTypeName ?? TOP_TYPE_NAME, [
      ...jsonExamples,
      ...respDataStrList as any,
    ], quickTypeOpts);
    return typeCode;
  } catch (error) {
    throw simpleError(`failed to generate typeCode, json-list: ${
      JSON.stringify([
        ...respDataList,
        ...jsonExamplesInput.map(item => item.value),
      ], null, 2)
    }`);
  }
};
