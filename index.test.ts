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
  it("should parse arrays", () => expect(schema.asZodType("my favorite colors are red and green", z.array(z.string()).describe("favorite colors"))).resolves.toStrictEqual(["red", "green"]))
})

describe('booleans', () => {
  it("should return true for a positive review", () => expect(schema.bool("Did this review user like the business? Best bang for your buck. For a price much cheaper than college consultants, I have hundreds of successful Ivy Leagu