//@ts-check

import { DB, AUTH } from "../firebase.js";
import { app } from "../app.js";
import {
    EditOrderElement,
    EditOperationElement,
    EditRequestTemplateElement,
    EditPackageElement,
    EditPackageTypeElement,
} from "./edit-document.js";

import { LookupElement } from "./lookup.js";
import { ProgressElement } from "./progress.js";
import { utility } from "../utility/date.js";

class DocumentElement extends HTMLElement {
    contextmenuHandler() {
        event.preventDefault();

        this.menu.classList.remove('hidden');
        //@ts-ignore
        this.menu.style.left = event.clientX - 16 + 'px';
        //@ts-ignore
        this.menu.style.top = 32 + event.clientY - this.menu.offsetHeight + 'px';
        setTimeout(() => this.menu.style.opacity = '1', 0);
    }

    constructor() {
        super();
        this.ref = this.getAttribute('ref');
        this.key = null;
        this.value = {};
        this.connection = null;
        this.menu = undefined;
        this.addEventListener('contextmenu', () => this.contextmenuHandler());
        this.addEventListener('mouseleave', () => {
            if (this.menu) {
                this.menu.style.opacity = '0';
                setTimeout(() => this.menu.classList.add('hidden'), 500);
            };
        });
    }

    connectedCallback() {
        this.connection = DB.ref(this.ref);
        this.onValueCanged = this.connection.on('value', snapshot => {
            this.key = snapshot.key;
            this.value = snapshot.val();
            if (this.value) this.render();
        });
    }

    disconnectedCallback() {
        this.connection.off('value', this.onValueCanged);
    }

    clickHandler() {}
    render() {}
}

class EmployeeElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'employees/' + this.ref;
    }

    render() {
        let employee = this.value;
        this.innerHTML = `
            <wdb-text>${employee.firstname||'first name'} ${employee.lastname||'last name'}</wdb-text>
            <wdb-text><label>meiliaadress: </label>${employee.email}</wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
            </wdb-context-menu>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.addHandler());
    }

    addHandler() {
        app.content = `<wdb-edit-employee class="edit" ref="${this.key}"></wdb-edit-employee>`;
    }
}

class RequestTemplateElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'request-templates/' + this.ref;
    }

    render() {
        let requestTemplate = this.value;
        this.innerHTML = `
            <wdb-text>${requestTemplate.name}</wdb-text>
            <wdb-text><label>kirjeldus: </label>${requestTemplate.description}</wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
            </wdb-context-menu>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.addHandler());
    }

    addHandler() {
        app.content = `<wdb-edit-request-template class="edit" ref="${this.key}"></wdb-edit-request-template>`;
    }
}

class OperationElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'operations/' + this.ref;
    }

    render() {
        let operation = this.value;
        this.innerHTML = `
            <wdb-text>${operation.name}</wdb-text>
            <wdb-text><label>ressurss: </label>${operation.capacity}</wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
            </wdb-context-menu>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.addHandler());
    }

    addHandler() {
        app.content = `<wdb-edit-operation class="edit" ref="${this.key}"></wdb-edit-operation>`;
    }
}

class PackageElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'packages/' + this.ref;
    }

    render() {
        let pack = this.value;
        let measures = 'L' + (pack.length || '?') + ' x W' + (pack.width || '?') + ' x H' + (pack.height || '?');
        this.innerHTML = `
            <div row>
                <wdb-lookup class="green" ref="package-types/${pack.type}/name"></wdb-lookup>
                <wdb-text style="margin-left:auto;"><label>kogus: </label>${pack.amount} <label>tk</label></wdb-text>
            </div>
            <wdb-text><label>mõõdud: </label>${measures} <label>mm</label></wdb-text>
                <wdb-text><label>kaal: </label>${pack.weight} <label>kg</label></wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
                <a remove>KUSTUTA</a>
            </wdb-context-menu>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.changeHandler());
        this.menu.querySelector('[remove]').addEventListener('click', () => this.removeHandler());
    }

    removeHandler() {
        DB.ref(this.ref).remove();
    }

    changeHandler() {
        app.content = `<wdb-edit-package class="edit" ref="${this.key}"></wdb-edit-package>`;
    }
}

class EmailPackageElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'packages/' + this.ref;
    }

    render() {
        let pack = this.value;
        let length = pack.length ? 'L' + pack.length : '';
        let width = (length && pack.width ? ' x ' : '') + (pack.width ? 'W' + pack.width : '');
        let height = (width && pack.height ? ' x ' : '') + (pack.height ? 'H' + pack.height : '');
        let weight = pack.weight ? pack.weight + ' kg, ' : '';
        let measures = length + width + height;
        measures += measures ? ' mm, ' : '';
        this.innerHTML = `
            <div row>
                <wdb-lookup ref="package-types/${pack.type}/name"></wdb-lookup>
                <wdb-text>- ${measures}</wdb-text>
                <wdb-text>${weight}</wdb-text>
                <wdb-text>${pack.amount} tk.</wdb-text>
            </div>
        `;
        this.output = measures + weight + pack.amount + ' tk.';
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
    }
}

class PackageTypeElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'package-types/' + this.ref;
    }

    render() {
        let pack = this.value;
        this.innerHTML = `
            <wdb-text class="green">${pack.name}</wdb-text>
            <wdb-text><label>selgitus: </label>${pack.description}</wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
                <a remove>KUSTUTA</a>
            </wdb-context-menu>
        `;
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.changeHandler());
        this.menu.querySelector('[remove]').addEventListener('click', () => this.removeHandler());
    }

    removeHandler() {
        DB.ref(this.ref).remove();
    }

    changeHandler() {
        app.content = `<wdb-edit-package-type class="edit" ref="${this.key}"></wdb-edit-package-type>`;
    }
}

class RequestElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'requests/' + this.ref;
    }

    addHandler() {
        app.content = `<wdb-edit-request class="edit" ref="${this.key}"></wdb-edit-request>`;
    }

    archiveHandler(number) {
        if (confirm(`ARHIVEERIDA tellimus nr.${number} ?`)) {
            DB.ref('archive').child(this.ref).update(this.value);
            DB.ref(this.ref).remove();
            // archive orderes also
            DB.ref('orders').orderByChild('request').equalTo(this.getAttribute('ref'))
                .once('value', snapshot => {
                    snapshot.forEach(item => {
                        DB.ref('archive').child('orders/' + item.key).update(item.val());
                        DB.ref('orders').child(item.key).remove();
                    });
                });
            // archive packages also
            DB.ref('packages').orderByChild('request').equalTo(this.getAttribute('ref'))
                .once('value', snapshot => {
                    snapshot.forEach(item => {
                        DB.ref('archive').child('packages/' + item.key).update(item.val());
                        DB.ref('packages').child(item.key).remove();
                    });
                });
        }
    }

    render() {
        let request = this.value;
        request.key = this.key;

        // PATCH: for 'true' and 'undefined' in request.notified
        request.notified ? request.notified = request.notified.replace('undefined', '') : '';
        if (request.notified === true) {
            request.notified = '@';
            this.connection.update({ notified: '@' });
        }
        // end PATCH

        this.removeAttribute('notified');
        if (request.notified) this.setAttribute('notified', request.notified);
        this.removeAttribute('message');
        if (request.notes) this.setAttribute('message', '');

        this.innerHTML = `
        <wdb-text class="yellow"><label>tellimus: </label>${request.number}</wdb-text>
        <wdb-text class="yellow"><label>kirjeldus: </label>${request.description}</wdb-text>
            <wdb-text id="duedate"><label>tähtaeg: </label>${utility.toEstLongDate(request.duedate)}</wdb-text>
            <div row>
                <wdb-lookup class="blue" ref="employees/${request.manager}/firstname"><label>projektijuht: </label></wdb-lookup>
                <wdb-lookup class="blue" ref="employees/${request.manager}/lastname"></wdb-lookup>
            </div>
            <wdb-message-notifier></wdb-message-notifier>
            <wdb-progress ref="${this.key}"></wdb-progress>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
                <!--a>TÖÖKÄSUD</a-->
                <a notes>MÄRKUSED</a>
                <a notify>TEAVITA PROJEKTIJUHTI</a>
                <hr>
                <a archive>ARHIVEERI</a>
            </wdb-context-menu>
        `;
        if (request.duedate < new Date(new Date().setHours(0, 0, 0, 0))) {
            this.classList.add('danger');
        }
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.addHandler());
        this.menu.querySelector('[archive]')
            .addEventListener('click', () => this.archiveHandler(request.number));
        this.menu.querySelector('[notify]')
            .addEventListener('click', () => this.notifyHandler(request));
        this.menu.querySelector('[notes]')
            .addEventListener('click', () => this.notesHandler(request));
    }

    notesHandler(request) {
        const now = new Date().toLocaleDateString('et', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        app.content = `
            <div class="edit">
                <wdb-text class="yellow" style="text-align:right;margin:4px 0;"><label>tellimus: </label>${request.number}</wdb-text>
                <form>
                    <div class="input">
                        <textarea id="notes" autofocus disabled>${request.notes||''}</textarea>
                    </div>
                    <wdb-tools>
                        <button type="button" class="nice" add>LISA</button>
                        <button type="submit" class="nice" disabled>SALVESTA</button>
                    </wdb-tools>
                </form>
            </div>
        `;
        let addButton = document.querySelector('[add]');
        let submitButton = document.querySelector('[type="submit"]');
        let notesArea = document.getElementById('notes');
        document.forms[0].addEventListener('submit', () => {
            event.preventDefault();
            //@ts-ignore
            request.notes = notesArea.value;
            //console.log(request.notes);
            this.connection.update({ notes: request.notes });
            app.goBack();
        });
        addButton.addEventListener('click', () => {
            let step = request.notes === '' ? '' : '\n\n';
            //@ts-ignore
            notesArea.value += step + `${now} (${ AUTH.currentUser.displayName})\n`;
            submitButton.removeAttribute('disabled');
            notesArea.removeAttribute('disabled');
            notesArea.focus();
            //@ts-ignore
            notesArea.selectionStart = 10000;
            addButton.setAttribute('disabled', '');
        });
    }

    notifyHandler(request) {
        DB.ref('employees').child(request.manager).once('value', async snapshot => {
            let manager = snapshot.val();
            let message = {
                manager: manager.firstname + ' ' + manager.lastname,
                email: manager.email,
                project: request.number,
                packages: '',
            }
            app.content = `
                <label style="text-align:right;margin-top:20px;">teavita projektijuhti</label>
                <wdb-text>to: ${message.manager} (${message.email})</wdb-text>
                <p>pakendi info:</p>
                <wdb-email-packages-collection filter="${this.key}" style="margin-left:32px;"></wdb-email-packages-collection>
                <wdb-tools>
                    <button id="send" class="nice">SAADA</button>
                </wdb-tools>
            `;
            document.getElementById('send').addEventListener('click', () => {
                //@ts-ignore
                let info = [...document.querySelector('wdb-email-packages-collection').output];
                info.forEach(item => {
                    message.packages += '<p style="margin:0 0 0 30px;">' + item.querySelector('wdb-lookup').textContent + ' - ' + item.output + '</p>';
                });
                this.connection.update({ notified: (request.notified || '') + '@' });

                app.notifyManager(message);

                app.goBack();
            });
        });
    }
}

class OrderElement extends DocumentElement {
    constructor() {
        super();
        this.ref = 'orders/' + this.ref;
    }

    completedHandler(number) {
        if (confirm(`Töökäsk nr.${number} on VALMIS ?`)) {
            DB.ref(this.ref).update({ completed: true });
        }
    }

