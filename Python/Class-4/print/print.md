## What is `print()`?

`print()` is a **built-in Python function**.

Its job is very simple:

> **It displays output on the screen.**

Think of `print()` as a person whose only job is to **show information**.

---

# Real-Life Example

Imagine you have a printer.

You press the **Print** button.

The printer prints a document.

Similarly, Python's `print()` function prints information on the computer screen.

---

# Our First Example

```python
print("Hello")
```

Output:

```
Hello
```

### What happened?

Python read this instruction:

> "Show the word **Hello** on the screen."

And it displayed:

```
Hello
```

---

# Breaking It Down

Look at this code:

```python
print("Hello")
```

Let's understand each part.

```
print
```

This is the **function name**.

It tells Python:

> "Display something."

---

```
(
```

This is an **opening parenthesis**.

It marks the beginning of the information you want to print.

---

```
"Hello"
```

This is the **text** we want to display.

Because it is text, it is written inside quotation marks.

---

```
)
```

This is the **closing parenthesis**.

It marks the end of the information.

---

# Visual Diagram

```
print("Hello")
│     │      │
│     │      └── Text
│     └───────── Parentheses
└────────────── Function Name
```

---

# Printing Different Text

Example:

```python
print("Good Morning")
```

Output

```
Good Morning
```

Another example:

```python
print("Welcome to Python")
```

Output

```
Welcome to Python
```

You can print **any text** you want.

---

# Printing Numbers

You can also print numbers.

```python
print(10)
```

Output

```
10
```

Another example:

```python
print(250)
```

Output

```
250
```

Notice:

Numbers are **not** inside quotation marks.

---

# Printing Decimal Numbers

```python
print(3.14)
```

Output

```
3.14
```

---

# Printing Multiple Lines

Write:

```python
print("Ali")
print("Ahmed")
print("Sara")
```

Output

```
Ali
Ahmed
Sara
```

Each `print()` creates a **new line**.

---

# Printing Blank Lines

```python
print()
print("Hello")
```

Output

```

Hello
```

An empty `print()` prints a blank line.

---

# Printing Symbols

```python
print("@")
print("#")
print("$")
```

Output

```
@
#
$
```

---

# Printing a Sentence

```python
print("Python is easy.")
```

Output

```
Python is easy.
```

---

# Printing Using Single Quotes

Python also allows single quotes.

```python
print('Hello')
```

Output

```
Hello
```

These are also valid:

```python
print("Python")
```

```python
print('Python')
```

Both give the same output.

---

# Double Quotes vs Single Quotes

Both work.

```python
print("Ali")
```

```python
print('Ali')
```

Output

```
Ali
```

Choose one style and use it consistently.

---

# Common Beginner Mistakes

### Mistake 1: Forgetting Quotes

Wrong:

```python
print(Hello)
```

Python thinks `Hello` is a variable, not text, and gives an error.

Correct:

```python
print("Hello")
```

---

### Mistake 2: Forgetting Parentheses

Wrong:

```python
print "Hello"
```

Correct:

```python
print("Hello")
```

---

### Mistake 3: Missing Closing Quote

Wrong:

```python
print("Hello)
```

Correct:

```python
print("Hello")
```

---

### Mistake 4: Missing Closing Parenthesis

Wrong:

```python
print("Hello"
```

Correct:

```python
print("Hello")
```

---

# Real-Life Analogy

Imagine a TV screen.

The only thing the audience can see is what appears on the screen.

`print()` is like the TV screen.

Whatever you place inside `print()`, Python shows it on the screen.

Example:

```python
print("Welcome")
```

Screen:

```
Welcome
```

---

# Practice Examples

### Example 1

```python
print("I am learning Python.")
```

Output

```
I am learning Python.
```

---

### Example 2

```python
print(100)
```

Output

```
100
```

---

### Example 3

```python
print("Today is a good day.")
```

Output

```
Today is a good day.
```

---

### Example 4

```python
print("Apple")
print("Banana")
print("Mango")
```

Output

```
Apple
Banana
Mango
```

---

# Mini Exercise

Can you predict the output?

### Question 1

```python
print("Python")
```

---

### Question 2

```python
print(25)
```

---

### Question 3

```python
print("A")
print("B")
```

---

### Question 4

```python
print()
print("Done")
```

Try to answer **without running the code**. Predicting the output is a great way to build your programming skills.

---

# Summary

* `print()` is a **built-in function** used to display output.
* Text must be inside **quotation marks** (`" "` or `' '`).
* Numbers do **not** need quotation marks.
* Every `print()` starts a **new line**.
* Empty `print()` prints a **blank line**.
* Parentheses `()` are required in Python 3.

## Key Points to Remember

| Code                         | Output                        |
| ---------------------------- | ----------------------------- |
| `print("Hello")`             | `Hello`                       |
| `print(10)`                  | `10`                          |
| `print(3.14)`                | `3.14`                        |
| `print()`                    | Blank line                    |
| `print("A")`<br>`print("B")` | `A` then `B` on the next line |

In the next lesson, we'll learn **how `print()` can display multiple values in one statement**, along with concepts like **commas**, **`sep`**, and **`end`**, using simple real-life examples.