import { morph_ } from "src/lib/fp-essentials/utils/record";
import { modifyState, throwErr, tryCatch } from "../app-m/ctors";
import { AppM } from "../app-m/monad";


const blockInc = modifyState(morph_(s => ({ uiBlockCount: s.uiBlockCount + 1 })))
const blockDec = modifyState(morph_(s => ({ uiBlockCount: s.uiBlockCount - 1 })))

export const doBlockingUi: <a>(a: AppM<a>) => AppM<a>
    = m => blockInc
        .flatMap(_ =>
            tryCatch(
                m.flatMap(v => blockDec.map(_ => v))
                , e => blockDec.flatMap(_ => throwErr(e))
            )
        )

