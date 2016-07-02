import { Database, Schema } from '../../src';
import { Dialect } from 'sql-dialect';
import { Source } from 'chaos-orm';

describe("Database", function() {

  beforeEach(function() {

    this.dialect = new Dialect();
    this.database = new Database({
      dialect: this.dialect
    });

  });

  describe(".constructor()", function() {

    it("correctly sets default values", function() {

      expect(this.database.config()).toEqual({
        host: 'localhost',
        options: {},
        meta: { key: 'id', locked: true }
      });

      expect(this.database.lastInsertId()).toBe(undefined);

    });

  });

  describe(".config()", function() {

    it("returns the default config", function() {

      var database = new Database();

      expect(database.config()).toEqual({
        host: 'localhost',
        options: {},
        meta: { key: 'id', locked: true }
      });

    });

    it("overrides the default config", function() {

      var database = new Database({
        host: 'mydomain',
        username: 'username',
        password: 'password',
        database: 'mydb',
        options: { option: 'value' },
        meta: { key: '_id', locked: false }
      });

      expect(database.config()).toEqual({
        host: 'mydomain',
        username: 'username',
        password: 'password',
        database: 'mydb',
        options: { option: 'value' },
        meta: { key: '_id', locked: false }
      });

    });

  });

  describe(".dialect()", function() {

    it("returns the dialect", function() {

      expect(this.database.dialect()).toBe(this.dialect);

    });

  });

  describe(".convert()", function() {

    it("formats according default `'datasource'` handlers", function() {

      expect(this.database.convert('datasource', 'id', 123)).toBe('123');
      expect(this.database.convert('datasource', 'serial', 123)).toBe('123');
      expect(this.database.convert('datasource', 'integer', 123)).toBe('123');
      expect(this.database.convert('datasource', 'float', 12.3)).toBe('12.3');
      expect(this.database.convert('datasource', 'decimal', 12.3)).toBe('12.3');
      var date = new Date('2014-11-21');
      expect(this.database.convert('datasource', 'date', date)).toBe("'2014-11-21'");
      expect(this.database.convert('datasource', 'date', '2014-11-21')).toBe("'2014-11-21'");
      var datetime = new Date('2014-11-21T10:20:45.000Z');
      expect(this.database.convert('datasource', 'datetime', datetime)).toBe("'2014-11-21 10:20:45'");
      expect(this.database.convert('datasource', 'datetime', '2014-11-21T10:20:45+02:00')).toBe("'2014-11-21 08:20:45'");
      expect(this.database.convert('datasource', 'boolean', true)).toBe('TRUE');
      expect(this.database.convert('datasource', 'boolean', false)).toBe('FALSE');
      expect(this.database.convert('datasource', 'null', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'string', 'abc')).toBe("'abc'");
      expect(this.database.convert('datasource', '_default_', 123)).toBe("'123'");
      expect(this.database.convert('datasource', '_undefined_', 123)).toBe("'123'");
      expect(this.database.convert('datasource', 'serial', { ':plain': 'default' })).toBe('default');

    });

    it("formats according default `'cast'` handlers", function() {

      expect(this.database.convert('cast', 'id', '123')).toBe(123);
      expect(this.database.convert('cast', 'serial', '123')).toBe(123);
      expect(this.database.convert('cast', 'integer', '123')).toBe(123);
      expect(this.database.convert('cast', 'float', '12.3')).toBe(12.3);
      expect(this.database.convert('cast', 'decimal', '12.3')).toBe('12.30');
      var date = new Date('2014-11-21');
      expect(this.database.convert('cast', 'date', date)).toEqual(date);
      expect(this.database.convert('cast', 'date', '2014-11-21')).toEqual(date);
      var datetime = new Date('2014-11-21 10:20:45');
      expect(this.database.convert('cast', 'datetime', datetime)).toEqual(datetime);

      var offset = new Date('2014-11-21 10:20:45').getTimezoneOffset();
      var timezone = ('0' + Math.floor(Math.abs(offset)/60)).slice(-2) + ':' + ('0' + offset%60).slice(-2);
      timezone = offset > 0 ? '-' + timezone : '+' + timezone;
      var local = new Date('2014-11-21T10:20:45' + timezone);
      expect(this.database.convert('cast', 'datetime', '2014-11-21 10:20:45')).toEqual(local);

      expect(this.database.convert('cast', 'datetime', 1416565245 * 1000)).toEqual(new Date('2014-11-21T10:20:45.000Z'));
      expect(this.database.convert('cast', 'boolean', 1)).toBe(true);
      expect(this.database.convert('cast', 'boolean', 0)).toBe(false);
      expect(this.database.convert('cast', 'null', '')).toBe(null);
      expect(this.database.convert('cast', 'string', 'abc')).toBe('abc');
      expect(this.database.convert('cast', '_default_', 123)).toBe(123);
      expect(this.database.convert('cast', '_undefined_', 123)).toBe(123);

    });

    it("formats `null` values", function() {

      expect(this.database.convert('datasource', 'id', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'serial', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'integer', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'float', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'decimal', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'date', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'datetime', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'boolean', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'null', null)).toBe('NULL');
      expect(this.database.convert('datasource', 'string', null)).toBe('NULL');
      expect(this.database.convert('datasource', '_default_',null)).toBe('NULL');
      expect(this.database.convert('datasource', '_undefined_', null)).toBe('NULL');

    });

  });

});
