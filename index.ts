import {OpenAIApi, Configuration, CreateChatCompletionRequest} from 'openai'
import {z, type ZodError} from 'zod'
import {zodToJsonSchema