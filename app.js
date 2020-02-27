//@ts-check

import { AUTH, DB } from "./firebase.js";
import { gate } from "./WDB/sign-in.js";
import { MenuElement } from "./WDB/menu.js";

let app = null;

class AppElement extends HTMLElement {
    constructor() {
        super();
        this.currentContent = '';
        this.backContent = '';
    }

    set content(newContent) {
        this.backContent = this.currentContent;
        this.currentContent = newContent;
        this.contentElement.innerHTML = newContent;
    }

    signIn() {
        this.innerHTML = `
            <wdb-sign-in>
                <h2> WDB App</h2>
                <label id="error">kasutaja tuvastamine</label>
                <form>
                    <div class="input">
                        <input id="email" type="email" autofocus>
                        <label for="email">meiliaadress</label>
                    </div>
                    <div class="input">
                        <input id="password" type="password">
                        <label for="password">salasõna</label>
                    </div>
                    <wdb-tools>
                        <button type="submit" class="nice">EDASI</button>
                    </wdb-tools>
                </form>
            </wdb-sign-in>
        `;
    }

    openMenu() {
        this.innerHTML = `
            <wdb-menu>
                <a class="menuitem" action="displayRequests">TELLIMUSED</a>
                <a class="menuitem" action="displayOrders">TÖÖKÄSUD</a>
                <a class="menuitem" action="displayGraph">GRAAFIK</a>
                <a class="menuitem" action="displayDataMenu">ANDMED</a>
                <a class="menuitem move-right" action="logOff">VÄLJU</a>
            </wdb-menu>
        `;
        this.contentElement = document.createElement('wdb-content');
        this.appendChild(this.contentElement);
    }

    connectedCallback() {
        app = this;

        AUTH.onAuthStateChanged(user => {
            if (user) {
                if (user.email === 'wactory@wactory.ee') {
                    this.innerHTML = '';
                    this.contentElement = document.createElement('wdb-content');
                    this.appendChild(this.contentElement);
                    this.content = `
                        <wdb-tools>
                            <input type="search" placeholder="otsi">
                            <button logout class="nice">VÄLJU</button>
                        </wdb-tools>
                        <wdb-orders-collection class="collection"></wdb-orders-collection>
                    `;
                } else {
                    if (!user.displayName) {
                        let displayName = prompt(user.email + "\nKirjuta siia oma kasutajanimi");
                        if (displayName != null) {
                            user.updateProfile({ displayName: displayName });
                        } else {
                            user.updateProfile({ displayName: user.email });
                        }
                    };
                    this.openMenu();
                }
            } else {
                this.signIn();
            }
        });
    }

    goBack() {
        this.content = this.backContent;
    }

    notifyManager(message) {
        //@ts-ignore
        emailjs.send("wactory_ladu", "order_ready", message);
    }
}

customElements.define('wdb-app', AppElement);

DB.ref('settings/emailjsUserID').once('value', snapshot => {
    let emailjsUserID = snapshot.val();
    //@ts-ignore
    emailjs.init(emailjsUserID);
});

export { app };