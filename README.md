# Lead Full-Stack Engineer  
## Take-Home Assessment: AI Lead Processing System

**Please review this document in full before starting the assessment.**

---

## Overview

You’ve advanced to the next stage of the interview process at **Nuha.ai**.

This take-home exercise is intended to evaluate your ability to design, implement, and reason about a production-grade system spanning backend services, frontend UI, and AI-driven workflows. It is meant to reflect the scope, judgment, and technical ownership expected of a Lead Engineer.

As a Lead Individual Contributor at Nuha.ai, you would be expected to make strong architectural decisions, balance tradeoffs, and build systems that are reliable, observable, and maintainable. This assessment is structured to give you space to demonstrate those skills.

---

## The Project

You will build an application that ingests inbound customer messages, processes them through a clearly defined multi-step AI workflow, and surfaces progress and results in a secure, browser-based dashboard.

The focus is **not** simply calling an LLM. We are specifically interested in how you:

- Structure explicit workflows

- Handle partial failure and unreliable AI outputs

- Persist and expose workflow state in a debuggable way

---

## Detailed Requirements

Each major area of the assessment is documented separately:

- **Backend requirements**

  - [View backend requirements](/requirements/backend.md)

  - Or open `requirements/backend.md`

- **Frontend requirements**

  - [View frontend requirements](/requirements/frontend.md)

  - Or open `requirements/frontend.md`

- **Additional requirements**

  - [View additional requirements](/requirements/additional.md)

  - Or open `requirements/additional.md`

Anything not explicitly specified is intentionally left to your judgment, including (but not limited to):

- Project and file organization  

- Data modeling  

- Validation strategies  

- Error handling and retries  

- AI model selection and integration approach  

- UI structure and interaction patterns  

- Third-party libraries and tooling  

You may use any LLM (hosted or open-source). Your choices and assumptions should be clearly documented.

This is intentionally an open-ended project. While baseline functionality is required, we encourage you to make thoughtful decisions where requirements are underspecified and to explain those decisions clearly.

## Testing

- Ten [sample messages](./sample-messages.md) have been provided for testing and as part of your submission

---

## Expected Time Investment

- Designed for approximately **6-8 hours** of focused work

We value:

- Clear structure

- Sound technical judgment

- Appropriate scoping

Over-engineering or unnecessary abstraction will be viewed negatively.

---

## Project Structure

The assessment consists of two applications:

- A **NestJS** backend

- A **React** frontend

You will be provided with a private repository containing minimal boilerplate for both. The starter code is intentionally lightweight - just enough to run - so that all candidates begin from the same baseline.

### Getting Started

1. Clone the repository locally

2. Follow the setup instructions in each project’s README:

   - [Backend README](/assessment-backend/README.md)

   - [Frontend README](/assessment-frontend/README.md)

### Development Workflow

1. Create a new working branch (e.g. `git checkout -b working-branch`)

2. Implement all changes in that branch:

   - Backend code lives in `assessment-backend/`

   - Frontend code lives in `assessment-frontend/`
   
3. Commit and push as frequently as you like

---

## Submitting Your Assessment

Submission has **two required steps**.

### 1. Code Submission (GitHub)

- Open a pull request from your working branch into `main`
- Merge the PR

⚠️ **Important:**  This merge is treated as your final submission. Do not open or merge a PR until you are fully ready to submit.

Ensure that all relevant README files are updated with:
- Setup instructions
- Environment variables
- Any assumptions or implementation notes

The repository will remain private and accessible only to Nuha.ai reviewers.

### 2. Google Form Submission

Complete the Google form you were provided, including:

- Email

- Full name

- Repository URL

- Link to demo video

- Link to deployed project (optional)

- Description of AI usage during development

- Estimated percentage of AI-generated code

- Time spent on the assessment

- Optional feedback

#### Demo Video Requirements

Please include a narrated demo video (maximum **15 minutes**) covering:

1. The working product and all required functionality

2. A walkthrough of the system design and key technical decisions

3. Any non-obvious flows or tradeoffs

Silent videos or videos without explanation will be disqualified. 

Do **not** upload the video to public platforms such as YouTube.

---

## Submission Checklist

- [ ] Code merged into `main`
- [ ] Google form submitted with all required fields
- [ ] Demo video link included
- [ ] Outputs for 10 sample messages included

---

## Evaluation Criteria

Submissions will be reviewed holistically, including but not limited to:

- Correctness and completeness relative to the requirements

- Code quality

  - Clarity and simplicity

  - Appropriate abstractions

  - Strong typing and validation

  - Logical project structure

- Architectural decisions and tradeoffs

- Alignment with industry best practices

- Avoidance of common anti-patterns

---

## Follow-Up Interview

Candidates with satisfactory submissions will be invited to a **90-minute technical follow-up**. You should be prepared to:

- Explain and defend your design choices

- Walk through your code

- Extend or modify the existing system live

Please keep your local branches after submission.

---

## Guidance

### Treat This as Production Code

Although this is a short exercise, approach it as you would a real production system. We care about how you think, structure, and reason - not just whether the code works. For example, generating unique IDs via randomness alone is not acceptable.

### Use of AI Tools

You are welcome to use AI-assisted development tools (e.g. ChatGPT, Copilot, Cursor) to improve productivity. However:

- You must understand all code you submit

- You must be able to explain your implementation in detail

- The final result should reflect your own technical judgment

Use AI as an accelerator, not a replacement.

---

## Additional Notes

1. Adhere to any given requirements strictly

2. For any under-defined requirements, you are free to choose your own approach

3. You are free to add any additional functionality or improvements to the above application that you see fit, so long as the base requirements are present as described above

4. You are free to use any unspecified third-party libraries, packages or services

5. **_This only needs to run locally, but you are free to deploy it at your own discretion_**

---

## Support

If you encounter access issues, setup problems, or have clarifying questions, contact:

**Yashdiq Lubis**  

yashdiq@lubis.dev
