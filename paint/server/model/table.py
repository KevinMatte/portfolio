import bcrypt
from werkzeug.exceptions import NotFound

from db.database import Database, escape_string
from utils.settings import get_app_setting


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