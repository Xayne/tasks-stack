import { Observable, of, throwError } from "rxjs";
import { Maybe } from "src/lib/fp-essentials/data/maybe";

export const assertExists: <v>(o: Maybe<v>) => Observable<v>
    = v => v.hasVal ? of(v.val) : throwError('assertExists! todo')


