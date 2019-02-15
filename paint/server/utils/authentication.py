import datetime
import os
from functools import wraps

import jwt
import requests
from flask import request
from werkzeug.exceptions import Unauthorized

from db.database import Database
from drawing.drawing import User
from utils.config import get_logger
import secrets

# Error handler
SUPER_SECRET_KEY = "This is a secre ... oops. Almost said 9."
LOGGER = get_logger('WTE')


class AuthError(Exception):
    """The exception this module raises on any error."""

    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


# Format error response and append status code
def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header
    """
    auth = request.headers.get("Authorization")
    if not auth:
        raise AuthError({
            "code": "authorization_header_missing",
            "description": "Authorization header is expected.",
        },
            401)

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError({"code": "invalid_header",
                         "description":
                             "Authorization header must start with"
                             " Bearer"}, 401)
    elif len(parts) == 1:
        raise AuthError({"code": "invalid_header",
                         "description": "Token not found"}, 401)
    elif len(parts) > 2:
        raise AuthError({"code": "invalid_header",
                         "description":
                             "Authorization header must be"
                             " Bearer token"}, 401)

    token = parts[1]
    return token


def requires_auth(f):
    """Function decorator on Flask routes. Determines if the Access Token is valid
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        if not token:
            raise AuthError({"code": "invalid_header",
                             "description": "Missing authentication"}, 400)
        try:
            token_obj = jwt.decode(token, SUPER_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthError('Signature expired. Login please', 440)
        except jwt.InvalidTokenError:
            raise AuthError('Invalid authentication. Login please', 403)
        if not token_obj:
            raise AuthError({"code": "invalid_token",
                             "description": "Invalid Access"}, 401)

        return f(*args, **kwargs)

    return decorated


def get_user_token(email, user_id, password):
    """Creates a token for the UI to use on all its API requests that require authentication.

    Also, completes the UC Service Validation process and verifies the user belongs to a
    group that may access the WFS App.
    """

    with User() as user_table:
        if email:
            user = user_table.get(email=user_id)
        else:
            user = user_table.get(userid=user_id)
        if password != user['password']:
            raise Unauthorized()

    certificate = secrets.token_hex(16)
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, hours=4),
        'iat': datetime.datetime.utcnow(),
        'certificate': certificate,
        'user_id': user['id']
    }
    token = jwt.encode(payload, SUPER_SECRET_KEY, algorithm='HS256')

    response = {
        'status': 'success',
        'auth_token': token.decode('utf-8')
    }

    return response