    render() {
        this.classList.remove('full');
        let order = this.value;
        this.innerHTML = `
            <wdb-text><label>number: </label>${order.number}</wdb-text>
            <wdb-lookup class="yellow" ref="requests/${order.request}/number"><label>tellimus: </label></wdb-lookup>
            <div>
                <wdb-lookup class="green" ref="operations/${order.operation}/name"><label>operatsioon: </label></wdb-lookup>
                <wdb-text class="green">- ${order.amount}<label> h</label></wdb-text>
            </div>
            <wdb-text><label>tähtaeg: </label>${utility.toEstLongDateTime(order.duedate)}</wdb-text>
            <svg id="${this.key}" barcode></svg>
            <wdb-context-menu class="hidden">
                <a completed>VALMIS</a>
            </wdb-context-menu>
        `;
        //@ts-ignore
        JsBarcode(`#${this.key}`, this.key, {
            height: 50,
            font: 'initial',
            fontSize: 16,
        });
        if (order.duedate < new Date(new Date().setHours(0, 0, 0, 0))) {
            this.classList.add('danger');
        }
        if (order.completed) {
            setTimeout(() => {
                this.classList.remove('full');
            }, 0);
        };
        if (!order.completed) {
            setTimeout(() => {
                this.classList.add('full');
            }, 0);
        };

        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[completed]').addEventListener('click', () => this.completedHandler(order.number));
    }
}

class SubOrderElement extends DocumentElement {
    removeHandler() {
        DB.ref(this.ref).remove();

        // arvutame uue graafiku

        // uus graafik ok

    }
    changeHandler() {
        //@ts-ignore
        app.content = `<wdb-edit-order class="edit" ref="${this.key}" link="${this.parentElement.filter}"></wdb-edit-order>`;
    }
    constructor() {
        super();
        this.ref = 'orders/' + this.ref;
    }
    render() {
        this.classList.remove('full');
        let order = this.value;

        this.innerHTML = `
            <wdb-text><label>töökäsk: </label>${order.number}</wdb-text>
            <div>
                <wdb-lookup class="green" ref="operations/${order.operation}/name"><label>operatsioon: </label></wdb-lookup>
                <wdb-text class="yellow">- ${order.amount}<label> h</label></wdb-text>
            </div>
            <wdb-text><label>tähtaeg: </label>${utility.toEstLongDateTime(order.duedate)}</wdb-text>
            <wdb-context-menu class="hidden">
                <a change>MUUDA</a>
                <a remove>KUSTUTA</a>
                <hr>
                <a style="text-decoration: line-through;" uncomplete>VALMIS</a>
                <a test style="display:none;">TEST</a>
            </wdb-context-menu>
        `;
        if (order.completed) this.classList.add('completed');
        if (!order.completed) this.classList.remove('completed');
        setTimeout(() => {
            this.classList.add('full');
        }, 0);
        this.menu = this.querySelector('wdb-context-menu');
        this.menu.querySelector('[change]').addEventListener('click', () => this.changeHandler());
        this.menu.querySelector('[remove]').addEventListener('click', () => this.removeHandler());
        this.menu.querySelector('[uncomplete]').addEventListener('click', () => this.uncompleteHandler());

        this.menu.querySelector('[test]').addEventListener('click', () => this.test());


        // kas on keegi juba ees
        const updatePrev = el => {
                const prev = el.previousElementSibling;
                if (!prev) return;
                const val = prev.value;
                val.duedate = utility.addHoursTo(el.value.duedate, -el.value.amount);
                DB.ref(prev.ref).update(val);
                return updatePrev(prev);
            }
            //updatePrev(this);
    }
    uncompleteHandler() {
        DB.ref(this.ref).update({
            completed: false,
        })
    }
    test() {
        //debugger
        const { duedate, amount } = this.value;
        const start = utility.getStartTime(duedate, amount);
        console.log(
            amount,
            utility.toEstLongDateTime(start),
            utility.toEstLongDateTime(duedate),
        );
    }


}

customElements.define('wdb-employee', EmployeeElement);
customElements.define('wdb-request', RequestElement);
customElements.define('wdb-order', OrderElement);
customElements.define('wdb-sub-order', SubOrderElement);
customElements.define('wdb-operation', OperationElement);
customElements.define('wdb-request-template', RequestTemplateElement);
customElements.define('wdb-package', PackageElement);
customElements.define('wdb-email-package', EmailPackageElement);
customElements.define('wdb-package-type', PackageTypeElement);

export {
    DocumentElement,
    EmployeeElement,
    RequestElement,
    OrderElement,
    SubOrderElement,
    OperationElement,
    RequestTemplateElement,
    PackageElement,
    PackageTypeElement,
    EmailPackageElement,
};