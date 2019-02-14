"""Module for basic logging and application configuration"""

import logging
import logging.config
import os.path
import re

LOGGER_LEVEL = os.environ.get('LOGGER_LEVEL', 'INFO')
logging.config.fileConfig(os.path.dirname(__file__) + '/logging.ini')

FORMAT_NAMES = re.compile('{([a-z_0-9]+)}', flags=re.IGNORECASE)


class FormatLogger(logging.LoggerAdapter):
    """Adding argument parms to logger, for use with str.format()."""

    def __init__(self, logger, extra=None):
        super(FormatLogger, self).__init__(logger, extra or {})
        self.prefix = ""

    def log(self, level, msg, *args, **kwargs):
        """Inserts msg.format(), pulling args from the {...}'s in msg."""
        if self.isEnabledFor(level):
            parms = FORMAT_NAMES.findall(msg)
            if self.prefix:
                msg = self.prefix + msg
            if parms:
                values = {parm: kwargs.pop(parm) for parm in parms}
                msg = msg.format(**values)
            msg, kwargs = self.process(msg, kwargs)
            # noinspection PyProtectedMember
            self.logger._log(level, msg, args, **kwargs)


def get_logger(name) -> logging.LoggerAdapter:
    """Returns a named logger using the application wide logger level.

    The level may be changed by the caller.
    """
    logger = FormatLogger(logging.getLogger(name))
    logger.setLevel(LOGGER_LEVEL)

    return logger
