const t = {
  text: (): {type: 'string'} => ({type: 'string'}),
  number: (): {type: 'number'} => ({type: 'number'}),
  many: <T>(input: T) => ({type: 'array', item: input}),

  of: <T>(type: T): {type: 'ref'; item: T} => ({
    type: 'ref',
    item: type,
  }),

  optional: <T>(type: T): {type: 'optional'; item: T} => ({
    type: 'optional',
    item: type,
  }),
}

function create<T>(name: string, schema: T) {
  return {type: 'schema', name, schema}
}

const Person = create('person', {
  name: t.text(),
  age: t.number(),
})

interface ScalarTypeMapping {
  id: string
  string: string
  number: number
}

type Scalar = keyof ScalarTypeMapping

Person //?

type PersonSchema = typeof Person.schema

type PersonType = {
  [K in keyof PersonSchema]: PersonSchema[K]['type']
}

type PersonReturnType = {
  [K in keyof PersonSchema]: ScalarTypeMapping[PersonSchema[K]['type']]
}

// type MapSchemaToReturnType<T> = {
//   [K in keyof T]: ScalarTypeMapping[T[K]['type']]
// }

// type MapSchemaToReturnType<T> = {
//   -readonly [K in keyof T]: T[K] extends {type: Scalar}
//     ? ScalarTypeMapping[T[K]['type']]
//     : 'nope'
// }

// type IsScalar<T> = T extends {type: Scalar}
//   ? 'yes'
//   : 'no'

// type A = IsScalar<{type: 'string'}>
// type B = IsScalar<{type: 'cthulhu'}>

// type GetReturnType<T> = T extends {type: Scalar}
//   ? ScalarTypeMapping[T['type']]
//   : T

// type C = GetReturnType<{type: 'number'}>

// type C_Result = MapSchemaToReturnType<typeof Person.schema>
