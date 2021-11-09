import { ChangeDetectorRef, Directive } from "@angular/core"


@Directive()
export class DetachedComponent {

    constructor(private cdr: ChangeDetectorRef) {
        cdr.detach()
    }

    ngOnChanges() {
        this.cdr.detectChanges()
    }

    runCd() {
        this.cdr.detectChanges()
    }

}
