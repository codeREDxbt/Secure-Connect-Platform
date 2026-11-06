let database;

async function setDatabase(db) {
  database = db;
}

function getDatabase() {
  if (!database) {
    throw new Error("Database has not been initialized");
  }
  return database;
}

module.exports = { setDatabase, getDatabase };
