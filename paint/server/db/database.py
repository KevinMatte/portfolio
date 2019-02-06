"""
Holds Database class which provides postgres access
"""
import os
import re
import time
import logging
from typing import List, Dict
from werkzeug.exceptions import BadRequest, NotFound

import psycopg2
from config.default_settings import DEFAULT_LANG

DATA_COLUMN_NAMES = ['id', 'typename', 'entitytype', 'tenantid', 'Status', 'created_on as "Created on"',
                     'created_by as "Created by"', 'Updated_on as "Updated on"', 'Updated_by as "Updated by"',
                     'Public_visible', 'Intern_visible', 'Public_manual', 'Intern_manual',
                     'sd_1 as Short_description', 'sd_2', 'sd_3', 'fd_1 as FShort_description', 'fd_2', 'fd_3', ]

LINK_COLUMN_NAMES = ['id', "typename", "leftentity", "rightentity", "linkentitytype as entitytype",
                     'created_on as "Created on"', 'created_by as "Created by"', 'Updated_on as "Updated on"',
                     'Updated_by as "Updated by"', 'left_seq as "Left seq"', 'right_seq as "Right seq"', ]

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

    def __init__(self, db_settings):
        self.conn = None
        self.cursor = None
        self.retries = db_settings.get('DB_RETRIES', -1)
        self.retry_sleep_secs = db_settings.get('DB_RETRY_SLEEP', 15)
        self.connect_parms = db_settings.get('DB_CONNECT_PARMS', {
            'database': db_settings.get('DB_NAME', 'converis'),
            'user': db_settings.get('DB_USER', 'converisadmin'),
            'password': db_settings.get('DB_PASSWORD', None),
            'host': db_settings.get('DB_HOST', 'localhost'),
            'port': db_settings.get('DB_PORT', 5432),
        })
        self.connect_info_str = "dbname='{database}' user='{user}' host='{host}'".format(**self.connect_parms)

    def connect(self):
        """Retrieves the database connection context and creates self.cursor"""

        retries = self.retries

        while not self.conn and retries != 0:
            try:
                self.conn = psycopg2.connect(**self.connect_parms)
                LOGGER.debug("Connected to database with %s", str(self.connect_parms))
            except psycopg2.Error:
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

    def get_choice_group(self, name, from_value=None):
        """Returns a structure describing a choicegroup with its values."""

        if from_value:
            sql = f'select name from choicegroup as cg, choicegroupvalue as cgv where cgv.choicegroup = cg.id AND cgv.id = {from_value}'
            rows = self.fetch_all(sql)
            name = rows[0][0]

        column_names = ['id', 'name', 'step', 'is_tree', 'editable_by_admin']
        sql = ("select {columns} from choicegroup"
               " where name = '{name}'").format(columns=", ".join(column_names), name=name)
        rows = self.fetch_all(sql)
        choice_group = self.make_rows_of_objects(column_names, rows)[0]

        column_names = ['id', 'cgvalue', 'is_selectable', 'step', 'parent_cgv']
        sql = ("select {columns} from choicegroupvalue"
               " where choicegroup = {id}").format(columns=", ".join(column_names), id=choice_group['id'])
        rows = self.fetch_all(sql)
        values = self.make_rows_of_objects(column_names, rows)
        choice_group['values'] = {value.pop('id'): value for value in values}

        return choice_group

    def get_converis_user(self, login):
        """Retrieves user information for a login id."""

        column_names = [
            "id",
            "is_active",
            "is_config_admin",
            "to_char(created_on, 'YYYY-MM-DD HH24:MI:SS.US') as created_on",
            "email",
            "fail_count",
            "first_login",
            "first_name",
            "internal_user",
            "to_char(last_loggedin, 'YYYY-MM-DD HH24:MI:SS.US') as last_loggedin",
            "last_name",
            "last_pw_changed_on",
            "login",
            "photo_id",
            "is_super_admin",
            "is_system_admin",
            "tenantid",
            "language",
            "tc_active",
        ]
        sql = "SELECT {columns} FROM converisuser WHERE is_active=true AND login='{login}'".format(
            columns=", ".join(column_names),
            login=login,
        )
        rows = self.fetch_all(sql)
        converis_roles = self.make_rows_of_objects(column_names, rows)

        return converis_roles

    @staticmethod
    def _merge_approvers(approvers, org_approvers):
        """
        Merges the results of one list_approvers with another.
        :param approvers: Approver set to update.
        :param org_approvers: A set of approvers for an organization.
        """
        for approver_rec in org_approvers:
            login = approver_rec['login']
            rec = approvers.get(login, None)

            if rec is None:
                rec = approver_rec
                approvers[login] = rec
            else:
                rec['org_roles'] += approver_rec['org_roles']

    def list_orgas_for_user_with_role(self, ucid, role_name):
        """
        Finds all organisations for a user (ucid) for a given role.
        :param ucid: The user's ucid.
        :param role_name: The role to search for.
        """
        sql = ("SELECT DISTINCT t1.dataentity FROM converisuser t0 "
               "LEFT OUTER JOIN convuserhaspremrole t1 ON (t1.converisuser = t0.ID) "
               "LEFT OUTER JOIN premiumrole t2 ON (t2.ID = t1.premiumrole) "
               "WHERE t0.login='{ucid}' AND t0.is_active=true AND t2.name = '{role_name}'"
               ).format(
            ucid=ucid,
            role_name=role_name
        )
        rows = self.fetch_all(sql)
        return [row[0] for row in rows]

    def list_approvers(self, roles, orgid, search_hierarchy=None, roles_found=None):
        """Lists all cards of approvers for a given role and entry point organisation id
        Added to the card rec is 'org_roles', which contains a list of organizations and roles
        the approver belongs to.
        :param roles: Role names to search for.
        :param orgid: Organisation id to start search at.
        :param search_hierarchy: One of:
           None: Search only given orgid's organization
           'up_first': find first per role in parent organizations
           'up': find all in parent organizations,
           'down_first': find first per role in child organizations
           'down': find all in child organizations,
        :param roles_found: Internal: Current roles found when doing recursive search up or down orga hierarchy.
        """

        if roles_found is None:
            roles_found = {}

        do_hierarchy_scan = False
        search_upwards = False
        stop_on_first_found = False
        if search_hierarchy is not None:
            do_hierarchy_scan = True
            if search_hierarchy.startswith('up'):
                search_upwards = True
            if search_hierarchy.endswith('first'):
                stop_on_first_found = True

        if isinstance(roles, str):
            role_sql = roles
            if role_sql.startswith('-'):
                role_sql = role_sql[1:]
                role_comparison = 'NOT IN'
            else:
                role_comparison = 'IN'
            role_set = role_sql.split(',')
        else:
            role_comparison, role_set = roles

        column_names = [
            "t0.login",
            "t2.name as role",
            "t0.id",
            "t0.is_active",
            "t0.is_config_admin",
            "to_char(t0.created_on, 'YYYY-MM-DD HH24:MI:SS.US') as created_on",
            "t0.email",
            "t0.fail_count",
            "t0.first_login",
            "t0.first_name",
            "t0.internal_user",
            "to_char(t0.last_loggedin, 'YYYY-MM-DD HH24:MI:SS.US') as last_loggedin",
            "t0.last_name",
            "t0.last_pw_changed_on",
            "t0.photo_id",
            "t0.is_super_admin",
            "t0.is_system_admin",
            "t0.tenantid",
            "t0.language",
            "t0.tc_active",
            "(select login from converisuser where id=t1.delegatedbyuser) as delegatedbyuser",
        ]
        sql = ("SELECT "
               "distinct {columns} "
               "FROM converisuser t0 "
               "LEFT OUTER JOIN convuserhaspremrole t1 ON (t1.converisuser = t0.ID) "
               "LEFT OUTER JOIN premiumrole t2 ON (t2.ID = t1.premiumrole) "
               "WHERE t0.is_active=true AND t1.dataentity='{orgid}' AND t2.name {roleop} {rolename}").format(
            columns=", ".join(column_names),
            orgid=orgid,
            roleop=role_comparison,
            rolename="('%s')" % "', '".join(role_set)
        )
        rows = self.fetch_all(sql)
        approver_recs = self.make_rows_of_objects(column_names, rows)
        approvers = {}
        next_role_set = set(role_set)
        if rows:
            for approver_rec in approver_recs:

                login = approver_rec['login']
                rec = approvers.get(login, None)

                roles_found[approver_rec['role']] = orgid
                role = approver_rec['role']
                org_role = {'org': orgid, 'role': role}
                if rec is None:
                    rec = approver_rec
                    rec['org_roles'] = [org_role]
                    approvers[login] = rec
                else:
                    rec['org_roles'].append(org_role)

                if stop_on_first_found:
                    if role_comparison == 'IN':
                        next_role_set.discard(role)
                    else:
                        next_role_set.add(role)

        if do_hierarchy_scan:
            if search_upwards:
                next_orga_ids = self.fetch_all_ids(
                    "select leftentity from linkentity"
                    " where typename='ORGA_has_child_ORGA' and rightentity={orgid}".format(orgid=orgid))
            else:
                next_orga_ids = self.fetch_all_ids(
                    "select rightentity from linkentity"
                    " where typename='ORGA_has_child_ORGA' and leftentity={orgid}".format(orgid=orgid))

            for next_orga_id in next_orga_ids:
                org_approvers = self.list_approvers(
                    (role_comparison, next_role_set),
                    next_orga_id,
                    search_hierarchy,
                    roles_found)
                self._merge_approvers(approvers, org_approvers)

        result = [approver for approver in approvers.values()]

        return result

    def list_converis_roles(self, login):
        """Retrieves role information for a login

        :param login: The Converis User login ID.

        :return: A list of records containing login, dataentitytype, dataentity id, and role name.
        """

        column_names = [
            "t0.id as converisuserid",
            "t0.login",
            "t0.internal_user",
            "t0.is_active",
            "t0.is_config_admin",
            "t0.is_super_admin",
            "t0.is_system_admin",
            "(select typename from dataentity where id=t1.dataentity) as dataentitytype",
            "t1.dataentity",
            "(select login from converisuser where id=t1.delegatedbyuser) as delegatedbyuser",
            "t1.delegatedbyuser as delegatedbyuserid",
            "t2.name",
        ]
        sql = ("SELECT t0.login, "
               "{columns} "
               "FROM converisuser t0 "
               "LEFT OUTER JOIN convuserhaspremrole t1 ON (t1.converisuser = t0.ID) "
               "LEFT OUTER JOIN premiumrole t2 ON (t2.ID = t1.premiumrole) "
               "WHERE t0.is_active=true AND t0.login='{login}'").format(
            columns=", ".join(column_names),
            login=login,
        )

        rows = self.fetch_all(sql)
        converis_roles = self.make_rows_of_objects(column_names, rows)

        return converis_roles

    def list_orgas_with_roles(self):
        """Lists all organizations that have converis user's attached as an entry point."""

        column_names = [
            "t1.dataentity as orga_id",
            "t0.login",
            "t0.first_name",
            "t0.last_name",
            "t2.name as role",
        ]
        sql = ("SELECT {columns}"
               " FROM converisuser t0"
               " LEFT OUTER JOIN convuserhaspremrole t1 ON (t1.converisuser = t0.ID)"
               " LEFT OUTER JOIN premiumrole t2 ON (t2.ID = t1.premiumrole)"
               " LEFT OUTER JOIN dataentity de on (de.id = t1.dataentity)"
               " WHERE t0.is_active=true AND de.typename = 'Organisation'")

        rows = self.fetch_all(sql, columns=", ".join(column_names))

        return self.make_rows_of_objects(column_names, rows)

    def list_entity_type_records(self, table, name_or_id=None):
        """Retrieves all entity types"""

        if table == 'dataentity':
            dtype = 'DataEntityType'
            column_names = [
                "bm.id",
                "dtype",
                "description",
                "editable",
                "name",
                "maximumstatus",
                '(select ad.name from attributedefinition as ad where typeselector=ad.id) as typeselector',
            ]
        else:
            dtype = 'LinkEntityType'
            column_names = [
                "bm.id",
                "dtype",
                "description",
                "editable",
                "name",
                "tree",
                "leftentity",
                "rightentity",
                "(select name from basemodelobject where id=leftentity) as left",
                "(select name from basemodelobject where id=rightentity) as right",
            ]

        sql = "SELECT {columns}" \
              " FROM basemodelobject as bm, {table}type as de" \
              " WHERE dtype='{dtype}' AND bm.id=de.id"

        # Add name_or_id to sql if provided.
        if name_or_id:
            try:
                name_or_id = int(name_or_id)
                sql = f"{sql} and bm.id={name_or_id}"
            except ValueError:
                if "%" in name_or_id:
                    sql = f"{sql} and name LIKE '{name_or_id}'"
                else:
                    sql = f"{sql} and name = '{name_or_id}'"

        # Retrieve the data.
        rows = self.fetch_all(sql, columns=", ".join(column_names), table=table, dtype=dtype, name_or_id=name_or_id)
        entity_types = self.make_rows_of_objects(column_names, rows)

        return entity_types

    def list_orga_hierarchy(self, dataentity, card_link_name, args=None):
        """Returns organisation information on a particular dataentitytype.

        dataentity: The id of the data entity and beginning point to search.

        card_link_name: If given, links the entity to a card, from which the organization will be found.
        """

        show_details = args and 'details' in args
        details = {}
        card_orgas = []
        dataentity = int(dataentity)

        cards = None  # type: List[int]
        if card_link_name is not None:
            cards = self.fetch_all_ids(
                "select rightentity from linkentity where typename='{card_link_name}' and leftentity={leftentity}",
                card_link_name=card_link_name,
                leftentity=dataentity,
            )

        if cards is not None:
            central_ids = []
            card_orgas = []
            for card in cards:
                cards_orgas = self.fetch_all_ids(
                    "select rightentity from linkentity where typename='CARD_has_ORGA' and leftentity={leftentity}",
                    leftentity=card,
                )
                central_ids += cards_orgas
                card_orgas += [(card, orga) for orga in cards_orgas]
        else:
            central_ids = [dataentity]

        def add_details(detail_orga_id):
            """Updates details, if required."""
            if show_details:
                if detail_orga_id not in details:
                    strings = self.get_entity_strings(detail_orga_id, ['cfName'])
                    details[detail_orga_id] = strings.get('cfName')

        if show_details:
            for orga_id in central_ids:
                add_details(orga_id)

        orga_pairs = set()

        all_parents = set()
        orga_ids = list(central_ids)
        while orga_ids:
            orga_id = orga_ids.pop()
            parents = self.fetch_all_ids(
                "select leftentity from linkentity where typename='ORGA_has_child_ORGA' and rightentity={rightentity}",
                rightentity=orga_id,
            )
            if not parents:
                pair = (orga_id, None)
                if pair not in orga_pairs:
                    orga_pairs.add(pair)
                    all_parents.add(orga_id)
            else:
                all_parents.update(set(parents))
                for parent in parents:
                    pair = (orga_id, parent)
                    if pair not in orga_pairs:
                        orga_pairs.add(pair)
                        orga_ids.append(parent)
                        add_details(parent)

        all_subchildren = set(central_ids)
        if 'subchildren' in args:
            orga_ids = list(central_ids)
            while orga_ids:
                orga_id = orga_ids.pop()
                subchildren = self.fetch_all_ids(
                    "select rightentity from linkentity "
                    "where typename='ORGA_has_child_ORGA' and leftentity={leftentity}",
                    leftentity=orga_id,
                )
                if not subchildren:
                    pair = (None, orga_id)
                    if pair not in orga_pairs:
                        orga_pairs.add(pair)
                        all_subchildren.add(orga_id)
                else:
                    all_subchildren.update(set(subchildren))
                    for subchild in subchildren:
                        pair = (subchild, orga_id)
                        if pair not in orga_pairs:
                            orga_pairs.add(pair)
                            orga_ids.append(subchild)
                            add_details(subchild)

        result = {
            "parents": list(all_parents),
            "children": list(all_subchildren),
            "card_orgas": card_orgas,
            "child_parent": {pair[0]: pair[1] for pair in orga_pairs if pair[0]},
            "parent_child": {pair[1]: pair[0] for pair in orga_pairs if pair[1]},
        }
        if show_details:
            result['details'] = details
        return result

    # noinspection PyUnusedLocal
    def find_bestcard(self, loginname, orgid):
        """Finds the closest card for the 'loginname' user to the organisation id.

        WIP: Currently just takes the first card and ignores the orgid.

        :param loginname: converis loginname
        :param orgid: The organisation id (for future implementation)
        :return: The Card id is returned.
        """

        entries = self.list_converis_roles(loginname)
        best_card = None
        for entry in entries:
            if entry['dataentitytype'] == 'Person':
                hier = self.list_orga_hierarchy(entry['dataentity'], 'PERS_has_CARD')
                if hier['card_orgas']:
                    # Issue 7: Don't just get the first one. Should check card's
                    # organisation in the orgid hierarchy.
                    best_card = hier['card_orgas'][0][0]
                    return best_card

        return best_card

    # noinspection PyTypeChecker
    def get_entity_type(self, name_or_id, table):
        """Retrieves names, dataType and attributes for an entity type.'

        A BadRequest is raised if name_or_id matches more than 1 entity type.
        A NotFound HTTP exception may be raised if no entity type is found.

        :param name_or_id: The name or ID of the entity. May be a wildcard. Uses self.list_entity_type_records().
        :param table: Either 'dataentity' or 'linkentity'
        """

        entity_types = self.list_entity_type_records(table, name_or_id)

        if len(entity_types) == 0:
            msg = "Entity Type not found: %s"
            LOGGER.error(msg, name_or_id)
            raise NotFound(msg % name_or_id)

        if len(entity_types) > 1:
            msg = "Unexpected number of entity_types for: %s found: [%s]"
            types_str = ", ".join([et['name'] for et in entity_types])
            LOGGER.error(msg, name_or_id, types_str)
            raise BadRequest(msg % (name_or_id, types_str))

        self.add_entity_type_attributes(entity_types[0])

        return entity_types[0]

    def add_entity_type_attributes(self, entity_type_rec: dict):
        """
        Sets entity_type['attributes'] to a dictionary of attribute definitions key by their attribute name.

        :param entity_type_rec: The data or link entity type record.
        """
        column_names = [
            'ad.id',
            'datatype as dataType',
            'default_expression',
            'description',
            'editable',
            'multilanguage',
            'ad.name as name',
            '(select cg.name from choicegroup as cg where choicegroup=cg.id) as choicegroup',
        ]
        sql = "SELECT {columns} FROM attributedefinition as ad WHERE owner={entity_type}"
        rows = self.fetch_all(sql,
                              columns=", ".join(column_names),
                              entity_type=entity_type_rec['id'])
        attributevalues = self.make_rows_of_objects(column_names, rows)
        entity_type_rec['attributes'] = {attr["name"]: attr for attr in attributevalues}

    def list_entities(self, name_or_id, table, args=None):
        """Returns all data entities for the type"""

        entity_types = self.list_entity_type_records(table, name_or_id)

        entities = []
        for entity_type in entity_types:
            self.add_entity_type_attributes(entity_type)

            entity_ids = None
            if 'ids' in args:
                entity_ids = args['ids']
                if entity_ids != '':
                    entity_ids = [int(entity_id) for entity_id in entity_ids.split(',')]
                else:
                    continue

            if 'name' in args:
                attr_name = args['name']
                attr_value = args['value']
                search_entity_ids = self.get_entity_ids_with_value(table, entity_type['id'], attr_name, attr_value,
                                                                   args)
                if len(search_entity_ids) == 0:
                    continue
                if entity_ids is not None:
                    entity_ids = set(entity_ids).intersection(set(search_entity_ids))
                else:
                    entity_ids = search_entity_ids

            if table == 'dataentity':
                column_names = DATA_COLUMN_NAMES
                sql = "SELECT {columns} FROM {table} where entitytype={entity_type_id}"
                sql += f' and status != {entity_type["maximumstatus"]}'
            else:
                column_names = LINK_COLUMN_NAMES
                sql = "SELECT {columns} FROM {table} where linkentitytype={entity_type_id}"
            if entity_ids is not None:
                sql += " AND id IN ({})".format(",".join([str(entity_id) for entity_id in entity_ids]))
            rows = self.fetch_all(sql, columns=", ".join(column_names), table=table, entity_type_id=entity_type['id'])

            new_entities = self.make_rows_of_objects(column_names, rows)

            if 'attrs' in args and new_entities:
                self.get_entity_attributes(entity_type['id'], new_entities, args['attrs'])

            entities.extend(new_entities)

        return entities

    # noinspection PyUnusedLocal
    def get_entity_ids_with_value(self, table, entity_type_id, attr_name, attr_value, args):
        """
        Returns all entities that have a value for a named attribute.


        """

        if attr_name == 'Left seq':
            attr_name = 'left_seq'
        elif attr_name == 'Right seq':
            attr_name = 'right_seq'

        def get_query(query_datatype, query_args):
            """
            Returns the query portion to match the value. Handles values and lists of values.

            :param query_datatype: If true, the value is a string that should be quoted, and LIKE may be used.
            :param query_args: URL parameters
            :return: The query string is returned.
            """
            if attr_value in ['None', 'null']:
                get_values_query = 'is null'
            elif isinstance(attr_value, list):
                # Handle posted value.
                if attr_value and isinstance(attr_value[0], str):
                    value = "','".join(attr_value)
                else:
                    value = ",".join(str(v) for v in attr_value)
                get_values_query = "IN (%s)" % value
            elif query_datatype in ['STRING', 'TEXT', 'CGV']:
                # Support 's in the value.
                value = attr_value.replace("'", "''")
                if 'list' in query_args:
                    get_values_query = "IN ('%s')" % value.replace(",", "','")
                elif 'like' in query_args:
                    get_values_query = "LIKE '%s'" % value
                else:
                    get_values_query = "= '%s'" % value
            elif attr_value == '':
                get_values_query = 'is null'
            elif 'list' in query_args:
                get_values_query = "IN (%s)" % attr_value
            else:
                get_values_query = "= %s" % attr_value

            ids = query_args.get('ids', None)
            if ids is not None and query_datatype != 'CGV':
                if query_datatype != 'ENTITY':
                    get_ids_query = "AND ownerid in (%s)" % ids
                else:
                    get_ids_query = "AND id in (%s)" % ids
            else:
                get_ids_query = ""

            return get_values_query, get_ids_query

        type_query = '%s = %s' % ('entitytype' if table == 'dataentity' else 'linkentitytype', entity_type_id)
        if attr_name in {'Status', 'leftentity', 'rightentity'}:
            datatype_rows = []
        else:
            sql = "SELECT id, datatype, choicegroup FROM attributedefinition" \
                  " WHERE name='{name}' AND owner={entity_type_id}"
            datatype_rows = self.fetch_all(sql, entity_type_id=entity_type_id, name=attr_name)

        result_rows = []
        if len(datatype_rows) == 0:
            # If it's not an attribute definition or is one of Status, leftentity, rightentity
            values_query, ids_query = get_query('ENTITY', args)

            sql = f"SELECT id FROM {table} where {type_query} and {attr_name} {values_query} {ids_query}"
            rows = self.fetch_all(sql)
            result_rows.extend(row[0] for row in rows)
        else:
            for attributedefinition_id, datatype, choicegroup in datatype_rows:
                rows = []
                values_query, ids_query = get_query(datatype, args)

                if datatype == 'NUMBER':
                    sql = f"SELECT ownerid FROM attributevalues_num av" \
                        f" WHERE av.attributedefinition_id={attributedefinition_id}" \
                        f" AND av.numbervalue {values_query} {ids_query}"
                elif datatype == 'STRING':
                    sql = f"SELECT ownerid FROM attributevalues_str av" \
                        f"  WHERE av.attributedefinition_id={attributedefinition_id}" \
                        f" AND av.stringvalue {values_query} {ids_query}"
                elif datatype == 'TEXT':
                    sql = f"SELECT ownerid FROM attributevalues_binary av " \
                        f"  WHERE av.attributedefinition_id={attributedefinition_id}" \
                        f" AND av.binaryvalue {values_query} {ids_query}"
                elif datatype == 'CGV':
                    sql = f"SELECT id from choicegroupvalue" \
                        f"  WHERE choicegroup={choicegroup}" \
                        f"  AND cgvalue {values_query}"

                    rows = self.fetch_all(sql)
                    if rows:
                        values_query = 'IN (%s)' % (','.join(str(row[0]) for row in rows))
                        if 'ids' in args:
                            ids_query = 'AND  ownerid in (%s)' % args['ids']

                        sql = (f"SELECT ownerid FROM attributevalues_cgv av "
                               f"WHERE av.attributedefinition_id={attributedefinition_id} "
                               f"AND av.choicegroupvalue {values_query} {ids_query}")
                    else:
                        sql = None
                else:
                    sql = None

                if sql:
                    LOGGER.debug('sql=%s', sql)
                    rows = self.fetch_all(sql)

                    # Handle values_query = 'is null' where there's no value in the attribute's table.
                    if 'ids' in args and values_query == 'is null':
                        # Get set of ids that may just be missing a row in the attribute table.
                        query_ids = set(int(entity_id) for entity_id in args['ids'].split(','))
                        unchecked_ids = query_ids.difference(set(row[0] for row in rows))

                        # Look for ids in the unchecked set that do have values.
                        sql = sql.replace(' is null ', ' is not null ')
                        unwanted_rows = self.fetch_all(sql)
                        unwanted_ids = set(row[0] for row in unwanted_rows)

                        # Add in any ids that had no values.
                        result_rows.extend(query_ids.difference(unwanted_ids))
                else:
                    rows = []

                result_rows.extend(row[0] for row in rows)

        return result_rows

    def get_entity_ids(self, entity_type_name, attr_name):
        """
        Returns a list of [entity_id, attribute value].

        Used in database restores for looking up an entity_id by some key for reference.

        Examples:
        get_entity_ids('Organisation', 'cfFedId')
        get_entity_ids('ucWorkflow', 'wkflId')
        get_entity_ids('ucAction', 'actnId')
        :param entity_type_name: An entity type name.
        :param attr_name: The attribute to retrieve.
        """
        result = []

        entity_types = self.list_entity_type_records('dataentity', entity_type_name)
        for entity_type in entity_types:
            entity_type_id = entity_type['id']
            maximum_status = entity_type['maximumstatus']
            sql = "SELECT id, datatype, choicegroup FROM attributedefinition" \
                  " WHERE name='{name}' AND owner={entity_type_id}"
            datatype_rows = self.fetch_all(sql, entity_type_id=entity_type_id, name=attr_name)
            for datatype_row in datatype_rows:
                attributedefinition_id = datatype_row[0]
                datatype = datatype_row[1]
                if datatype == 'STRING':
                    sql = "SELECT ownerid, stringvalue FROM attributevalues_str av" \
                          " WHERE av.attributedefinition_id={attributedefinition_id}"
                    rows = self.fetch_all(sql, attributedefinition_id=attributedefinition_id)

                    if rows:
                        # Get all ids that aren't archived.
                        sql = "SELECT id FROM dataentity" \
                              " WHERE status != {maximum_status}" \
                              " AND entitytype = {entity_type_id} AND id IN ({entity_ids})"
                        id_rows = self.fetch_all(
                            sql,
                            maximum_status=maximum_status,
                            entity_type_id=entity_type_id,
                            entity_ids=','.join(str(row[0]) for row in rows)
                        )
                        if id_rows:
                            id_rows = set(id_row[0] for id_row in id_rows)
                            result += [row for row in rows if row[0] in id_rows]

        return result

    def get_entity_strings(self, entity_id, names):
        """Returns named strings from en entity's attributes.
        """

        sql = ("SELECT ad.name, stringvalue FROM attributevalues_str av, attributedefinition ad "
               "WHERE av.attributedefinition_id=ad.id AND ad.name "
               "IN ({names}) AND ownerid={entity_id}")
        rows = self.fetch_all(sql, names=",".join(["'{}'".format(name) for name in names]), entity_id=entity_id)

        strings = {row[0]: row[1] for row in rows}
        return strings

    def get_action_log(self, record_id):
        """
        Returns an actionlogrecord row.
        :param record_id: The id of the row to retrieve.
        """
        column_names = [
            "id",
            "usercomment",
            "entityid",
            "entitytypename",
            "rolename",
            "timestamp",
            "username",
        ]
        sql = "select * from actionlogrecord where id={record_id} limit 1"
        rows = self.fetch_all(sql, columns=", ".join(column_names), record_id=record_id)
        if rows:
            return self.make_rows_of_objects(column_names, rows)[0]
        else:
            return {}

    def count_status(self, entity_type_name, attr_name):
        """
        Creates a dictionary of Status counts keyed by Status value.
        :param entity_type_name: Name of the entity type.
        :param attr_name: Normally 'Status' but can be other string attribute values.
        :return: The dictionary.
        """
        sql = "select id, dtype from basemodelobject as bmo where bmo.name = '{name}'"
        rows = self.fetch_all(sql, name=entity_type_name)

        if len(rows) == 0:
            return {}

        if rows[0][1] == 'LinkEntityType' or attr_name != 'Status':
            sql = "select id from attributedefinition as ad" \
                  " where ad.name = '{attr_name}' and ad.owner = {owner} limit 2;"
            rows = self.fetch_all(sql, attr_name=attr_name, owner=rows[0][0])

            if len(rows) == 0:
                return {}

            sql = "select count(id), numbervalue from attributevalues_num as avn" \
                  " where avn.attributedefinition_id = {attr_id} group by numbervalue"
            rows = self.fetch_all(sql, attr_id=rows[0][0])
        else:
            sql = "select count(id), status from dataentity where entitytype = {entity_id} group by status"
            rows = self.fetch_all(sql, entity_id=rows[0][0])

        return {str(row[1]): row[0] for row in rows}

    def count_link_status(self, link_type_name, link_status_name, data_side):
        """
        Similar to count_status(), but on one or the other side of a link.
        :param link_type_name: Name of the entity link type.
        :param link_status_name: Normally 'Status' but can be other string attribute values.
        :param data_side: The side of the link to find the data entity at.
        :return: The dictionary.
        """
        sql = "select id from basemodelobject as bmo where bmo.name = '{link_type_name}'"
        rows = self.fetch_all(sql, link_type_name=link_type_name)
        if len(rows) == 0:
            return {}
        action_link_id = rows[0][0]

        sql = "select id from attributedefinition as ad" \
              " where ad.name = '{link_status_name}' and ad.owner = {action_link_id} limit 2;"
        rows = self.fetch_all(sql, link_status_name=link_status_name, action_link_id=action_link_id)
        if len(rows) == 0:
            return {}
        link_status_attr_id = rows[0][0]

        sql = "select count(avn.id), de.status, avn.numbervalue" \
              " from attributevalues_num as avn, linkentity as le, dataentity as de" \
              " where avn.ownerid = le.id and le.{data_side} = de.id" \
              " and avn.attributedefinition_id = {link_status_attr_id}" \
              " group by de.status, numbervalue"
        rows = self.fetch_all(sql, link_status_attr_id=link_status_attr_id, data_side=data_side)
        action_link_counts = {}
        for action_link_count, workflow_status, action_link_status in rows:
            counts = action_link_counts.get(str(workflow_status), None)
            if counts is None:
                counts = {}
                action_link_counts[str(workflow_status)] = counts
            counts[str(int(action_link_status or 0))] = action_link_count

        return action_link_counts

    def get_link_sides(self, link_id):
        sql = f'SELECT leftentity, rightentity FROM linkentity WHERE id = {link_id}'
        rows = self.fetch_all(sql)
        if rows:
            return [int(rows[0][0]), int(rows[0][1])]
        else:
            return []

    def get_rms_events_data(self):
        sql = f'SELECT id, status FROM dataentity ORDER BY id'
        dataentity_rows = self.fetch_all(sql)
        entityid_status = [[int(row[0]), int(row[1])] for row in dataentity_rows]

        sql = "SELECT" \
              " bm.id AS entityid," \
              " bm.id IN (SELECT id FROM dataentitytype) AS isdata," \
              " bm.name AS entityname," \
              " ad.id AS attrid," \
              " ad.datatype as datatype," \
              " ad.name AS attrname" \
              " FROM attributedefinition AS ad, basemodelobject AS bm" \
              " WHERE ad.owner = bm.id ORDER BY owner"
        attr_rows = self.fetch_all(sql)
        attributes = []
        for entity_id, is_data, entity_name, attr_id, data_type, attr_name in attr_rows:
            attributes.append([
                int(entity_id),
                is_data,
                str(entity_name),
                int(attr_id),
                str(data_type),
                str(attr_name),
            ])

        return {
            'entityid_status': entityid_status,
            'attributes': attributes,
        }

    def get_entity(self, name_or_id, entity_id_or_query, table, attr_ids=None):
        """
        Retrieve full contents of an entity.

        If name_or_id contains a '%' or entity_id_or_query is not an integer, a list of entity recs without
        attributes is returned. Otherwise, just an entity rec with the given attributes is returned.

        :param name_or_id: If an integer, or a string version of an integer, this should be the entity type id.
        Otherwise, if it contains a '%', a list of entities matching the entity type is returned, otherwise just
        the entity is returned.

        :param entity_id_or_query: If an integer, or a string version of an integer, that entity_id is returned.
        Otherwise, this should be a attr_name='attr_value' or some other SQL query, and a list of entities
        is returned.

        :param table: Either 'dataentity' or 'linkentity'.

        :param attr_ids: If given, and an entity is being returned, only these attributes are included.


        If attr_ids is provided, then retrieves the entity and only those attributes.
        """

        extended_attributes = {}
        if table is None:
            sql = f'SELECT dtype FROM dataobjects WHERE id = {entity_id_or_query}'
            self.cursor.execute(sql)
            rows = self.cursor.fetchall()  # type: List
            table = rows[0][0].lower()
            extended_attributes['api_read_entity_table'] = table
        if name_or_id is None:
            sql = f'SELECT typename FROM {table} WHERE id = {entity_id_or_query}'
            self.cursor.execute(sql)
            rows = self.cursor.fetchall()  # type: List
            name_or_id = rows[0][0]
            extended_attributes['api_read_entity_type_name'] = name_or_id

        return_entity_list = False

        # Get entity type query
        entity_type_id = None
        try:
            entity_type_id = int(name_or_id)
            if table == 'dataentity':
                entity_type_query = f"entitytype={name_or_id}"
            else:
                entity_type_query = f"linkentitytype={name_or_id}"
        except ValueError:
            if "%" in name_or_id:
                return_entity_list = True
                entity_type_query = f"typename like '{name_or_id}'"
            else:
                entity_type_query = f"typename = '{name_or_id}'"
                entity_type = self.get_entity_type(name_or_id, table)
                entity_type_id = entity_type['id']

        # Get entity query
        try:
            entity_id_or_query = int(entity_id_or_query)
            entity_query = f"id={entity_id_or_query}"
        except ValueError:
            return_entity_list = True
            entity_query = entity_id_or_query

        column_names = DATA_COLUMN_NAMES if table == 'dataentity' else LINK_COLUMN_NAMES
        sql = f"SELECT {', '.join(column_names)} FROM {table} where {entity_type_query} AND {entity_query}"
        rows = self.fetch_all(sql)
        entities = self.make_rows_of_objects(column_names, rows)

        if return_entity_list:
            return entities

        if len(entities) == 0:
            msg = "Entity not found: %s"
            LOGGER.error(msg, entity_id_or_query)
            raise NotFound(msg % entity_id_or_query)

        if len(entities) != 1:
            msg = "Unexpected number of entities for: %s found %s"
            entities_str = ", ".join([str(et[0]) for et in entities])
            LOGGER.error(msg, entity_id_or_query, entities_str)
            raise BadRequest(msg % (entity_id_or_query, entities_str))

        entity_decl = self.get_entity_attributes(entity_type_id, entities, attr_ids)[0]
        entity_decl.update(extended_attributes)
        return entity_decl

    def get_entity_attributes(self, entity_type_id, entities, attr_ids):
        """
        Adds attribute values to list of entities.

        :param entity_type_id: If not None, attr_ids may be supplied to reduce the set of attributes returned.
        :param entities: A list of entity records.
        :param attr_ids: If not None, filters the set of attributes.
        :return: The same list of entities is returned.
        """

        if attr_ids is not None and entity_type_id is not None:
            try:
                attr_ids = [int(attr_id) for attr_id in attr_ids.split(',') if attr_id != '']
            except ValueError:
                attr_names = "','".join(attr_ids.split(','))
                sql = "SELECT id FROM attributedefinition WHERE name IN ('{attrs}') AND owner={entity_type_id}"
                attr_ids = [rec[0] for rec in self.fetch_all(sql, entity_type_id=entity_type_id, attrs=attr_names)]

        if len(entities) == 1:
            entity_query = f'av.ownerid={entities[0]["id"]}'
        else:
            entities_str = ",".join(str(entity['id']) for entity in entities)
            entity_query = f"av.ownerid IN ({entities_str})"
        entity_by_id = {entity['id']: entity for entity in entities}

        # Pre-process filtering by attribute ID.
        if attr_ids:
            # Split out into a dictionary keyed by table type containing their attribute ids.
            attr_ids = [str(attr_id) for attr_id in attr_ids]
            rows = self.fetch_all('SELECT id, datatype FROM attributedefinition WHERE id in (%s)' % ",".join(attr_ids))
            attr_ids_by_type = {
                'STRING': [],
                'TEXT': [],
                'DATE': [],
                'BOOLEAN': [],
                'BINARY': [],
                'NUMBER': [],
                'CGV': [],
            }
            for attr_id, attr_type in rows:
                attr_ids_by_type[attr_type].append(str(attr_id))
        else:
            # No filtering.
            attr_ids_by_type = None

        attr_table_info = (
            ('STRING', 'attributevalues_str', 'av.stringvalue, av.language'),
            ('TEXT', 'attributevalues_binary', "encode(av.binaryvalue, 'escape'::text)"),
            ('DATE', 'attributevalues_date', 'av.datevalue'),
            ('BOOLEAN', 'attributevalues_bool', 'av.booleanvalue'),
            ('NUMBER', 'attributevalues_num', 'av.numbervalue'),
            ('CGV', 'choicegroupvalue cgv, attributevalues_cgv', 'cgv.cgvalue'),
        )
        sql = "SELECT av.ownerid, ad.name, {value}" \
              " FROM {table} av, attributedefinition ad" \
              " WHERE {entity_query} AND av.attributedefinition_id = ad.id"

        for table_type, table_name, table_value in attr_table_info:
            # No filtering
            sql_for_table = sql
            if attr_ids_by_type is not None:
                # If Filtered on attribute ids
                if attr_ids_by_type.get(table_type):
                    sql_for_table += " AND  attributedefinition_id IN ( %s )" % ",".join(
                        attr_ids_by_type.get(table_type))
                else:
                    # If this table has no ids, skip it.
                    continue

            # Support translation of CGV enum to label.
            if table_type == 'CGV':
                sql_for_table += " AND av.choicegroupvalue=cgv.id"

            rows = self.fetch_all(
                sql_for_table,
                value=table_value,
                table=table_name,
                entity_query=entity_query,
            )
            for row in rows:
                if table_type == 'STRING':
                    owner_id, name, value, lang = row
                    entity = entity_by_id[owner_id]
                    if lang == DEFAULT_LANG or lang is None:
                        entity[name] = value
                    else:
                        entity['{}_{}'.format(name, lang)] = value
                else:
                    owner_id, name, value = row
                    entity = entity_by_id[owner_id]
                    entity[name] = value

        return entities
