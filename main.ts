import csvdb from "./src/main";
import generateDummy from "./src/utils/generateDummy";

const db = new csvdb(import.meta.dir, "test.csv");

console.log(import.meta.dir);

db.SchemaFactory({
  name: "string",
  age: "number",
  email: "string",
});

console.log(db.deleteMany({}));
