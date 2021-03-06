var Model = require('chaos-orm').Model;
var Gallery = require('./gallery');

class GalleryDetail extends Model {
  static _define(schema) {
    schema.column('id', { type: 'serial' });
    schema.column('description', { type: 'string' });
    schema.column('gallery_id', { type: 'integer' });

    schema.belongsTo('gallery',  'Gallery', { keys: { gallery_id: 'id' } });
  }
}

GalleryDetail.register();

module.exports = GalleryDetail;
