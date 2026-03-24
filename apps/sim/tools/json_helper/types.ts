export interface JsonParseParams {
  jsonString: string
}

export interface JsonStringifyParams {
  data: unknown
  indent?: number
}

export interface JsonGetParams {
  data: unknown
  path: string
}

export interface JsonSetParams {
  data: unknown
  path: string
  value: unknown
}

export interface JsonDeleteParams {
  data: unknown
  path: string
}

export interface JsonMergeParams {
  data: unknown
  source: unknown
}

export interface JsonFlattenParams {
  data: unknown
  separator?: string
}

export interface JsonKeysParams {
  data: unknown
}

export interface JsonValuesParams {
  data: unknown
}

export interface JsonFilterKeysParams {
  data: unknown
  keys: string
}

export interface JsonArrayGetParams {
  data: unknown
  index: number
}

export interface JsonArrayFilterParams {
  data: unknown
  field: string
  value: unknown
}

export interface JsonArrayMapParams {
  data: unknown
  field: string
}

export interface JsonSizeParams {
  data: unknown
}

export interface JsonTypeCheckParams {
  data: unknown
}

export interface JsonEntriesParams {
  data: unknown
}

export interface JsonResult {
  result: unknown
}

export interface JsonGetKeyParams {
  data: unknown
  key: string
}