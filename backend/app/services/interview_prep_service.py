from app.schemas.interview_prep import (
    HRAnswerRequest,
    HRAnswerResponse,
    HRAnswerStyle,
    InterviewPrepRequest,
    InterviewPrepResponse,
    InterviewQuestion,
)

# Question bank organized by category
QUESTION_BANK: dict[str, list[dict]] = {
    "HR": [
        {
            "question": "Tell me about yourself.",
            "expected_answer": "Brief professional summary: current role, years of experience, key technologies, notable achievement, and why you're interested in this role.",
            "evaluation_criteria": "Concise (2 min max), relevant to role, shows progression, ends with why this company.",
            "difficulty": "Easy",
        },
        {
            "question": "Why do you want to join our company?",
            "expected_answer": "Research-backed answer mentioning company products, culture, tech stack alignment, and growth opportunities.",
            "evaluation_criteria": "Shows genuine research, connects personal goals to company mission.",
            "difficulty": "Easy",
        },
        {
            "question": "What are your salary expectations?",
            "expected_answer": "Provide a researched range based on role, location, and experience. Express flexibility.",
            "evaluation_criteria": "Realistic range, shows market research, open to discussion.",
            "difficulty": "Medium",
        },
    ],
    "Behavioral": [
        {
            "question": "Describe a challenging project and how you handled it.",
            "expected_answer": "Use STAR method: Situation, Task, Action, Result. Focus on technical challenge and your specific contribution.",
            "evaluation_criteria": "Clear STAR structure, quantifiable results, demonstrates problem-solving.",
            "difficulty": "Medium",
        },
        {
            "question": "Tell me about a time you disagreed with a teammate.",
            "expected_answer": "Describe conflict professionally, focus on communication, compromise, and positive outcome.",
            "evaluation_criteria": "Shows maturity, empathy, conflict resolution skills.",
            "difficulty": "Medium",
        },
        {
            "question": "Describe your biggest professional achievement.",
            "expected_answer": "Specific project with measurable impact. Explain your role and technologies used.",
            "evaluation_criteria": "Quantifiable impact, relevant skills, personal contribution clear.",
            "difficulty": "Easy",
        },
    ],
    "JavaScript": [
        {
            "question": "Explain closures in JavaScript with an example.",
            "expected_answer": "A closure is a function that retains access to its lexical scope even when executed outside. Example: function factory returning inner function with captured variables.",
            "evaluation_criteria": "Correct definition, practical example, mentions memory considerations.",
            "difficulty": "Medium",
        },
        {
            "question": "What is the event loop? Explain microtasks vs macrotasks.",
            "expected_answer": "Event loop processes call stack, then microtask queue (Promises), then macrotask queue (setTimeout). Explain execution order.",
            "evaluation_criteria": "Correct ordering, understands async model, can draw diagram.",
            "difficulty": "Hard",
        },
        {
            "question": "Explain prototypal inheritance.",
            "expected_answer": "Objects inherit from prototypes via __proto__ chain. Functions have prototype property. ES6 classes are syntactic sugar.",
            "evaluation_criteria": "Understands prototype chain, difference from classical inheritance.",
            "difficulty": "Medium",
        },
    ],
    "TypeScript": [
        {
            "question": "What are generics and when would you use them?",
            "expected_answer": "Generics create reusable components with type parameters. Use for functions, interfaces, and classes that work with multiple types.",
            "evaluation_criteria": "Clear explanation, practical use cases, syntax knowledge.",
            "difficulty": "Medium",
        },
        {
            "question": "Explain the difference between 'interface' and 'type' in TypeScript.",
            "expected_answer": "Interfaces are extendable and mergeable. Types support unions, intersections, and mapped types. Prefer interfaces for object shapes.",
            "evaluation_criteria": "Knows when to use each, understands declaration merging.",
            "difficulty": "Medium",
        },
    ],
    "React": [
        {
            "question": "Explain the React component lifecycle and hooks equivalents.",
            "expected_answer": "Mounting, updating, unmounting phases. useEffect replaces componentDidMount/Update/Unmount. useState for state management.",
            "evaluation_criteria": "Maps class lifecycle to hooks, understands useEffect dependencies.",
            "difficulty": "Medium",
        },
        {
            "question": "How does React reconciliation work?",
            "expected_answer": "Virtual DOM diffing algorithm. React compares new and old trees, calculates minimal DOM updates. Keys help identify list items.",
            "evaluation_criteria": "Understands virtual DOM, diffing, importance of keys.",
            "difficulty": "Hard",
        },
        {
            "question": "What is the difference between useMemo and useCallback?",
            "expected_answer": "useMemo memoizes computed values, useCallback memoizes function references. Both prevent unnecessary re-renders.",
            "evaluation_criteria": "Correct use cases, understands referential equality.",
            "difficulty": "Medium",
        },
    ],
    "Next.js": [
        {
            "question": "Explain the difference between SSR, SSG, and ISR in Next.js.",
            "expected_answer": "SSR renders on each request (getServerSideProps). SSG builds at compile time (getStaticProps). ISR revalidates static pages on interval.",
            "evaluation_criteria": "Knows App Router equivalents, trade-offs, use cases.",
            "difficulty": "Medium",
        },
        {
            "question": "How do Server Components work in Next.js App Router?",
            "expected_answer": "Server Components render on server, zero JS bundle. Client Components use 'use client'. Composition pattern for interactivity.",
            "evaluation_criteria": "Understands RSC architecture, data fetching patterns.",
            "difficulty": "Hard",
        },
    ],
    "Node.js": [
        {
            "question": "Explain Node.js streams and their types.",
            "expected_answer": "Readable, Writable, Duplex, Transform streams. Used for processing large data efficiently without loading into memory.",
            "evaluation_criteria": "Knows stream types, pipe usage, backpressure handling.",
            "difficulty": "Medium",
        },
        {
            "question": "How does the Node.js cluster module work?",
            "expected_answer": "Cluster module forks worker processes sharing server ports. Utilizes multi-core CPUs. Primary process manages workers.",
            "evaluation_criteria": "Understands process model, load balancing, IPC.",
            "difficulty": "Hard",
        },
    ],
    "REST APIs": [
        {
            "question": "Design a REST API for a job application tracker.",
            "expected_answer": "Resources: /applications, /interviews, /resumes. HTTP methods, status codes, pagination, filtering, authentication.",
            "evaluation_criteria": "RESTful conventions, proper status codes, versioning, error handling.",
            "difficulty": "Medium",
        },
        {
            "question": "Explain idempotency in REST APIs.",
            "expected_answer": "GET, PUT, DELETE are idempotent. POST is not. Important for retry logic and distributed systems.",
            "evaluation_criteria": "Correct HTTP method mapping, practical implications.",
            "difficulty": "Medium",
        },
    ],
    "Databases": [
        {
            "question": "Explain database indexing and when to use it.",
            "expected_answer": "Indexes speed up reads but slow writes. B-tree indexes for range queries. Composite indexes for multi-column queries.",
            "evaluation_criteria": "Trade-offs understood, index types, query optimization.",
            "difficulty": "Medium",
        },
        {
            "question": "What is the difference between SQL and NoSQL databases?",
            "expected_answer": "SQL: structured, ACID, relations. NoSQL: flexible schema, horizontal scaling. Choose based on data model and consistency needs.",
            "evaluation_criteria": "Knows CAP theorem basics, use case selection.",
            "difficulty": "Easy",
        },
    ],
    "System Design": [
        {
            "question": "Design a URL shortener like bit.ly.",
            "expected_answer": "API design, base62 encoding, database schema, caching (Redis), rate limiting, analytics, scalability considerations.",
            "evaluation_criteria": "Covers functional/non-functional requirements, estimates capacity.",
            "difficulty": "Hard",
        },
        {
            "question": "How would you design a real-time notification system?",
            "expected_answer": "WebSockets/SSE, message queue (Kafka/RabbitMQ), pub/sub pattern, delivery guarantees, scaling with load balancers.",
            "evaluation_criteria": "Architecture diagram, technology choices justified.",
            "difficulty": "Hard",
        },
    ],
    "Performance": [
        {
            "question": "How would you optimize a slow React application?",
            "expected_answer": "React DevTools Profiler, code splitting, lazy loading, memoization, virtual lists, bundle analysis, image optimization.",
            "evaluation_criteria": "Systematic approach, measurement first, specific techniques.",
            "difficulty": "Medium",
        },
    ],
    "Security": [
        {
            "question": "Explain common web security vulnerabilities (XSS, CSRF, SQL Injection).",
            "expected_answer": "XSS: sanitize input/output. CSRF: tokens, SameSite cookies. SQL Injection: parameterized queries. OWASP top 10 awareness.",
            "evaluation_criteria": "Prevention methods, real-world examples.",
            "difficulty": "Medium",
        },
    ],
}

