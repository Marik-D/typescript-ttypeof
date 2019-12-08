import { ClassType, RuntimeType, ttypeof } from '../src/common'

const numberType = ttypeof<number>()
const stringType = ttypeof<string>()
const booleanType = ttypeof<boolean>()
const undefinedType = ttypeof<undefined>()
const nullType = ttypeof<null>()

interface BaseInterface {
  baseInterfaceProp: number
}

interface Interface extends BaseInterface {
  interfaceProp: string
}

const interfaceType = ttypeof<Interface>()

namespace ClassNamespace {
  class BaseClass {
    baseClassProp: number = 3
  }

  export class Class extends BaseClass {
    classProp: string = '5'

    static staticProp: string = '10'

    method() {

    }
  }
}

const classType = ttypeof<ClassNamespace.Class>()

const classInstance = new (classType as ClassType).declaration()

function func<T>(num: number) {
  const genericType = ttypeof<T>()
}

func<string>(5);


// namespace compiled_iteration1 {
//   function func<T>(type0: RuntimeType, num: number) {
//     const genericType = type0
//   }
//
//   func({ type: 'string' }, 5)
//
//   /**
//    * Cons:
//    * - Does not error if called without transformation
//    * - Does not work with curring
//    */
// }
//
// namespace compiled_iteration2 {
//   function func<T>(guard: 'ttypeof$guard', ttypeof$type0: RuntimeType) {
//     if(guard !== 'ttypeof$guard') throw new Error('this function cannot be called directly')
//     return function ttypeof$inner(num: number) {
//       const genericType = ttypeof$type0
//     }
//   }
//
//   func('ttypeof$guard', { type: 'string' })(5)
// }
