import crypto from 'crypto';

export function buildRegexp(...parts: RegExp[]) {
    return new RegExp(parts.map(part => part.source).join(''), 'gms');
}

export function md5(data: string) {
    return crypto.createHash('md5').update(data).digest("hex");
}

type ItemType<T> = T extends readonly (infer U)[] ? U : T;
type MapType<T, U> = T extends readonly unknown[] ? U[] : U;
type Func<T, U> = (_: T) => U;
type AsyncFunc<T, U> = Func<T, Promise<U>>;

declare global {
    interface Array<T> {
        mapSequential<U>(f: AsyncFunc<T, U>): Promise<U[]>;
    }
    interface Promise<T> {
        mapSequential<U>(f: AsyncFunc<ItemType<T>, U>): Promise<MapType<T, U>>;
    }
}

Array.prototype.mapSequential = async function<T, U>(f: AsyncFunc<T, U>) {
    return this.reduce(async (promise, item) => {
        const result = await promise;
        result.push(await f(item));
        return result;
    }, Promise.resolve([] as U[]));
}

Promise.prototype.mapSequential = async function <T, U>(f: AsyncFunc<ItemType<T>, U>) {
    const value = await this as ItemType<T>;
    if (!Array.isArray(value)) {
        return f(value);
    }
    return value.mapSequential(f);
}