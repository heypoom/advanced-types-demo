// A custom ORM

// A hackathon submission system

const t = {
  text: () => '',
  number: () => 0,
  many: <T>(input: T) => [input],
  of: <T>(type: T) => type,
  optional: <T>(type: T): T | null => type,
}

const Person = {
  name: t.text(),
  age: t.number(),
}

const Team = {
  name: t.text(),
  people: t.many(t.of(Person)),
}

const Project = {
  name: t.text(),
  team: t.of(Team),
  tagline: t.optional(t.text()),
}

const createHandler = <T>(result: () => T) => result

const h = createHandler<typeof Project>(() => ({
  name: 'Candy Machine',
  team: {
    name: 'Lollipop Gang',
    people: [{name: 'Poom', age: 19}],
  },
  tagline: 'Hello',
}))

// Do you think about TYPE first, or about CODE first?
