import * as ts from 'typescript'

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

export interface InterfaceType {
  type: 'interface'
  name: string
  members: Record<string, RuntimeType>
}

export interface ClassType {
  type: 'class'
  name: string
  members: Record<string, RuntimeType>
  declaration: ts.Expression
}

export interface ReferenceType {
  type: 'reference'
  expr: ts.Expression
}

export type RuntimeType
  = NumberType
  | StringType
  | BooleanType
  | UndefinedType
  | NullType
  | InterfaceType
  | ClassType
  | ReferenceType
