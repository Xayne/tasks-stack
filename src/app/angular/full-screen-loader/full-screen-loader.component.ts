import { Component, Input } from "@angular/core"
import { DetachedComponent } from "../detached";

@Component({
    selector: 'full-screen-loader',
    templateUrl: './full-screen-loader.component.html',
    styleUrls: ['./full-screen-loader.component.scss']
})
export class FullScreenLoaderComponent extends DetachedComponent {
    @Input() state: boolean = undefined as any
}
