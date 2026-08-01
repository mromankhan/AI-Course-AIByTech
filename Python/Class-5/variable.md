# Lesson 5: Variables (Beginner-Friendly)

Welcome to one of the **most important topics in Python**.

Once you understand **variables**, programming becomes much easier.

---

# What is a Variable?

A **variable** is a **container that stores data**.

Simple definition:

> **A variable is a name used to store a value.**

Think of it like a labeled box.

---

# Real-Life Example

Imagine you have three boxes.

```text
+----------+
| Apples   |
+----------+

+----------+
| Books    |
+----------+

+----------+
| Clothes  |
+----------+
```

Each box has:

* A label (name)
* Something stored inside

A Python variable works the same way.

```text
Name (Label)   →   Value (Inside)
```

---

# Example

```python
name = "Ali"
```

Let's understand it.

```text
name     =     "Ali"
│               │
│               └── Value
└────────────────── Variable Name
```

This means:

> Create a variable named **name** and store the value **Ali** inside it.

---

# Another Example

```python
age = 25
```

Meaning:

> Store **25** inside a variable called **age**.

---

# Another Example

```python
city = "Karachi"
```

Meaning:

> Store **Karachi** inside a variable named **city**.

---

# Why Do We Need Variables?

Imagine you want to remember:

* Your name
* Your age
* Your city

Without variables:

```python
print("Ali")
print(25)
print("Karachi")
```

This works, but what if your age changes?

You would need to change it everywhere.

Using variables:

```python
name = "Ali"
age = 25
city = "Karachi"

print(name)
print(age)
print(city)
```

Now, if your age changes:

```python
age = 26
```

You only update it **once**.

---

# Variable = Reusable Storage

Suppose:

```python
name = "Ali"
```

Now you can use `name` many times.

```python
print(name)
print(name)
print(name)
```

Output

```text
Ali
Ali
Ali
```

The variable keeps giving you the stored value.

---

# Variable Analogy

Think about your phone contacts.

```text
Ali  → 03001234567
Ahmed → 03111234567
Sara → 03221234567
```

You don't memorize the phone numbers.

You remember the **names**.

Variables work the same way.

```text
name → "Ali"

age → 25

city → "Karachi"
```

The variable name helps you access the stored value.

---

# Printing Variables

```python
name = "Ali"

print(name)
```

Output

```text
Ali
```

Notice:

We **do not** use quotation marks around the variable name when printing it.

Correct:

```python
print(name)
```

Wrong:

```python
print("name")
```

Output:

```text
name
```

Why?

Because `"name"` is just text.

`name` (without quotes) is the variable.

---

# More Examples

Example 1

```python
country = "Pakistan"

print(country)
```

Output

```text
Pakistan
```

---

Example 2

```python
age = 20

print(age)
```

Output

```text
20
```

---

Example 3

```python
price = 150

print(price)
```

Output

```text
150
```

---

# Changing Variable Values

Variables can change.

```python
age = 20

print(age)
```

Output

```text
20
```

Now change it:

```python
age = 21

print(age)
```

Output

```text
21
```

The old value is replaced.

---

# Variable Names

A variable can have almost any meaningful name.

Examples

```python
name = "Ali"
```

```python
age = 22
```

```python
city = "Lahore"
```

```python
salary = 50000
```

```python
student = "Ahmed"
```

---

# Choosing Good Variable Names

Good:

```python
student_name = "Ali"
```

```python
book_price = 300
```

```python
user_age = 18
```

These names clearly describe what they store.

---

# Bad Variable Names

```python
a = "Ali"
```

```python
x = 20
```

```python
abc = 500
```

These work, but they do not explain what the value means.

As a beginner, choose **meaningful names**.

---

# Variable Naming Rules

### Rule 1: Start with a letter or underscore

Correct

```python
name = "Ali"
```

```python
_age = 20
```

Wrong

```python
2name = "Ali"
```

Variable names cannot start with a number.

---

### Rule 2: No Spaces

Wrong

```python
student name = "Ali"
```

Correct

```python
student_name = "Ali"
```

Use an underscore (`_`) instead of spaces.

---

### Rule 3: No Special Characters

Wrong

```python
name@ = "Ali"
```

Wrong

```python
price$ = 100
```

Correct

```python
price = 100
```

---

### Rule 4: Python is Case-Sensitive

These are different variables:

```python
name = "Ali"
```

```python
Name = "Ahmed"
```

```python
NAME = "Sara"
```

Python treats them as three different names.

---

# Storing Different Types of Values

Variables can store many kinds of data.

Text

```python
name = "Ali"
```

Number

```python
age = 20
```

Decimal Number

```python
height = 5.8
```

True or False

```python
student = True
```

We'll learn these data types in detail in the next lesson.

---

# Common Beginner Mistakes

### Mistake 1: Using Quotes Around the Variable Name

```python
name = "Ali"

print("name")
```

Output

```text
name
```

Correct

```python
print(name)
```

Output

```text
Ali
```

---

### Mistake 2: Using a Variable Before Creating It

Wrong

```python
print(age)
```

Python gives an error because `age` has not been created yet.

Correct

```python
age = 20

print(age)
```

---

### Mistake 3: Forgetting the Equal Sign

Wrong

```python
name "Ali"
```

Correct

```python
name = "Ali"
```

---

# Real-Life Example

Imagine you own a shop.

```text
Product Name → Apple

Price → 120

Stock → 50
```

In Python:

```python
product = "Apple"
price = 120
stock = 50

print(product)
print(price)
print(stock)
```

Output

```text
Apple
120
50
```

---

# Practice Examples

### Example 1

```python
name = "Sara"

print(name)
```

Output

```text
Sara
```

---

### Example 2

```python
age = 18

print(age)
```

Output

```text
18
```

---

### Example 3

```python
city = "Islamabad"

print(city)
```

Output

```text
Islamabad
```

---

### Example 4

```python
name = "Ali"
age = 25

print(name)
print(age)
```

Output

```text
Ali
25
```

---

# Mini Exercise

Predict the output without running the code.

### Question 1

```python
fruit = "Mango"

print(fruit)
```

---

### Question 2

```python
number = 100

print(number)
```

---

### Question 3

```python
name = "Ali"

name = "Ahmed"

print(name)
```

---

### Question 4

```python
city = "Karachi"

print("city")
```

---

# Summary

* A **variable** stores a value.
* Use the `=` operator to assign a value to a variable.
* A variable has a **name** and a **value**.
* Print a variable **without quotation marks**.
* Variable values can be changed.
* Use meaningful variable names.
* Python is **case-sensitive**, so `name`, `Name`, and `NAME` are different variables.

## Key Points to Remember

| Code             | Meaning                              |
| ---------------- | ------------------------------------ |
| `name = "Ali"`   | Store `"Ali"` in `name`              |
| `age = 20`       | Store `20` in `age`                  |
| `print(name)`    | Display the value stored in `name`   |
| `name = "Ahmed"` | Replace the old value with a new one |
| `student_name`   | A good, meaningful variable name     |
