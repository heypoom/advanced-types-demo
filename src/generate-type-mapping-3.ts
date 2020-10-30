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

type toUnion = ['hello', 'world'][number]

const a: toUnion = 'hello'

const ProjectStatus = t.enum(
  'forming team',
  'interviewing users',
  'prototyping'
)

const Project = t.type('project', {
  name: t.text(),
  team: t.of(Team),
  status: t.of(ProjectStatus),
  tagline: t.optional(t.text()),
})

console.log(JSON.stringify(Project.schema))

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
type GetReturnType<Input> =
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
    ? GetReturnType<Item>
    : // Otherwise, the typed is not wrapped in array of ref.
      GetReturnType<Input>

type D_R_Lead = TeamSchema['lead']
type D_R_People = TeamSchema['people']

type TypeRef = MapSchemaToReturnType<{
  people: {
    type: 'ref'
    item: {type: 'type'; name: 'people'; schema: {name: {type: 'string'}}}
  }
}>['people']

type ArrayOfRefs = MapBoxedInputToReturnType<{
  type: 'array'
  item: {
    type: 'ref'
    item: {
      type: 'type'
      name: 'people'
      schema: {name: {type: 'string'}}
    }
  }
}>

const arrRef: ArrayOfRefs = [{name: 'Poom'}]

type TypeEnum = GetReturnType<{
  type: 'enum'
  choices: ['hello', 'world']
}>

const typeEnumTest: TypeEnum = 'hello'

const typeArrayRef: TypeArrayRef = [{name: 'Hello!'}]

type ToOptionalField<T> = T | null | undefined

type Input = {name: string; age: number}

type B = {
  [K in keyof Input]: ToOptionalField<Input[K]>
}

type PersonSchema = MapSchemaToReturnType<typeof Person.schema>
type TeamSchema = MapSchemaToReturnType<typeof Team.schema>
type ProjectSchema = MapSchemaToReturnType<typeof Project.schema>

const poom: PersonSchema = {
  id: 'lab-member-001',
  name: 'Poom',
  age: 19,
}

const teamRed: TeamSchema = {
  name: 'Team Red',
  lead: poom,
  people: [poom],
}

const project: ProjectSchema = {
  name: 'Team Red',
  team: teamRed,
  status: 'prototyping',
  // tagline: {type: }
}

/** Extract the value of an optional field,
 *  otherwise return never if not found. */
type ExtractOptionalFields<T> = {
  [K in keyof T]: T[K] extends {type: 'optional'; item: infer Item}
    ? Item
    : never
}

/** Create a union out of field names
 *  in which the field type is not never. */
export type FilterKeys<T> = {
  [K in keyof T]: T[K] extends never ? never : K
}[keyof T]

type NullablePartial<
  T,
  NK extends keyof T = {
    [K in keyof T]: null extends T[K] ? K : never
  }[keyof T],
  NP = Partial<Pick<T, NK>> & Pick<T, Exclude<keyof T, NK>>
> = {[K in keyof NP]: NP[K]}

type PersonType = {
  name: {type: 'string'}
  tagline: {type: 'optional'; item: {type: 'string'}}
  age: {type: 'optional'; item: {type: 'number'}}
}

type OptionalFields = ExtractOptionalFields<PersonType>

type OptionalKeys = FilterKeys<OptionalFields>

type Optionals = NullablePartial<OptionalFields, OptionalKeys>

type Result = Pick<Optionals, OptionalKeys> &
  Pick<PersonType, Exclude<keyof PersonType, OptionalKeys>>

const typeOutput: MapSchemaToReturnType<Result> = {
  name: 'Hello!',
  age: 50
}

type B = Extract<A>

type ITeamSchema = typeof Team.schema
