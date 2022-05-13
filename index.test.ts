import * as schema from './index'
import {config} from 'dotenv'
import {z} from 'zod'

config()


describe("zod tests", () => {
  it("should parse numbers", () => expect(schema.asZodType("what is 2+2", z.number())).resolves.toBe(4))
  it("should parse objects", () => expect(schema.asZodType("hey i'm jose and i'm 42 years old", z.object({
    name: z.string(),
    age: z.number()
  }))).resolves.toStrictEqual({
    name: "jose",
    age: 42
  }))
  it("should par