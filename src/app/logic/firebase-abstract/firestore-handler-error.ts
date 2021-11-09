export type FirestoreHandlerError
    = { _tag: 'FHE.PatternMatchingFail', docPath: string, gotInstead: any }
    | { _tag: 'FHE.FirestoreErr', err: any }

