# Lesson 7: Input from User (`input()`)

Welcome to **Lesson 7**.

Until now, our programs used **fixed values**.

Example:

```python
name = "Ali"

print(name)
```

Output:

```text
Ali
```

This always prints **Ali**.

But what if we want the **user** to enter their own name?

For that, Python provides the **`input()`** function.

---

# What is `input()`?

`input()` is a **built-in Python function**.

Its job is:

> **Take input (information) from the user.**

Think of it as asking a question and waiting for the user's answer.

---

# Real-Life Example

Imagine a teacher asks:

> What is your name?

Student replies:

> Ali

The teacher receives the answer.

Python works the same way.

```text
Python asks a question
        ↓
User types an answer
        ↓
Python receives the answer
```

---

# Basic Example

```python
name = input()
```

What happens?

1. Python waits.
2. The user types something.
3. The value is stored in the variable `name`.

Suppose the user types:

```text
Ali
```

Then:

```text
name = "Ali"
```

---

# Printing the User's Input

```python
name = input()

print(name)
```

If the user enters:

```text
Sara
```

Output:

```text
Sara
```

The program prints whatever the user typed.

---

# Asking a Question

Usually, we show a message inside `input()`.

```python
name = input("Enter your name: ")

print(name)
```

Screen:

```text
Enter your name: Ali
Ali
```

The text inside `input()` is called the **prompt**.

It tells the user what to enter.

---

# Another Example

```python
city = input("Enter your city: ")

print(city)
```

If the user types:

```text
Karachi
```

Output:

```text
Karachi
```

---

# Input + Variable + Print

```python
country = input("Enter your country: ")

print(country)
```

If the user types:

```text
Pakistan
```

Output:

```text
Pakistan
```

---

# Visual Diagram

```text
input("Enter your name: ")
            │
            ▼
      User types:
          Ali
            │
            ▼
name = "Ali"
            │
            ▼
print(name)
            │
            ▼
          Ali
```

---

# Taking More Than One Input

You can ask multiple questions.

```python
name = input("Enter your name: ")
age = input("Enter your age: ")

print(name)
print(age)
```

Example:

```text
Enter your name: Ahmed
Enter your age: 20
```

Output:

```text
Ahmed
20
```

---

# Real-Life Example

Imagine an online registration form.

It asks:

* Name
* Age
* City

Python program:

```python
name = input("Enter your name: ")
age = input("Enter your age: ")
city = input("Enter your city: ")

print(name)
print(age)
print(city)
```

---

# Important Rule

## `input()` Always Returns a String

This is one of the **most important rules** in Python.

Suppose the user enters:

```text
25
```

Code:

```python
age = input("Enter your age: ")
```

Even though the user typed **25**, Python stores it as:

```text
"25"
```

It is **text**, not a number.

Let's check it.

```python
age = input("Enter your age: ")

print(type(age))
```

User enters:

```text
25
```

Output:

```text
<class 'str'>
```

So, `input()` always returns a **string (`str`)**.

---

# Converting Input to an Integer

If you want a whole number, use `int()`.

```python
age = int(input("Enter your age: "))

print(age)
print(type(age))
```

User enters:

```text
20
```

Output:

```text
20
<class 'int'>
```

Now the value is an integer.

---

# Converting Input to a Float

For decimal numbers, use `float()`.

```python
height = float(input("Enter your height: "))

print(height)
print(type(height))
```

User enters:

```text
5.8
```

Output:

```text
5.8
<class 'float'>
```

---

# Why Convert Input?

Suppose you write:

```python
age = input("Enter your age: ")

print(age + age)
```

User enters:

```text
20
```

Output:

```text
2020
```

Why?

Because `"20"` is a string.

Python joins the two strings together.

This is called **string concatenation**.

---

# Correct Way

```python
age = int(input("Enter your age: "))

print(age + age)
```

User enters:

```text
20
```

Output:

```text
40
```

Now Python adds the numbers.

---

# Real-Life Analogy

Imagine someone asks:

> How old are you?

You answer:

```text
20
```

If they write it in a notebook as **text**, it's just words.

If they write it in a calculator, it's a number.

Python needs to know which one you want.

---

# Common Beginner Mistakes

## Mistake 1: Forgetting to Store the Input

Wrong:

```python
input("Enter your name: ")
```

The user enters a value, but it is not saved.

Correct:

```python
name = input("Enter your name: ")
```

---

## Mistake 2: Expecting a Number

```python
age = input("Enter your age: ")
```

Many beginners think `age` is an integer.

It is not.

Check it:

```python
print(type(age))
```

Output:

```text
<class 'str'>
```

---

## Mistake 3: Using `int()` with Text

```python
age = int(input("Enter your age: "))
```

If the user enters:

```text
Ali
```

Python gives an error because `"Ali"` cannot be converted to an integer.

Only numeric input like `20` or `35` works with `int()`.

---

# Practice Examples

## Example 1

```python
name = input("What is your name? ")

print(name)
```

---

## Example 2

```python
city = input("Enter your city: ")

print(city)
```

---

## Example 3

```python
age = int(input("Enter your age: "))

print(age)
```

---

## Example 4

```python
price = float(input("Enter the price: "))

print(price)
```

---

# Mini Project 1

Ask the user for their name and greet them.

```python
name = input("What is your name? ")

print("Welcome!")
print(name)
```

Example:

```text
What is your name? Sara

Welcome!
Sara
```

---

# Mini Project 2

Ask the user for their favorite color.

```python
color = input("What is your favorite color? ")

print("Your favorite color is:")
print(color)
```

---

# Mini Exercise

Predict the answer before running the code.

### Question 1

```python
name = input("Enter your name: ")

print(name)
```

If the user enters:

```text
Ali
```

What is the output?

---

### Question 2

```python
age = input("Enter your age: ")

print(type(age))
```

If the user enters:

```text
20
```

What is the output?

---

### Question 3

```python
age = int(input("Enter your age: "))

print(type(age))
```

If the user enters:

```text
20
```

What is the output?

---

### Question 4

```python
number = input("Enter a number: ")

print(number + number)
```

If the user enters:

```text
5
```

What is the output?

---

### Question 5

```python
number = int(input("Enter a number: "))

print(number + number)
```

If the user enters:

```text
5
```

What is the output?

---

# Summary

* `input()` is used to take input from the user.
* The text inside `input()` is called the **prompt**.
* Always store the input in a variable.
* `input()` always returns a **string (`str`)**.
* Use `int()` to convert input into a whole number.
* Use `float()` to convert input into a decimal number.

---

# Key Points to Remember

| Code                         | Meaning                          |
| ---------------------------- | -------------------------------- |
| `input()`                    | Take input from the user         |
| `name = input()`             | Store user input in `name`       |
| `input("Enter your name: ")` | Show a prompt and wait for input |
| `int(input())`               | Convert input to an integer      |
| `float(input())`             | Convert input to a float         |
| `type(value)`                | Check the data type              |

---

# What's Next?

The next lesson is **Lesson 8: Operators**.

You will learn:

* Arithmetic Operators (`+`, `-`, `*`, `/`, `%`, `//`, `**`)
* Comparison Operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
* Assignment Operators (`=`, `+=`, `-=`, `*=`, `/=`)
* Logical Operators (`and`, `or`, `not`)

Operators allow Python to **perform calculations, compare values, and make decisions**, making your programs much more powerful.
