import type { Options } from 'quicktype-core';

interface QuickTypeOpts extends Partial<Omit<Options, 'rendererOptions'>> {
  rendererOptions?: RendererOptions;
}

/** 传入的参数 */
export type TypeOpts = Omit<QuickTypeOpts, 'inputData' | 'lang'>;

export interface RendererOptions {
  /** 只生成类型 */
  'just-types'?: 'true' | 'false';
  /** 更任性的属性名, 比如postId -> postID */
  'nice-property-names'?: 'true' | 'false';
  /** 是否要把 unions 抽出来成为一个单独的类型 */
  'explicit-unions'?: 'true' | 'false';
  /** 使用 unions 或 enum */
  'prefer-unions'?: 'true' | 'false';
  /** 使用 types 或 interface */
  'prefer-types'?: 'true' | 'false';
};

export const renderOpts: RendererOptions = {
  'just-types': 'true', // 只生成类型
  'nice-property-names': 'false', // 更人性的属性名, 比如postId -> postID
  'explicit-unions': 'false', // 是否要把 unions 抽出来成为一个单独的类型
  'prefer-unions': 'false', // 使用 unions 或 enum
  'prefer-types': 'false', // 使用 types 或 interface
};

export const defaultTypeOpts: TypeOpts = {
  rendererOptions: renderOpts,
  allPropertiesOptional: true, // 可选, 即 ?:
  alphabetizeProperties: false, // interface的先后按字母排列
  leadingComments: [], // 代码最顶部加quicktype自己定的注释
  indentation: '  ', // 缩进
  inferEnums: true, // interMenu为true时, 列表中, 出现少量字符串会自动生成枚举, 多数才为string
  debugPrintGraph: false, // debug, 每个处理步骤将类型图打印到控制台

  fixedTopLevels: false,
  noRender: false,
  outputFilename: '',
  checkProvenance: false,
  debugPrintReconstitution: false,
  debugPrintGatherNames: false,
  debugPrintTransformations: false,
  debugPrintTimes: false,
  debugPrintSchemaResolving: false,

  inferMaps: false,
  inferUuids: false,
  inferDateTimes: false,
  inferIntegerStrings: false,
  inferBooleanStrings: false,
  combineClasses: false,
  ignoreJsonRefs: false,
};
