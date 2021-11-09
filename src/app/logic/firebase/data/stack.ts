import { Uid } from "./uid";

export type StackDm = {
    owner: Uid,
    tasks: Uid[],
    /** empty uid means nothing */
    createdWithPopOfTask: Uid
}
