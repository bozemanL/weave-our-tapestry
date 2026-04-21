import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy.orm import Session


from ..database.model import User

PEPPER = os.getenv("PEPPER","")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

#get salt
def generate_salt() -> str:
    return secrets.token_hex(16)

#hasing: password + salt + papper
def hash_password_sha256(password: str, salt: str) -> str:
    hashed = f"{password}{salt}{PEPPER}"
    return hashlib.sha256(hashed.encode("utf-8")).hexdigest()

def register_user(db: Session, username: str, email: str, password: str):

    #check for existing emails
    existing_email = db.query(User).filter(User.email == email).first()

    if existing_email:
        return None, "Already registered email"
    
    #check for existing username
    existing_username = db.query(User).filter(User.username == username).first()

    if existing_username:
        return None, "Already registered username"
    
    salt = generate_salt()
    hashed_password = hash_password_sha256(password, salt)

    user = User(
        username = username,
        email = email,
        password_salt = salt,
        hashed_password = hashed_password,
    )
    
    #update database
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, None

def authenticate_user(db: Session, email: str, password: str):

    #check if user email exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None, "Failed to authenticate"
    
    #check if hashed password
    attempted_hash = hash_password_sha256(password, user.password_salt)

    if attempted_hash != user.hashed_password:
        return None, "Failed to authenticate"
    
    return user, None

# Creates a JSON web token so that we can check if a user is logged in.
def create_access_token(user_id: int, username: str) -> str:
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# This function checks if the token is legitimate by verifying the signature matches, checks that the
# exp hasn't passed.
# If anything is wrong then PyJWT raises an exception.
def verify_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None






