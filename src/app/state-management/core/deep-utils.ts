export type Undefinable<T> = T extends (infer U)[]
? Array<Undefinable<U>> | undefined
: T extends readonly (infer U)[]
    ? ReadonlyArray<U> | undefined
    : T extends {}
    ? { [K in keyof T]: Undefinable<T[K]> | undefined }
    : T | undefined

export type DeepPartial<T> = T extends (infer U)[]
    ? Array<U> | undefined
    : T extends readonly (infer U)[]
    ? ReadonlyArray<U> | undefined
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>

export type DeepReadonly<T> = T extends (...args: any[]) => any ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

// null, undefined, booleans, numbers, strings, arrays, and dictionaries only
export function DeepClone<T>(obj: ReadonlyArray<T>): T[]
export function DeepClone<T>(obj: Readonly<T> | DeepReadonly<T>): T
export function DeepClone<T>(obj: T): T
export function DeepClone<T>(obj: T | Readonly<T> | DeepReadonly<T>): T {
    // null
    if(obj === null)
        return null as any;
    
    // undefined
    if(obj === undefined)
        return undefined as any;
    
    // booleans, numbers, strings
    if(typeof obj !== 'object')
        return obj as T;
    
    // arrays
    if(Array.isArray(obj))
        return obj.map(o => DeepClone(o)) as any;
    
    // dictionaries
    const clone: { [key: string]: any } = {};
    for(let key in (obj as object))
        clone[key] = DeepClone((obj as any)[key] as any);
    return clone as any;
}

// null, undefined, booleans, numbers, strings, arrays, and dictionaries only
export function DeepEquals(a: any, b: any): boolean {
    // null
    if(a === null)
        return b === null;
    if(b === null)
        return false;
    
    // undefined
    if(a === undefined)
        return b === undefined;
    if(b === undefined)
        return false;
    
    // booleans, numbers, strings
    if(typeof a !== 'object')
        return a === b;
    if(typeof b !== 'object')
        return false;
    
    // arrays
    if(Array.isArray(a))
        return Array.isArray(b) && a.length === b.length && !a.some((aa, i) => !DeepEquals(aa, b[i]));
    if(Array.isArray(b))
        return false;
    
    // dictionaries
    if(!DeepEquals(Object.keys(a), Object.keys(b)))
        return false;
    
    for(let key in a)
        if(!DeepEquals(a[key], b[key]))
            return false;
    
    return true;
}

export function DeepApply<T extends Record<any, any> | Array<any>>(
    obj: Undefinable<DeepPartial<T>>,
    objOnto: T,
) {
    if(Array.isArray(obj)) {
        if(!Array.isArray(objOnto))
            throw new Error(`Type mismatch during DeepApply`);
        objOnto.length = obj.length;
        for(let i = 0; i < obj.length; i++)
            objOnto[i] = DeepClone(obj[i]);
        return;
    }

    for(const key in obj) {
        const value = obj[key];
        if(value === undefined) {
            delete objOnto[key];
            continue;
        }
        
        if(value === null || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
            objOnto[key] = value as any;
            continue;
        }

        if(key in objOnto)
            DeepApply(value as any, objOnto[key] as any);
        else
            objOnto[key] = DeepClone(value) as any;
    }
}

function loopAddKeys(obj: any, keys: string[], value: any) {
    if(keys.length <= 0)
        return obj;
    const og = obj;
    for(let i = 0; i < keys.length-1; i++) {
        if(keys[i]! in obj)
            obj = obj[keys[i]!]
        else
            obj = obj[keys[i]!] = {};
    }
    obj[keys[keys.length-1]!] = value;
    return og;
}
function DeepDiffHelper<T extends Record<any, any>>(objWithChanges: Undefinable<DeepPartial<T>>, objOriginal: T, compiledObj: any, keys: string[]): void {
    const key = keys[keys.length-1];
    if(key == null)
        return;
    const objWithChangesValue = objWithChanges[key];
    const objOriginalValue = objOriginal[key];
    if(objWithChangesValue === null || objWithChangesValue === undefined || typeof objWithChangesValue === 'number' || typeof objWithChangesValue === 'boolean' || typeof objWithChangesValue === 'string' || Array.isArray(objWithChangesValue)) {
        if(!DeepEquals(objOriginalValue, objWithChangesValue))
            loopAddKeys(compiledObj, keys, DeepClone(objWithChangesValue))
        return;
    }

    if(objOriginalValue === undefined)
        loopAddKeys(compiledObj, keys, DeepClone(objWithChangesValue))
    else
        for(const key2 in objWithChangesValue)
            DeepDiffHelper(objWithChangesValue as any, objOriginalValue, compiledObj, [...keys, key2])
    
    for(const key2 in objOriginalValue)
        if(!(key2 in objWithChangesValue))
            loopAddKeys(compiledObj, [...keys, key2], undefined)
}

export function DeepDiff<T extends Record<any, any>>(objWithChangesValue: Undefinable<DeepPartial<T>>, objOriginalValue: T): DeepWriteable<Undefinable<DeepPartial<T>>> {
    const result: Undefinable<DeepPartial<T>> = {} as unknown as Undefinable<DeepPartial<T>>
    for(const key in objWithChangesValue)
        DeepDiffHelper(objWithChangesValue, objOriginalValue, result, [key])
    return result;
}
