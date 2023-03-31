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
  const openai = new OpenAIApi(new Configurat