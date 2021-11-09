import { Observable } from "rxjs"
import { shareReplay, tap } from "rxjs/operators"


export type ExpressCache<v> = {
    get: (k: string) => Observable<v>
    reset: () => void
}

export const mkExpressCache: <v>(getter: (k: string) => Observable<v>) => ExpressCache<v>
    = getter => {
        let c: Record<any, any> = {}
        return {
            get: (k) => {
                if (!c.hasOwnProperty(k)) {
                    c[k] = getter(k).pipe(shareReplay(1))
                }
                return c[k]
            },
            reset: () => {
                c = {}
            }
        }
    }
