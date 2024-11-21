export type Box<T> = {
  readonly isBox: true;
  readonly map: <U>(fn: (value: T) => U) => Box<U>;
  readonly apply: <A, B>(this: Box<(a: A) => B>, boxValue: Box<A>) => Box<B>;
  readonly flatMap: <U>(fn: (value: T) => Box<U>) => Box<U>;
  readonly getValue: () => T;
  readonly "<$>": <U>(fn: (value: T) => U) => Box<U>;
  readonly "<*>": <A, B>(this: Box<(a: A) => B>, boxValue: Box<A>) => Box<B>;
  readonly ">>=": <U>(fn: (value: T) => Box<U>) => Box<U>;
};

const box = <T>(value: T): Box<T> => {
  const map = <U>(fn: (value: T) => U): Box<U> => box(fn(value));
  const apply = function <A, B>(
    this: Box<(a: A) => B>,
    boxValue: Box<A>
  ): Box<B> {
    const fn = this.getValue();
    return boxValue.map((a) => fn(a));
  };
  const flatMap = <U>(fn: (value: T) => Box<U>): Box<U> => fn(value);
  const getValue = () => value;

  return {
    isBox: true,
    map,
    apply,
    flatMap,
    getValue,
    "<$>": map,
    "<*>": apply,
    ">>=": flatMap,
  } as const;
};

export const isBox = <T>(value: any): value is Box<T> => value?.isBox === true;

export const Box = {
  pack: box,
  isBox,
} as const;
