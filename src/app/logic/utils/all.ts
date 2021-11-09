import { Observable, of, combineLatest } from "rxjs"

export const all: <v>(obses: Observable<v>[]) => Observable<v[]>
    = o => o.length === 0 ? of([]) : combineLatest(o)

