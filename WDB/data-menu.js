//@ts-check

import { app } from "../app.js";
import {
    EmployeesCollectionElement,
    OperationsCollectionElement,
    RequestsCollectionElement,
    RequestTemplatesCollectionElement,
    PackageTypesCollectionElement,
} from "./collection.js";

import { ArchiveCollectionElement } from "./archive.js";
import { EditSettings, EditUserElement } from "./edit-document.js";

class DataMenuElement extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <a action="displayEmployees">TÖÖTAJAD</a>
            <a action="displayOperations">OPERATSIOONID</a>
            <a action="" style="display:none;" disabled>NORMID</a>
            <a action="displayRequestTemplates" style="display:none;" disabled>TELLIMUSE PÕHJAD</a>
            <a action="displayPackegeTypes">PAKENDI TÜÜBID</a>
            <a action="displayArchive">TELLIMUSTE ARHIIV</a>
            <a action="displayUser">KASUTAJA</a>
            <a action="displaySettings" style="display:none;" disabled>TÖÖAJA SEADED</a>
        `;

        this.tools = this.querySelectorAll('a');

        this.tools.forEach(item => {
            const clickHandler = this[item.getAttribute('action')];
            item.addEventListener('click', clickHandler);
        });
    }

    displayUser() {
        app.content = `
            <wdb-edit-user class="edit"></wdb-edit-user>
        `;
    }

    displayPackegeTypes() {
        app.content = `
            <wdb-tools>
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-package-types-collection class="collection"></wdb-package-types-collection>
        `;
    }

    displayRequestTemplates() {
        app.content = `
            <wdb-tools>
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-request-templates-collection class="collection"></wdb-request-templates-collection>
        `;
    }

    displayEmployees() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-employees-collection class="collection"></wdb-employees-collection>
        `;
    }

    displayOperations() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-operations-collection class="collection"></wdb-operations-collection>
        `;
    }

    displayArchive() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
            </wdb-tools>
            <wdb-archive-collection class="collection"></wdb-archive-collection>
        `;
    }

    displaySettings() {
        app.content = `
            <wdb-settings class="edit" ref="settings"></wdb-settings>
        `;
    }
}

customElements.define('wdb-data-menu', DataMenuElement);

export { DataMenuElement }