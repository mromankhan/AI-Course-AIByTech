# Lesson 9: `if`, `elif`, and `else` Statements

In this lesson, we will learn how Python **makes decisions**.

## 1. What is an `if` statement?

Sometimes we want our program to do something **only when a condition is true**.

For example:

* If age is 18 or more → allow voting.
* If password is correct → allow login.
* If marks are greater than 50 → print "Pass".

We use the `if` statement for this.

### Syntax

```python
if condition:
    # code to run if condition is True
```

### Example

```python
age = 20

if age >= 18:
    print("You can vote")
```

Output:

```text
You can vote
```

Python checks:

```python
age >= 18
```

Since `20 >= 18` is `True`, Python runs:

```python
print("You can vote")
```

---

# 2. Understanding `True` and `False`

An `if` statement works with a condition that gives either:

* `True`
* `False`

Example:

```python
age = 15

print(age >= 18)
```

Output:

```text
False
```

Because 15 is not greater than or equal to 18.

So if we write:

```python
if age >= 18:
    print("You can vote")
```

Nothing will be printed because the condition is `False`.

---

# 3. Using `else`

What if we want Python to do something when the condition is **False**?

We use `else`.

### Example

```python
age = 15

if age >= 18:
    print("You can vote")
else:
    print("You cannot vote")
```

Output:

```text
You cannot vote
```

### How it works

Python checks:

```python
age >= 18
```

If it is `True`:

```python
print("You can vote")
```

Otherwise:

```python
print("You cannot vote")
```

---

# 4. Simple Real-Life Example

Imagine a student taking an exam.

```python
marks = 70

if marks >= 50:
    print("Pass")
else:
    print("Fail")
```

Output:

```text
Pass
```

If we change marks:

```python
marks = 40
```

Then the output will be:

```text
Fail
```

---

# 5. What is `elif`?

`elif` means:

> **Else If**

We use `elif` when we have **more than two conditions**.

For example, we want to give grades:

* 80 or above → A
* 60 or above → B
* 50 or above → C
* Below 50 → Fail

```python
marks = 75

if marks >= 80:
    print("Grade A")

elif marks >= 60:
    print("Grade B")

elif marks >= 50:
    print("Grade C")

else:
    print("Fail")
```

Output:

```text
Grade B
```

---

# 6. How Python checks `if`, `elif`, and `else`

Python checks conditions **from top to bottom**.

Example:

```python
marks = 75

if marks >= 80:
    print("A")

elif marks >= 60:
    print("B")

elif marks >= 50:
    print("C")

else:
    print("Fail")
```

Python checks:

1. Is `75 >= 80`? → ❌ False
2. Is `75 >= 60`? → ✅ True
3. Print `"B"`
4. Python stops checking the remaining conditions.

This is important:

> Once Python finds a `True` condition, it runs that block and skips the remaining `elif` and `else`.

---

# 7. Indentation is Very Important

Look carefully:

```python
if age >= 18:
    print("Adult")
```

There are spaces before:

```python
print("Adult")
```

This is called **indentation**.

Python uses indentation to understand which code belongs to the `if` statement.

Correct:

```python
age = 20

if age >= 18:
    print("Adult")

print("Program finished")
```

Output:

```text
Adult
Program finished
```

---

# 8. Using `input()` with `if-else`

Now let's combine what we learned in previous lessons.

```python
age = int(input("Enter your age: "))

if age >= 18:
    print("You are an adult")
else:
    print("You are under 18")
```

If the user enters:

```text
20
```

Output:

```text
You are an adult
```

If the user enters:

```text
15
```

Output:

```text
You are under 18
```

### Why do we use `int()`?

Because `input()` normally gives us text (a string).

```python
age = input("Enter your age: ")
```

If we want to compare age with a number like `18`, we should convert it:

```python
age = int(input("Enter your age: "))
```

---

# 9. Another Example: Positive, Negative, or Zero

```python
number = int(input("Enter a number: "))

if number > 0:
    print("Positive number")

elif number < 0:
    print("Negative number")

else:
    print("Zero")
```

Examples:

| Input | Output          |
| ----- | --------------- |
| `10`  | Positive number |
| `-5`  | Negative number |
| `0`   | Zero            |

---

# 10. Important Comparison Operators

You already learned operators, but these are especially useful with `if` statements:

| Operator | Meaning                  | Example     |
| -------- | ------------------------ | ----------- |
| `==`     | Equal to                 | `age == 18` |
| `!=`     | Not equal to             | `age != 18` |
| `>`      | Greater than             | `age > 18`  |
| `<`      | Less than                | `age < 18`  |
| `>=`     | Greater than or equal to | `age >= 18` |
| `<=`     | Less than or equal to    | `age <= 18` |

### Important difference

```python
=
```

means **assign a value**.

```python
age = 20
```

But:

```python
==
```

means **compare two values**.

```python
if age == 20:
    print("Age is 20")
```

---

# 11. Example: Login System

```python
username = input("Enter username: ")

if username == "admin":
    print("Welcome Admin")
else:
    print("Access denied")
```

If the user enters:

```text
admin
```

Output:

```text
Welcome Admin
```

Otherwise:

```text
Access denied
```

---

# 12. Example with Multiple Conditions

```python
number = int(input("Enter a number: "))

if number > 100:
    print("Number is greater than 100")

elif number > 50:
    print("Number is greater than 50")

else:
    print("Number is 50 or less")
```

Suppose the user enters:

```text
75
```

Python checks:

```text
75 > 100 → False
75 > 50 → True
```

So the output is:

```text
Number is greater than 50
```

---

# Simple Structure to Remember

```python
if condition:
    # Run this if condition is True

elif another_condition:
    # Run this if the first condition is False
    # and this condition is True

else:
    # Run this if all conditions are False
```

## Important Rules

1. `if` comes first.
2. `elif` is optional.
3. You can use multiple `elif` statements.
4. `else` is optional.
5. `else` always comes at the end.
6. Use `:` after `if`, `elif`, and `else`.
7. Indentation is very important.

---

# Practice Exercises 📝

Try solving these yourself:

### Exercise 1: Even or Odd

Ask the user for a number.

* If the number is divisible by 2 → print `"Even"`
* Otherwise → print `"Odd"`

Hint:

```python
number % 2
```

---

### Exercise 2: Pass or Fail

Ask the user for marks.

* Marks 50 or above → `"Pass"`
* Otherwise → `"Fail"`

---

### Exercise 3: Age Category

Ask the user for age.

* Less than 13 → `"Child"`
* 13 to 19 → `"Teenager"`
* 20 or above → `"Adult"`

---

### Exercise 4: Simple Calculator Decision

Ask the user for two numbers and an operator (`+`, `-`, `*`, `/`).

Use `if`, `elif`, and `else` to perform the selected operation.

---

## Lesson Summary

Today you learned:

```text
if     → Check a condition
elif   → Check another condition
else   → Run when all conditions are False
```

The basic idea is:

> **IF this condition is true, do this. OTHERWISE, check another condition. If nothing is true, do something else.**

This is one of the most important concepts in Python because it allows your programs to **make decisions**.

**Next lesson: Lesson 10 — Loops (`for` and `while`)**
