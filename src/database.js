import co from 'co';
import { extend, merge } from 'extend-merge';
import { Dialect } from 'sql-dialect';
import { Cursor, Source } from 'chaos-orm';
import dateformat from 'date-format';
import Schema from './schema';

/**
 * An adapter base class for SQL based driver
 */
class Database extends Source {
  /**
   * Gets/sets class dependencies.
   *
   * @param  Object classes The classes dependencies to set or none to get them.
   * @return Object         The classes dependencies.
   */
  static classes(classes) {
    if (arguments.length) {
      this._classes = extend({}, this._classes, classes);
    }
    return this._classes;
  }

  /**
   * Creates the database object and set default values for it.
   *
   * Options defined:
   *  - `'dns'`       : _string_ The full dsn connection url. Defaults to `null`.
   *  - `'database'`  : _string_ Name of the database to use. Defaults to `null`.
   *  - `'host'`      : _string_ Name/address of server to connect to. Defaults to 'localhost'.
   *  - `'username'`  : _string_ Username to use when connecting to server. Defaults to 'root'.
   *  - `'password'`  : _string_ Password to use when connecting to server. Defaults to `''`.
   *  - `'persistent'`: _boolean_ If true a persistent connection will be attempted, provided the
   *                    adapter supports it. Defaults to `true`.
   *  - `'dialect'`   : _object_ A SQL dialect adapter
   *
   * @param  Object config Configuration options.
   * @return Database object.
   */
  constructor(config) {
    super(config);

    var defaults = {
      classes: {},
      host: 'localhost',
      username: 'root',
      password: '',
      database: undefined,
      options: {},
      dialect: undefined,
      meta: { key: 'id', locked: true }
    };
    config = extend({}, defaults, config);

    /**
     * Default entity and set classes used by subclasses of `Source`.
     *
     * @var Object
     */
    this._classes = extend({}, this.constructor._classes, config.classes);

    /**
     * Stores configuration information for object instances at time of construction.
     *
     * @var Object
     */
    this._config = extend({}, config);
    delete this._config.classes;
    delete this._config.dialect;

    /**
     * The SQL dialect instance.
     *
     * @var Function
     */
    this._dialect = config.dialect || new Database._classes.dialect();

    var handlers = this._handlers;

    this.formatter('datasource', 'id',        handlers.datasource['string']);
    this.formatter('datasource', 'serial',    handlers.datasource['string']);
    this.formatter('datasource', 'integer',   handlers.datasource['string']);
    this.formatter('datasource', 'float',     handlers.datasource['string']);
    this.formatter('datasource', 'decimal',   handlers.datasource['string']);
    this.formatter('datasource', 'date',      handlers.datasource['date']);
    this.formatter('datasource', 'datetime',  handlers.datasource['datetime']);
    this.formatter('datasource', 'boolean',   handlers.datasource['boolean']);
    this.formatter('datasource', 'null',      handlers.datasource['null']);
    this.formatter('datasource', 'string',    handlers.datasource['quote']);
    this.formatter('datasource', 'object',    handlers.datasource['object']);
    this.formatter('datasource', '_default_', handlers.datasource['quote']);
  }

  /**
   * Gets/sets instance dependencies.
   *
   * @param  Object classes The classes dependencies to set or nothing to get the defined ones.
   * @return Object         The classes dependencies.
   */
  classes(classes) {
    if (arguments.length) {
      this._classes = extend({}, this._classes, classes);
    }
    return this._classes;
  }

  /**
   * Return the source configuration.
   *
   * @return Object.
   */
  config() {
    return this._config;
  }

  /**
   * Returns the SQL dialect instance.
   *
   * @return Object.
   */
  dialect() {
    return this._dialect;
  }

  /**
   * Returns the list of tables in the currently-connected database.
   *
   * @return array Returns an array of sources to which models can connect.
   */
  _sources(sql) {
    return co(function*() {
      var result = yield this.query(sql.toString());

      var sources = {};
      for(var source of result) {
        var key = Object.keys(source);
        var name = source[key];
        sources[name] = name;
      }
      return sources;
    }.bind(this));
  }

  /**
   * Returns default casting handlers.
   *
   * @return Object
   */
  _handlers() {
    return {
      cast: {
        'string': function(value, options) {
          return String(value);
        },
        'integer': function(value, options) {
          return Number.parseInt(value);
        },
        'float': function(value, options) {
          return Number.parseFloat(value);
        },
        'decimal': function(value, options) {
          return Number.parseFloat(value);
        },
        'date':function(value, options) {
          return new Date(value);
        },
        'datetime': function(value, options) {
          return new Date(value);
        },
        'boolean': function(value, options) {
          return !!value;
        },
        'null': function(value, options) {
          return null;
        }
      },
      datasource: {
        'string': function(value, options) {
          return String(value);
        },
        'quote': function(value, options) {
          return this.dialect().quote(String(value));
        }.bind(this),
        'date': function(value, options) {
          return this.format('datasource', 'datetime', value, { format: 'yyyy-MM-dd' });
        }.bind(this),
        'datetime': function(value, options) {
          options = options || {};
          options.format = options.format ? options.format : 'yyyy-MM-dd hh:mm:ss';
          if (!value instanceof Date) {
            value = new Date(value);
          }
          return this.dialect().quote(dateformat.asString(options.format, value));
        }.bind(this),
        'boolean': function(value, options) {
          return value ? 'TRUE' : 'FALSE';
        },
        'null': function(value, options) {
          return 'NULL';
        },
        'object': function(value, options) {
          var key = Object.keys(value)[0];
          if (this.dialect().isOperator(key)) {
            return this.dialect().format(key, value[key]);
          }
          return String(value);
        }.bind(this)
      }
    };
  }

  /**
   * Formats a value according to its definition.
   *
   * @param  String mode  The format mode (i.e. `'cast'` or `'datasource'`).
   * @param  String type  The type name.
   * @param  mixed  value The value to format.
   * @return mixed        The formated value.
   */
  format(mode, type, value, options) {
    var type = (mode === 'datasource' && value === null) ? 'null' : type;
    return super.format(mode, type, value, options);
  }
}

/**
 * Class dependencies.
 *
 * @var array
 */
Database._classes = {
  cursor: Cursor,
  schema: Schema,
  dialect: Dialect
};

export default Database;
