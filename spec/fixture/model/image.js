var Model = require('chaos-orm').Model;
var ImageTag = require('./image-tag');
var Gallery = require('./gallery');

class Image extends Model {
  static _define(schema) {
    schema.column('id', { type: 'serial' });
    schema.column('name', { type: 'string', null: true });
    schema.column('title', { type: 'string', length: 50, null: true });

    schema.belongsTo('gallery', 'Gallery', { keys: { gallery_id: 'id' }, null: true });
    schema.hasMany('images_tags', 'ImageTag', { keys: { id: 'image_id' } });
    schema.hasManyThrough('tags', 'images_tags', 'tag');
  }
}

Image.register();

module.exports = Image;