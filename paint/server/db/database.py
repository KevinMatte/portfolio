"""
Holds Database class which provides postgres access
"""
import os
import re
import time
import logging
from typing import List, Dict
from werkzeug.exceptions import BadRequest, NotFound
import mysql.connector

LOGGER = logging.getLogger('api_read')
LOGGER.setLevel(os.environ.get('LOGGER_LEVEL', LOGGER.getEffectiveLevel()))

# For sql column selectors.
# Extracts simple field names from table selectors or optional 'as' statement.
FIELD_MATCH = re.compile(r'(.* as "(?P<n1>.*)")|(.* as (?P<n2>.*))|(.*\.(?P<n3>.*))|(?P<n4>.*)')


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

    def __init__(self, database, user, password, host='localhost', port=5432, db_settings=None, retries=-1, retry_sleep_secs=15):
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
        self.connect_info_str = f"dbname='{database}' user='{user}' host='{host}'".format(**self.connect_parms)

    def connect(self):
        """Retrieves the database connection context and creates self.cursor"""

        retries = self.retries

        while not self.conn and retries != 0:
            try:
                self.conn = mysql.connector.connect(**self.connect_parms)
                LOGGER.debug("Connected to database with %s", str(self.connect_parms))
            except mysql.Error:
                LOGGER.error("Failed to connect to database with %s", self.connect_info_str)
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

    def fetch_all(self, statement_template, **kwargs):
        """Returns all results of an SQL query

        :param statement_template: SQL statement  with optional named {}'s (used with *kwargs*).
        :param kwargs: Keyword arguments to be applied to *statement_template*
        :return: SQL rows are returned (via *cursor.execute*)
        """

        if kwargs:
            statement = statement_template.format(**kwargs)
        else:
            statement = statement_template

        LOGGER.debug("SQL: %s", statement)
        self.cursor.execute(statement)

        rows = self.cursor.fetchall()  # type: List
        return rows

    def fetch_all_ids(self, statement_template, **kwargs):
        """Returns an array of every row's first column."""

        rows = self.fetch_all(statement_template, **kwargs)
        ids = [row[0] for row in rows]  # type: List[int]

        return ids

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
