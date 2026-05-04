"""
API Routes Layer(HTTP Endpoints)
File Desription: Defines URLs/endpoints for frontend to call

Objectives:
- Define HTTP endpoints
- Validate request inputs
- Call DB and feature logic
- Return JSON responses
- Add GET /api/stories/{id}
- Improve error handling
- Add /api/search endpoint
- Add sorting parameters
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from pydantic import BaseModel
from typing import Optional, List

from ..database.db import SessionLocal
from ..database.model import (
    UserLogin, UserRegister, UserOut, TokenResponse, User, Story,
    CommentCreate, CommentOut,
)
from ..features.engagement import increment_story_views
from ..features.stories import list_all_stories, get_story_by_id, create_new_story
from ..features.comments import list_comments_for_story, create_comment
from ..features.auth import authenticate_user, register_user, create_access_token, verify_access_token

router = APIRouter(prefix="/api", tags=["api"])

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

bearer_scheme = HTTPBearer()

# Auth dependency: pulls the Bearer token from the Authorization header,
# verifies it, and loads the matching user. Raises 401 on any failure.
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

#API contract
class StoryCreate(BaseModel):
    title: str
    culture: Optional[str] = None
    year: Optional[int] = None
    text: str

class StoryOut(BaseModel):
    id: int
    title: str
    culture: Optional[str] = None
    country: Optional[str] = None
    year: Optional[int] = None
    category: Optional[str] = None
    text: str
    views: int
    author: str = "N/A"

    class Config:
        from_attributes = True


class SearchResultItem(BaseModel):
    id: int
    title: str
    culture: Optional[str] = None
    snippet: str
    views: int

class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]



@router.get("/stories", response_model=List[StoryOut])
def list_stories(db: Session = Depends(get_db)):
    return list_all_stories(db)

#receives story_id from URL + queries DB for ID
@router.get("/stories/{story_id}", response_model = StoryOut)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = get_story_by_id(db, story_id)
    if story is None:
        raise HTTPException(status_code = 404, detail = "Story not found")
    return story


#registers GET endpoint for search
@router.get("/search", response_model = SearchResponse)
def search_stories(
    q: str = Query(..., min_length = 1), #required at least 1 text
    limit: int  = Query(10, ge = 1, le = 100), #items per page 1-100
    offset: int = Query(0 , ge = 0), #items to skip
    sort: str = Query("views" , pattern = "^(views|newest|relevance)$"), 
    db: Session = Depends(get_db), 
):
    
    query_text = q.strip() #removes space
    if not query_text:
        raise HTTPException(status_code = 400, detail = "Search query cannot be empty")
    
    pattern = f"%{query_text}%" #matches texts

    #search filter => ilike: case-insensitive match in Postgres
    filters = or_(
        Story.title.ilike(pattern),
        Story.culture.ilike(pattern),
        Story.text.ilike(pattern),
    )

    #find how many searches match
    total = db.query(func.count(Story.id)).filter(filters).scalar() or 0

    #sort
    if sort == "newest":
        order_by = (Story.id.desc(),)
    else:
        order_by = (Story.views.desc(), Story.id.desc())

    #db query
    rows = (
        db.query(Story)
        .filter(filters)
        .order_by(*order_by)
        .offset(offset)
        .limit(limit)
        .all()
    )

    #display result snippets until user decide to open or not
    results: List[SearchResultItem] = []
    for s in rows:
        raw = s.text or ""
        snippet = raw[:160].strip() + ("..." if len(raw) > 160 else "")
        results.append(
            SearchResultItem(
                id = s.id,
                title = s.title,
                culture = s.culture,
                snippet = snippet,
                views = s.views,
            )
        )
        #return typed Pydantic object
    return SearchResponse(query = query_text, total = int(total),  results = results)

 


@router.post("/stories", response_model=StoryOut)
def create_story(
    payload: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # pass the logged-in user's username so it gets stored with the story
    return create_new_story(db, payload, author=current_user.username)

@router.post("/stories/{story_id}/views")
def increment_views(story_id: int, db:Session = Depends(get_db)):
    #OLD: story = db.query(Story).filter(Story.id == story_id).first()
    story = increment_story_views(db, story_id)
    if story is None:
        raise HTTPException(status_code = 404, detail = "Story not found")
    return {"id" : story.id, "views": story.views}


@router.get("/stories/{story_id}/comments", response_model=List[CommentOut])
def list_story_comments(story_id: int, db: Session = Depends(get_db)):
    if get_story_by_id(db, story_id) is None:
        raise HTTPException(status_code=404, detail="Story not found")
    rows = list_comments_for_story(db, story_id)
    return [
        CommentOut(
            id=r.id,
            story_id=r.story_id,
            text=r.text,
            author=r.user.username,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post(
    "/stories/{story_id}/comments",
    response_model=CommentOut,
    status_code=201,
)
def post_story_comment(
    story_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if get_story_by_id(db, story_id) is None:
        raise HTTPException(status_code=404, detail="Story not found")
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Comment text is required")
    comment = create_comment(
        db,
        story_id=story_id,
        user_id=current_user.id,
        text=text,
    )
    return CommentOut(
        id=comment.id,
        story_id=comment.story_id,
        text=comment.text,
        author=current_user.username,
        created_at=comment.created_at,
    )

@router.post("/auth/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user, error = register_user(db, payload.username, payload.email, payload.password)

    if error:
        raise HTTPException(status_code=400, detail=error)

    token = create_access_token(user.id, user.username)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )

@router.post("/auth/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user, error, retry_after, attempts_remaining = authenticate_user(db, payload.email, payload.password)

    if retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail={
                "message": f"Too many failed login attempts. Try again in {retry_after} seconds.",
                "retry_after": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )

    if error:
        if attempts_remaining is not None:
            attempt_word = "attempt" if attempts_remaining == 1 else "attempts"
            raise HTTPException(
                status_code=401,
                detail={
                    "message": f"Invalid information. {attempts_remaining} {attempt_word} remaining.",
                    "attempts_remaining": attempts_remaining,
                },
            )
        raise HTTPException(status_code=401, detail="Invalid information")

    token = create_access_token(user.id, user.username)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )

@router.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

    




        
