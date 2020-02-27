//@ts-check

import { DB, AUTH } from "../firebase.js";
import { app } from "../app.js";
import { OrdersSubCollectionElement, PackagesSubCollectionElement } from "./collection.js";
import { utility } from "../utility/date.js";

// @ts-ignore
HTMLSelectElement.prototype.fillOptons = function (options) {
    this.innerHTML = `<option value=""></option>`;

    DB.ref(options.from).once('value', snapshot => {
        snapshot.forEach(item => {
            if (item.key === options.value) {
                this.insertAdjacentHTML('beforeend', `
                    <option value="${item.key}" selected>${item.val()[options.display[0]]} ${item.val()[options.display[1]] || ''}</option>
                `);
                return;
            }
            this.insertAdjacentHTML('beforeend', `
                    <option value="${item.key}">${item.val()[options.display[0]]} ${item.val()[options.display[1]] || ''}</option>
                `);
        });
    });
}

class EditDocumentElement extends HTMLElement {
    constructor() {
        super();
        this.ref = this.getAttribute('ref');
        this.key = null;
        this.value = {};
        this.newValue = {};
        this.add = false;
        this.tools = null;
    }

    connectedCallback() {
        DB.ref(this.ref).once('value', snapshot => {
            this.key = snapshot.key;
            this.value = snapshot.val() || this.newValue;
            if (!snapshot.val()) {
                this.add = true;
            }
            this.render();
            this.activateTools();
            if (this.querySelector('form')) this.querySelector('form').addEventListener('submit', event => this.submit());
        });
    }

    submit() {
        event.preventDefault();
        this.querySelectorAll('.property').forEach(element => {
            //@ts-ignore
            this.value[element.id] = element.value;
            //@ts-ignore
            if (this.tagName === 'WDB-EDIT-REQUEST' && element.type === 'date') {
                //@ts-ignore
                this.value[element.id] = new Date(element.value).setHours(15, 30, 0, 0);
            }
        });
        DB.ref(this.ref).update(this.value);
        this.goBack();
    }

    render() { }
    activateTools() { }
    goBack() {
        app.goBack();
    }
}

class EditSettings extends EditDocumentElement {
    constructor() {
        super();
        this.ref = this.ref;
    }

    render() {
        let settings = this.value;
        this.innerHTML = `
            <label>muuda seadeid</label>
            <form>
                <div class="input">
                    <input type="time" id="workdayStartTime" class="property" value="${settings.workdayStartTime}" autofocus>
                    <label for="workdayStartTime">tööpäeva algus</label>
                </div>
                <div class="input">
                    <input type="time" id="workdayEndTime" class="property" value="${settings.workdayEndTime}">
                    <label for="workdayEndTime">tööpäeva lõpp</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
    }
}

class EditUserElement extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <label style="text-align:right;">muuda kasutaja andmeid</label>
            <form>
                <div class="input">
                    <input id="displayName" class="property" value="${AUTH.currentUser.displayName}" autofocus>
                    <label for="displayName">kasutajanimi</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
        let form = document.forms[0]
        form.addEventListener('submit', () => {
            event.preventDefault();
            let newDisplayName = form.displayName.value;
            AUTH.currentUser.updateProfile({ displayName: newDisplayName });
            app.goBack();
        });
    }
}

class EditEmployeeElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'employees/' + this.ref;
        this.newValue = {
            firstname: '',
            lastname: '',
            email: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus töötaja' : 'muuda töötaja andmeid';
        let employee = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <div class="input">
                    <input id="firstname" class="property" value="${employee.firstname}" autofocus>
                    <label for="firstname">eesnimi</label>
                </div>
                <div class="input">
                    <input id="lastname" class="property" value="${employee.lastname}">
                    <label for="lastname">perekonnanimi</label>
                </div>
                <div class="input">
                    <input id="email" class="property" value="${employee.email}">
                    <label for="email">meiliaadress</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
    }
}

class EditPackageTypeElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'package-types/' + this.ref;
        this.newValue = {
            name: '',
            description: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus pakendi tüüp' : 'muuda pakendi tüübi andmeid';
        let pack = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <div class="input">
                    <input id="name" class="property" value="${pack.name}" autofocus>
                    <label for="name">nimetus</label>
                </div>
                <div class="input">
                    <input id="description" class="property" value="${pack.description}">
                    <label for="description">selgitus</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
    }
}

class EditOperationElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'operations/' + this.ref;
        this.newValue = {
            name: '',
            capacity: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus operatsioon' : 'muuda operatsiooni andmeid';
        let operation = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <div class="input">
                    <input id="name" class="property" value="${operation.name}" autofocus>
                    <label for="name">nimetus</label>
                </div>
                <div class="input">
                    <input id="capacity" class="property" value="${operation.capacity}">
                    <label for="capacity">ressurss</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
    }
}

class EditRequestTemplateElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'request-templates/' + this.ref;
        this.newValue = {
            name: '',
            description: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus tellimuse põhi' : 'muuda tellimuse põhja andmeid';
        let requestTemplate = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <div class="input">
                    <input id="name" class="property" value="${requestTemplate.name}" autofocus>
                    <label for="name">nimetus</label>
                </div>
                <div class="input">
                    <input id="capacity" class="property" value="${requestTemplate.description}">
                    <label for="capacity">ressurss</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
    }
}

class EditPackageElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'packages/' + this.ref;
        this.newValue = {
            request: this.getAttribute('link'),
            type: '',
            weight: '',
            length: '',
            width: '',
            height: '',
            amount: 1,
        };
    }

    render() {
        let caption = this.add ? 'lisa uus pakend' : 'muuda pakendi andmeid';
        let pack = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <div class="input">
                    <select id="type" class="property" value="${pack.type}"></select>
                    <label for="type">tüüp</label>
                </div>
                <div row>
                <div class="input">
                    <input id="length" class="property" value="${pack.length}">
                    <label for="length">pikkus (mm)</label>
                </div>
                <div class="input">
                    <input id="width" class="property" value="${pack.width}">
                    <label for="width">laius (mm)</label>
                </div>
                <div class="input">
                    <input id="height" class="property" value="${pack.height}">
                    <label for="height">kõrgus (mm)</label>
                </div>
                </div>
                <div class="input">
                    <input id="weight" class="property" value="${pack.weight}">
                    <label for="weight">kaal (kg)</label>
                </div>
                <div class="input">
                    <input id="amount" class="property" value="${pack.amount}">
                    <label for="amount">kogus</label>
                </div>
                <wdb-tools>
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
        `;
        //@ts-ignore
        this.querySelector('[id="type"').fillOptons({
            from: 'package-types',
            display: ['name'],
            value: pack.type,
        })
    }
}

class EditRequestElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'requests/' + this.ref;
        this.newValue = {
            number: '',
            duedate: undefined,
            description: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus tellimus' : 'muuda tellimuse andmeid';
        this.request = this.value;
        this.innerHTML = `
            <label>${caption}</label>
            <form>
                <wdb-tools>
                    <button type="button" class="nice" orders>TÖÖKÄSUD</button>
                    <button type="button" class="nice" packages>PAKENDID</button>
                    <!--button type="button" class="nice">MÄRKUSED</button-->
                </wdb-tools>
                <div class="input">
                    <input type="text" id="number" class="property" value="${this.request.number}" autofocus>
                    <label for="number">number</label>
                </div>
                <div class="input">
                    <input id="description" class="property" value="${this.request.description}">
                    <label for="description">kirjeldus</label>
                </div>
                <div class="input">
                    <input id="duedate" class="property" type="date">
                    <label for="duedate">tähtaeg</label>
                </div>
                <div class="input">
                    <select id="manager" class="property" value="${this.request.manager}"></select>
                    <label for="manager">projektijuht</label>
                </div>
                <wdb-tools>
                    <!--button type="button" class="nice" add>LISA TÖÖKÄSK</button-->
                    <button type="submit" class="nice">SALVESTA</button>
                </wdb-tools>
            </form>
            `;
        //@ts-ignore
        document.getElementById('duedate').valueAsDate = new Date(this.request.duedate);
        //@ts-ignore
        this.querySelector('[id="manager"').fillOptons({
            from: 'employees',
            display: ['firstname', 'lastname'],
            value: this.request.manager,
        })
        this.tools = document.querySelector('wdb-tools');
    }

    activateTools() {
        this.tools.querySelector('[orders]').addEventListener('click', event => this.showOrders());
        this.tools.querySelector('[packages]').addEventListener('click', event => this.showPackages());
    }

    showOrders() {
        this.submit();
        app.content = `
            <wdb-text class="yellow" style="text-align:right;margin:20px 0 4px 0;"><label>tellimuse </label>${this.request.number}<label> töökäsud</label></wdb-text>
            <wdb-tools>
                <button type="button" class="nice" add>LISA</button>
                <button type="button" class="nice" back>KORRAS</button>
            </wdb-tools>
            <wdb-orders-sub-collection class="collection" filter="${this.key}"></wdb-orders-sub-collection>
        `;
    }

    showPackages() {
        this.submit();
        app.content = `
            <wdb-text class="yellow" style="text-align:right;margin:20px 0 4px 0;"><label>tellimuse </label>${this.request.number}<label> pakendid</label></wdb-text>
            <wdb-tools>
                <button type="button" class="nice" add>LISA</button>
                <button type="button" class="nice" back>KORRAS</button>
            </wdb-tools>
            <wdb-packages-collection class="collection" filter="${this.key}"></wdb-packages-collection>
        `;
    }

    addOrder() {
        event.preventDefault();
        this.querySelectorAll('.property').forEach(element => {
            //@ts-ignore
            this.value[element.id] = element.value;
        });
        DB.ref(this.ref).update(this.value);
        let newOrderKey = DB.ref('orders').push().key;
        app.content = `<wdb-edit-order class="edit" ref="${newOrderKey}" link="${this.key}" add></wdb-edit-order>`;
    }

    submit() {
        event.preventDefault();
        this.querySelectorAll('.property').forEach(element => {
            //@ts-ignore
            this.value[element.id] = element.value;
            //@ts-ignore
            if (this.tagName === 'WDB-EDIT-REQUEST' && element.type === 'date') {
                //@ts-ignore
                this.value[element.id] = new Date(element.value).setHours(15, 0, 0, 0);
            }
        });
        DB.ref(this.ref).update(this.value);
        // arvutame uue graafiku
        const ORDERS = DB.ref('orders').orderByChild('request').equalTo(this.key);
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
                let prevDate = this.value.duedate;
                const newOrders = sortedArray.map((item, i, arr) => {
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
        // uus graafik ok
        this.goBack();
    }

    goBack() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-requests-collection class="collection"></wdb-requests-collection>
        `;
    }
}


class EditOrderElement extends EditDocumentElement {
    constructor() {
        super();
        this.ref = 'orders/' + this.ref;
        this.requestKey = this.getAttribute('link');
        this.newValue = {
            request: this.getAttribute('link'),
            number: '',
            operation: '',
            amount: '',
        };
    }

    render() {
        let caption = this.add ? 'lisa uus töökäsk' : 'muuda töökäsu andmeid';
        let order = this.value;
        DB.ref('requests').child(this.requestKey)
            .once('value', snap => {
                this.requestDate = snap.val().duedate;
            });
        // kas order juba on
        DB.ref('orders').orderByChild('duedate').once('value')
            .then(snap => {
                const dates = [];
                snap.forEach(item => {
                    const { request, duedate, amount } = item.val();
                    if (request !== this.newValue.request) return;
                    dates.push(utility.getStartTime(duedate, amount));
                });
                return dates;
            })
            .then(res => {
                DB.ref(`requests/${order.request}/duedate`).once('value')
                    .then(snap => {
                        if (res.length === 0) {
                            return snap.val();
                        }
                        return Math.min(...res);
                    }).then(res => {
                        if (this.add) order.duedate = res;
                        //console.log(res);
                    });
            }).then(() => {
                DB.ref('settings/newOrderNumber').once('value', snapshot => {
                    if (this.add) {
                        let newOrderNumber = snapshot.val();
                        DB.ref('settings').update({ newOrderNumber: newOrderNumber + 1 });
                        order.number = 'TK-' + '0'.repeat(5 - String(newOrderNumber).length) + newOrderNumber;
                    }
                    this.innerHTML = `
                        <label>${caption}</label>
                        <wdb-text class="yellow" style="text-align:right;"><label>tähtaeg: </label>${utility.toEstLongDateTime(order.duedate)}</wdb-text>
                        <form>
                            <div class="input">
                                <input id="number" class="property" value="${order.number}" autofocus>
                                <label for="number">number</label>
                            </div>
                            <div class="input">
                                <select id="operation" class="property" value="${order.operation}"></select>
                                <label for="operation">operatsioon</label>
                            </div>
                            <div class="input">
                                <input id="amount" class="property" value="${order.amount}">
                                <label for="amount">aeg (h)</label>
                            </div>
                            <wdb-tools>
                                <button type="submit" class="nice">SALVESTA</button>
                            </wdb-tools>
                        </form>
                    `;
                    //@ts-ignore
                    this.querySelector('form').addEventListener('submit', event => this.submit());
                    //@ts-ignore
                    this.querySelector('[id="operation"').fillOptons({
                        from: 'operations',
                        display: ['name'],
                        value: order.operation,
                    });
                });
            })
    }

    submit() {
        event.preventDefault();

        this.querySelectorAll('.property').forEach(element => {
            //@ts-ignore
            this.value[element.id] = element.value;
        });

        DB.ref(this.ref).update(this.value).then(() => {
            // arvutame uue graafiku
            const ORDERS = DB.ref('orders').orderByChild('request').equalTo(this.requestKey);
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
                        //console.log(key, newValues);
                        DB.ref('orders').child(key).update(newValues);
                    });
                });
        });
        // uus graafik ok

        this.goBack();
    }
}

customElements.define('wdb-edit-employee', EditEmployeeElement);
customElements.define('wdb-edit-request', EditRequestElement);
customElements.define('wdb-edit-order', EditOrderElement);
customElements.define('wdb-edit-operation', EditOperationElement);
customElements.define('wdb-settings', EditSettings);
customElements.define('wdb-edit-request-template', EditRequestTemplateElement);
customElements.define('wdb-edit-package', EditPackageElement);
customElements.define('wdb-edit-package-type', EditPackageTypeElement);
customElements.define('wdb-edit-user', EditUserElement);

export {
    EditEmployeeElement,
    EditRequestElement,
    EditOrderElement,
    EditOperationElement,
    EditSettings,
    EditRequestTemplateElement,
    EditPackageElement,
    EditPackageTypeElement,
    EditUserElement,
};