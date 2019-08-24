export interface NumberType {
  type: 'number'
}

export interface StringType {
  type: 'string'
}

export interface BooleanType {
  type: 'boolean'
}

export interface UndefinedType {
  type: 'undefined'
}

export interface NullType {
  type: 'null'
}

export interface ClassLike {
  new (...args: any[]): this
}

export interface ClassType {
  type: 'class'
  name: string
  members: Record<string, RuntimeType>
  declaration: ClassLike
}

export interface InterfaceType {
  type: 'interface'
  name: string
  members: Record<string, RuntimeType>
}

export type RuntimeType
  = NumberType
  | StringType
  | BooleanType
  | UndefinedType
  | NullType
  | ClassType
  | InterfaceType

export function ttypeof<T>(): RuntimeType {
  throw new Error('This function is not meant to be called directly');
}

