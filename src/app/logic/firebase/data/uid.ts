import { Just } from "src/lib/fp-essentials/data/maybe"
import { pmAnd, pmArray, pmString } from "src/lib/generalized-pattern-matching/base-matchers"
import { Matcher } from "src/lib/generalized-pattern-matching/matcher"
import { FirestoreDoc } from "../../firebase-abstract/firestore-doc"

export type Uid = { uid: string }

export const emptyUid: Uid
    = { uid: '' }

export const isEmptyUid: (uid: Uid) => boolean
    = ({ uid }) => uid.length === 0

export const readUid: Matcher<unknown, Uid>
    = pmAnd(pmString, uid => Just({ uid }))

export const readUidArr: Matcher<unknown, Uid[]>
    = pmArray(readUid)

export const getUid: (fd: FirestoreDoc<any>) => Uid
    = fd => ({ uid: fd.uid })
