from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.learning_topic import TopicStatus
from app.repositories.learning_topic_repository import LearningTopicRepository
from app.schemas.learning_topic import (
    LearningTopicCreate,
    LearningTopicListResponse,
    LearningTopicResponse,
    LearningTopicUpdate,
)

router = APIRouter(prefix="/learning", tags=["Learning"])


@router.get("", response_model=LearningTopicListResponse)
def list_topics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: TopicStatus | None = None,
    db: Session = Depends(get_db),
):
    repo = LearningTopicRepository(db)
    items, total = repo.get_all(skip=skip, limit=limit, status=status)
    return LearningTopicListResponse(
        items=[LearningTopicResponse.model_validate(i) for i in items],
        total=total,
    )


@router.get("/{topic_id}", response_model=LearningTopicResponse)
def get_topic(topic_id: int, db: Session = Depends(get_db)):
    repo = LearningTopicRepository(db)
    topic = repo.get_by_id(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return LearningTopicResponse.model_validate(topic)


@router.post("", response_model=LearningTopicResponse, status_code=201)
def create_topic(data: LearningTopicCreate, db: Session = Depends(get_db)):
    repo = LearningTopicRepository(db)
    topic = repo.create(data)
    return LearningTopicResponse.model_validate(topic)


@router.patch("/{topic_id}", response_model=LearningTopicResponse)
def update_topic(
    topic_id: int, data: LearningTopicUpdate, db: Session = Depends(get_db)
):
    repo = LearningTopicRepository(db)
    topic = repo.update(topic_id, data)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return LearningTopicResponse.model_validate(topic)


@router.delete("/{topic_id}", status_code=204)
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    repo = LearningTopicRepository(db)
    if not repo.delete(topic_id):
        raise HTTPException(status_code=404, detail="Topic not found")
