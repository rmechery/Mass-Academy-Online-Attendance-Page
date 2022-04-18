import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCoESPy-Wp8dUpTuPLuR2iwNotXIOg5vHM",
    authDomain: "hello-world-a8cba.firebaseapp.com",
    projectId: "hello-world-a8cba",
    storageBucket: "hello-world-a8cba.appspot.com",
    messagingSenderId: "9854576099",
    appId: "1:9854576099:web:7d0adde9f238a84466acd6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//const db = getFirestore();
const firestore = getFirestore();

const timeStampDB = collection(firestore, "time");

const log_in_button = document.getElementById("log-in-button");
let admin = false;

onAuthStateChanged(auth, user => {
    if (user) {
        console.log('Logged in as ' + user.email);
    } else {
        console.log('No user');
        //this will open the credentials function to sign-in when a user clicks the log in button    
        log_in_button.onclick = function () {
            credentials();
        };
    }
});

function credentials() {
    let un = String(document.getElementById("username").value);
    let pw = String(document.getElementById("password").value);
    //console.log('Username:' + un + '\nPassword: ' + pw);
    const cred_array = [un, pw];

    setPersistence(auth, browserSessionPersistence)
        .then(() => {
            // Existing and future Auth states are now persisted in the current
            // session only. Closing the window would clear any existing state even
            // if a user forgets to sign out.
            // ...
            // New sign-in will be persisted with session persistence.
            return signInWithEmailAndPassword(auth, un, pw);
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
            document.getElementById("errorModalMessage").innerHTML = `<p>An error occured: ${errorCode}.
                <br>If the issue persists, please contact me immediately at 
                <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix the issue.</p>
                `;
            window.$('#errorModal').modal('show');
        });

    //if the user is signed in it will redirect the page to the main page
    onAuthStateChanged(auth, user => {
        if (user) {
            //window.location.href='main.html';
            console.log("users/" + user.email + "/")
            const docRef = doc(firestore, 'users', user.email);

            const docSnap = getDoc(docRef).then(docSnap => {

                if (docSnap.exists()) {
                    console.log(docSnap.data())
                    if (docSnap.data().admin == true) {
                        console.log("Admin User");
                        window.location.href = 'admin';

                    }
                    else {
                        // doc.data() will be undefined in this case
                        console.log("Not an admin");
                        admin = false;
                        window.location.href = 'mainPage.html';
                    }
                }
            });
        }
    });
}
$('#recoverEmailSubmit').click(function () {
    resetPassword();
    $('#recoverEmailSubmit').val('Submit');
});

function resetPassword(){
    let recoverEmail = $('#recoverEmailInput').val();
    console.log(recoverEmail);
    const auth = getAuth();

    sendPasswordResetEmail(auth, recoverEmail)
    .then(() => {
        // Password reset email sent!
        document.getElementById("errorModalMessage").innerHTML = `<p>Password reset email sent!<br>
        Please check your outlook account for the email.</p>
                `;
        window.$('#errorModal').modal('show');
        // ..
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
        document.getElementById("errorModalMessage").innerHTML = `<p>An error occured: ${errorCode}.
                <br>If the issue persists, please contact me immediately at 
                <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix the issue.</p>
                `;
        window.$('#errorModal').modal('show');
        // ..
    });
}
