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

interface ReturnTypeMapping {
  string: string
  number: number
}

type Scalar = keyof ReturnTypeMapping

Person //?

type R = typeof Person.schema

type B_Result = {
  -readonly [K in keyof R]: ReturnTypeMapping[R[K]['type']]
}

type MapSchemaToReturnType<T> = {
  -readonly [K in keyof T]: T[K] extends {type: Scalar}
    ? ReturnTypeMapping[T[K]['type']]
    : 'nope'
}

type C_Result = MapSchemaToReturnType<typeof Person.schema>
