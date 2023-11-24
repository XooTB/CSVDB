import { faker } from "@faker-js/faker";

export default function generateDummy(n: number) {
  return Array.from({ length: n }).map(() => ({
    name: faker.person.fullName(),
    age: faker.number.int({ min: 1, max: 100 }),
    email: faker.internet.email(),
  }));
}

console.log(generateDummy(10));
