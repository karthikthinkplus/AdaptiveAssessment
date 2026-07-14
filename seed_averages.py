import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from app.database.session import SessionLocal
from app.models.topic import Topic
from app.models.subtopic import Subtopic

def seed_averages():
    db = SessionLocal()
    try:
        # 1. Create 'Averages' topic if not present
        topic = db.query(Topic).filter(Topic.name == "Averages").first()
        if not topic:
            topic = Topic(
                id=uuid.uuid4(),
                name="Averages",
                difficulty_level="medium",
                display_order=2,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(topic)
            db.commit()
            db.refresh(topic)
            print(f"Created Topic: {topic.name}")
        else:
            print(f"Topic 'Averages' already exists: {topic.id}")

        # 2. Create subtopics under 'Averages'
        subtopics_to_create = [
            {
                "name": "Simple Average of Numbers",
                "description": "Basic calculation of mean, summing values and dividing by the count.",
                "display_order": 1
            },
            {
                "name": "Weighted Average",
                "description": "Calculations where different values in the set carry different importance or weights.",
                "display_order": 2
            },
            {
                "name": "Average Speed Problems",
                "description": "Finding average speed for journeys with different speeds over different segments (Total Distance / Total Time).",
                "display_order": 3
            },
            {
                "name": "Averages involving Ages and Mixtures",
                "description": "Solving complex word problems involving average ages of groups, replacements, or mixture concentrations.",
                "display_order": 4
            }
        ]

        for st_info in subtopics_to_create:
            subtopic = db.query(Subtopic).filter(
                Subtopic.name == st_info["name"],
                Subtopic.topic_id == topic.id
            ).first()
            if not subtopic:
                subtopic = Subtopic(
                    id=uuid.uuid4(),
                    topic_id=topic.id,
                    name=st_info["name"],
                    description=st_info["description"],
                    difficulty_level="medium",
                    display_order=st_info["display_order"],
                    mastery_threshold=0.85,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(subtopic)
                db.commit()
                print(f"Created Subtopic: {subtopic.name}")
            else:
                print(f"Subtopic '{st_info['name']}' already exists.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_averages()
