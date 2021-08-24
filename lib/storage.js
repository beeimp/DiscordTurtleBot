class Storage {
  resource = {};

  get = (key) => {
    if (!key) {
      return this.resource;
    }
    return this.resource && this.resource[key] ? this.resource[key] : undefined;
  };
  set = (key, obj) => {
    this.resource = { ...this.resource, [key]: obj };
  };
}
module.exports = Storage;
