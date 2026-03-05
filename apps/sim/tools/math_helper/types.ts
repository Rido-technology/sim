export interface MathBinaryParams {
  a: number
  b: number
}

export interface MathUnaryParams {
  a: number
}

export interface MathRoundParams {
  a: number
  precision?: number
}

export interface MathPowerParams {
  base: number
  exponent: number
}

export interface MathMinMaxParams {
  values: string
}

export interface MathPercentageParams {
  value: number
  total: number
}

export interface MathClampParams {
  value: number
  min: number
  max: number
}

export interface MathRandomParams {
  min: number
  max: number
  integer?: boolean
}

export interface MathResult {
  result: number
  remainder?: number
}
