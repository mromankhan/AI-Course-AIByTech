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
