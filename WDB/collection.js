//@ts-check

import { app } from "../app.js";
import { utility } from "../utility/date.js";

import { DB, AUTH } from "../firebase.js";
import {
    EmployeeElement,
    RequestElement,
    OrderElement,
    SubOrderElement,
    OperationElement,
    RequestTemplateElement,
    PackageElement,
    EmailPackageElement,
    PackageTypeElement,
} from "./document.js";

class CollectionElement extends HTMLElement {
    constructor() {
        super();
        this.connection = null;
        this.newKey = null;
        this.tools = document.querySelector('wdb-tools');
        this.ref = null;
    }

    connectedCallback() {
        this.newKey = DB.ref(this.ref).push().key;

        this.onChildAdded = this.connection.on('child_added', (snapshot, previous) => {
            this.insertAdjacentHTML('beforeend', this.documentTemplate(snapshot.key));
            const newDocument = this.querySelector(`[ref=${snapshot.key}]`);
            if (previous !== null) {
                const nextDocument = this.querySelector(`[ref=${previous}]`).nextElementSibling;
                this.insertBefore(newDocument, nextDocument);
            }
        });

        this.onChildMoved = this.connection.on('child_moved', (snapshot, previous) => {
            //this.insertAdjacentHTML('beforeend', this.documentTemplate(snapshot.key));
            const thisDocument = this.querySelector(`[ref=${snapshot.key}]`);
            //console.log(thisDocument);
            if (previous !== null) {
                const nextDocument = this.querySelector(`[ref=${previous}]`).nextElementSibling;
                this.insertBefore(thisDocument, nextDocument);
            }
        });

        this.onChildRemoved = this.connection.on('child_removed', snapshot => {
            const me = this.querySelector(`[ref="${snapshot.key}"]`);
            me.classList.remove('full');
            setTimeout(() => {
                me.remove();
            }, 500);
        });

        this.activateTools();
    }

    disconnectedCallback() {
        this.connection.off('child_added', this.onChildAdded);
        this.connection.off('child_moved', this.onChildMoved);
        this.connection.off('child_removed', this.onChildRemoved);
    }

    activateTools() { }

    documentTemplate(key) { return '' }

    searchHandler(event) {
        let searchValue = event.target.value;
        let documents = this.querySelectorAll('.document');

        documents.forEach(documentElement => {
            let searchItems = documentElement.querySelectorAll('wdb-text, wdb-lookup');
            documentElement.classList.add('filtered');

            searchItems.forEach(element => {
                let value = element.textContent.toLowerCase();
                if (value.includes(searchValue.toLowerCase())) {
                    documentElement.classList.remove('filtered');
                }
            });

            let ref = documentElement.getAttribute('ref');
            if (ref.includes(searchValue)) {
                documentElement.classList.remove('filtered');
            }
        });
    }
}

class EmployeesCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'employees';
        this.connection = DB.ref(this.ref).orderByChild('firstname');
        this.newOperation = {
            name: '',
            resource: '',
        }
    }

    documentTemplate(key) { return `<wdb-employee class="document" ref="${key}"></wdb-employee>` };

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', () => {
            app.content = `<wdb-edit-employee class="edit" ref="${this.newKey}" add></wdb-edit-employee>`;
        });
        this.tools.querySelector('input[type="search"]').addEventListener('input', event => this.searchHandler(event));
    }
}

class RequestTemplatesCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'request-templates';
        this.connection = DB.ref(this.ref).orderByChild('name');
        this.newRequestTemplate = {
            name: '',
            description: '',
        }
    }

    documentTemplate(key) { return `<wdb-request-template class="document" ref="${key}"></wdb-request-template>` };

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', () => {
            app.content = `<wdb-edit-request-template class="edit" ref="${this.newKey}" add></wdb-edit-request-template>`;
        });
    }
}

class PackageTypesCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'package-types';
        this.connection = DB.ref(this.ref).orderByChild('name');
        this.newType = {
            name: '',
            description: '',
        }
    }

    documentTemplate(key) { return `<wdb-package-type class="document" ref="${key}"></wdb-package-type>` };

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', () => {
            app.content = `<wdb-edit-package-type class="edit" ref="${this.newKey}" add></wdb-edit-package-type>`;
        });
    }
}

class OperationsCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'operations';
        this.connection = DB.ref(this.ref).orderByChild('name');
        this.newOperation = {
            firstname: '',
            lastname: '',
            email: '',
        }
    }

    documentTemplate(key) { return `<wdb-operation class="document" ref="${key}"></wdb-operation>` };

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', () => {
            app.content = `<wdb-edit-operation class="edit" ref="${this.newKey}" add></wdb-edit-operation>`;
        });
        this.tools.querySelector('input[type="search"]').addEventListener('input', event => this.searchHandler(event));
    }
}

class RequestsCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'requests';
        this.connection = DB.ref(this.ref).orderByChild('duedate');
        this.newRequest = {
            number: 'new nunber',
        }
    }

    documentTemplate(key) { return `<wdb-request class="document" ref="${key}"></wdb-request>` };

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', () => {
            app.content = `<wdb-edit-request class="edit" ref="${this.newKey}" add></wdb-edit-request>`;
        });
        this.tools.querySelector('input[type="search"]').addEventListener('input', event => this.searchHandler(event));
    }
}

class OrdersCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'orders';
        this.filter = this.getAttribute('filter');
        this.connection = DB.ref(this.ref).orderByChild('duedate');
    }

    documentTemplate(key) { return `<wdb-order class="document" ref="${key}"></wdb-order>` };

    activateTools() {
        this.tools.querySelector('input[type="search"]').addEventListener('input', event => this.searchHandler(event));
        if (this.tools.querySelector('[logout]')) {
            this.tools.querySelector('[logout]').addEventListener('click', () => {
                AUTH.signOut()
            });
        }
    }
}

class OrdersSubCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'orders';
        this.filter = this.getAttribute('filter');
        this.connection = DB.ref(this.ref).orderByChild('duedate');
    }

    connectedCallback() {
        this.newKey = DB.ref(this.ref).push().key;

        DB.ref('requests').child(this.filter)
            .once('value', snap => {
                this.requestDate = snap.val().duedate;
            });

        this.connection.on('child_added', snapshot => {
            if (snapshot.val().request === this.filter) {
                this.insertAdjacentHTML('beforeend', this.documentTemplate(snapshot.key));
            }
        });

        this.connection.on('child_removed', snapshot => {
            const me = this.querySelector(`[ref="${snapshot.key}"]`);
            me.classList.remove('full');
            setTimeout(() => {
                me.remove();
                // arvuta uus graafik
                const ORDERS = DB.ref('orders').orderByChild('request').equalTo(this.filter);
                ORDERS.once('value')
                    .then(ordersSnap => {
                        const ordersArr = [];
                        ordersSnap.forEach(ordSnap => {
                            const order = { key: ordSnap.key, ...ordSnap.val() }
                            ordersArr.push({
                                key: order.key,
                                duedate: order.duedate,
                                newDate: order.duedate,
                                amount: order.amount,
                            });
                        });
                        // sorteerime hilisemad ettepoole
                        const sortedArray = ordersArr.sort(
                            (prev, next) => {
                                if (prev.newDate > next.newDate) return -1;
                                if (prev.newDate < next.newDate) return 1;
                                return 0;
                            }
                        );
                        // arvutame uue graafiku

                        // SEE ON VALE
                        let prevDate = this.requestDate;


                        const aaaa = utility.toEstLongDateTime(prevDate);
                        const newOrders = sortedArray.map((item, i, arr) => {
                            const { key } = item;
                            if (i > 0) {
                                const { amount } = arr[i - 1];
                                prevDate = utility.getStartTime(prevDate, amount);
                            }
                            const newOrder = {
                                key: key,
                                duedate: prevDate,
                            }
                            return newOrder;
                        });
                        // salvestame
                        newOrders.forEach(order => {
                            const { key, ...newValues } = order;
                            DB.ref('orders').child(key).update(newValues);
                        });
                    });
                // uus graafik ok
            }, 500);
        });

        this.activateTools();

        // arvutame uue graafiku
        //@ts-ignore
        const drake = dragula();
        drake.containers.push(this);
        drake.on('drop', (el, target, source, sibling) => {
            DB.ref('requests').child(this.filter).once('value')
                .then(snap => {
                    return snap.val().duedate;
                })
                .then(reqEndDate => {
                    const orders = [...target.children].reverse().map(item => {
                        const data = {};
                        data.key = item.getAttribute('ref');
                        data.amount = item.value.amount;
                        return data;
                    });
                    // arvutame uue graafiku
                    let prevDate = reqEndDate;
                    const newOrders = orders.map((item, i, arr) => {
                        //debugger
                        const { key } = item;
                        if (i > 0) {
                            const { amount } = arr[i - 1];
                            prevDate = utility.getStartTime(prevDate, amount);
                        }
                        const newOrder = {
                            key: key,
                            duedate: prevDate,
                        }
                        return newOrder;
                    });
                    // salvestame
                    newOrders.forEach(order => {
                        const { key, ...newValues } = order;
                        DB.ref('orders').child(key).update(newValues);
                    });
                });
            // uus graafik OK
        });
    }

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', event => this.addOrder());
        this.tools.querySelector('[back]').addEventListener('click', () => this.goBack());
    }

    goBack() {
        app.content = `<wdb-edit-request class="edit" ref="${this.filter}" add></wdb-edit-request>`;
    }

    addOrder() {
        event.preventDefault();
        let newOrderKey = DB.ref('orders').push().key;
        app.content = `<wdb-edit-order class="edit" ref="${newOrderKey}" link="${this.filter}" add></wdb-edit-order>`;
    }

    documentTemplate(key) { return `<wdb-sub-order class="document" ref="${key}"></wdb-sub-order>` };
}

class PackagesSubCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'packages';
        this.filter = this.getAttribute('filter');
        this.connection = DB.ref(this.ref);
    }

    connectedCallback() {
        this.newKey = DB.ref(this.ref).push().key;

        this.connection.on('child_added', snapshot => {
            if (snapshot.val().request === this.filter) {
                this.insertAdjacentHTML('beforeend', this.documentTemplate(snapshot.key));
            }
        });

        this.connection.on('child_removed', snapshot => {
            const me = this.querySelector(`[ref="${snapshot.key}"]`);
            //me.style.padding = '0';
            //me.style.maxHeight = '0';
            me.classList.remove('full');
            setTimeout(() => me.remove(), 500);
        });

        this.activateTools();
    }

    activateTools() {
        this.tools.querySelector('[add]').addEventListener('click', event => this.addPackage());
        this.tools.querySelector('[back]').addEventListener('click', () => this.goBack());
    }

    goBack() {
        app.content = `<wdb-edit-request class="edit" ref="${this.filter}" add></wdb-edit-request>`;
    }

    addPackage() {
        event.preventDefault();
        let newPackageKey = DB.ref('packages').push().key;
        app.content = `<wdb-edit-package class="edit" ref="${newPackageKey}" link="${this.filter}" add></wdb-edit-package>`;
    }

    documentTemplate(key) { return `<wdb-package class="document" ref="${key}"></wdb-package>` };
}

class EmailPackagesSubCollectionElement extends CollectionElement {
    constructor() {
        super();
        this.ref = 'packages';
        this.filter = this.getAttribute('filter');
        this.connection = DB.ref(this.ref);
    }

    connectedCallback() {
        this.newKey = DB.ref(this.ref).push().key;

        this.connection.on('child_added', snapshot => {
            if (snapshot.val().request === this.filter) {
                this.insertAdjacentHTML('beforeend', this.documentTemplate(snapshot.key));
            }
        });

        this.output = this.children;
    }

    documentTemplate(key) { return `<wdb-email-package ref="${key}"></wdb-email-package>` };
}

customElements.define('wdb-employees-collection', EmployeesCollectionElement);
customElements.define('wdb-requests-collection', RequestsCollectionElement);
customElements.define('wdb-orders-collection', OrdersCollectionElement);
customElements.define('wdb-orders-sub-collection', OrdersSubCollectionElement);
customElements.define('wdb-operations-collection', OperationsCollectionElement);
customElements.define('wdb-request-templates-collection', RequestTemplatesCollectionElement);
customElements.define('wdb-packages-collection', PackagesSubCollectionElement);
customElements.define('wdb-email-packages-collection', EmailPackagesSubCollectionElement);
customElements.define('wdb-package-types-collection', PackageTypesCollectionElement);

export {
    CollectionElement,
    EmployeesCollectionElement,
    RequestsCollectionElement,
    OrdersCollectionElement,
    OrdersSubCollectionElement,
    OperationsCollectionElement,
    RequestTemplatesCollectionElement,
    PackagesSubCollectionElement,
    PackageTypesCollectionElement,
    EmailPackagesSubCollectionElement,
};