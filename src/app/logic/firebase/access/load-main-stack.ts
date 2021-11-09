import { Observable, of, throwError } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { doObs } from "src/lib/do-notation-generic/do.rxjs";
import { Just, mbMap, mbUnbox, None } from "src/lib/fp-essentials/data/maybe";
import { p } from "src/lib/fp-essentials/utils/apply-fn-pipe";
import { arrTakeLast } from "src/lib/fp-essentials/utils/array";
import { morphFlipped } from "src/lib/fp-essentials/utils/record";
import { pure } from "../../app-m/monad";
import { initialTaskStack, maxDepthReachedTaskStack, TaskStackVm, TaskVm } from "../../app-state/stack-state";
import { mkExpressCache } from "../../firebase-abstract/express-cache";
import { all } from "../../utils/all";
import { assertExists } from "../../utils/assert-exists";
import { debugLog } from "../../utils/debug-log";
import { TaskDm } from "../data/task";
import { isEmptyUid, Uid } from "../data/uid";
import { UserDm } from "../data/user";
import { DbHandler } from "../db";

const asEx = concatMap(assertExists)

const loadUser: (userUid: Uid) => (h: DbHandler) => Observable<UserDm>
    = uid => h => doObs
        .$('mu', _ => h.users.get(uid.uid))
        .$('u', z => z.mu.hasVal
            ? of(z.mu.val)
            : h.users.set(uid.uid, { stackQueue: [] }).pipe(map(_ => ({ stackQueue: [] })))
        )
        .pure(z => z.u)

export const loadMainStack: (userUid: Uid) => (h: DbHandler) => Observable<TaskStackVm>
    = uid => h =>
        doObs
            ._(_ => debugLog('Loading started'))
            .$('u', _ => loadUser(uid)(h))
            .$('stackDms', z =>
                all(
                    p(z.u.stackQueue, arrTakeLast(20))
                        .map(({ uid }) => h.stacks.get(uid).pipe(asEx))
                )
            )
            .$('tasksProxy', _ => of(
                mkExpressCache(h.tasks.get)
            ))
            .$('stacksWithTasks', z =>
                all(z.stackDms.map(s => doObs
                    .$('tasks', _ => all(
                        s.tasks.map(tUid =>
                            z.tasksProxy.get(tUid.uid).pipe(asEx, map(toTaskVm(tUid)))
                        )
                    ))
                    .$('prodFromPopped', _ =>
                        isEmptyUid(s.createdWithPopOfTask)
                            ? of(None)
                            : z.tasksProxy
                                .get(s.createdWithPopOfTask.uid)
                                .pipe(asEx, map(toTaskVm(s.createdWithPopOfTask)), map(Just))
                    )
                    .pure<TaskStackVm>(z => ({
                        tasks: z.tasks,
                        prev: None,
                        stackProducedType: p(
                            z.prodFromPopped,
                            mbMap(t => ({ _tag: 'pop' as const, popped: t })),
                            mbUnbox(({ _tag: 'push' }))
                        )
                    }))
                ))
            )
            ._(_ => debugLog('loading finished'))
            .pure(z => {
                if (z.stacksWithTasks.length === 0) {
                    return initialTaskStack
                }
                const lastStack = z.u.stackQueue.length > z.stackDms.length
                    ? maxDepthReachedTaskStack : initialTaskStack
                return [lastStack].concat(z.stacksWithTasks)
                    .reduce((p, c) => morphFlipped(c)({ prev: Just(p) }))
            })


const toTaskVm: (uid: Uid) => (d: TaskDm) => TaskVm
    = uid => v => ({ name: v.name, desc: v.desc, uid })

