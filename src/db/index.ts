import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionOptions = {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  statement_timeout: 5000,
  max_lifetime: 60 * 30,
};

const queryClientPropertyName = "__prevent-name-collision__postgres";
type GlobalThisWithPostgres = typeof globalThis & {
  [queryClientPropertyName]: postgres.Sql<{}>;
};

const getDrizzle = () => {
  if (process.env.NODE_ENV === "production") {
    return postgres(process.env.DATABASE_URL!, connectionOptions);
  } else {
    const newGlobalThis = globalThis as GlobalThisWithPostgres;
    if (!newGlobalThis[queryClientPropertyName]) {
      newGlobalThis[queryClientPropertyName] = postgres(
        process.env.DATABASE_URL!,
        connectionOptions
      );
    }
    return newGlobalThis[queryClientPropertyName];
  }
};

export const db = drizzle({ client: getDrizzle(), schema });
