import * as schema from './index'
import {config} from 'dotenv'
import {z} from 'zod'

config()


describe("zod tests", () => {
  it("should parse numbers", () => expect(schema.asZodType("what is 2+2", z.number())).resolves.toBe(4))
  it("should parse objects", () => expect(schema.asZodTyp