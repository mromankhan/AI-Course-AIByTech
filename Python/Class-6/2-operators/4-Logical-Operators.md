# Part 4: Logical Operators

Logical operators work with **True** and **False**.

There are only three.

| Operator | Meaning                             |
| -------- | ----------------------------------- |
| `and`    | Both conditions must be True        |
| `or`     | At least one condition must be True |
| `not`    | Reverses the result                 |

---

## AND

```python
print(True and True)
```

Output

```text
True
```

---

```python
print(True and False)
```

Output

```text
False
```

Think of `and` as saying:

> **Both conditions must be true.**

---

## OR

```python
print(True or False)
```

Output

```text
True
```

Only one condition needs to be true.

---

## NOT

```python
print(not True)
```

Output

```text
False
```

---

```python
print(not False)
```

Output

```text
True
```

`not` simply changes True to False and False to True.

---

# Real-Life Example

Imagine a website login.

Condition 1:

```text
Correct username
```

Condition 2:

```text
Correct password
```

To log in:

```text
Username AND Password
```

Both must be correct.

---

# Common Beginner Mistakes

## Mistake 1: Using `=` Instead of `==`

Wrong:

```python
print(5 = 5)
```

Correct:

```python
print(5 == 5)
```

Remember:

* `=` means **assign a value**.
* `==` means **compare two values**.

---

## Mistake 2: Dividing by Zero

Wrong:

```python
print(10 / 0)
```

Python gives an error because division by zero is not allowed.

---

## Mistake 3: Forgetting That `/` Returns a Float

```python
print(8 / 2)
```

Output:

```text
4.0
```

Not:

```text
4
```

---

# Mini Project

Ask the user for two numbers and add them.

```python
num1 = int(input("Enter first number: "))
num2 = int(input("Enter second number: "))

total = num1 + num2

print("Sum =", total)
```

Example:

```text
Enter first number: 10
Enter second number: 5
Sum = 15
```

---

# Mini Exercise

Predict the output.

### Question 1

```python
print(8 + 2)
```

---

### Question 2

```python
print(10 % 4)
```

---

### Question 3

```python
print(5 == 5)
```

---

### Question 4

```python
x = 10
x += 5

print(x)
```

---

### Question 5

```python
print(True and False)
```

---

# Summary

Operators help Python perform different tasks.

The four main categories are:

| Category   | Purpose                       |
| ---------- | ----------------------------- |
| Arithmetic | Perform calculations          |
| Comparison | Compare values                |
| Assignment | Store or update values        |
| Logical    | Combine or reverse conditions |

---

# Key Points to Remember

* `+`, `-`, `*`, `/` are basic math operators.
* `%` gives the **remainder**.
* `//` gives the **whole number** after division.
* `**` means **power**.
* `==` compares values.
* `=` assigns a value.
* Comparison operators always return `True` or `False`.
* `and` requires **both** conditions to be true.
* `or` requires **at least one** condition to be true.
* `not` reverses a Boolean value.
