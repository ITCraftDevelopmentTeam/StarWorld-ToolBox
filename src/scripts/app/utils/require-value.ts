export function requireNonError (callback: Function, errors: ErrorConstructor[] = null, executeThis: ThisType<any> = null, ...executeArgs): {type: 'return', result: any} | {type: 'error', result: Error} {
    if (errors == null) errors = [Error];
    try {
        if (executeThis == null) return {
            type: 'return',
            result: callback(...executeArgs),
        }
        return {
            type: 'return',
            result: callback.call(executeThis, ...executeArgs)
        };
    } catch (e) {
        if (
            errors.some(
                (item) => {
                    if (e instanceof item) {
                        return true;
                    }
                }
            )
        ) {
            return {
                type: 'error',
                result: e,
            }
        } else {
            throw e;
        }
    }
}
