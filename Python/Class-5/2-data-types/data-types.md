# Lesson 6: Data Types (Beginner-Friendly)

Welcome to **Lesson 6**.

In the previous lesson, you learned that **variables store values**.

Now the question is:

> **What kind of values can a variable store?**

The answer is:

> **Data Types**

---

# What is a Data Type?

A **data type** tells Python **what kind of data a value is**.

Simple definition:

> **A data type is the type or category of a value.**

Think of it like sorting items into different boxes.

---

# Real-Life Example

Imagine you have four boxes.

```text
+----------------+
| Fruits         |
+----------------+

+----------------+
| Numbers        |
+----------------+

+----------------+
| Decimal Values |
+----------------+

+----------------+
| Yes / No       |
+----------------+
```

Each box stores a different type of item.

Python works the same way.

Different kinds of values belong to different **data types**.

---

# The Four Basic Data Types

As a beginner, you should first learn these **four** data types.

| Data Type | Meaning        | Example |
| --------- | -------------- | ------- |
| `str`     | Text           | `"Ali"` |
| `int`     | Whole Number   | `25`    |
| `float`   | Decimal Number | `3.14`  |
| `bool`    | True or False  | `True`  |

These four are the most commonly used data types.

---

# 1. String (`str`)

A **string** is **text**.

Examples:

```python
name = "Ali"
```

```python
city = "Karachi"
```

```python
country = "Pakistan"
```

All of these are strings because they contain text.

---

## Strings Must Be Inside Quotes

Correct:

```python
name = "Ali"
```

or

```python
name = 'Ali'
```

Wrong:

```python
name = Ali
```

Without quotes, Python thinks `Ali` is a variable, not text.

---

## Printing a String

```python
name = "Ali"

print(name)
```

Output

```text
Ali
```

---

# Real-Life Example

Your name is text.

```python
student = "Ahmed"
```

Your favorite color is text.

```python
color = "Blue"
```

---

# 2. Integer (`int`)

An **integer** is a **whole number**.

Examples:

```python
age = 20
```

```python
marks = 95
```

```python
apples = 10
```

These are integers because they have **no decimal point**.

---

## Printing an Integer

```python
age = 20

print(age)
```

Output

```text
20
```

---

# Real-Life Example

Number of students

```python
students = 40
```

Number of books

```python
books = 100
```

Number of cars

```python
cars = 15
```

---

# 3. Float (`float`)

A **float** is a **decimal number**.

Examples:

```python
height = 5.8
```

```python
price = 120.50
```

```python
temperature = 36.7
```

All these numbers have a decimal point.

---

## Printing a Float

```python
price = 120.50

print(price)
```

Output

```text
120.5
```

Python may remove unnecessary zeros after the decimal point.

---

# Real-Life Example

Height

```python
height = 5.9
```

Weight

```python
weight = 68.5
```

Petrol price

```python
petrol = 273.75
```

---

# 4. Boolean (`bool`)

A Boolean has only **two values**:

```text
True
False
```

It answers questions like:

* Yes or No
* On or Off
* Pass or Fail
* Logged In or Logged Out

---

## Example

```python
student = True
```

```python
logged_in = False
```

---

## Printing a Boolean

```python
student = True

print(student)
```

Output

```text
True
```

Notice:

`True` and `False` start with a capital letter.

---

# Comparing the Four Types

```python
name = "Ali"
age = 20
height = 5.8
student = True
```

| Variable  | Value   | Data Type |
| --------- | ------- | --------- |
| `name`    | `"Ali"` | `str`     |
| `age`     | `20`    | `int`     |
| `height`  | `5.8`   | `float`   |
| `student` | `True`  | `bool`    |

---

# How to Check a Data Type

Python provides a built-in function called `type()`.

It tells you the data type of a value or variable.

---

## Example 1

```python
print(type("Ali"))
```

Output

```text
<class 'str'>
```

This means the value is a **string**.

---

## Example 2

```python
print(type(25))
```

Output

```text
<class 'int'>
```

---

## Example 3

```python
print(type(3.14))
```

Output

```text
<class 'float'>
```

---

## Example 4

```python
print(type(True))
```

Output

```text
<class 'bool'>
```

---

# Checking the Type of Variables

```python
name = "Ali"
age = 20
height = 5.8
student = True

print(type(name))
print(type(age))
print(type(height))
print(type(student))
```

Output

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
```

---

# Why Are Data Types Important?

Imagine a school.

* Student name → Text
* Student age → Number
* Fee → Decimal
* Passed → Yes/No

Different information needs different data types.

Python needs to know what kind of data it is working with.

---

# Common Beginner Mistakes

## Mistake 1: Number Inside Quotes

```python
age = "20"
```

Many beginners think this is an integer.

It is **not**.

Because it is inside quotes, it is a **string**.

Check it:

```python
print(type(age))
```

Output

```text
<class 'str'>
```

---

Correct integer:

```python
age = 20
```

---

## Mistake 2: Decimal Without a Decimal Point

```python
price = 100
```

This is an **integer**, not a float.

Correct float:

```python
price = 100.0
```

---

## Mistake 3: Using Small Letters for Boolean

Wrong:

```python
student = true
```

Wrong:

```python
student = false
```

Correct:

```python
student = True
```

```python
student = False
```

---

# Real-Life Example

Suppose we are storing information about a student.

```python
name = "Ahmed"
age = 18
height = 5.7
passed = True
```

Now print everything.

```python
print(name)
print(age)
print(height)
print(passed)
```

Output

```text
Ahmed
18
5.7
True
```

---

# Practice Example

```python
city = "Lahore"
population = 13000000
temperature = 35.5
capital = False

print(city)
print(population)
print(temperature)
print(capital)
```

Output

```text
Lahore
13000000
35.5
False
```

---

# Mini Exercise

Without running the code, identify the data type.

### Question 1

```python
name = "Sara"
```

Data Type = ?

---

### Question 2

```python
age = 22
```

Data Type = ?

---

### Question 3

```python
weight = 55.4
```

Data Type = ?

---

### Question 4

```python
logged_in = True
```

Data Type = ?

---

### Question 5

```python
number = "100"
```

Data Type = ?

(Hint: Look carefully at the quotation marks.)

---

# Summary

A **data type** tells Python what kind of value is being stored.

The four basic data types are:

| Data Type | Meaning        | Example |
| --------- | -------------- | ------- |
| `str`     | Text           | `"Ali"` |
| `int`     | Whole Number   | `25`    |
| `float`   | Decimal Number | `3.14`  |
| `bool`    | True or False  | `True`  |

You can use the `type()` function to check the data type of any value or variable.

---

# Key Points to Remember

* Text → `str`
* Whole numbers → `int`
* Decimal numbers → `float`
* Yes/No values → `bool`
* Values inside quotes are always **strings**.
* `True` and `False` must start with a capital letter.
* Use `type()` whenever you want to know a value's data type.

---

# What's Next?

The next lesson is **Lesson 7: Input from User (`input()`)**.

You will learn:

* What `input()` is
* How to take input from the user
* Store the input in a variable
* Display it using `print()`
* Why `input()` always returns a string
* How to convert input into numbers (using `int()` and `float()`)

This is where your programs become **interactive**, because they can start asking the user questions instead of always using fixed values.
