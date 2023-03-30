export type IndexSignatureKey<T> = Record<any, any> extends T ? T extends Record<infer Key, any> ? Key : never : never;