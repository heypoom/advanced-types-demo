const t = {
  id: (): {type: 'id'} => ({type: 'id'}),

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
  id: t.id(),
  name: t.text(),
  age: t.number(),
})

const Team = create('team', {
  name: t.text(),
  lead: t.of(Person),
})

interface ReturnTypeMapping {
  id: string
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
    : T[K] extends {type: 'ref'; item: {schema: infer Schema}}
    ? MapSchemaToReturnType<Schema>
    : 'none'
}

type C_Result = MapSchemaToReturnType<typeof Person.schema>

type D = typeof Team.schema
type D_Result = MapSchemaToReturnType<D>
type D_R_2 = D_Result['lead']

const project: D_Result = {
  name: 'Project Altair',
  lead: {
    id: 'lab-member-001',
    name: 'Poom',
    age: 19,
  },
}
