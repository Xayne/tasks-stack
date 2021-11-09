import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { TaskStackComponent } from "./task-stack.component"


@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        TaskStackComponent
    ],
    exports: [
        TaskStackComponent
    ]
})
export class TaskStackModule { }

