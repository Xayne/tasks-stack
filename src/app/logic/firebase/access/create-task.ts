import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TaskDm } from "../data/task";
import { getUid, Uid } from "../data/uid";
import { DbHandler } from "../db";

type Input = TaskDm

/** just creates new task */
export const createTask: (i: Input) => (h: DbHandler) => Observable<Uid>
    = i => h => h.tasks.set(undefined, i).pipe(map(getUid))
