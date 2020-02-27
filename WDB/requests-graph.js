//@ts-check

import { DB } from "../firebase.js";
import { app } from "../app.js";
import { utility } from "../utility/date.js";

let SCALE = 40;
let SHIFT_DAYS_END = 5;
let SHIFT_DAYS_START = 21;
let SHIFT = SHIFT_DAYS_START * SCALE;

class GridElement extends HTMLElement {
    fillDates(startDate, endDate, countOfRequests) {
        let step = 1000 * 60 * 60 * 24;
        // changed timeformat
        let start = startDate - SHIFT_DAYS_START * step;
        let end = endDate + SHIFT_DAYS_END * step;
        let today = new Date().setHours(15, 0, 0, 0);

        this.innerHTML = '';
        for (let i = start; i <= end; i += step) {
            let date = new Date(i).getDate();
            let month = new Date(i).getMonth() + 1;
            let day = new Date(i).getDay();

            let weekends = ['weekend', '', '', '', '', '', 'weekend'];

            let dateClass, title;
            if (utility.isWeekend(new Date(i))) dateClass = 'weekend';
            if (utility.isHoliday(new Date(i))) {
                dateClass = 'holiday';
                title = utility.HOLIDAYS[new Date(i).setHours(0, 0, 0, 0)];
            };
            this.insertAdjacentHTML('beforeend', `<wdb-date title="${title || ''}" class="${dateClass}">${date}.${month}</wdb-date>`);
        }
        //@ts-ignore
        this.parentElement.querySelector('wdb-now').style.left = SCALE * (today - start) / step + 'px';
        //@ts-ignore
        // this.parentElement.querySelector('wdb-now').style.height = countOfRequests * 38 - 8 + 'px';
        this.parentElement.scrollLeft = SCALE * (today - start) / step - window.innerWidth / 2 + 36;
    }
}

class RequestsGraphElement extends HTMLElement {
    constructor() {
        super();
        this.connection = DB.ref('requests').orderByChild('duedate');
        this.innerHTML = `
            <wdb-grid></wdb-grid>
            <wdb-now></wdb-now>
        `;
        this.onValueChanged = this.connection.once('value', snapshot => {
            let minDate = 4070908800000;
            let maxDate = 0;
            let count = 0;
            snapshot.forEach(item => {
                count = count + 1;
                if (item.val().duedate < minDate) minDate = item.val().duedate;
                if (item.val().duedate > maxDate) maxDate = item.val().duedate;
            });
            this.minwidth = minDate - 1000 * 60 * 60 * 24;
            this.startWidth = SHIFT - SCALE + SCALE * (Date.now() - this.minwidth) / 1000 / 60 / 60 / 24;
            //@ts-ignore
            this.querySelector('wdb-grid').fillDates(minDate, maxDate, count);
        });
    }

    connectedCallback() {
        this.onChildAdded = this.connection.on('child_added', snapshot => {
            this.displayRequestBox(snapshot);
        });
        this.onChildRemoved = this.connection.on('child_removed', snapshot => {
            const me = this.querySelector(`[ref="${snapshot.key}"]`);
            me.classList.add('delete');
            //@ts-ignore
            setTimeout(() => me.style.opacity = '0', 500);
            setTimeout(() => me.remove(), 1000);
        });
    }

    displayRequestBox(snap) {
        this.insertAdjacentHTML('beforeend', `
            <wdb-request-box
                number="${snap.val().number}"
                label="${utility.toEstLongDate(snap.val().duedate)}"
                ref="${snap.key}">
            </wdb-request-box>
        `);
    }

    disconnectedCallback() {
        this.connection.off('child_added', this.onChildAdded);
        this.connection.off('value', this.onChildRemoved);
    }
}

class RequestBoxElement extends HTMLElement {
    constructor() {
        super();
        this.ref = this.getAttribute('ref');
        this.connection = DB.ref('orders').orderByChild('duedate');
        this.innerHTML = `
            <wdb-start-box key="${this.ref}"></wdb-start-box>
        `;
    }

    connectedCallback() {
        this.onChildAdded = this.connection.once('value', snapshot => {
            snapshot.forEach(item => {
                const order = item.val();
                if (order.request === this.ref) {
                    this.insertAdjacentHTML('beforeend', `<wdb-order-box key="${item.key}"></wdb-order-box>`)
                }
            });
        });
    }

    clickHandler() { }
    disconnectedCallback() { }
}

class StartBoxElement extends HTMLElement {
    constructor() {
        super();
        this.key = this.getAttribute('key');
        this.connection = DB.ref('requests').child(this.key);
        this.orders = DB.ref('orders').orderByChild('request').equalTo(this.key);
    }

