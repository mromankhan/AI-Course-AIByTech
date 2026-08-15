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