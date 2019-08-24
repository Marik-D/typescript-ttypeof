import * as ts from 'typescript'
import { RuntimeType } from './compilerTypes'

export default function (program: ts.Program, pluginOptions: {}) {
  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const typeChecker = program.getTypeChecker()
      function convertToRuntimeType (typeNode: ts.TypeNode): RuntimeType {
        const type = typeChecker.getTypeFromTypeNode(typeNode);
        if(type.flags & ts.TypeFlags.String) {
          return { type: 'string' }
        } else if(type.flags & ts.TypeFlags.Number) {
          return { type: 'number'}
        } else if(type.flags & ts.TypeFlags.Boolean) {
          return { type: 'boolean' }
        } else if(type.flags & ts.TypeFlags.Undefined) {
          return { type: 'undefined' }
        } else if(type.flags & ts.TypeFlags.Null) {
          return { type: 'null' }
        } else if(type.isClassOrInterface()) {
          // console.log(type)
          if(type.objectFlags & ts.ObjectFlags.Interface) {
            const members: Record<string, RuntimeType> = {}
            type.getApparentProperties().forEach(member => {
              let valueDeclaration = member.valueDeclaration

              if (!ts.isPropertySignature(valueDeclaration)) throw new Error('Expected a property signature')
              if (valueDeclaration.type === undefined) throw new Error('Expected signature to have a type')

              members[ts.unescapeLeadingUnderscores(member.escapedName)] = convertToRuntimeType(valueDeclaration.type)
            })

            return { type: 'interface', name: ts.unescapeLeadingUnderscores(type.symbol.escapedName), members }
          } else if(type.objectFlags & ts.ObjectFlags.Class) {
            const members: Record<string, RuntimeType> = {}
            type.getApparentProperties().forEach(member => {
              let valueDeclaration = member.valueDeclaration

              if (!ts.isPropertyDeclaration(valueDeclaration)) return
              if (valueDeclaration.type === undefined) throw new Error('Expected signature to have a type')

              members[ts.unescapeLeadingUnderscores(member.escapedName)] = convertToRuntimeType(valueDeclaration.type)
            })

            if(!ts.isTypeReferenceNode(typeNode)) throw new Error('Expected aa type reference')
            return {
              type: 'class',
              name: ts.unescapeLeadingUnderscores(type.symbol.escapedName),
              members,
              declaration: convertEntityNameToExpression(typeNode.typeName)
            }
          } else {
            console.log(type)
            throw new Error('Unknown object type')
          }
        } else if(type.flags & ts.TypeFlags.TypeParameter) {
          console.log(type)
          throw new Error('Type parameters are not supported')
        } else {
          console.log(type)
          throw new Error('Unknown type')
        }
      }

      function visitor (node: ts.Node): ts.Node {
        if (ts.isCallExpression(node)) {
          const callee = node.expression
          if (ts.isIdentifier(callee)) {
            if (callee.escapedText === 'ttypeof') {
              if (!node.typeArguments || node.typeArguments.length !== 1) throw new Error('must be only 1 type arg')
              const typeArg = node.typeArguments[0]
              const runtimeType = convertToRuntimeType(typeArg)
              return serializeType(runtimeType)
            }
          }
        }
        return ts.visitEachChild(node, visitor, ctx)
      }

      return ts.visitEachChild(sourceFile, visitor, ctx)
    }
  }
}

function serializeType (type: RuntimeType): ts.ObjectLiteralExpression {
  switch (type.type) {
    case 'interface': return ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral(type.type)),
      ts.createPropertyAssignment('name', ts.createLiteral(type.name)),
      ts.createPropertyAssignment('members', ts.createObjectLiteral(
        Object.entries(type.members).map(([key, value]) => ts.createPropertyAssignment(key, serializeType(value)))
      ))
    ])
    case 'class': return ts.createObjectLiteral([
      ts.createPropertyAssignment('type', ts.createLiteral(type.type)),
      ts.createPropertyAssignment('name', ts.createLiteral(type.name)),
      ts.createPropertyAssignment('members', ts.createObjectLiteral(
        Object.entries(type.members).map(([key, value]) => ts.createPropertyAssignment(key, serializeType(value)))
      )),
      ts.createPropertyAssignment('declaration', type.declaration),
    ])
    default: return ts.createObjectLiteral([ts.createPropertyAssignment('type', ts.createLiteral(type.type))])
  }
}

function convertEntityNameToExpression(name: ts.EntityName): ts.Expression {
  if(ts.isIdentifier(name)) {
    return name
  } else {
    return ts.createPropertyAccess(convertEntityNameToExpression(name.left), name.right)
  }
}

