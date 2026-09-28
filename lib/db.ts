import "server-only";
import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set.");
  const p = new MongoClient(uri).connect();
  if (process.env.NODE_ENV === "development") {
    // Clear the cache on failure so the next hot-reload retries cleanly.
    p.catch(() => { globalThis._mongoClientPromise = undefined; });
  }
  return p;
}

export async function getDb(): Promise<Db> {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = createClientPromise();
    }
    const client = await globalThis._mongoClientPromise;
    return client.db(process.env.MONGODB_DB || "maaz-notes");
  }
  const client = await createClientPromise();
  return client.db(process.env.MONGODB_DB || "maaz-notes");
}
