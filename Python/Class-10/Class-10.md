Absolutely 👍 Let’s continue your **Python Beginner Course**.

Since you completed:

* Lesson 9: `if`, `else`, `elif`
* Lesson 10: Loops

We’ll now cover **Lessons 11–15** in simple English, step by step.

---

# 🐍 Lesson 11: Lists

A **list** is used to store multiple values in one variable.

Instead of:

```python
name1 = "Ali"
name2 = "Ahmed"
name3 = "Sara"
```

We can use a list:

```python
names = ["Ali", "Ahmed", "Sara"]
```

### 1. Creating a List

```python
fruits = ["Apple", "Banana", "Mango"]
```

A list can contain numbers too:

```python
numbers = [10, 20, 30, 40]
```

And even different data types:

```python
data = ["Ali", 25, True, 10.5]
```

---

## 2. Accessing List Items

Python starts counting from **0**.

```python
fruits = ["Apple", "Banana", "Mango"]
```

| Index | Value  |
| ----- | ------ |
| 0     | Apple  |
| 1     | Banana |
| 2     | Mango  |

So:

```python
print(fruits[0])
```

Output:

```text
Apple
```

```python
print(fruits[2])
```

Output:

```text
Mango
```

### Important

Python indexing starts at **0**, not 1.

---

## 3. Changing a List Item

Lists are **changeable**.

```python
fruits = ["Apple", "Banana", "Mango"]

fruits[1] = "Orange"

print(fruits)
```

Output:

```text
['Apple', 'Orange', 'Mango']
```

---

## 4. Adding Items

Use `append()`:

```python
fruits = ["Apple", "Banana"]

fruits.append("Mango")

print(fruits)
```

Output:

```text
['Apple', 'Banana', 'Mango']
```

---

## 5. Removing Items

Use `remove()`:

```python
fruits = ["Apple", "Banana", "Mango"]

fruits.remove("Banana")

print(fruits)
```

Output:

```text
['Apple', 'Mango']
```

---

## 6. List Length

Use `len()`:

```python
fruits = ["Apple", "Banana", "Mango"]

print(len(fruits))
```

Output:

```text
3
```

### Mini Example

```python
students = ["Ali", "Ahmed", "Sara"]

print(students[0])

students.append("Usman")

print(students)

print(len(students))
```

---

# 🐍 Lesson 12: Tuples

A **tuple** is similar to a list.

Example:

```python
colors = ("Red", "Green", "Blue")
```

The main difference is:

> **List = can be changed**
> **Tuple = cannot be changed**

---

## 1. Creating a Tuple

```python
numbers = (10, 20, 30, 40)
```

Access items just like lists:

```python
print(numbers[0])
```

Output:

```text
10
```

---

## 2. Tuple Cannot Be Changed

This will cause an error:

```python
numbers = (10, 20, 30)

numbers[0] = 100
```

Why?

Because tuples are **immutable**.

Immutable means:

> Cannot be changed after creation.

---

## 3. When Do We Use Tuples?

Use a tuple when you have data that should not change.

For example:

```python
days = ("Monday", "Tuesday", "Wednesday")
```

Or:

```python
coordinates = (10, 20)
```

---

## List vs Tuple

| List            | Tuple               |
| --------------- | ------------------- |
| `[]`            | `()`                |
| Changeable      | Not changeable      |
| More flexible   | More fixed          |
| Used frequently | Used for fixed data |

Example:

```python
my_list = [1, 2, 3]
my_tuple = (1, 2, 3)
```

---

# 🐍 Lesson 13: Dictionaries

A **dictionary** stores information using **key-value pairs**.

Think about a real dictionary:

```text
word → meaning
```

Python dictionary:

```python
student = {
    "name": "Ali",
    "age": 20,
    "city": "Karachi"
}
```

Here:

```text
name → Ali
age → 20
city → Karachi
```

---

## 1. Accessing Dictionary Values

```python
student = {
    "name": "Ali",
    "age": 20
}

print(student["name"])
```

Output:

```text
Ali
```

And:

```python
print(student["age"])
```

Output:

```text
20
```

---

## 2. Changing Values

```python
student = {
    "name": "Ali",
    "age": 20
}

student["age"] = 21

print(student)
```

---

## 3. Adding a New Item

```python
student["city"] = "Karachi"
```

Now:

```python
print(student)
```

You will get something like:

```text
{'name': 'Ali', 'age': 21, 'city': 'Karachi'}
```

---

## 4. Removing an Item

Use `pop()`:

```python
student.pop("city")
```

---

## 5. Getting All Keys

```python
print(student.keys())
```

---

## 6. Getting All Values

```python
print(student.values())
```

---

## Real-Life Example

Imagine storing a user's information:

```python
user = {
    "name": "Ahmed",
    "age": 25,
    "email": "ahmed@example.com"
}

print(user["name"])
print(user["age"])
print(user["email"])
```

Dictionaries are **very important in Python**, especially when working with APIs, JSON, databases, and AI applications.

---

# 🐍 Lesson 14: Sets

A **set** is a collection of unique values.

Example:

```python
numbers = {1, 2, 3, 4}
```

The important thing about sets:

> **Sets do not allow duplicate values.**

Example:

```python
numbers = {1, 2, 2, 3, 3, 4}

print(numbers)
```

Output:

```text
{1, 2, 3, 4}
```

The duplicates are removed.

---

## 1. Creating a Set

```python
fruits = {"Apple", "Banana", "Mango"}
```

---

## 2. Adding an Item

Use `add()`:

```python
fruits.add("Orange")
```

---

## 3. Removing an Item

```python
fruits.remove("Banana")
```

---

## 4. Why Use Sets?

Sets are useful when you want **unique data**.

For example:

```python
numbers = [1, 2, 2, 3, 3, 4, 4]

unique_numbers = set(numbers)

print(unique_numbers)
```

Output:

```text
{1, 2, 3, 4}
```

So sets are very useful for removing duplicates.

---
