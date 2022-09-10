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
  it("should return true for a positive review", () => expect(schema.bool("Did this review user like the business? Best bang for your buck. For a price much cheaper than college consultants, I have hundreds of successful Ivy League applications at my fingertips.")).resolves.toBe(true))

  it("should handle short strings", () => expect(schema.bool("Did this review user like the business? worst service EVER!")).resolves.toBe(false))

  it("should return false for an empty string", () => expect(schema.bool("")).resolves.toBe(false))
})

describe('enums', () => {
  it("should classify basic values correctly", () => expect(schema.categorize("My favorite color is red", ["red", "blue", "green"])).resolves.toBe("red"))

  it("should not throw an error for an invalid value", () => expect(schema.categorize("My favorite color is red", ["blue", "green"])).resolves.not.toThrow())

  it("should classify values with spaces correctly", () => expect(schema.categorize("I prefer watching Sci