HR_QUESTIONS: dict[str, dict] = {
    "tell_me_about_yourself": {
        "question": "Tell me about yourself",
        "templates": {
            "concise": (
                "I'm a {target_role} with {years} years of experience specializing in "
                "React, Next.js, and Node.js. {experience} Currently, I'm looking for "
                "opportunities where I can contribute to scalable product development."
            ),
            "detailed": (
                "I'm a passionate {target_role} with {years}+ years building production "
                "web applications. My expertise spans the full stack — from crafting "
                "responsive React/Next.js frontends to designing RESTful APIs with FastAPI "
                "and Node.js. {experience} I'm particularly drawn to {company} because of "
                "your focus on developer experience and technical excellence."
            ),
            "storytelling": (
                "My journey into software started with curiosity about how websites work, "
                "and over {years} years it evolved into a career building products used by "
                "thousands. {experience} What excites me most is solving complex problems "
                "with clean, maintainable code — which is why this {target_role} role at "
                "{company} resonates with me."
            ),
        },
    },
    "why_leaving": {
        "question": "Why are you leaving your current company?",
        "templates": {
            "growth": (
                "I've had a great run at my current company where I {experience}. "
                "Now I'm looking for new challenges that align with my goal of working on "
                "larger-scale systems and mentoring junior developers."
            ),
            "positive": (
                "I'm grateful for everything I've learned in my current role. "
                "I'm now seeking an environment where I can contribute to {target_role} "
                "work at a larger scale, which is why {company} caught my attention."
            ),
            "direct": (
                "My current role has been rewarding, but I'm ready for the next step — "
                "more ownership, bigger impact, and working with a team that pushes "
                "technical boundaries. This role offers exactly that."
            ),
        },
    },
    "why_hire_you": {
        "question": "Why should we hire you?",
        "templates": {
            "skills": (
                "I bring {years} years of hands-on experience with the exact stack you're "
                "using — React, TypeScript, Next.js, and Node.js. {experience} "
                "I can contribute from day one while growing with the team."
            ),
            "value": (
                "Beyond technical skills, I bring a product mindset — I don't just write "
                "code, I think about user impact. {experience} I'm confident I can deliver "
                "high-quality features quickly and help elevate the team's engineering practices."
            ),
            "unique": (
                "What sets me apart is my combination of full-stack depth and AI integration "
                "experience. {experience} I can bridge frontend polish with backend "
                "robustness, which is exactly what this role demands."
            ),
        },
    },
    "biggest_achievement": {
        "question": "What is your biggest achievement?",
        "templates": {
            "project": (
                "My biggest achievement was {experience}. This project improved performance "
                "by 40% and became a reference architecture for the team. It taught me the "
                "importance of measuring before optimizing."
            ),
            "impact": (
                "Leading the migration of a legacy Angular app to Next.js — {experience}. "
                "The result was a 60% faster load time and significantly improved developer "
                "productivity. I'm most proud of how I managed stakeholder expectations "
                "throughout."
            ),
        },
    },
    "biggest_challenge": {
        "question": "What is the biggest challenge you've faced?",
        "templates": {
            "technical": (
                "The toughest challenge was debugging a production memory leak that caused "
                "intermittent crashes. {experience} I systematically profiled the app, "
                "identified the root cause in event listener cleanup, and implemented a "
                "fix that reduced memory usage by 70%."
            ),
            "team": (
                "Managing a critical deadline when a key team member left mid-sprint. "
                "{experience} I reorganized tasks, pair-programmed on blockers, and we "
                "delivered on time without compromising quality."
            ),
        },
    },
    "leadership": {
        "question": "Describe your leadership experience",
        "templates": {
            "informal": (
                "While I haven't had a formal management title, I've consistently taken "
                "leadership roles — mentoring juniors, leading code reviews, and driving "
                "technical decisions. {experience}"
            ),
            "formal": (
                "I've led a team of 3 developers on a major product feature. "
                "{experience} I focused on clear communication, breaking down work, "
                "and creating an environment where everyone could do their best work."
            ),
        },
    },
    "conflict_resolution": {
        "question": "How do you handle conflict with a colleague?",
        "templates": {
            "diplomatic": (
                "I believe in addressing conflicts directly but respectfully. "
                "When I disagreed with a colleague on architecture choices, I suggested "
                "we document pros/cons and present to the team. {experience} "
                "We reached a data-driven decision that everyone supported."
            ),
        },
    },
    "career_goals": {
        "question": "What are your career goals?",
        "templates": {
            "short_term": (
                "In the next 2-3 years, I want to deepen my expertise in system design "
                "and contribute to building scalable platforms. Long-term, I see myself "
                "growing into a Staff Engineer role where I can influence architecture "
                "decisions across teams."
            ),
            "aligned": (
                "My goal is to grow as a {target_role} who can own end-to-end features "
                "and mentor others. {company}'s growth trajectory aligns perfectly with "
                "where I want to take my career."
            ),
        },
    },
    "salary_expectations": {
        "question": "What are your salary expectations?",
        "templates": {
            "range": (
                "Based on my research for {target_role} roles with {years} years of "
                "experience in this market, I'm looking at a range of [X-Y] LPA. "
                "However, I'm flexible and would like to understand the full compensation "
                "package including benefits and growth opportunities."
            ),
            "deflect": (
                "I'm more focused on the role and growth opportunity right now. "
                "Could you share the budget range for this position? I want to ensure "
                "we're aligned before discussing specifics."
            ),
        },
    },
}


