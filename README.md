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

const isGood: boolean = await bool('Is this review 