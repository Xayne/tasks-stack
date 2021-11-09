import { Uid } from "./uid";

export type UserDm = {
    /** instead of linked list in stacks, last is freshiest */
    stackQueue: Uid[]
}
