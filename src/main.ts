import * as fs from "node:fs";
import { z } from "zod";
import checktype from "./utils/checktype";
import matchAll from "./utils/matchAll";

type Schema = {
  [key: string]:
    | "number"
    | "string"
    | "boolean"
    | "date"
    | "undefined"
    | "null"
    | "any";
};

export default class csvdb {
  private db: string;
  private schema: z.ZodObject<any, any>;
  private keys: string[] = [];

  constructor(dirname: string, filename: string) {
    this.db = `${dirname}/${filename}`;
    this.schema = z.object({});
  }

  /**
   * Creates a schema object based on the provided schema definition.
   * @param schema - The schema definition.
   * @returns The created schema object.
   */
  public SchemaFactory(schema: Schema) {
    const schemaObj: any = {};
    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        const element = schema[key];
        schemaObj[key] = checktype(element);
      }
    }
    this.schema = z.object(schemaObj);
    this.keys = Object.keys(schemaObj);
    return z.object(schemaObj);
  }

  /**
   * Inserts data into the database.
   *
   * @param data - The data to be inserted.
   * @throws {Error} If the data fails validation or if the schema is not defined.
   */
  public insert(data: z.infer<typeof this.schema>) {
    if (this.schema) {
      const validated = this.schema.safeParse(data);
      if (validated.success) {
        const dataString = this.keys.map((key) => data[key]).join(", ");
        fs.appendFileSync(this.db, `${dataString}\n`);
      } else {
        throw new Error(validated.error.message);
      }
    } else {
      throw new Error("Schema not defined");
    }
  }

  /**
   * Inserts multiple data objects into the database.
   *
   * @param data An array of data objects to be inserted.
   * @throws {Error} If the schema is not defined or if any of the data objects fail validation.
   */
  public insertMany(data: z.infer<typeof this.schema>[]) {
    if (this.schema) {
      data.forEach((item: z.infer<typeof this.schema>) => {
        const validated = this.schema.safeParse(item);
        if (validated.success) {
          const dataString = this.keys.map((key) => item[key]).join(", ");
          fs.appendFileSync(this.db, `${dataString}\n`);
        } else {
          throw new Error(validated.error.message);
        }
      });
    } else {
      throw new Error("Schema not defined");
    }
  }

  /**
   * Finds and returns all the records in the CSV database.
   * @returns An array of objects representing the records in the CSV database.
   */
  public getAll() {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];

    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    return result;
  }

  /**
   * Finds a single item in the database that matches the given query.
   * @param query The query object used to search for the item.
   * @returns The found item, or undefined if no match is found.
   */
  public findOne(
    query: z.infer<typeof this.schema>
  ): undefined | z.infer<typeof this.schema> {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];
    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};

      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    const keys = Object.keys(query);
    const values = Object.values(query);

    const found = result.filter((el) => {
      if (el[keys[0]] === values[0]) {
        return el;
      }
    });

    let element = found[0];

    if (found.length > 1) {
      element = found.find((el) => matchAll(query, el));
      return element;
    } else {
      return element;
    }
  }

  /**
   * Finds all records in the database that match the given query.
   * @param query The query object used to filter the records.
   * @returns An array of records that match the query, or undefined if no records are found.
   */
  public findAll(query: z.infer<typeof this.schema>) {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];

    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    const found = result.filter((item) => matchAll(query, item));

    if (found.length > 1) return found;
    else return undefined;
  }

  /**
   * Updates a single record in the database based on the provided query and update values.
   * @param query - The query object used to find the record to be updated.
   * @param update - The update object containing the new values to be applied to the record.
   * @throws Error - Throws an error if no matching record is found.
   */
  public updateOne(
    query: z.infer<typeof this.schema>,
    update: z.infer<typeof this.schema>
  ) {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];

    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    const found = result.find((el) => matchAll(query, el));

    if (found) {
      const keys = Object.keys(update);
      const values = Object.values(update);
      keys.forEach((key, index) => {
        found[key] = values[index];
      });

      const newData = result
        .map((item) => {
          const itemArr = this.keys.map((key) => item[key]);
          return itemArr.join(", ");
        })
        .join("\n");
      fs.writeFileSync(this.db, newData);
    } else {
      throw new Error("No data found");
    }
  }

  /**
   * Updates multiple records in the database that match the given query.
   * @param query - The query object used to filter the records.
   * @param update - The update object containing the fields and values to update.
   * @throws Error - If no records are found that match the query.
   */
  public updateMany(
    query: z.infer<typeof this.schema>,
    update: z.infer<typeof this.schema>
  ) {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];

    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    const found = result.filter((item) => matchAll(query, item));

    if (found.length > 0) {
      const keys = Object.keys(update);
      const values = Object.values(update);
      found.forEach((item) => {
        keys.forEach((key, index) => {
          item[key] = values[index];
        });
      });
      const newData = result
        .map((item) => {
          const itemArr = this.keys.map((key) => item[key]);
          return itemArr.join(", ");
        })
        .join("\n");
      fs.writeFileSync(this.db, newData);
    } else {
      throw new Error("No data found");
    }
  }

  /**
   * Deletes a single record from the database that matches the given query.
   * @param query - The query object used to match the record to be deleted.
   * @throws Error - If no matching record is found.
   */
  public deleteOne(query: z.infer<typeof this.schema>) {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];
    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });

    const found = result.find((item) => matchAll(query, item));

    if (found) {
      const newData = result
        .filter((item) => (matchAll(query, item) ? false : true))
        .map((item) => {
          const itemArr = this.keys.map((key) => item[key]);
          return itemArr.join(", ");
        })
        .join("\n");
      fs.writeFileSync(this.db, newData);
      return true;
    } else {
      throw new Error("No data found");
    }
  }

  public deleteMany(query: z.infer<typeof this.schema>) {
    const data = fs.readFileSync(this.db, "utf-8");
    const dataArr = data.split("\n");
    const result: any[] = [];
    dataArr.forEach((item) => {
      const itemArr = item.split(", ");
      const obj: any = {};
      this.keys.forEach((key, index) => {
        obj[key] = itemArr[index];
      });
      result.push(obj);
    });
    const keys = Object.keys(query);
    const values = Object.values(query);

    const found = result.filter((item) => matchAll(query, item));

    if (found.length > 0) {
      const newData = result
        .filter((item) => {
          let flag = true;
          keys.forEach((key, index) => {
            if (item[key] !== values[index].toString()) {
              flag = false;
            }
          });
          return !flag;
        })
        .map((item) => {
          const itemArr = this.keys.map((key) => item[key]);
          return itemArr.join(", ");
        })
        .join("\n");

      fs.writeFileSync(this.db, newData);
    } else {
      throw new Error("No data found");
    }
  }

  public deleteAll() {
    fs.writeFileSync(this.db, "");
    return true;
  }
}
