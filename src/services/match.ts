export type When<T> = [boolean, () => T]

export const match =
  <T>(l: When<T>[]) =>
  (ow: () => T = () => undefined as unknown as T): T =>
    (l.find(([exp]) => exp)?.[1] || ow)()

export const when = <T>([exp, fn]: When<T>): T | false => (exp && fn()) || false
