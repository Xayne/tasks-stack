import { Maybe, None } from "src/lib/fp-essentials/data/maybe"
import { Uid } from "../firebase/data/uid"

export type StacksState = {
    showMaxDepth: number
    stack: TaskStackVm
    newTask: NewTask
}

export const initialTaskStack: TaskStackVm
    = {
    tasks: [],
    prev: None,
    stackProducedType: { _tag: 'empty' }
}

export const maxDepthReachedTaskStack: TaskStackVm
    = {
    tasks: [],
    prev: None,
    stackProducedType: { _tag: 'max-depth-reached' }
}

export const emptyStacksState: StacksState = {
    newTask: {
        name: '',
        desc: ''
    },
    showMaxDepth: 20,
    stack: initialTaskStack
}

export type TaskStackVm = {
    tasks: TaskVm[]
    prev: Maybe<TaskStackVm>
    stackProducedType: StackProducedType
}

export type StackProducedType
    = { _tag: 'empty' }
    | { _tag: 'max-depth-reached'}
    | { _tag: 'push' }
    | { _tag: 'pop', popped: TaskVm }

export type TaskVm = {
    uid: Uid
    name: string, desc: string
}

export type NewTask = {
    name: string, desc: string
}
