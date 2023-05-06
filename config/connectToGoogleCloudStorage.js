const Cloud = require("@google-cloud/storage");
const path = require("path");
const serviceKey = path.join(
  __dirname,
  "../hacklingo-385822-02054ee74722.json"
);

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "hacklingo-385822",
});

module.exports = storage;
