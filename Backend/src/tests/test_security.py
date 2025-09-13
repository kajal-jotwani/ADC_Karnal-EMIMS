# test_security_verbose.py
"""
Simple test script to check security.py functions
Prints hashes, tokens, and other outputs
"""

import sys
from datetime import timedelta
sys.path.append("src")

from src.auth.security import security

def run_tests():
    # 1️⃣ Password hashing
    password = "myTestPassword123"
    hashed = security.hash_password(password)
    print(f"Original password: {password}")
    print(f"Hashed password:   {hashed}")
    print(f"Verify correct:    {security.verify_password(password, hashed)}")
    print(f"Verify wrong:      {security.verify_password('wrongPassword', hashed)}\n")

    # 2️⃣ Access token
    user_data = {"sub": "user123", "email": "test@example.com", "type": "access"}
    access_token = security.create_access_token(user_data)
    print(f"Access token:      {access_token}")
    decoded_access = security.verify_token(access_token, "access")
    print(f"Decoded access:    {decoded_access}\n")

    # 3️⃣ Refresh token
    refresh_data = {"sub": "user123", "type": "refresh"}
    refresh_token = security.create_refresh_token(refresh_data)
    print(f"Refresh token:     {refresh_token}")
    decoded_refresh = security.verify_token(refresh_token, "refresh")
    print(f"Decoded refresh:   {decoded_refresh}\n")

    # 4️⃣ Random tokens
    reset_token = security.generate_reset_token()
    verify_token = security.generate_verification_token()
    print(f"Reset token:       {reset_token}")
    print(f"Verification token:{verify_token}\n")

    # 5️⃣ Password strength
    print(f"Password '123' strong? {security.validate_password_strength('123')}")
    print(f"Password 'StrongPassword123!' strong? {security.validate_password_strength('StrongPassword123!')}")

    print("\n🎉 All functions ran successfully!")

if __name__ == "__main__":
    run_tests()
