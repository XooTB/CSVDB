import { number } from "zod";
import z from "zod";
import csvdb from "./src/main";

const db = new csvdb(import.meta.dir, "test.csv");

console.log(import.meta.dir);

db.SchemaFactory({
  name: "string",
  age: "number",
  email: "string",
});

const x = db.deleteAll();

console.log(x);
