 # Lesson 10: Loops in Python 🔁

Welcome to **Lesson 10**!

So far, we have learned:

* `print()`
* Variables
* Data Types
* `input()`
* Operators
* `if`, `elif`, and `else`

Now we will learn another very important concept:

> **Loops allow us to repeat code.**

---

# 1. What is a Loop?

Imagine you want to print:

```text
Hello
Hello
Hello
Hello
Hello
```

Without a loop, you would write:

```python
print("Hello")
print("Hello")
print("Hello")
print("Hello")
print("Hello")
```

But this is repetitive.

With a loop:

```python
for i in range(5):
    print("Hello")
```

Output:

```text
Hello
Hello
Hello
Hello
Hello
```

Much easier! 🙂

---

# 2. Types of Loops in Python

There are mainly two types of loops:

1. `for` loop
2. `while` loop

We will learn both.

---

# Part 1: `for` Loop

## 3. What is a `for` loop?

A `for` loop is used when we want to repeat something a specific number of times or go through a collection of items.

### Example

```python
for i in range(5):
    print(i)
```

Output:

```text
0
1
2
3
4
```

Notice that Python starts counting from `0`.

---

# 4. Understanding `range()`

The `range()` function is commonly used with a `for` loop.

### Example:

```python
for i in range(5):
    print(i)
```

`range(5)` means:

```text
0, 1, 2, 3, 4
```

It does **not** include `5`.

---

## `range(start, stop)`

You can choose where to start.

```python
for i in range(1, 6):
    print(i)
```

Output:

```text
1
2
3
4
5
```

Here:

```text
range(1, 6)
```

means:

* Start at `1`
* Stop before `6`

So Python prints `1` to `5`.

---

## `range(start, stop, step)`

You can also control the steps.

```python
for i in range(0, 10, 2):
    print(i)
```

Output:

```text
0
2
4
6
8
```

The third number `2` means:

> Move forward by 2 each time.

---

# 5. Simple `for` Loop Example

Let's print numbers from 1 to 10:

```python
for number in range(1, 11):
    print(number)
```

Output:

```text
1
2
3
4
5
6
7
8
9
10
```

---

# 6. Using a `for` Loop with a String

A string contains characters.

Example:

```python
name = "Ali"

for letter in name:
    print(letter)
```

Output:

```text
A
l
i
```

Python goes through each character one by one.

---

# 7. Using a `for` Loop with a List

Example:

```python
fruits = ["Apple", "Banana", "Mango"]

for fruit in fruits:
    print(fruit)
```

Output:

```text
Apple
Banana
Mango
```

Python takes each item from the list one by one.

First:

```text
Apple
```

Then:

```text
Banana
```

Then:

```text
Mango
```

---

# Part 2: `while` Loop

## 8. What is a `while` Loop?

A `while` loop continues running **while a condition is True**.

Example:

```python
number = 1

while number <= 5:
    print(number)
    number = number + 1
```

Output:

```text
1
2
3
4
5
```

---

## How does it work?

Initially:

```python
number = 1
```

Python checks:

```python
number <= 5
```

Since `1 <= 5` is `True`, Python prints:

```text
1
```

Then:

```python
number = number + 1
```

Now:

```python
number = 2
```

Python repeats the process.

Eventually:

```python
number = 6
```

Now:

```python
6 <= 5
```

is `False`.

So the loop stops.

---

# 9. Important: Avoid Infinite Loops ⚠️

Look at this:

```python
number = 1

while number <= 5:
    print(number)
```

This creates an **infinite loop**.

Why?

Because `number` never changes.

It will remain:

```text
1
```

So Python keeps printing:

```text
1
1
1
1
1
...
```

To fix it:

```python
number = 1

while number <= 5:
    print(number)
    number = number + 1
```

Always make sure the condition can eventually become `False`.

---

# 10. `for` vs `while`

| `for` Loop                                      | `while` Loop                                        |
| ----------------------------------------------- | --------------------------------------------------- |
| Used when repeating over items or a known range | Used when repeating until a condition becomes False |
| Often uses `range()`                            | Uses a condition                                    |
| Usually simpler for fixed repetitions           | Useful when the number of repetitions is unknown    |

### Example: `for`

```python
for i in range(5):
    print("Hello")
```

We know we want to repeat 5 times.

### Example: `while`

