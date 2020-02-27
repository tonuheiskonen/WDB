//@ts-check
import { app } from "../app.js";
import { AUTH } from "../firebase.js";
import { RequestsCollectionElement, OrdersCollectionElement } from "./collection.js";
import { DataMenuElement } from "./data-menu.js";
import { RequestsGraphElement, RequestBoxElement, OrderBoxElement, StartBoxElement, GridElement } from "./requests-graph.js";
import { utility } from "../utility/date.js";

class MenuElement extends HTMLElement {
    select() {
        [...this.parentElement.children].forEach(item => {
            item.classList.remove('selected');
        });
        this.classList.add('selected');
    }

    connectedCallback() {
        this.items = this.querySelectorAll('a');
        this.items.forEach(item => {
            const clickHandler = this[item.getAttribute('action')];
            item.addEventListener('click', clickHandler);
            item.addEventListener('click', this.select);
        });
    }

    displayRequests() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-requests-collection class="collection"></wdb-requests-collection>
        `;
    }

    displayOrders() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
            </wdb-tools>
            <h2 id="caption">Töökäsud ${utility.toEstLongDate(new Date())}</h2>
            <wdb-orders-collection class="collection"></wdb-orders-collection>
        `;
    }

    displayGraph() {
        app.content = '<wdb-requests-graph></wdb-requests-graph>';
    }

    displayDataMenu() {
        app.content = '<wdb-data-menu></wdb-data-menu>';
    }

    displaySettings() {
        app.content = 'settings';
    }

    logOff() {
        AUTH.signOut();
    }
}

customElements.define('wdb-menu', MenuElement);

export { MenuElement };