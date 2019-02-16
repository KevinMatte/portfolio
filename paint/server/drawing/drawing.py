import datetime
import secrets

import bcrypt
import jwt
from werkzeug.exceptions import NotFound, Unauthorized, HTTPException

from db.database import Database, escape_string
from utils.authentication import SUPER_SECRET_KEY
from utils.settings import get_app_setting
import MySQLdb


class Table(object):

    def __init__(self, table_name, types_by_name):
        self.table_name = table_name
        self.column_names = list(types_by_name.keys())
        self.types_by_name = types_by_name
        self.db = None

    def __enter__(self):
        """'with' Controlled execution entrance"""

        self.db = Database(
                get_app_setting('SQL_DATABASE'),
                get_app_setting('SQL_USERID'),
                get_app_setting('SQL_PASSWORD')
        )
        self.db.connect()

        return self

    def __exit__(self, the_type, value, traceback):
        """'with' Controlled execution exit"""

        self.db.disconnect()

    def get(self, *args, **kwargs):
        rows = self.list(*args, **kwargs)
        if not rows:
            raise NotFound(f'Not found')

        return rows[0]

    def list(self, row_id=None, **kwargs):
        if row_id is not None:
            rows = self.db.fetch_objects(
                f'SELECT {", ".join(self.column_names)} FROM {self.table_name} WHERE id={row_id}',
                self.column_names,
            )
        else:
            where_values = []
            for name, value in zip(*self.get_names_and_values(kwargs)):
                where_values.append(f'{name}={value}')
            where_values = ' AND '.join(where_values)
            where_clause = f'WHERE {where_values}' if where_values else ''
            rows = self.db.fetch_objects(
                f'SELECT {", ".join(self.column_names)} FROM {self.table_name} {where_clause}',
                self.column_names,
            )

        return rows

    def create(self, **kwargs):
        names, values = self.get_names_and_values(kwargs, skip_if_none=True)
        names = ','.join(names)
        values = ','.join(values)

        row_id = self.db.add_row(f"INSERT INTO {self.table_name}({names}) VALUES({values})")
        return self.get(row_id)

    def update(self, where_clause=None, **kwargs):
        if isinstance(where_clause, int):
            where_clause = f'id={where_clause}'

        set_values = []
        for name, value in zip(*self.get_names_and_values(kwargs)):
            set_values.append(f'{name}={value}')
        set_values = ', '.join(set_values)

        self.db.execute(f"UPDATE {self.table_name} SET {set_values} WHERE {where_clause}")

        return

    def get_names_and_values(self, kwargs, skip_if_none=False):
        values = []
        names = []
        for name, value in kwargs.items():
            value_type = self.types_by_name.get(name) or str
            if value is None:
                if skip_if_none:
                    continue
                else:
                    value_str = 'null'
            elif isinstance(value_type, str):
                value = escape_string(value)
                if value_type == 'password':
                    value_str = f"'{bcrypt.hashpw(value, bcrypt.gensalt())}'"
                else:
                    value_str = f"'{value}'"
            elif value_type is str:
                value = escape_string(value)
                value_str = f"'{value}'"
            else:
                value_str = str(value)

            names.append(name)
            values.append(value_str)

        return names, values

    def delete(self, row_id_or_ids):
        if isinstance(row_id_or_ids, list):
            row_id_or_ids = ','.join(row_id_or_ids)

        self.db.execute(f"DELETE FROM {self.table_name} where id in ({row_id_or_ids})")

        return

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
                return 'failure', f'User with this email already exists: {email}'
            if user_id and user_table.list(userid=user_id):
                return 'failure', f'User with this user ID already exists: {user_id}'

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


class Drawing(Table):
    table_name = 'drawing'

    def __init__(self):
        super(Drawing, self).__init__(self.table_name, {'id':int, 'userid':int, 'name': str})

class Graph(Table):
    table_name = 'graph'

    def __init__(self):
        super(Graph, self).__init__(self.table_name, {'id':int, 'type':str, 'name':str, 'drawingid':int})

class Vector3(Table):
    table_name = 'vector3'

    def __init__(self):
        super(Vector3, self).__init__(
            self.table_name,
            {
                'id':int,
                'graphid':int,
                'type':str,
                'name':str,
                'x1':int,
                'x2':int,
                'x3':int
            }
        )


