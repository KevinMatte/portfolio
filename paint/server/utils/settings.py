# Copyright (C) 2019 Kevin Matte - All Rights Reserved

"""
Loads secret values

settings.json should look like:

{
    "SQL_DATABASE": "...",
    "SQL_USERID": "...",
    "SQL_PASSWORD": "..."
}

"""
import os

from utils.json_object import load_object_from_file

_settings = {
    'SQL_DATABASE': 'paint',
    'SQL_USERID': None,
    'SQL_PASSWORD': None,
}

_settings_file = os.environ.get('PORTFOLIO_SETTINGS', '/opt/portfolio/settings.json')
if os.path.exists(_settings_file):
    _settings.update(load_object_from_file(_settings_file))

def get_app_setting(name, default_value=None):
    """
    Gets one of the named settings found in settings.json.
    :param name:
    :param default_value:
    :return:
    """
    return _settings.get(name, default_value)

if __name__ == '__main__':
    # Quick test
    print(f"userid={get_app_setting('SQL_USERID')}")
