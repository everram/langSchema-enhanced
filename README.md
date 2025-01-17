# 🧱 langSchema-enhanced

**one-line LLM output parsers for JS/TS.** No code bloat. One file. Enhanced for better usage and experience.

## How to Use

### 1. Install the Package
```bash
npm i langSchema-enhanced
```

### 2. Use Any of Our One-Line Parsers

```javascript
import { bool, list, categorize, asZodType } from 'langSchema-enhanced'

const isGood: boolean = await bool('Is this review positive? Review: Best bang for your buck.')

const foodsAte: string[] = await list(
  'What foods did this review user like? Review: i loved pizza and milkshakes', 
  ['pizza', 'burger', 'fries']
)

const rating: string = await categorize(
  `What rating would this review user give?
  Review: could NOT recommend it more, best ive ever eaten`, 
  ['1 star', '2 stars', '3 stars', '4 stars', '5 stars']
)

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

const user = await asZodType('hi my name is John and im 21 years old', userSchema)
// => { name: "John", age: 21 }
```

## Features

### Boolean Parser
Useful for parsing outputs that are in a binary format, i.e., `true` or `false`.

### Categorize Parser
It assists in parsing outputs that can be categorized into a specific set of strings (enums).

### List Parser
This is intended to parse outputs that are lists of specific set of strings (enums).

### Zod Parser
Parse ANY zod type with this parser.

Original repo owned by everram