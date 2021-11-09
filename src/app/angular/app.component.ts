import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { morph_ } from 'src/lib/fp-essentials/utils/record';
import { modifyNewTask, pushCurrentNewTask } from '../logic/actions/over-stack-state';
import { trySignIn } from '../logic/actions/signed-in';
import { AppFacade } from '../logic/app-facade';
import { AppState } from '../logic/app-state';
import { TaskVm } from '../logic/app-state/stack-state';
import { DetachedComponent } from './detached';
import { injAppFacade } from './inj-app-facade';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends DetachedComponent implements OnInit {

    state: AppState = undefined as any

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(injAppFacade) private af: AppFacade
    ) {
        super(cdr)
    }

    ngOnInit() {
        this.af.state.subscribe(x => {
            this.state = x
            this.runCd()
        })
    }

    signInWithGoogleClick() {
        this.af.run(trySignIn)
    }

    setNewTaskName(t: string) {
        this.af.run(modifyNewTask(morph_(_ => ({ name: t }))))
    }

    setNewTaskDesc(t: string) {
        this.af.run(modifyNewTask(morph_(_ => ({ desc: t }))))
    }

    pushNewTask() {
        this.af.run(pushCurrentNewTask)
    }

}
