import ast
import sys
import os.path

import atexit
import csv
import json
import os
import signal
from io import StringIO

from flask import Flask, request, make_response
from flask import send_from_directory, redirect, send_file
from flask.helpers import NotFound
from flask.wrappers import Response

PROJ_DIR = os.path.dirname(sys.argv[0])
sys.path.insert(0, PROJ_DIR)

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
        if request.method == 'POST':
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


def json_response(obj):
    contents = json.dumps(obj)
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

URL_BASE = os.environ.get('PAINT_URL_ROOT', '').rstrip('/')
URL_ROOT = f'{URL_BASE}/'

APP = Flask(
    __name__.split('.')[0],
    static_url_path=URL_ROOT + 'static',
    static_folder='../build/static',
    # static_folder=os.environ.get('APP_STATIC_FOLDER', '../build/static'),
    # static_url_path='',
    # static_folder=os.environ.get('APP_STATIC_FOLDER', '../build'),
    # instance_path=os.path.abspath('www/build'),
    # template_folder='templates',
)
application = APP


@APP.route(URL_ROOT + '', defaults={'filename': 'index.html'})
@APP.route(URL_ROOT + '<path:filename>')
def ui_root(filename):
    """Displays the root UI."""
    return send_from_directory('../build', filename)

@APP.route(URL_ROOT + 'api/info', methods=['GET', 'POST'])
def get_info():
    """Stub. Does nothing. Just including this to hide the fact from the UI."""

    return json_response({
        'status': 'success',
        'URL_BASE': URL_BASE,
        'URL_ROOT': URL_ROOT,
        'env': dict(os.environ),
        '__name__': __name__,
    })
