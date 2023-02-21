import Mock from 'mockjs';
import axios from 'axios';
import curl2json from '@juln/curl-to-json';
import { simpleError } from './utils';
import type { AxiosRequestConfig } from 'axios';
import type { ResultJSON as CurlExpress } from '@juln/curl-to-json';
import type { RequestMock } from './input';

const curl2RequestOpts = (curl: string): AxiosRequestConfig => {
  try {
    const opts: CurlExpress = curl2json(curl);
    return {
      url: opts.url,
      method: opts.method,
      headers: opts.header,
      data: opts.data,
      params: opts.params,
    };
  } catch {
    throw simpleError('failed to parse "curl"');
  }
};

async function fetch(
  request: string | AxiosRequestConfig,
  requestConfig: AxiosRequestConfig = {},
  requestMock?: RequestMock,
): Promise<any> {
  const requestOpts: AxiosRequestConfig = typeof request === 'string'
    ? curl2RequestOpts(request)
    : request;
  Object.assign(requestOpts, requestConfig);

  if (requestMock?.params) requestOpts.params = Mock.mock(requestMock?.params);
  if (requestMock?.data) requestOpts.data = Mock.mock(requestMock?.data);

  try {
    const axiosResp = await axios(requestOpts);
    const respData = axiosResp.data;
    return respData;
  } catch (error: any) {
    throw simpleError(`fetch error: ${error?.message ?? error.toString()}\nAxiosRequestConfig of error: \n${JSON.stringify(requestOpts, null, 2)}`);
  }
};

export default fetch;
