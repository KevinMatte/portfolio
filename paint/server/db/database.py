"""
Holds Database class which provides postgres access
"""
import os
import re
import time
import logging
import traceback
from typing import List, Dict

import MySQLdb
from mysql.connector import ProgrammingError
from werkzeug.exceptions import BadRequest, NotFound
import mysql.connector

LOGGER = logging.getLogger('api_read')
LOGGER.setLevel(os.environ.get('LOGGER_LEVEL', LOGGER.getEffectiveLevel()))

# For sql column selectors.
# Extracts simple field names from table selectors or optional 'as' statement.
FIELD_MATCH = re.compile(r'(.* as "(?P<n1>.*)")|(.* as (?P<n2>.*))|(.*\.(?P<n3>.*))|(?P<n4>.*)')


def escape_string(value):
    return MySQLdb.escape_string(value).decode('utf-8') if value is not None else None


class Database:
    """Converis Database access

    config:

    DB_RETRIES: Number of retry attempts until failure and server exits. -1 = Infinite.

    DB_RETRY_SLEEP: How long to sleep between failed connection attempts.

    DB_NAME: The name of the database.

    DB_USER: The user of the database.

    DB_HOST: The host of the database.

    DB_PASSWORD: The password of the database.

    """

    def __init__(self, database, user, password, host='localhost', port=3306, db_settings=None, retries=-1, retry_sleep_secs=15):
        self.conn = None
        self.cursor = None
        self.retries = retries
        self.retry_sleep_secs = retry_sleep_secs
        self.connect_parms = {
            'database': database,
            'user': user,
            'password': password,
            'host': host,
            'port': port,
        }

    def connect(self):
        """Retrieves the database connection context and creates self.cursor"""

        retries = self.retries

        while not self.conn and retries != 0:
            try:
                self.conn = mysql.connector.connect(**self.connect_parms)
                LOGGER.debug("Connected to database with %s", str(self.connect_parms))
            except:
                LOGGER.error("Failed to connect to database with %s", self.connect_parms)
                self.conn = None

                time.sleep(self.retry_sleep_secs)
                if retries > 0:
                    retries -= 1
                elif retries == 0:
                    return None

        if self.conn:
            self.cursor = self.conn.cursor()

        return self.conn

    def disconnect(self):
        """Close the database connection"""

        if self.conn:
            self.cursor.close()
            self.conn.commit()
            self.conn.close()
            self.conn = None
            self.cursor = None

    def __enter__(self):
        """'with' Controlled execution entrance"""
        self.connect()

        return self

    def __exit__(self, the_type, value, traceback):
        """'with' Controlled execution exit"""

        self.disconnect()


    def fetch_objects(self, statement_template, column_names):
        rows = self.fetch_all(statement_template)
        objects = self.make_rows_of_objects(column_names, rows)

        return objects

    def add_row(self, statement_template):
        statement = statement_template

        LOGGER.debug("SQL: %s", statement)
        self.execute(statement)
        self.execute('SELECT LAST_INSERT_ID()')
        new_id = self.cursor.fetchall()[0][0]

        return new_id


    def execute(self, statement):
        LOGGER.debug("SQL: %s", statement)
        try:
            self.cursor.execute(statement)
        except ProgrammingError as error:
            print(f'{error.__class__.__name__}: {error}')
            traceback.print_tb(error.__traceback__)
            raise RuntimeError(f'Failed to execute SQL: {statement}')
        return


    def fetch_all(self, statement_template):
        """Returns all results of an SQL query

        :param statement_template: SQL statement  with optional named {}'s (used with *kwargs*).
        :return: SQL rows are returned (via *cursor.execute*)
        """

        statement = statement_template

        LOGGER.debug("SQL: %s", statement)
        self.execute(statement)

        rows = self.cursor.fetchall()  # type: List
        return rows

    def fetch_all_ids(self, statement_template, id_column=0):
        """Returns an array of every row's first column."""

        rows = self.fetch_all(statement_template)
        a_list = [row[id_column] for row in rows]  # type: List[any]

        return a_list

    @staticmethod
    def make_rows_of_objects(column_names, rows):
        """Converts rows of values into rows of mapped values.
        column_names: An array of SQL selectors.
                      if a selector is 'xxx as aName', 'aName' is used as the key.
                      if a selector is 'y.aName', 'aName' is used as the key.
                      if a selector is 'aName', 'aName' is used as the key.
        rows: list of lists of values. The values must be in the same order as 'column_names'.
        """

        # Get simple field name.
        new_column_names = []
        for name in column_names:
            match = FIELD_MATCH.match(name)
            new_column_names.append(match.group('n1') or match.group('n2') or match.group('n3') or match.group('n4'))
        new_column_names.reverse()

        rows_of_objects = []  # type: List[Dict]
        for row in rows:
            row = list(row)
            value = {columnName: row.pop() for columnName in new_column_names}
            rows_of_objects.append(value)

        return rows_of_objects


if __name__ == '__main__':
    from utils.settings import get_app_setting
    with Database(
            get_app_setting('SQL_DATABASE'),
            get_app_setting('SQL_USERID'),
            get_app_setting('SQL_PASSWORD'),
    ) as db:
        users = db.fetch_all('SELECT * FROM user')
        for user in users:
            print(user)

        user_id = 1
        name = 'dunky'
        new_id = db.add_row(f"INSERT INTO drawing(userid, name) VALUES('{user_id}', '{name}')")
        print(new_id)
