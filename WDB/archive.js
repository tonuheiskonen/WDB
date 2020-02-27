//@ts-check

import { CollectionElement } from "./collection.js";
import { DB } from "../firebase.js";
import { app } from "../app.js";
import { DocumentElement } from "./document.js";
import { utility } from "../utility/date.js";

class ArchiveCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'archive/requests';
        this.connection = DB.ref(this.ref).orderByChild('duedate');
    }

    documentTemplate(key) { return `<wdb-archive-request class="document" ref="${key}"></wdb-archive-request>` };
    activateTools() {
        this.tools.querySelector('input[type="search"]').addEventListener('input', event => this.searchHandler(event));
    }
}

class ArchiveRequestElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'archive/requests/' + this.ref;
    }

    addHandler() {
        app.content = `<wdb-edit-request class="edit" ref="${this.key}"></wdb-edit-request>`;
    }

    archiveHandler(number) {
        if (confirm(`ARHIVEERIDA tellimus nr.${number} ?`)) {
            DB.ref('orders').orderByChild('request').equalTo(this.getAttribute('ref'))
                .once('value', snapshot => {
                    snapshot.forEach(item => {
                        DB.ref('archive').child('orders/' + item.key).update(item.val());
                        DB.ref('orders').child(item.key).remove();
                    });
                });
            DB.ref('archive').child(this.ref).update(this.value);
            DB.ref(this.ref).remove();
        }
    }

    render() {
        let request = this.value;
        this.innerHTML = `
        <wdb-text><label>tellimus: </label>${request.number}</wdb-text>
        <wdb-text><label>kirjeldus: </label>${request.description}</wdb-text>
            <wdb-text><label>tähtaeg: </label>${utility.toEstLongDate(request.duedate)}</wdb-text>
            <div row>
                <wdb-lookup ref="employees/${request.manager}/firstname"><label>projektijuht: </label></wdb-lookup>
                <wdb-lookup ref="employees/${request.manager}/lastname"></wdb-lookup>
            </div>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
    }
}

customElements.define('wdb-archive-collection', ArchiveCollectionElement);
customElements.define('wdb-archive-request', ArchiveRequestElement);

export { ArchiveCollectionElement }