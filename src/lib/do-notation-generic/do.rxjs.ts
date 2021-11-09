import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { AddKvToRecord, mkDoNotationFor } from "./do-general";




type DoObs<r> = {
    $: <k extends string, v>(k: k, next: (r: r) => Observable<v>) => DoObs<AddKvToRecord<r, k, v>>
    _: <v>(next: (r: r) => Observable<v>) => DoObs<r>
    e: <v>(exit: (r: r) => Observable<v>) => Observable<v>
    pure: <v>(exit: (r: r) => v) => Observable<v>
}

export const doObs: DoObs<{}> = mkDoNotationFor({
    pure: of,
    map: map,
    bind: concatMap
})







