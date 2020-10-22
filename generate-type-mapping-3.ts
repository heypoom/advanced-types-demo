const t = {
  id: (): {type: 'id'} => ({type: 'id'}),

  text: (): {type: 'string'} => ({type: 'string'}),
  number: (): {type: 'number'} => ({type: 'number'}),

  many: <T>(input: T): {type: 'array'; item: T} => ({
    type: 'array',
    item: input,
  }),

  of: <T>(type: T): {type: 'ref'; item: T} => ({
    type: 'ref',
    item: type,
  }),

  optional: <T>(type: T): {type: 'optional'; item: T} => ({
    type: 'optional',
    item: type,
  }),
}

function create<T, N extends string>(
  name: N,
  schema: T
): {type: 'type'; name: N; schema: T} {
  return {type: 'type', name, schema}
}

const Person = create('person', {
  id: t.id(),
  name: t.text(),
  age: t.number(),
})

const Team = create('team', {
  name: t.text(),
  lead: t.of(Person),
  people: t.many(t.of(Person)),
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

/** Map an unboxed input type (e.g. scalar, constructed type) to the native return type. */
type GetReturnType<Input> =
  // Is a scalar type? (string, number)
  Input extends {type: Scalar}
    ? ReturnTypeMapping[Input['type']]
    : // Is a constructed type with schema? (created by create() function)
    Input extends {type: 'type'; schema: infer Schema}
    ? MapSchemaToReturnType<Schema>
    : Input

/** Map a schema definition `Record<string, Input>` to the native return type. */
type MapSchemaToReturnType<T> = {
  -readonly [K in keyof T]: MapInputToReturnType<T[K]>
}

/** Map a boxed Input type (e.g. array, ref) to the native return type. */
type MapInputToReturnType<Input> =
  // Is an array type?
  Input extends {
    type: 'array'
    item: infer Item
  }
    ? MapInputToReturnType<Item>[]
    : // Is a reference type? (can reference constructed type or enums)
    Input extends {type: 'ref'; item: infer Item}
    ? GetReturnType<Item>
    : // Otherwise, the typed is not wrapped in array of ref.
      GetReturnType<Input>

type C_Result = MapSchemaToReturnType<typeof Person.schema>

type D = typeof Team.schema
type D_Result = MapSchemaToReturnType<D>
type D_R_Lead = D_Result['lead']
type D_R_People = D_Result['people']

type TypeRef = MapSchemaToReturnType<{
  people: {
    type: 'ref'
    item: {type: 'type'; name: 'people'; schema: {name: {type: 'string'}}}
  }
}>['people']

type TypeArrayRef = MapSchemaToReturnType<{
  people: {
    type: 'array'
    item: {
      type: 'ref'
      item: {type: 'type'; name: 'people'; schema: {name: {type: 'string'}}}
    }
  }
}>['people']

const typeArrayRef: TypeArrayRef = [{name: 'Hello!'}]

const project: D_Result = {
  name: 'Project Altair',
  lead: {
    id: 'lab-member-001',
    name: 'Poom',
    age: 19,
  },
  people: [{id: 'lab-member-001', name: 'Poom', age: 19}],
}
