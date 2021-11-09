import { Just } from "src/lib/fp-essentials/data/maybe";
import { p } from "src/lib/fp-essentials/utils/apply-fn-pipe";
import { arrHead } from "src/lib/fp-essentials/utils/array";
import { const$ } from "src/lib/fp-essentials/utils/const";
import { morphFlipped, morph_ } from "src/lib/fp-essentials/utils/record";
import { Endo } from "src/lib/utils";
import { wrapToAppErr } from "../app-m/app-err";
import { liftObs, modifyState, readState, throwErr, withDb } from "../app-m/ctors";
import { AppM, doAppM, pure } from "../app-m/monad";
import { NewTask, TaskStackVm, TaskVm } from "../app-state/stack-state";
import { createNextStack } from "../firebase/access/create-next-stack";
import { createTask } from "../firebase/access/create-task";
import { emptyUid, Uid } from "../firebase/data/uid";
import { assertExists } from "../utils/assert-exists";
import { doBlockingUi } from "./do-blocking-ui";
import { getUserUidOrErr } from "./signed-in";

export const modifyNewTask: (f: Endo<NewTask>) => AppM<{}>
    = f => modifyState(morph_(s => ({
        stacks: morphFlipped(s.stacks)({
            newTask: f(s.stacks.newTask)
        })
    })))

export const resetNewTask: AppM<{}>
    = modifyNewTask(const$({ name: '', desc: '' }))

// TODO BE
export const modifyTask: (ix: number, f: Endo<TaskVm>) => AppM<{}>
    = (ix, f) => doAppM
        ._(_ => throwErr(wrapToAppErr('BE IS NOT IMPLEMENTED')))
        ._(_ =>
            modifyState(morph_(s => ({
                stacks: morphFlipped(s.stacks)
                    ({
                        stack: morphFlipped(s.stacks.stack)({
                            tasks: s.stacks.stack.tasks.map((t, i) => i === ix
                                ? f(t)
                                : t
                            )
                        })
                    })
            })))
        )
        .pure(_ => ({}))

export const pushCurrentNewTask: AppM<{}>
    = doAppM
        .$('s', _ => readState)
        .$('u', _ => getUserUidOrErr)
        .$('newTask', ({ s, u }) =>
            doBlockingUi(withDb(createTask({
                desc: s.stacks.newTask.desc,
                name: s.stacks.newTask.name,
                owner: u
            })).map(uid => ({
                desc: s.stacks.newTask.desc,
                name: s.stacks.newTask.name,
                uid
            })))
        )
        ._(z => pushTask(z.newTask))
        .e(_ => resetNewTask)

export const pushTask: (t: TaskVm) => AppM<{}>
    = t => doAppM
        .$('oldStack', _ => readState.map(x => x.stacks.stack))
        .$('newStack', z => pure(
            morphFlipped(z.oldStack)({
                tasks: [t].concat(z.oldStack.tasks),
                prev: Just(z.oldStack),
                stackProducedType: { _tag: 'push' }
            })
        ))
        ._(z => createNewStackInDbAndState(z.newStack, emptyUid))
        .pure(_ => ({}))

export const popTask: AppM<{}>
    = doAppM
        .$('oldStack', _ => readState.map(x => x.stacks.stack))
        .$('popped', z => p(z.oldStack.tasks, arrHead, assertExists, liftObs))
        .$('newStack', z => pure(
            morphFlipped(z.oldStack)({
                tasks: z.oldStack.tasks.slice(1, z.oldStack.tasks.length),
                prev: Just(z.oldStack),
                stackProducedType: { _tag: 'pop', popped: z.popped }
            })
        ))
        ._(z => createNewStackInDbAndState(z.newStack, z.popped.uid))
        .pure(_ => ({}))

const createNewStackInDbAndState: (st: TaskStackVm, createdWithPopOfTask: Uid) => AppM<Uid>
    = (st, cwp) => doAppM
        ._(_ =>
            st.stackProducedType._tag === 'empty'
                || st.stackProducedType._tag === 'max-depth-reached'
                ? throwErr<{}>(wrapToAppErr('empty or max-depth-reached cannot be created in db and view'))
                : pure({})
        )
        .$('u', _ => getUserUidOrErr)
        .$('uid', z =>
            doBlockingUi(withDb(createNextStack({
                owner: z.u,
                tasks: st.tasks.map(x => x.uid),
                createdWithPopOfTask: cwp
            })))
        )
        ._(z =>
            modifyState(morph_(s => ({
                stacks: morphFlipped(s.stacks)
                    ({
                        stack: st
                    })
            })))
        ).pure(z => z.uid)



