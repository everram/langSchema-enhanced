import {OpenAIApi, Configuration, CreateChatCompletionRequest} from 'openai'
import {z, type ZodError} from 'zod'
import {zodToJsonSchema} from "zod-to-json-schema"

interface GenericPromptOptions {
  gpt4?: boolean
}

type AtLeastOne<T> = [T, ...T[]];

async function backoff<T>(
  retries: number,
  fn: () => Promise<T>,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return backoff(retries - 1, fn, delay * 2);
  }
}

function buildLLM() {
  const openai = new OpenAIApi(new Configuration({apiKey: process.env.OPENAI_API_KEY}))
  return {
    createChatCompletion(request: CreateChatCompletionRequest) {
      return backoff(10, () => openai.createChatCompletion(request), 500)
    }
  }
}

function buildLLMOptions(promptOptions?: GenericPromptOptions) {
  return {
    temperature: 0,
    model: promptOptions?.gpt4 ? "gpt-4" : "gpt-3.5-turbo"
  }
}

/**
 * This function parses the given input into a given Zod type using the OpenAI API. The
 * input type can be ANY Zod type, not just an object - a boolean, a number, an enum,
 * etc. are all valid inputs.
 *
 * @export
 * @param {string} prompt - The input to parse
 * @param zodType - The Zod type to parse the response into.
 * @param {GenericPromptOptions} [promptOptions] - Optional settings for the prompt.
 * @returns {Promise<T>} A promise that resolves to the parsed value.
 *
 * @throws {ZodError} If the parsed response does not match the expected structure.
 *
 * @async
 */
export async function asZodType<T>(prompt: string, zodType: z.ZodType<T>, promptOptions?: GenericPromptOptions): Promise<T> {
  if (!prompt) {
    return zodType.parse("")
  }
  const openai = buildLLM()
  const llmOptions = buildLLMOptions(promptOptions)
  let wrapperZod: any
  let shouldWrap = (zodType._def as any).typeName !== "ZodObject"
  if (shouldWrap) {
    wrapperZod = z.object({value: zodType})
  } else {
    wrapperZod = zodType
  }

  const jsonSchema = zodToJsonSchema(wrapperZod, "wrapper").definitions?.wrapper

  const result = await openai.createChatCompletion({
    ...llmOptions,
    messages: [
      {
        role: "system",
        content: "Follow the user's instructions exactly, and respond with ONLY what the user requests in valid JSON format. No extraneous information."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    function_call: {name: "answer"},