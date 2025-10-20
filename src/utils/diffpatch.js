import { create } from "jsondiffpatch";

export const jdp = create({
  textDiff: { minLength: 30 },
});

export function diff(a, b) {
  return jdp.diff(a, b) || null;
}

export function patch(target, delta) {
  if (!delta) return target;
  jdp.patch(target, delta);
  return target;
}

export function deepClone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}