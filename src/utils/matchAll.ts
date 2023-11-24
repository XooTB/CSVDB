export default function matchAll(el: any, el2: any) {
  const keys = Object.keys(el);
  for (const key in keys) {
    if (el[keys[key]].toString() !== el2[keys[key]]) return false;
  }
  return true;
}
