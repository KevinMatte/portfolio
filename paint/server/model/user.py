import datetime
import secrets

import bcrypt
import jwt

from model.table import Table
from utils.authentication import SUPER_SECRET_KEY


class User(Table):
    table_name = 'user'

    def __init__(self):
        super(User, self).__init__(
            self.table_name,
            {
                'id':int,
                'userid':str,
                'name': str,
                'email': str,
                'password': 'password',
            })

    @classmethod
    def register(cls, email=None, user_id=None, password=None, name=None):

        with User() as user_table:
            if email and user_table.list(email=email):
                return 'failure', {
                    'field': 'register/email',
                    'message': f'User with this email already exists: {email}',
                }
            if user_id and user_table.list(userid=user_id):
                return 'failure', {
                    'field': 'register/userid',
                    'message': f'User with this user ID already exists: {user_id}',
                }

            user = user_table.create(userid=user_id, email=email, name=name, password=password)

        token = cls.create_auth_token(user)
        return 'success', token

    @classmethod
    def login(cls, email, user_id, password):
        """Creates a token for the UI to use on all its API requests that require authentication.

        Also, completes the UC Service Validation process and verifies the user belongs to a
        group that may access the WFS App.
        """

        with User() as user_table:
            if email:
                users = user_table.list(email=email)
            elif user_id:
                users = user_table.list(userid=user_id)
            else:
                users = None

            if not users:
                return 'failure', 'Authentication failed.'
            user = users[0]

            try:
                if not bcrypt.checkpw(password, user['password']):
                    return 'failure', 'Authentication failed.'
            except:
                return 'failure', 'Authentication failed.'

        token = cls.create_auth_token(user)

        return 'success', token

    @classmethod
    def create_auth_token(cls, user):
        certificate = secrets.token_hex(16)
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, hours=4),
            'iat': datetime.datetime.utcnow(),
            'certificate': certificate,
            'user_id': user['id']
        }
        token = jwt.encode(payload, SUPER_SECRET_KEY, algorithm='HS256')
        return token.decode('utf-8')