# Final Summary

| Concept                  | Simple Meaning                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **Token**                | A small piece of text that the AI reads and writes.                                           |
| **Context Window**       | The AI's short-term memory during a conversation.                                             |
| **Direct Prompting**     | Asking the AI directly with a simple instruction.                                             |
| **Structured Prompting** | Giving clear instructions using Role, Task, Context, Negative Constraints, and Output Format. |
| **Role**                 | Who the AI should act as (teacher, doctor, engineer, etc.).                                   |
| **Task**                 | What you want the AI to do.                                                                   |
| **Context**              | Background information that helps the AI understand your situation.                           |
| **Negative Constraints** | Things you don't want the AI to do.                                                           |
| **Output Format**        | How you want the answer presented (table, bullets, steps, etc.).                              |
| **Router (MoE)**         | Chooses the best expert inside the AI for your request.                                       |
| **Experts (MoE)**        | Specialized parts of the AI that handle different types of problems more efficiently.         |

## One sentence to remember

> **You write a prompt → the AI breaks it into tokens → keeps it in its context window → the router selects the most suitable expert(s) if it's an MoE model → the model processes your request → and finally generates output tokens that become the answer you see.**