```python
password = ""

while password != "python123":
    password = input("Enter password: ")

print("Correct password!")
```

Here, we don't know how many attempts the user will need.

The loop continues until the correct password is entered.

---

# 11. Incrementing a Variable

This is very common in loops.

```python
number = number + 1
```

You can also write:

```python
number += 1
```

Both mean the same thing.

Example:

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

Output:

```text
1
2
3
4
5
```

---

# 12. Nested Loops

A loop inside another loop is called a **nested loop**.

Example:

```python
for i in range(1, 4):
    for j in range(1, 4):
        print(i, j)
```

Output:

```text
1 1
1 2
1 3
2 1
2 2
2 3
3 1
3 2
3 3
```

Don't worry if this feels a little difficult right now. You will understand it better with practice.

---

# 13. Using `if` Inside a Loop

We can combine loops with `if` statements.

Example: Print only even numbers.

```python
for number in range(1, 11):
    if number % 2 == 0:
        print(number)
```

Output:

```text
2
4
6
8
10
```

Let's understand this:

```python
number % 2 == 0
```

If the remainder after dividing by 2 is `0`, the number is even.

---

# 14. `break` Statement

The `break` statement immediately stops a loop.

Example:

```python
for number in range(1, 11):

    if number == 6:
        break

    print(number)
```

Output:

```text
1
2
3
4
5
```

When Python reaches:

```python
number == 6
```

The loop stops.

---

# 15. `continue` Statement

The `continue` statement skips the current iteration.

Example:

```python
for number in range(1, 6):

    if number == 3:
        continue

    print(number)
```

Output:

```text
1
2
4
5
```

When the number is `3`, Python skips:

```python
print(number)
```

Then it continues with the next number.

---

# 16. Real-Life Example: Simple Countdown

```python
number = 5

while number > 0:
    print(number)
    number -= 1

print("Go!")
```

Output:

```text
5
4
3
2
1
Go!
```

---

# 17. Real-Life Example: Multiplication Table

Let's create a multiplication table.

```python
number = int(input("Enter a number: "))

for i in range(1, 11):
    print(number, "x", i, "=", number * i)
```

If the user enters:

```text
5
```

Output:

```text
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 x 6 = 30
5 x 7 = 35
5 x 8 = 40
5 x 9 = 45
5 x 10 = 50
```

---

# 18. Real-Life Example: Keep Asking Until User Says "yes"

```python
answer = ""

while answer != "yes":
    answer = input("Do you want to continue? ")

print("Program ended.")
```

The program will keep asking:

```text
Do you want to continue?
```

Until the user enters:

```text
yes
```

---

# Important Rules to Remember

### Rule 1: Indentation is important

Correct:

```python
for i in range(5):
    print(i)
```

Wrong:

```python
for i in range(5):
print(i)
```

---

### Rule 2: `range()` stops before the last number

```python
range(1, 5)
```

Produces:

```text
1
2
3
4
```

Not `5`.

---

### Rule 3: Update variables in `while` loops

Example:

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

Otherwise, you may create an infinite loop.

---

# Practice Exercises 📝

Try these yourself.

### Exercise 1: Print 1 to 10

Use a `for` loop.

Expected output:

```text
1
2
3
4
5
6
7
8
9
10
```

---

### Exercise 2: Print Even Numbers

Print all even numbers from 1 to 20.

Expected output:

```text
2
4
6
8
10
12
14
16
18
20
```

---

### Exercise 3: Multiplication Table

Ask the user for a number and print its multiplication table from 1 to 10.

---

### Exercise 4: Countdown

Use a `while` loop to print:

```text
10
9
8
7
6
5
4
3
2
1
Go!
```

---

### Exercise 5: Password Program

Create a program that keeps asking the user for a password.

The correct password is:

```text
python123
```

The program should only stop when the user enters the correct password.

---

# Lesson Summary

Today you learned:

```text
for loop      → Repeat code for a range or collection of items
while loop    → Repeat code while a condition is True
range()       → Generate a sequence of numbers
break         → Stop the loop immediately
continue      → Skip the current iteration
```

The most important thing to remember is:

> **Loops help us repeat code without writing the same code again and again.**

### Basic `for` loop:

```python
for i in range(5):
    print(i)
```

### Basic `while` loop:

```python
count = 1

while count <= 5:
    print(count)
    count += 1
```

**Next Lesson: Lesson 11 — Functions in Python**
