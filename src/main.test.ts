import { expect, test } from "bun:test";
import csvdb from "./main";

const db = new csvdb(import.meta.dir, "test.csv");

db.SchemaFactory({
  name: "string",
  age: "number",
  email: "string",
});

const dummyData = [
  { name: "John Doe", age: 25, email: "johndoe@example.com" },
  { name: "Jane Smith", age: 30, email: "janesmith@example.com" },
  { name: "Anita Ledner", age: 47, email: "Cornell.Watsica@hotmail.com" },
  { name: "Lance Langworth", age: 42, email: "Neal.Goyette@yahoo.com" },
];

test("Insert data into the database", () => {
  db.insertMany(dummyData);

  const result = db.findOne({
    name: "John Doe",
    age: 25,
    email: "johndoe@example.com",
  });

  expect(result).toEqual({
    name: "John Doe",
    age: "25",
    email: "johndoe@example.com",
  });
});

test("Finds data in the database", () => {
  const result = db.findOne({
    name: "John Doe",
    age: "25",
    email: "johndoe@example.com",
  });

  expect(result).toEqual({
    name: "John Doe",
    age: "25",
    email: "johndoe@example.com",
  });
});

test("Updates data in the database", () => {
  const updateData = { age: 50 };

  db.updateOne({ name: "John Doe" }, updateData);

  const result = db.findOne({ name: "John Doe" });

  expect(result).toEqual({
    name: "John Doe",
    age: "50",
    email: "johndoe@example.com",
  });
});

test("Deletes data from the database", () => {
  db.deleteOne({ name: "Jane Smith" });

  const result = db.findOne({ name: "Jane Smith" });

  //@ts-ignore
  expect(result).toEqual(undefined);
});
