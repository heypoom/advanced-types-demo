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

  enum: <Choices extends string[]>(
    ...choices: Choices
  ): {type: 'enum'; choices: Choices} => ({
    type: 'enum',
    choices,
  }),

  type: <T, N extends string>(
    name: N,
    schema: T
  ): {type: 'type'; name: N; schema: T} => ({
    type: 'type',
    name,
    schema,
  }),
}

const Person = t.type('person', {
  id: t.id(),
  name: t.text(),
  age: t.number(),
})

const Team = t.type('team', {
  name: t.text(),
  lead: t.of(Person),
  people: t.many(t.of(Person)),
})

const ProjectStatus = t.enum(
  'forming team',
  'interviewing users',
  'prototyping'
)

const Project = t.type('project', {
  name: t.text(),
  team: t.of(Team),
  status: t.of(ProjectStatus),
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

type EnumType<T extends string[] = []> = {type: 'enum'; choices: T}

/** Map an unboxed input type (e.g. scalar, constructed type) to the native return type. */
type MapInputToReturnType<Input> =
  // Is a scalar type? (string, number)
  Input extends {type: Scalar}
    ? ReturnTypeMapping[Input['type']]
    : // Is a constructed type with schema? (created by t.type() function)
    Input extends {type: 'type'; schema: infer Schema}
    ? MapSchemaToReturnType<Schema>
    : // Is an enum type? (created by t.enum() function)
    Input extends EnumType<infer Choices>
    ? Choices[number]
    : Input

/** Map a schema definition `Record<string, Input>` to the native return type. */
type MapSchemaToReturnType<T> = {
  -readonly [K in keyof T]: MapBoxedInputToReturnType<T[K]>
}

/** Map a boxed Input type (e.g. array, ref) to the native return type. */
type MapBoxedInputToReturnType<Input> =
  // Is an array type?
  Input extends {
    type: 'array'
    item: infer Item
  }
    ? MapBoxedInputToReturnType<Item>[]
    : // Is a reference type? (can reference constructed type or enums)
    Input extends {type: 'ref'; item: infer Item}
    ? MapInputToReturnType<Item>
    : // Otherwise, the typed is not wrapped in array of ref.
      MapInputToReturnType<Input>

type C_Result = MapSchemaToReturnType<typeof Person.schema>

type TeamSchema = MapSchemaToReturnType<typeof Team.schema>

type D_R_Lead = TeamSchema['lead']
type D_R_People = TeamSchema['people']

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

const teamRed: TeamSchema = {
  name: 'Team Red',
  lead: {
    id: 'lab-member-001',
    name: 'Poom',
    age: 19,
  },
  people: [{id: 'lab-member-001', name: 'Poom', age: 19}],
}

type ProjectSchema = MapSchemaToReturnType<typeof Project.schema>

const project: ProjectSchema = {
  name: 'Team Red',
  team: teamRed,
  status: 'forming team',
}
