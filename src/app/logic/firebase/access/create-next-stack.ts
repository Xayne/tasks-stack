


import { Observable, throwError } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { doObs } from "src/lib/do-notation-generic/do.rxjs";
import { morphFlipped } from "src/lib/fp-essentials/utils/record";
import { assertExists } from "../../utils/assert-exists";
import { StackDm } from "../data/stack";
import { getUid, Uid } from "../data/uid";
import { DbHandler } from "../db";

type Input = StackDm

/** creates stack and puts it's uid in user.stackQueue */
export const createNextStack: (i: Input) => (h: DbHandler) => Observable<Uid>
    = i => h => doObs
        .$('uid', _ => h.stacks.set(undefined, i).pipe(map(getUid)))
        .$('u', _ => h.users.get(i.owner.uid).pipe(concatMap(assertExists)))
        ._(z => h.users
            .set(i.owner.uid, morphFlipped(z.u)({ stackQueue: z.u.stackQueue.concat([z.uid]) }))
        )
        .pure(x => x.uid)

