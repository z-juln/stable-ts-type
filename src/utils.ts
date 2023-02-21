export const simpleError = (error: any) => {
  const newError = new Error();
  newError.stack = '';
  if (error instanceof Error) {
    newError.name = error.name;
    newError.message = error.message;
    return newError;
  } else if (typeof error === 'string') {
    newError.name = 'Stable-ts-type Error';
    newError.message = error;
    return newError;
  }
  if (error?.stack) {
    newError.stack = '';
  }
  return error;
};

export const isValidJSON = (json: any) => {
  try {
    JSON.stringify(json);
    return true;
  } catch {
    return false;
  }
};

/** 支持不严谨的json字符串(包含注释或key没有双引号) */
export const easyJSONStringify = (jsCode: string): string => eval(`JSON.stringify(${jsCode})`);
export const easyJSONParse = (jsCode: string): any => eval(`JSON.parse(JSON.stringify(${jsCode}))`);
