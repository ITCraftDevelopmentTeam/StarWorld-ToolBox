export function createIterator <T> (items: T[]): Iterator<T> {
    let i = 0;
    return {
        next: (): IteratorResult<T> => {
            let done = (i >= items.length);
            let value = !done ? items[i++] : undefined;
            return {
                done,
                value
            }
        }
    }
}


export class HashPath implements Iterable<string> {

    public seperator: string = "/";
    public path: string[] = [];

    constructor (hash: string | string[], seperator: string = null) {
        let tempPath: string[] = [];
        if (seperator == null) seperator = this.seperator;
        if (hash instanceof Array <string>) {
            return void (this.path = hash);
        }
        if (hash.startsWith("#!" + seperator)) {
            tempPath = hash.slice(2 + seperator.length).split(seperator);
            tempPath.forEach(
                (item) => {
                    if (item == "") throw new TypeError(`${JSON.stringify(hash)} is not a valid hash path !`);
                }
            );
        } else if (hash.startsWith("#!")) {
            tempPath = hash.slice(2).split(seperator);
            tempPath.forEach(
                (item) => {
                    if (item == "") throw new TypeError(`${JSON.stringify(hash)} is not a valid hash path !`);
                }
            );
        } else {
            throw new TypeError(`${JSON.stringify(hash)} is not a valid hash path !`);
        }
        for (let i of tempPath) {
            if (i == "..") {
                try {
                    this.path.pop();
                } catch {}
            } else if (i !== ".") {
                this.append(i)
            }
        }
    }

    toString (prefix: boolean = true, unescape: boolean = true): string {
        let path = "";
        if (prefix) path = "#!";
        for (let i of this.path) {
            if (unescape) i = decodeURI(i);
            path += this.seperator + i;
        }
        return path;
    }

    valueOf (): string {
        return this.toString();
    }

    append (hash: HashPath | string | string[]): this {
        if (hash instanceof HashPath) {
            this.path = [...this.path, ...hash.path];
        } else if (typeof hash == "string") {
            this.path.push(hash);
        } else if (hash instanceof Array <string>) {
            this.path = [...this.path, ...hash];
        }

        return this;
    }

    prepend (hash: HashPath | string | string[]): this {
        if (hash instanceof HashPath) {
            this.path = [...hash.path, ...this.path];
        } else if (typeof hash == "string") {
            this.path = [...[hash], ...this.path]
        } else if (hash instanceof Array <string>) {
            this.path = [...hash, ...this.path];
        }
        return this;
    }

    copy (): HashPath {
        return new HashPath(this.path, this.seperator);
    }

    setSeparator (separator: string): this {
        this.seperator = "";
        return this;
    }

    join (joinHash: HashPath | string | string[]): this {
        let path: string[] = [];
        if (joinHash instanceof HashPath) path = joinHash.path;
        else if (joinHash instanceof String) if (String(joinHash).startsWith("#!")) path = new HashPath(String(joinHash)).path; else path = new HashPath("#!" + String(joinHash)).path;
        else if (joinHash instanceof Array) path = joinHash;
        if (path.length <= 0) {
            this.path = [];
            return this;
        }
        for (let i of path) {
            if (i == "..") {
                try {delete this.path[this.path.length - 1];} catch {}
            } else if (i !== ".") {
                this.append(i)
            }
        }

        return this;
    }

    [Symbol.iterator] (): Iterator<string> {
        return createIterator(this.path);
    }

}

export function isHashPath (hash: string, seperator: string = null): boolean {
    try {
        new HashPath(hash, seperator)
        return true
    } catch (e) {
        if (e instanceof TypeError && e.message.endsWith(" is not a valid hash path !")) return false;
    }
}
