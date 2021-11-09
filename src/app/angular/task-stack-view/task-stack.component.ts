import { Component, ChangeDetectorRef, Inject, Input } from "@angular/core"
import { modifyTask, popTask } from "src/app/logic/actions/over-stack-state"
import { AppFacade } from "src/app/logic/app-facade"
import { TaskVm, TaskStackVm, maxDepthReachedTaskStack } from "src/app/logic/app-state/stack-state"
import { morph } from "src/lib/fp-essentials/utils/record"
import { DetachedComponent } from "../detached"
import { injAppFacade } from "../inj-app-facade"

@Component({
    selector: 'task-stack-view',
    templateUrl: './task-stack.component.html',
    styleUrls: ['./task-stack.component.scss']
})
export class TaskStackComponent extends DetachedComponent {

    @Input() topmost: boolean = undefined as any
    @Input() maxDepth: number = undefined as any
    @Input() state: TaskStackVm = undefined as any

    readonly maxDepthReachedStack = maxDepthReachedTaskStack

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(injAppFacade) private af: AppFacade
    ) {
        super(cdr)
    }

    trackByIndex = (i: number) => i

    setTaskName(ix: number, t: string) {
        this.af.run(modifyTask(ix, morph<TaskVm>({ name: t })))
    }

    setTaskDesc(ix: number, t: string) {
        this.af.run(modifyTask(ix, morph<TaskVm>({ desc: t })))
    }

    popTask() {
        this.af.run(popTask)
    }

}
