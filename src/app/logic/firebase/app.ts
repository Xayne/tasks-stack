import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

import cfg from '../../../../firebase-config.json'

export const initFirebase: () => [Auth, Firestore]
    = () => {
        const app = initializeApp({
            apiKey: cfg.apiKey,
            authDomain: cfg.authDomain,
            projectId: cfg.projectId,
            appId: cfg.appId,
            messagingSenderId: cfg.messagingSenderId
        })
        return [getAuth(app), getFirestore(app)]
    }


