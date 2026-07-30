# 3. Direct Prompting 💬

## What is Direct Prompting?

Direct Prompting means:

> Ask the AI directly without giving much extra information.

Simple.

Short.

Straight to the point.

---

### Example

```text
What is AI?
```

or

```text
Explain Machine Learning.
```

or

```text
Write an email.
```

Very simple.

No extra instructions.

---

### Think of Asking a Friend

You ask:

> "What time is it?"

That's direct.

No extra details.

---

### Easy Rule

> **Direct Prompt = Short and simple instruction.**

---

# 4. Structured Prompting 📝

Now imagine you don't just ask a question.

Instead...

You explain everything.

This gives much better results.

---

## What is Structured Prompting?

Structured Prompting means:

> Give the AI clear instructions using a proper structure.

Instead of:

```text
Write an article.
```

You explain:

* Who the AI should be
* What it should do
* Why
* How
* What format to use

The AI understands much better.

---

# RTNO Framework

One popular structure is called **RTNO**.

---

## R = Role 👨‍🏫

Tell the AI **who it should act as**.

Examples:

```text
You are a teacher.
```

```text
You are a software engineer.
```

```text
You are a doctor.
```

```text
You are a marketing expert.
```

This helps the AI answer from that perspective.

---

## T = Task ✅

Tell the AI exactly what to do.

Examples:

```text
Explain AI.
```

```text
Write a blog.
```

```text
Find bugs.
```

```text
Summarize this document.
```

---

## C = Context 📖

Give background information.

This helps the AI understand your situation.

Example:

```text
I am a beginner.

I don't know programming.

Explain everything simply.
```

Now the AI knows your level.

---

## N = Negative Constraints ❌

Tell the AI what **NOT** to do.

Examples:

```text
Don't use technical words.
```

```text
Don't write more than 200 words.
```

```text
Don't use emojis.
```

```text
Don't explain advanced topics.
```

---

## O = Output Format 📄

Tell the AI how you want the answer.

Examples:

```text
Use bullet points.
```

```text
Create a table.
```

```text
Write step by step.
```

```text
Give HTML code.
```

---

# Complete RTNO Example

Instead of writing:

```text
Explain AI.
```

Write:

```text
Role:
You are an experienced AI teacher.

Task:
Explain Artificial Intelligence.

Context:
I am a beginner with no technical background.

Negative Constraints:
Don't use difficult words.
Don't use programming terms.

Output Format:
Use headings, bullet points, examples, and simple English.
```

This gives a much better answer because the AI knows exactly what you want.

---

# 5. Understanding the Prompt Structure Image (Class-2\prompt-structure.png)

The image shows the parts of a great prompt.

### Role

Who should the AI be?

Example:

```text
You are an experienced teacher.
```

---

### Task

What should the AI do?

Example:

```text
Explain Machine Learning.
```

---

### Context

Give background information.

Example:

```text
I am a beginner.

I have no technical knowledge.
```

---

### Format

Tell the AI how to write.

Example:

```text
Use simple English.

Add examples.

Use bullet points.
```

---

### Example (Few-Shot Prompting)

Sometimes you show the AI an example of the style you want.

Example:

```text
Example:

Input:
What is AI?

Output:
AI is technology that helps computers think and solve problems like humans.
```

Now the AI understands your preferred style.

---