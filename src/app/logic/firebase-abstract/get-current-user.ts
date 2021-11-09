// https://github.com/firebase/firebase-js-sdk/issues/462

import { Auth, User } from "@firebase/auth"
import { defer, Observable } from "rxjs"

export const getCurrentUser: (auth: Auth) => Observable<User | undefined>
    = auth => defer(() =>
        new Promise<User | undefined>((resolve, reject) => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe()
                if (user === null) {
                    resolve(undefined)
                    return
                }
                resolve(user)
            }, reject)
        })
    )
