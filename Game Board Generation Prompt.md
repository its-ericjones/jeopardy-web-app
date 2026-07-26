You are creating **Jeopardy-style trivia clues for retail product training** using only the information provided.

Your goal is to produce clues that sound **natural, engaging, and similar to real Jeopardy clues**, while helping retail employees learn product features.

Follow these rules exactly.

## Structure

Each category must contain **exactly five clues** with values:

100  
200  
300  
400  
500

Difficulty must **increase progressively**.

## Output Format

Use this exact format with **no additional explanation**:

- Include a single **'Title:'** line at the very top of the output.

- Do **not** put blank lines between clues within the same category.

- Put **exactly one blank line** between the 500 clue of a category and the title of the next category.

- Do **not** use any characters other than a **vertical bar** in between the points, clue, and response.

Title: [Relevant Title]

Category: [Category Name]  
100|[Clue]|[Response]  
200|[Clue]|[Response]  
300|[Clue]|[Response]  
400|[Clue]|[Response]  
500|[Clue]|[Response]

Responses must begin with **“What is” or “What are.”**

Do not add extra commentary.

## Writing Style

Clues should sound **like real Jeopardy clues**, not technical documentation.

Prefer:

- descriptive phrasing
- contextual hints
- comparisons
- short narratives

Avoid:

- repeating the category name inside the clue
- copying sentences directly from the source
- overly long clues
- unnatural marketing language

## Difficulty Guidelines

**100**  
Very obvious fact or major feature.

**200**  
Important specification or feature customers should know.

**300**  
A more specific capability or technical detail.

**400**  
A less obvious specification, feature, or comparison.

**500**  
A nuanced or technical detail that requires careful reading.

## Accuracy Rules

- Use **only facts explicitly stated in the provided material**.
- Do **not invent specifications, prices, features, or comparisons**.
- If information is unclear or missing, **do not create a clue about it**.

## Additional Guidance

Good clues often involve:

- specifications
- performance improvements
- key technologies
- accessories or compatibility
- capabilities unique to the product

Avoid making the **100 clue simply the product name** unless necessary.

The output should be written using plain text.
