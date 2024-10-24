export type When<T> = [boolean, () => T]

export const match =
  <T>(l: When<T>[]) =>
  (ow: () => T = () => undefined as unknown as T): T => {
    const [_, fn] = l.find(([exp]) => exp) || [null, ow]
    return fn()
  }

export const when = <T>([exp, fn]: When<T>): T | false => (exp && fn()) || false
