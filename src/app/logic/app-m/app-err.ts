export type AppErr
    = { _$type_AppErr: true, _tag: 'AppErr.Unknown', err: any }

/** wraps any value to appErr, if value is alredy app err, returns it */
export const wrapToAppErr: (a: any) => AppErr
    = v => {
        if (typeof v === 'object' && v !== null && (v as AppErr)._$type_AppErr === true) {
            return v
        }
        return ({
            _$type_AppErr: true,
            _tag: 'AppErr.Unknown',
            err: v
        })
    }

