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