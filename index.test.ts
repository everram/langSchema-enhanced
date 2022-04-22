import * as schema from './index'
import {config} from 'dotenv'
import {z} from 'zod'

config()


describe("zod tests", () => {
  it("should parse numbers", () => expect(schema.asZ