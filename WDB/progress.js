//@ts-check

import { DB } from "../firebase.js";

class ProgressElement extends HTMLElement {
    connectedCallback() {
        const ref = this.getAttribute('ref');
        DB.ref('orders').orderByChild('duedate')
            .once('value', data => {
                if (!data.val()) {
                    this.setAttribute('empty', '');
                }
                data.forEach(item => {
                    if (item.val().request === ref) {
                        this.insertAdjacentHTML('beforeend', `
                         <wdb-meter ref="orders/${item.key}"></wdb-meter>
                     `);
                    }
                });
            });
    }
}

class MeterElement extends HTMLElement {
    connectedCallback() {
        const empty = this.hasAttribute('empty');
        if (!empty) {
            this.ref = DB.ref(this.getAttribute('ref'));
            this.ref.on('value', data => {
                if (data.val()) {
                    this.style.flex = data.val().amount;

                    if (data.val().duedate < '2017-12-20') {
                        this.classList.add('danger')
                    }
                    if (data.val().completed) {
                        this.classList.remove('danger');
                        this.setAttribute('completed', '');
                    }
                }
            });
        }
    }

    disconnectedCallback() {
        if (this.ref) this.ref.off();
    }
}

customElements.define('wdb-progress', ProgressElement);
customElements.define('wdb-meter', MeterElement);

export {
    ProgressElement,
    MeterElement,
}