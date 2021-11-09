import { Maybe, None } from "src/lib/fp-essentials/data/maybe"
import { Uid } from "../firebase/data/uid"
import { emptyStacksState, StacksState } from "./stack-state"

export type AppState = {
    signedInAs: Maybe<Uid>
    stacks: StacksState
    uiBlockCount: number
}


export const initialAppState: AppState
    = {
    signedInAs: None,
    stacks: emptyStacksState,
    uiBlockCount: 0
}

