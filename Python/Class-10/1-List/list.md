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