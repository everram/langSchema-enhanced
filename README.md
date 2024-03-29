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
  ['1 star', '2 stars', '3 stars', '4 st