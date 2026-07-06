"""Seed the database with sample data for development."""

from datetime import date, timedelta

from app.database import SessionLocal, init_db
from app.models.application import (
    Application,
    ApplicationStatus,
    JobSource,
    Priority,
    WorkMode,
)
from app.models.interview_journal import InterviewJournal, InterviewOutcome
from app.models.learning_topic import LearningCategory, LearningTopic, TopicStatus
from app.models.resume import Resume, ResumeType


def seed():
    init_db()
    db = SessionLocal()

    if db.query(Application).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    today = date.today()

    applications = [
        Application(
            company="Vercel",
            role="Senior Frontend Engineer",
            job_url="https://vercel.com/careers",
            source=JobSource.COMPANY_CAREERS,
            salary="35-45 LPA",
            experience="4+ years",
            location="Remote",
            work_mode=WorkMode.REMOTE,
            skills_required="React, Next.js, TypeScript, Node.js",
            priority=Priority.HIGH,
            status=ApplicationStatus.TECHNICAL,
            tags="frontend, remote, nextjs",
            application_date=today - timedelta(days=5),
            follow_up_date=today + timedelta(days=2),
        ),
        Application(
            company="Stripe",
            role="Full Stack Developer",
            source=JobSource.LINKEDIN,
            salary="40-50 LPA",
            experience="5+ years",
            location="Bangalore",
            work_mode=WorkMode.HYBRID,
            skills_required="React, Node.js, PostgreSQL, AWS",
            priority=Priority.URGENT,
            status=ApplicationStatus.PHONE_SCREEN,
            application_date=today - timedelta(days=3),
            follow_up_date=today + timedelta(days=1),
        ),
        Application(
            company="Linear",
            role="React Developer",
            source=JobSource.WELLFOUND,
            salary="30-40 LPA",
            location="Remote",
            work_mode=WorkMode.REMOTE,
            skills_required="React, TypeScript, CSS, Performance",
            priority=Priority.MEDIUM,
            status=ApplicationStatus.APPLIED,
            application_date=today,
        ),
        Application(
            company="Google",
            role="Software Engineer L4",
            source=JobSource.LINKEDIN,
            salary="50+ LPA",
            experience="4+ years",
            location="Hyderabad",
            work_mode=WorkMode.ONSITE,
            skills_required="JavaScript, System Design, DSA, React",
            priority=Priority.HIGH,
            status=ApplicationStatus.SAVED,
            tags="faang, onsite",
        ),
        Application(
            company="Razorpay",
            role="Senior Software Engineer",
            source=JobSource.INSTAHYRE,
            salary="35-42 LPA",
            location="Bangalore",
            work_mode=WorkMode.HYBRID,
            skills_required="React, Node.js, MongoDB, Kafka",
            priority=Priority.MEDIUM,
            status=ApplicationStatus.OFFER,
            application_date=today - timedelta(days=20),
        ),
        Application(
            company="Freshworks",
            role="Frontend Developer",
            source=JobSource.NAUKRI,
            status=ApplicationStatus.REJECTED,
            application_date=today - timedelta(days=15),
        ),
    ]
    db.add_all(applications)

    journals = [
        InterviewJournal(
            company="Vercel",
            role="Senior Frontend Engineer",
            round="Technical Round 1",
            interviewer="Senior Engineer",
            questions_asked="React reconciliation, Next.js SSR vs SSG, CSS performance",
            my_answers="Explained virtual DOM diffing well. Struggled with ISR details.",
            better_answers="Should have mentioned revalidate option and on-demand ISR.",
            lessons_learned="Review Next.js rendering modes before interviews.",
            confidence_rating=7.0,
            outcome=InterviewOutcome.PASSED,
        ),
        InterviewJournal(
            company="Stripe",
            role="Full Stack Developer",
            round="HR Round",
            questions_asked="Tell me about yourself, Why Stripe, Salary expectations",
            confidence_rating=8.5,
            outcome=InterviewOutcome.PENDING,
        ),
    ]
    db.add_all(journals)

    resumes = [
        Resume(
            name="React Specialist",
            resume_type=ResumeType.REACT,
            target_role="Senior React Developer",
            skills_highlighted="React, Redux, TypeScript, Jest, Storybook",
            last_updated=today - timedelta(days=7),
        ),
        Resume(
            name="Full Stack General",
            resume_type=ResumeType.FULLSTACK,
            target_role="Senior Full Stack Developer",
            skills_highlighted="React, Next.js, Node.js, Python, PostgreSQL, AWS",
            last_updated=today - timedelta(days=3),
        ),
        Resume(
            name="AI Applications",
            resume_type=ResumeType.AI,
            target_role="AI Application Developer",
            skills_highlighted="Python, FastAPI, LangChain, React, Vector DBs",
            last_updated=today - timedelta(days=14),
        ),
    ]
    db.add_all(resumes)

    topics = [
        LearningTopic(title="Closures & Event Loop", category=LearningCategory.JAVASCRIPT, status=TopicStatus.COMPLETED),
        LearningTopic(title="React Server Components", category=LearningCategory.NEXTJS, status=TopicStatus.IN_PROGRESS),
        LearningTopic(title="System Design: URL Shortener", category=LearningCategory.SYSTEM_DESIGN, status=TopicStatus.PLANNED),
        LearningTopic(title="Binary Trees & Graphs", category=LearningCategory.DSA, status=TopicStatus.IN_PROGRESS),
        LearningTopic(title="SQL Query Optimization", category=LearningCategory.SQL, status=TopicStatus.PLANNED),
        LearningTopic(title="TypeScript Generics", category=LearningCategory.TYPESCRIPT, status=TopicStatus.COMPLETED),
    ]
    db.add_all(topics)

    db.commit()
    db.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed()
