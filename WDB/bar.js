class ChartElement extends HTMLElement {
    connectedCallback() {
        db.ref('orders').orderByChild('duedate')
            .on('child_added', snap => {
                const data = snap.val();
                const start = new Date(data.duedate).getDate();

                this.insertAdjacentHTML('beforeend',
                    `<wdb-bar left="${300 + start * 80 - data.amount * 10 }" length="${ data.amount * 10 }">${ data.number }</wdb-bar>`);
            });
    }
}

class BarElement extends HTMLElement {
    connect(ref) {
        this.ref = app.db.ref(ref);
        this.ref.on('value', snap => {
            const data = snap.val();
            const length = data.amount * 10;
            let left = new Date(data.duedate).getDate();
            left = left * 80 - length;
            const caption = data.number;
            const duedate = data.duedate;

            this.innerHTML = '<div left></div><div length></div>';
            this.classList.add(data.operation);
            this.querySelector('[left]').style.width = left + 'px';
            this.querySelector('[length]').style.width = length + 'px';
            this.querySelector('[length]').innerHTML = `
            <div row>
            <wdb-text>${caption}</wdb-text>
            <label>lõpp</label>
            <wdb-text>${new Date(duedate).toLocaleDateString('et')}</wdb-text>
            </div>
            `;
            this.parentElement.parentElement.style.minWidth = 160 + left + length + 'px';
        });
    }
}

customElements.define('wdb-chart', ChartElement);
customElements.define('wdb-bar', BarElement);