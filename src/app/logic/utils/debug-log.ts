import { defer, Observable, of } from "rxjs";

export const debugLog: (...a: any[]) => Observable<{}>
    = (...a) => defer(() => (void console.log(...a)) || of({}))