    connectedCallback() {
        this.onValueChanged = this.connection.on('value', snapshot => {
            const request = snapshot.val();
            const { duedate } = request;
            const end = duedate;

            this.ordersValueChanged = this.orders.on('value', ordersSnaphot => {
                // SIIN TULEB LEIDA KOGU TELLIMUSE PIKKUS !!!
                let start = 4070908800000; // 2099-01-01
                let amountSum = 0;
                ordersSnaphot.forEach(item => {
                    const { duedate, amount } = item.val();
                    start = Math.min(start, utility.getStartTime(duedate, amount));
                    amountSum += Number(amount);
                });
                const duration = (end - start) / 1000 / 60 / 60;

                const weekDays = Math.floor(duration / 24);
                const workDays = Math.floor(amountSum / 8);
                const displayWidth = (weekDays - workDays + amountSum / 8);

                setTimeout(() => {
                    //@ts-ignore
                    let startWidth = (request.duedate - this.parentElement.parentElement.minwidth) / 1000 / 60 / 60 / 24;
                    this.parentElement.style.left = SHIFT + SCALE * (startWidth - displayWidth) + 'px';
                }, 0);
            });
            if (request.duedate < (new Date().setHours(15, 0, 0, 0))) {
                this.classList.add('danger');
                this.parentElement.style.setProperty('--right', '94px');
            }
            if (request.notified) {
                this.setAttribute('completed', '');
                this.parentElement.style.setProperty('--right', '90px');
            }
        });
    }

    disconnectedCallback() {
        this.connection.off('value', this.onValueChanged);
        this.orders.off('value', this.ordersValueChanged);
    }
}

class OrderBoxElement extends HTMLElement {
    constructor() {
        super();
        this.key = this.getAttribute('key');
        this.connection = DB.ref('orders').child(this.getAttribute('key'));
        this.innerHTML = `
            <wdb-context-menu class="hidden">
            </wdb-context-menu>
        `;
        this.menu = this.querySelector('wdb-context-menu');
        this.addEventListener('contextmenu', () => this.contextmenuHandler());
        this.addEventListener('mouseleave', () => {
            if (this.menu) {
                //@ts-ignore
                this.menu.style.opacity = '0';
                setTimeout(() => this.menu.classList.add('hidden'), 500);
            };
        });
    }
    contextmenuHandler() {
        event.preventDefault();
        this.menu.innerHTML = `
            <a class="gray" style="width:200px;">töökäsk: ${this.order.number}</a>
            <hr>
            <a class="gray" style="width:auto;"><wdb-lookup ref="operations/${this.order.operation}/name"></wdb-lookup></a>
            <a class="gray" style="width:auto;">maht ${this.order.amount} h</a>
            <hr>
            <a style="width:200px;" request>TELLIMUS</a>
        `;
        this.menu.classList.remove('hidden');
        //@ts-ignore
        this.menu.style.left = event.clientX - 16 + 'px';
        //@ts-ignore
        this.menu.style.top = 32 + event.clientY - this.menu.offsetHeight + 'px';
        //@ts-ignore
        setTimeout(() => this.menu.style.opacity = '1', 0);

        this.menu.querySelector('[request]').addEventListener('click', () => this.requestHandler());
    }

    requestHandler() {
        app.content = `
            <wdb-tools>
                <input type="search" placeholder="otsi">
                <button add class="nice">LISA</button>
            </wdb-tools>
            <wdb-requests-collection class="collection"></wdb-requests-collection>
        `;
        //@ts-ignore
        document.querySelector('[type="search"]').value = this.order.request;
        [...document.querySelector('wdb-requests-collection')
            .children
        ].forEach(element => {
            element.classList.add('filtered');
            if (element.getAttribute('ref') === this.order.request) {
                element.classList.remove('filtered');
            }
        });
        // TELLIMUSED activate
        const requestButton = document.querySelector('[action="displayRequests"]');
        [...requestButton.parentElement.children].forEach(item => {
            item.classList.remove('selected');
        });
        requestButton.classList.add('selected');
    }

    connectedCallback() {
        this.onValueChanged = this.connection.on('value', snapshot => {
            this.order = snapshot.val();
            if (this.order) {
                const { duedate, amount } = this.order;
                const end = duedate;
                const start = utility.getStartTime(duedate, amount);
                const duration = (end - start) / 1000 / 60 / 60;

                const weekDays = Math.floor(duration / 24);
                const workDays = Math.floor(amount / 8);
                const displayWidth = (weekDays - workDays + amount / 8);

                setTimeout(() => {
                    this.style.minWidth = SCALE * displayWidth + 1 + 'px';

                    if (this.order.completed) this.setAttribute('completed', '');
                    if (!this.order.completed) this.removeAttribute('completed');
                }, 0)
            } else {
                this.remove();
            }
        });
    }

    disconnectedCallback() {
        this.connection.off('value', this.onValueChanged);
    }
}

customElements.define('wdb-grid', GridElement);
customElements.define('wdb-requests-graph', RequestsGraphElement);
customElements.define('wdb-request-box', RequestBoxElement);
customElements.define('wdb-start-box', StartBoxElement);
customElements.define('wdb-order-box', OrderBoxElement);

export {
    GridElement,
    RequestsGraphElement,
    RequestBoxElement,
    OrderBoxElement,
    StartBoxElement,
}