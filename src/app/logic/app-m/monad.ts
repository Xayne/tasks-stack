import { AddKvToRecord, mkDoNotationFor } from "src/lib/do-notation-generic/do-general";
import { Free } from "src/lib/ts-free";
import { AppAlg } from "./algebra";

// ---------------------------------------
// App Algebra


// ---------------------------------------
// Monad

export type AppM<v> = Free<AppAlg<any>, v>

export const pure: <v>(v: v) => AppM<v>
    = Free.Of

export const asMonad: <a>(a: AppAlg<a>) => AppM<a>
    = Free.Lift as any

// ---------------------------------------
// Do

type DoAppM<r> = {
    $: <k extends string, v>(k: k, next: (r: r) => AppM<v>) => DoAppM<AddKvToRecord<r, k, v>>
    _: <v>(next: (r: r) => AppM<v>) => DoAppM<r>
    e: <v>(exit: (r: r) => AppM<v>) => AppM<v>
    pure: <v>(exit: (r: r) => v) => AppM<v>
}

export const doAppM: DoAppM<{}>
    = mkDoNotationFor({
        pure: pure,
        map: f => (m: AppM<any>) => m.map(f),
        bind: f => (m: AppM<any>) => m.flatMap(f)
    })