class InterviewPrepService:
    def generate(self, request: InterviewPrepRequest) -> InterviewPrepResponse:
        categories = request.categories or list(QUESTION_BANK.keys())
        questions: list[InterviewQuestion] = []

        for category in categories:
            bank = QUESTION_BANK.get(category, [])
            for q in bank:
                questions.append(
                    InterviewQuestion(
                        question=q["question"],
                        expected_answer=q["expected_answer"],
                        evaluation_criteria=q["evaluation_criteria"],
                        difficulty=q["difficulty"],
                        category=category,
                    )
                )

        # Add skill-specific questions if skills provided
        skill_category_map = {
            "javascript": "JavaScript",
            "typescript": "TypeScript",
            "react": "React",
            "next.js": "Next.js",
            "nextjs": "Next.js",
            "node.js": "Node.js",
            "nodejs": "Node.js",
            "angular": "Angular",
        }
        for skill in request.skills:
            cat = skill_category_map.get(skill.lower())
            if cat and cat in QUESTION_BANK:
                for q in QUESTION_BANK[cat]:
                    iq = InterviewQuestion(
                        question=q["question"],
                        expected_answer=q["expected_answer"],
                        evaluation_criteria=q["evaluation_criteria"],
                        difficulty=q["difficulty"],
                        category=cat,
                    )
                    if iq not in questions:
                        questions.append(iq)

        return InterviewPrepResponse(questions=questions, total=len(questions))

    def generate_hr_answers(self, request: HRAnswerRequest) -> HRAnswerResponse:
        hr_data = HR_QUESTIONS.get(request.question_key)
        if not hr_data:
            return HRAnswerResponse(
                question="Unknown question",
                answers=[],
            )

        experience_text = (
            request.user_experience
            or "I recently delivered a major feature that improved user engagement significantly."
        )

        answers = []
        for style, template in hr_data["templates"].items():
            answer = template.format(
                target_role=request.target_role,
                years=request.years_experience,
                experience=experience_text,
                company=request.company or "your company",
            )
            answers.append(HRAnswerStyle(style=style, answer=answer))

        return HRAnswerResponse(question=hr_data["question"], answers=answers)

    def get_hr_question_keys(self) -> list[dict]:
        return [
            {"key": key, "question": data["question"]}
            for key, data in HR_QUESTIONS.items()
        ]

    def get_categories(self) -> list[str]:
        return list(QUESTION_BANK.keys())
