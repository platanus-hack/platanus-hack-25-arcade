---
inclusion: always
---

# MCP Server Usage Guidelines

## Core Philosophy

Use MCP servers strategically to enhance development quality, research accuracy, and decision-making. Combine multiple MCPs to achieve senior-level development practices.

## Required MCP Servers

### 1. Sequential Thinking (sequentialthinking)

**Purpose**: Deep problem decomposition and multi-step reasoning

**When to use**:
- Complex architectural decisions
- Debugging intricate issues
- Planning multi-step implementations
- Evaluating trade-offs between approaches
- Breaking down ambiguous requirements

**Usage pattern**: Always engage sequential thinking before implementing complex features or making significant technical decisions.

### 2. Web Search MCPs (brave-search, hyperbrowser, playwright)

**Purpose**: Research, validation, and current best practices verification

**When to use**:
- Verifying if libraries/frameworks are current and maintained
- Finding solutions to errors and bugs
- Researching best practices for specific technologies
- Checking compatibility and version requirements
- Discovering alternative approaches to problems
- Validating that your approach follows current standards

**Critical rule**: If you don't know the current date or latest best practices, search first before implementing.

### 3. Context7 (context7)

**Purpose**: Finding relevant repositories and reference implementations

**When to use**:
- Discovering well-maintained libraries for specific use cases
- Finding reference implementations of patterns
- Understanding framework-specific conventions
- Validating architectural approaches against real-world examples

**Validation requirement**: Always verify that discovered repositories are current, well-maintained, and follow best practices using web search MCPs.

## Optional Project-Specific MCPs

### Supabase (supabase)

**When to use**: Projects involving Supabase database, authentication, or storage services

### Cloudflare Bindings (cloudflare-bindings)

**When to use**: Projects deploying to or integrating with Cloudflare services (Workers, Pages, R2, D1, KV, etc.)

## MCP Combination Strategies

### Strategy 1: Research-Driven Development
```
1. Use sequentialthinking to decompose the problem
2. Use context7 to find reference implementations
3. Use web search to verify best practices and currency
4. Implement based on validated research
```

### Strategy 2: Error Resolution
```
1. Use sequentialthinking to analyze the error context
2. Use web search to find solutions and explanations
3. Use context7 to find examples of correct implementations
4. Apply the validated solution
```

### Strategy 3: Technology Selection
```
1. Use sequentialthinking to define requirements and constraints
2. Use context7 to discover candidate libraries/frameworks
3. Use web search to verify maintenance status and best practices
4. Make informed decision based on research
```

### Strategy 4: Best Practice Validation
```
1. Use context7 to find how others solve similar problems
2. Use web search to verify current best practices
3. Use sequentialthinking to evaluate approaches
4. Implement the validated approach
```

## Development Workflow

**Standard workflow for complex tasks**:

1. **Think**: Use sequentialthinking to break down the problem
2. **Research**: Use context7 to find relevant examples
3. **Validate**: Use web search to verify best practices and currency
4. **Implement**: Build based on validated research
5. **Verify**: Test and validate the implementation

## Quality Standards

- Never assume best practices without verification
- Always check if libraries/frameworks are current before using them
- Combine multiple MCPs for comprehensive research
- Use sequential thinking for all non-trivial decisions
- Validate approaches against real-world implementations

## Examples

**Example 1: Adding authentication**
1. Sequential thinking: Analyze auth requirements and security considerations
2. Context7: Find authentication implementation examples
3. Web search: Verify current security best practices for the framework
4. Implement validated approach

**Example 2: Debugging a build error**
1. Sequential thinking: Analyze error context and potential causes
2. Web search: Research the specific error message
3. Context7: Find examples of correct configurations
4. Apply solution and verify

**Example 3: Choosing a state management solution**
1. Sequential thinking: Define state management requirements
2. Context7: Discover popular state management libraries
3. Web search: Verify which solutions are current and recommended
4. Sequential thinking: Evaluate trade-offs
5. Make informed decision