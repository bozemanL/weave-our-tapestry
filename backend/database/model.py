"""
Database Models
File Description: Defines what a “Story” looks like in the database - blueprint for storing data

- Defines database tables.
- Add views column (default=0)
- Add rating support
"""


from sqlalchemy import Column, Integer, String, Text, DateTime
from .db import Base
from pydantic import BaseModel

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    culture = Column(String, nullable=True)
    year = Column(Integer, nullable = True)
    text = Column(Text, nullable=False)
    views = Column(Integer, default = 0, nullable = False)
    like_count = Column(Integer, default=0)
    author = Column(String, nullable=False, default="N/A")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_salt =  Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut



