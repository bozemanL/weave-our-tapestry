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

MAX_FAILED_ATTEMPTS = 3
LOCKOUT_MINUTES = 2

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
        return None, "Failed to authenticate", None, None

    now = datetime.now(timezone.utc)

    # Reject without checking the password if the account is currently locked.
    if user.locked_until is not None:
        locked_until = user.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if locked_until > now:
            remaining = int((locked_until - now).total_seconds())
            return None, "Account temporarily locked", max(remaining, 1), None
        # Lockout window has expired — reset the counter and continue.
        user.locked_until = None
        user.failed_login_attempts = 0
        db.commit()

    attempted_hash = hash_password_sha256(password, user.password_salt)

    if attempted_hash != user.hashed_password:
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            return None, "Account temporarily locked", LOCKOUT_MINUTES * 60, None
        attempts_remaining = MAX_FAILED_ATTEMPTS - user.failed_login_attempts
        db.commit()
        return None, "Failed to authenticate", None, attempts_remaining

    if user.failed_login_attempts or user.locked_until is not None:
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()

    return user, None, None, None

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






