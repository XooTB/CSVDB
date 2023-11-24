import z from "zod";

export default function checktype(el: string) {
  switch (el) {
    case "string":
      return z.string();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "bigint":
      return z.bigint();
    case "date":
      return z.date();
    case "undefined":
      return z.undefined();
    case "null":
      return z.null();
    case "any":
      return z.any();
  }
}
