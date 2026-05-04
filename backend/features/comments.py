from sqlalchemy.orm import Session, joinedload

from ..database.model import Comment


def list_comments_for_story(db: Session, story_id: int):
    return (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.story_id == story_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )


def create_comment(db: Session, story_id: int, user_id: int, text: str) -> Comment:
    comment = Comment(story_id=story_id, user_id=user_id, text=text)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
