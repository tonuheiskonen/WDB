//@ts-check

import { AUTH } from "../firebase.js";

let gate = null;

class SignInElement extends HTMLElement {
    connectedCallback() {
        let signInForm, emailElement, passwordElement, errorElement;

        signInForm = this.querySelector('form');
        emailElement = this.querySelector('#email');
        passwordElement = this.querySelector('#password');
        errorElement = this.querySelector('#error');

        signInForm.addEventListener('submit', event => {
            event.preventDefault();
            AUTH.signIn(emailElement.value, passwordElement.value)
                .catch(error => {
                    let message;
                    if (error.code === 'auth/user-not-found') {
                        message = 'Registreerimata kasutaja!';
                        emailElement.select();
                    }
                    if (error.code === 'auth/invalid-email') {
                        message = emailElement.value ? 'Vigane meiliaadress!' : 'Puudub meiliaadress!';
                        emailElement.select();
                    }
                    if (error.code === 'auth/wrong-password') {
                        message = passwordElement.value ? 'Vale salasõna!' : 'Puudub salasõna';
                        passwordElement.select();
                    }
                    errorElement.textContent = message;
                    errorElement.classList.add('error');
                });
        });
        signInForm = this;
    }
}

customElements.define('wdb-sign-in', SignInElement);

export { gate };