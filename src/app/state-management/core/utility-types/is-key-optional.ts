type WithoutOptional<T, K extends keyof T> = { [Key in K]-?: T[Key] }[K]

export type IsKeyOptional<T, K extends keyof T> = T[K] extends WithoutOptional<T, K> ? {} extends Pick<T, K> ? true : false : true;

export type NonOptionalKeys<Model> = { [K in keyof Model]: IsKeyOptional<Model, K> extends true ? never : K }[keyof Model]