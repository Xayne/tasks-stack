import { morphFlipped } from "src/lib/fp-essentials/utils/record";
import { updateState, withDb } from "../app-m/ctors";
import { AppM, doAppM, pure } from "../app-m/monad";
import { emptyStacksState } from "../app-state/stack-state";
import { loadMainStack } from "../firebase/access/load-main-stack";
import { doBlockingUi } from "./do-blocking-ui";
import { updateSignInInfo } from "./signed-in";

export const initApp: AppM<{}>
    = doBlockingUi(doAppM
        .$('u', _ => updateSignInInfo)
        ._(z => z.u.hasVal
            ? withDb(loadMainStack({ uid: z.u.val.uid }))
                .flatMap(s => updateState({ stacks: morphFlipped(emptyStacksState)({ stack: s }) }))
            : pure({})
        )
        .pure(_ => ({}))
    )


