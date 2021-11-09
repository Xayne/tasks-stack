import { Maybe } from "src/lib/fp-essentials/data/maybe";
import { p } from "src/lib/fp-essentials/utils/apply-fn-pipe";
import { getUserUid, liftObs, readState, signInWithGoogle, updateState } from "../app-m/ctors";
import { AppM, doAppM } from "../app-m/monad";
import { Uid } from "../firebase/data/uid";
import { assertExists } from "../utils/assert-exists";
import { doBlockingUi } from "./do-blocking-ui";

export const updateSignInInfo: AppM<Maybe<Uid>>
    = doBlockingUi(doAppM
        .$('uid', _ => getUserUid)
        ._(z => updateState({ signedInAs: z.uid }))
        .pure(z => z.uid)
    )

export const trySignIn: AppM<Maybe<Uid>>
    = signInWithGoogle.flatMap(r => updateSignInInfo)

/** if not signed in, error will be thrown  */
export const getUserUidOrErr: AppM<Uid>
    = readState.flatMap(x => p(
        x.signedInAs,
        assertExists,
        liftObs
    ))
