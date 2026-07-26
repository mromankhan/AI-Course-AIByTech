# 4. Understanding the Router & Experts (Mixture of Experts - MoE) Image (Class-2\MixtureOfExperts(MOE).png)

This image explains how some modern AI models work internally.

## Imagine a Hospital 🏥

A hospital has many specialists:

👨‍⚕️ Heart Doctor

👩‍⚕️ Eye Doctor

👨‍⚕️ Skin Doctor

👩‍⚕️ Brain Doctor

When a patient arrives...

The receptionist decides which doctor should handle the patient.

---

The AI works in a similar way.

---

### Router

The **Router** is like the receptionist.

Its job is:

> Decide which expert is best for the current question.

---

### Experts

Each **Expert** is very good at certain kinds of tasks.

For example:

* Expert 1 → Programming
* Expert 2 → Mathematics
* Expert 3 → Writing
* Expert 4 → Science

*(These are simplified examples. In real models, experts usually learn patterns rather than being manually assigned topics.)*

---

### Example

You ask:

```text
Write Python code.
```

The Router thinks:

"This is a coding task."

↓

It sends the request to the coding expert.

---

Now you ask:

```text
Write a poem.
```

The Router chooses a different expert that is better at writing.

---

### Why Use Multiple Experts?

Imagine one teacher trying to teach:

* Math
* Physics
* Biology
* English
* Chemistry

Very difficult.

Now imagine five specialist teachers.

Each teaches only one subject.

The quality improves.

That's the idea behind **Mixture of Experts (MoE).**
