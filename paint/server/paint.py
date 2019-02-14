import ast
import sys
import os.path

import atexit
import csv
import json
import os
import signal
import traceback
from io import StringIO

from drawing.drawing import Drawing, Graph, Vector3
from utils.settings import get_app_setting

from flask import Flask, request, make_response, abort
from flask import send_from_directory, redirect, send_file
from flask.helpers import NotFound
from flask.wrappers import Response

from db.database import Database

STATUS_ERROR = 'error'
STATUS_SUCCESS = 'success'

if __name__ == '__main__':
    ROOT_URL = '/paint'
else:
    ROOT_URL = ''



# from app import app as application
# application.root_path = PROJ_DIR

# def application(env, startResponse):
#     startResponse("200 OK", [("Content-type", "text/plain")])
#     return [f'Project Dir={sys.argv[0]} Version={sys.version_info}\n'.encode('utf-8')]

def get_literal(value):
    """Converts strings to literal types.

    'value': The string value to convert.

    Attempts conversion with ast.literal_eval and json decoder.
    If no conversion occurs, the value will be returned.
    """

    # NOUNITTEST: Too simple

    try:
        value = ast.literal_eval(value)
    except ValueError:
        try:
            value = json.loads(value)
        except json.decoder.JSONDecodeError:
            pass
    except SyntaxError:
        pass

    return value


class RequestParameters:
    """Handles parameter retrievals that may come from a POST, PUT, or GET.

    It assumes POST and PUT's have a JSON data dictionary keyed by parameter.

    URL parameters override data parameters.
    """

    def __init__(self):
        self.request = request
        if request.method in ('POST', 'PUT'):
            self.data = request.json
        else:
            self.data = None

    def get_parameter(self, field_name, default_value=None):
        """
        Retrieves a parameter by name.
        :param field_name:
        :param default_value:
        :return:
        """
        if field_name in request.args:
            return get_literal(request.args.get(field_name, default_value))

        if self.data is not None and field_name in self.data:
            return self.data.get(field_name, default_value)

        return default_value

    def get_all_parameters(self):
        parameters = {name: get_literal(value) for name, value in request.args.items()}
        if self.data is not None:
            parameters.update(self.data)

        return parameters



def json_response(status, obj):
    contents = json.dumps({'status': status, 'result': obj})
    return Response(contents, mimetype="application/json")


def change_int_key_strings_to_int(old_value):
    new_value = old_value
    if isinstance(old_value, dict):
        new_value = {}
        for key, value in old_value.items():
            if '0' <= key[0] <= '9':
                try:
                    key = int(key)
                except ValueError:
                    pass
            new_value[key] = value
    elif isinstance(old_value, list):
        new_value = [change_int_key_strings_to_int(v) for v in old_value]

    return new_value


APP = Flask(
    __name__.split('.')[0],
    static_url_path=ROOT_URL + '/static',
    static_folder='../build/static',
    # static_folder=os.environ.get('APP_STATIC_FOLDER', '../build/static'),
    # static_url_path='',
    # static_folder=os.environ.get('APP_STATIC_FOLDER', '../build'),
    # instance_path=os.path.abspath('www/build'),
    # template_folder='templates',
)
application = APP

if __name__ == '__main__':
    @APP.route('/')
    def redirect_to_paint():
        return redirect(ROOT_URL)


@APP.errorhandler(Exception)
def handle_unexpected_error(error):
    """Exception handling """
    print(f'{error.__class__.__name__}: {error}')
    traceback.print_tb(error.__traceback__)
    return json_response(STATUS_ERROR, str(error))


@APP.route(ROOT_URL + '/', defaults={'filename': 'index.html'})
@APP.route(ROOT_URL + '/<path:filename>')
def ui_root(filename):
    """Displays the root UI."""
    if filename.startswith('api/'):
        return abort(404)
    try:
        return send_from_directory('../build', filename)
    except NotFound:
        if '.' in filename:
            raise
        return abort(404)


tables = {Drawing.table_name: Drawing, Graph.table_name: Graph, Vector3.table_name: Vector3}


@APP.route(ROOT_URL + '/api/table/<table>', methods=['GET'])
def table_list(table):
    table_class = tables.get(table)
    if table_class:
        with table_class() as table:
            return json_response(STATUS_SUCCESS, table.list())
    else:
        raise NotFound(f'Unknown table: {table}')


@APP.route(ROOT_URL + '/api/table/<table>/<int:row_id>', methods=['GET'])
def table_get(table, row_id):
    table_class = tables.get(table)
    if table_class:
        with table_class() as table:
            return json_response(STATUS_SUCCESS, table.get(row_id))
    else:
        raise NotFound(f'Unknown table: {table}')


@APP.route(ROOT_URL + '/api/table/<table>', methods=['POST'])
def table_post(table):
    parameters = RequestParameters().get_all_parameters()
    table_class = tables.get(table)
    if table_class:
        with table_class() as table:
            values = {name: value for name, value in parameters.items() if name in table.column_names}
            return json_response(STATUS_SUCCESS, table.create(**values))
    else:
        raise NotFound(f'Unknown table: {table}')


@APP.route(ROOT_URL + '/api/table/<table>/<int:row_id>', methods=['PUT'])
def table_update(table, row_id):
    parameters = RequestParameters().get_all_parameters()
    table_class = tables.get(table)
    if table_class:
        with table_class() as table:
            values = {name: value for name, value in parameters.items() if name in table.column_names}
            return json_response(STATUS_SUCCESS, table.update(row_id, **values))
    else:
        raise NotFound(f'Unknown table: {table}')

@APP.route(ROOT_URL + '/api/table/<table>/<int:row_id>', methods=['PUT'])
def table_delete(table, row_id):
    table_class = tables.get(table)
    if table_class:
        with table_class() as table:
            return json_response(STATUS_SUCCESS, table.delete(row_id))
    else:
        raise NotFound(f'Unknown table: {table}')


@APP.route(ROOT_URL + '/api/info', methods=['GET', 'POST'])
def get_info():
    """Stub. Does nothing. Just including this to hide the fact from the UI."""

    return json_response(
        STATUS_SUCCESS,
        {
            'ROOT_URL': request.path,
            'env': dict(os.environ),
            '__name__': __name__,
        }
    )


@APP.after_request
def apply_caching(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response


if __name__ == '__main__':
    APP.run(debug=True, host='localhost', port=5000, threaded=False)
