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
    functions: [
      {
        name: "answer",
        description: "Answer the user's question",
        parameters: jsonSchema
      }
    ]
  })
  const evaluated = wrapperZod.parse(JSON.parse(result.data.choices[0].message!.function_call!.arguments!))
  return shouldWrap ? (evaluated.value as T) : evaluated as T
}

/**
 * Asynchronously handles a binary prompt to return a boolean answer.
 *
 * This function creates a Large Language Model (LLM) from the provided options
 * and prompts the user with a message. It then returns a boolean value based on the
 * user's answer.
 *
 * @export
 * @param {string} prompt - The prompt message to display to the user.
 * @param {GenericPromptOptions} [promptOptions] - Optional settings for the prompt.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating the user's response.
 *
 * @throws {ZodError} If the parsed response does not match the expected structure.
 *
 * @async
 */
export async function bool(prompt: string, promptOptions?: GenericPromptOptions): Promise<boolean> {
  if (!prompt) {
    return false
  }
  const openai = buildLLM()
  const llmOptions = buildLLMOptions(promptOptions)
  const result = await openai.createChatCompletion({
    ...llmOptions,
    messages: [
      {
        role: "system",
        content: 'Answer the following question with a true or false.'
      },
      {
        role: "user",
        content: prompt
      }
    ],
    function_call: {name: "answer"},
    functions: [
      {
        name: "answer",
        description: "Answer the user's question",
        parameters: {
          type: "object",
          required: ["value"],
          description: "An object containing a boolean value.",
          properties: {
            value: {
              type: "boolean",
              description: "The boolean value to return.",
            },
          },
        },
      }
    ]
  })
  const zBooleanAnswer = z.object({value: z.boolean()})

  const answer = JSON.parse(result.data.choices[0].message?.function_call?.arguments as string)
  return zBooleanAnswer.parse(answer).value
}

/**
 * Asynchronously handles a categorical prompt and returns the classified category
 *
 * This function creates a Large Language Model (LLM) from the provided options
 * and prompts the user with a message. It then returns the selected category,
 * which must be one of the provided allowed values.
 *
 * @export
 * @param {string} prompt - The user's question to classify
 * @param {AtLeastOne<string>} allowedValues - Array of allowable categorical values.
 * @param {GenericPromptOptions} [promptOptions] - Optional settings for the prompt.
 * @returns {Promise<string>} A promise that resolves to a string indicating the user's selected category.
 *
 * @throws {Error} If no prompt is provided.
 * @throws {ZodError} If the parsed response does not match the expected structure or is not one of the allowed values.
 *
 * @async
 */
export async function categorize(prompt: string, allowedValues: AtLe