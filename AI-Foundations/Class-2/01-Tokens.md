# 1. Tokens 🧩

## What are Tokens?

A Large Language Model (LLM) **does not read words like humans do.**

Instead, it breaks your text into **small pieces** called **tokens**.

Think of tokens as **building blocks** of a sentence.

---

### Example

Sentence:

```text
I love artificial intelligence.
```

The AI may see something like:

```text
I | love | artificial | intelligence | .
```

These pieces are called **tokens**.

Sometimes one word is one token.

Sometimes one word becomes multiple tokens.

Example:

```text
unbelievable
```

may become

```text
un | believe | able
```

---

### Think of LEGO Blocks 🧱

Imagine a LEGO house.

The house is made from many small LEGO blocks.

Similarly,

A sentence is made from many **tokens**.

---

### Why are Tokens Important?

Every AI model charges and works based on **tokens**.

More tokens means:

* More processing
* More time
* More cost (when using paid AI APIs)

---

### Example

Prompt 1:

```text
What is AI?
```

Maybe 4–5 tokens.

Prompt 2:

```text
Hello ChatGPT, I hope you're doing well. Can you please explain Artificial Intelligence in very simple words?
```

Many more tokens.

Both ask the same question.

The second one uses more tokens.

---

### Easy Rule

> **Everything you type and everything the AI replies with is converted into tokens.**

---



# Understanding the Tokens Image (Class-2\Tokens.png)

The image shows three steps:

## Input

This is your prompt.

Example:

```text
Explain Artificial Intelligence.
```

↓

The AI breaks it into **tokens**.

↓

## Processing

The AI thinks about your request.

It looks for patterns it learned during training.

Then predicts the best answer.

↓

## Output

The AI generates new tokens.

Those tokens become:

```text
Artificial Intelligence is the ability of computers to perform tasks that normally require human intelligence.
```

---