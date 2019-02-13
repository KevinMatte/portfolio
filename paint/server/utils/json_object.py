"""A special load of a json file, where dict's are converted to namedtuple's if
the dict has a 'named_tuple_name' key.

"""

import json
from collections import namedtuple
import importlib
import importlib.util


def load_object_from_dict(obj):
    """Transforms obj or and sub-child in obj to a namedtuple, if it has a 'named_tuple_name' key."""

    def load_values(dict_obj):
        """Applies load_object_from_dict() on all values."""

        for key, value in dict_obj.items():
            if isinstance(value, dict):
                dict_obj[key] = load_object_from_dict(value)

    result = obj
    if 'named_tuple_name' in obj:
        named_tuple_name = obj.pop('named_tuple_name')
        named_tuple = namedtuple(named_tuple_name, obj.keys())
        load_values(obj)
        result = named_tuple(**obj)
    else:
        load_values(obj)

    return result


def load_object_from_file(file_name):
    """Wrapper around 'load()', loading content from a json file."""

    with open(file_name) as file_input:
        text = file_input.read()

    return load_object_from_dict(json.loads(text))


def json_dumps(obj, use_from_json_obj=False):
    """
    Does a json.dumps with support for classes that define to_json_obj and from_json_obj methods.
    :param obj: The object to dump.
    :param use_from_json_obj: If True, the to_json_obj conversion method is used anywhere within obj's contents.
    :return: A 'utf-8' encoded string is returned.
    """
    def use_to_json_obj(value):
        """
        Helper for json.dumps with objects that have 'to_json_obj' methods.
        """
        if hasattr(value, 'to_json_obj'):
            if hasattr(value, 'from_json_obj'):
                return {
                    'from_json_obj': '%s/%s' % (value.__module__, value.__class__.__name__),
                    'obj': value.to_json_obj()
                }
            else:
                return value.to_json_obj()
        else:
            return value

    if use_from_json_obj:
        result = json.dumps(
            obj,
            separators=(',', ':'),
            ensure_ascii=False,
            default=use_to_json_obj,
        ).encode('utf-8')
    else:
        result = json.dumps(
            obj,
            separators=(',', ':'),
            ensure_ascii=False,
        ).encode('utf-8')

    return result


def json_loads(line, use_from_json_obj=False):
    """
    Does a json.loads with support for classes that define to_json_obj and from_json_obj methods.
    :param line: The string to load the object from.
    :param use_from_json_obj: If True, the from_json_obj conversion method is used anywhere within obj's contents.
    :return: The object is returned.
    """
    def from_json_obj(value):
        """
        Helper for json.dumps with objects that have 'to_json_obj' methods.
        """
        if 'from_json_obj' in value:
            class_str = value['from_json_obj']
            slash = class_str.index('/')
            module_path = class_str[0:slash]
            class_name = class_str[slash+1:]
            a_module = importlib.import_module(module_path)
            the_class = getattr(a_module, class_name)
            value = the_class.from_json_obj(value['obj'])
        return value

    try:
        if use_from_json_obj:
            result = json.loads(line, object_hook=from_json_obj)
        else:
            result = json.loads(line)
    except json.JSONDecodeError:
        raise

    return result
