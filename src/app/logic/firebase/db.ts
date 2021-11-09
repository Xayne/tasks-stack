import { pmRec, pmString } from "src/lib/generalized-pattern-matching/base-matchers";
import { collectionTypes, createFsHandler } from "../firebase-abstract/firestore-handler";
import { StackDm } from "./data/stack";
import { TaskDm } from "./data/task";
import { readUid, readUidArr } from "./data/uid";
import { UserDm } from "./data/user";

export type DbHandler = ReturnType<typeof mkDbHandler>

export const mkDbHandler
    = createFsHandler({
        users: {
            nameInDb: 'users',
            types: collectionTypes<UserDm, UserDm>({
                readAs: pmRec({
                    stackQueue: readUidArr
                }),
                writeAs: x => ({ stackQueue: x.stackQueue.map(x => x.uid) })
            })
        },
        stacks: {
            nameInDb: 'stacks',
            types: collectionTypes<StackDm, StackDm>({
                readAs: pmRec({
                    owner: readUid,
                    tasks: readUidArr,
                    createdWithPopOfTask: readUid
                }),
                writeAs: x => ({
                    owner: x.owner.uid,
                    tasks: x.tasks.map(x => x.uid),
                    createdWithPopOfTask: x.createdWithPopOfTask.uid
                })
            })
        },
        tasks: {
            nameInDb: 'tasks',
            types: collectionTypes<TaskDm, TaskDm>({
                readAs: pmRec({
                    owner: readUid,
                    name: pmString,
                    desc: pmString
                }),
                writeAs: x => ({
                    owner: x.owner.uid,
                    name: x.name,
                    desc: x.desc
                })
            })
        }

    })
