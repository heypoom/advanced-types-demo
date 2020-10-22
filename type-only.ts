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

const createResolver = <T>(result: () => T) => result

// How do we resolve the type?
const handler = createResolver<typeof Project>(() => ({
  name: 'Killer Robot',
  team: {
    name: 'Black Velvet',
    people: [
      {name: 'Poom', age: 19},
      {name: 'Dr. Strange', age: 40},
    ],
  },
  tagline: 'Hello',
}))

// Do you think about TYPE first, or about CODE first?
