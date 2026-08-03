# Part 1: Arithmetic Operators

Arithmetic operators are used for **mathematical calculations**.

| Operator | Meaning             |
| -------- | ------------------- |
| `+`      | Addition            |
| `-`      | Subtraction         |
| `*`      | Multiplication      |
| `/`      | Division            |
| `%`      | Modulus (Remainder) |
| `//`     | Floor Division      |
| `**`     | Exponent (Power)    |

---

## 1. Addition (`+`)

Adds two numbers.

```python
print(10 + 5)
```

Output

```text
15
```

Using variables:

```python
a = 10
b = 5

print(a + b)
```

Output

```text
15
```

---

## Real-Life Example

Suppose you have:

* 3 apples
* Your friend gives you 2 more

```python
apples = 3
more_apples = 2

print(apples + more_apples)
```

Output

```text
5
```

---

## 2. Subtraction (`-`)

Subtracts one number from another.

```python
print(10 - 3)
```

Output

```text
7
```

---

## 3. Multiplication (`*`)

Multiplies numbers.

```python
print(4 * 5)
```

Output

```text
20
```

---

## 4. Division (`/`)

Divides one number by another.

```python
print(10 / 2)
```

Output

```text
5.0
```

Notice:

Even though the answer is 5, Python returns **5.0**, which is a float.

---

## 5. Modulus (`%`)

Returns the **remainder** after division.

Example:

```python
print(10 % 3)
```

Let's calculate:

```text
10 ÷ 3 = 3 remainder 1
```

Output

```text
1
```

Another example:

```python
print(20 % 4)
```

Output

```text
0
```

Because 20 is exactly divisible by 4.

---

## Real-Life Example

Imagine you have 10 chocolates.

You put them into boxes of 3.

```text
Box 1 = 3
Box 2 = 3
Box 3 = 3

Left = 1
```

That leftover chocolate is the **remainder**.

---

## 6. Floor Division (`//`)

Returns only the whole number.

```python
print(10 // 3)
```

Output

```text
3
```

Python ignores the decimal part.

Another example:

```python
print(15 // 2)
```

Output

```text
7
```

---

## 7. Exponent (`**`)

Means **power**.

```python
print(2 ** 3)
```

Means:

```text
2 × 2 × 2
```

Output

```text
8
```

Another example:

```python
print(5 ** 2)
```

Output

```text
25
```

---

# Arithmetic Operator Summary

| Expression | Result |
| ---------- | ------ |
| `5 + 3`    | `8`    |
| `5 - 3`    | `2`    |
| `5 * 3`    | `15`   |
| `6 / 2`    | `3.0`  |
| `10 % 3`   | `1`    |
| `10 // 3`  | `3`    |
| `2 ** 4`   | `16`   |
