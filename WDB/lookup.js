//@ts-check

import { DB } from "../firebase.js";

class LookupElement extends HTMLElement {
    constructor() {
        super();
        this.ref = this.getAttribute('ref');
        this.connection = DB.ref(this.ref);
        this.label = this.innerHTML;
    }

    connectedCallback() {
        this.connection.on('value', snapshot => {
            this.value = snapshot.val() || '';
            this.innerHTML = this.label + this.value;
        });
    }
}

customElements.define('wdb-lookup', LookupElement);

export { LookupElement }