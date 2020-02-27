//@ts-check

// @ts-ignore
const DB = firebase.database();
// @ts-ignore
const AUTH = firebase.auth();

AUTH.signIn = AUTH.signInWithEmailAndPassword;

export { DB, AUTH };