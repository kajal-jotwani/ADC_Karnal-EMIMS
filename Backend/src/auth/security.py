"""
Security utilities for authentication
Handles password hashing, JWT tokens, and security validations
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import uuid
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
import secrets
from fastapi import HTTPException, status


from src.config import Config

SECRET_KEY = Config.SECRET_KEY
ALGORITHM = Config.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = Config.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = Config.REFRESH_TOKEN_EXPIRE_DAYS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityManager:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plaintext password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plaintext password against the hashed version"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access",
            "jti": str(uuid.uuid4())
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "jti": str(uuid.uuid4())
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify a JWT token and return the payload"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            #verify token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid {token_type} token",
                )
            
            #ensure jti exists
            if "jti" not in payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token structure",
                )
            
            return payload
        
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"{token_type.capitalize()} token has expired",
            )

        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials",
            )
        
    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure random token for password resets"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure random token for email verification"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_password_strength(password: str) -> bool:
        """Validate password strength"""
        if len(password) < Config.PASSWORD_MIN_LENGTH:
            return False
            # for demo purposes I have commented the checks 
            #uncomment this when using for prod 

            #has_upper = any(c.isupper() for c in password)
            #has_lower = any(c.islower() for c in password)
            #has_digit = any(c.isdigit() for c in password)
            #has_special = any(c in string.punctuation for c in password)    

            #return has_upper and has_lower and has_digit and has_special
        
        return True

security = SecurityManager()