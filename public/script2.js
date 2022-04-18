import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, serverTimestamp, updateDoc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";


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
//const db = getDatabase();
const firestore = getFirestore();


const darkModeButton = document.getElementById('dark-mode-button');
darkModeButton.addEventListener("click", darkMode);

const signOutButton = document.getElementById('sign-out-button');
signOutButton.onclick = function () {
    auth.signOut();
};

const timeStampRef = doc(firestore, 'time', 'timeStamp');
const schoolIPAddress = '66.189.50.174';
let userIPAddress;


const randomModal = document.getElementById('randomModal');
const randomModalHeader = document.getElementById('randomModalHeader');
const randomModalText = document.getElementById('randomModalText');

const checkInButton = document.getElementById('check-in-button');
checkInButton.onclick = function () {
    checkIn();
};
const checkOutButton = document.getElementById('check-out-button');
checkOutButton.onclick = function () {
    checkOut();
};

let datemmDDYY = mmDDYY();

function pad2Digits(num) {
    return num.toString().padStart(2, '0');
}

function mmDDYY() {
    let fullDate = "";
    let date = new Date();
    let year = date.getFullYear();
    let month = pad2Digits(date.getMonth() + 1);
    let day = pad2Digits(date.getDate());
    fullDate = String(month) + "-" + String(day) + "-" + String(year);
    return String(fullDate);
}

function hhMMSS(d) {
    d = new Date(d);
    return `${pad2Digits(d.getHours())}:${pad2Digits(d.getMinutes())}:${pad2Digits(d.getSeconds())}`
}

function changeDisabledButton() {
    checkInButton.classList.remove('disabled');
    checkOutButton.classList.remove('disabled');
}

if (hhMMSS(Date.now()) > "06:45:00") {
    checkInButton.classList.add('disabled');
}
else {
    checkInButton.classList.remove('disabled');
}

if (hhMMSS(Date.now()) > "14:45:00") {
    checkOutButton.classList.add('disabled');
}
else {
    checkOutButton.classList.remove('disabled');
}

onAuthStateChanged(auth, user => {
    if (user) {
        console.log('user is signed in')
        notifications();

    } else {
        console.log('user is not signed in')
        setTimeout(function () {
            location.href = "index.html"
        }, 100);
    }
});

function darkMode() {
    const mainBody = document.body;
    mainBody.classList.toggle("bg-dark");
    mainBody.classList.toggle("text-light");
    const darkModeButton = document.getElementById('dark-mode-button')
    if (mainBody.className.includes('dark')) {
        darkModeButton.innerHTML = 'Light Mode';
        darkModeButton.classList.remove('btn-dark');
        darkModeButton.classList.add('btn-light');
    }
    else {
        document.getElementById('dark-mode-button').innerHTML = 'Dark Mode';
        darkModeButton.classList.remove('btn-light');
        darkModeButton.classList.add('btn-dark');
    }
}

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
        });

}


async function updateServerTime() {
    const updateTimestamp = await updateDoc(timeStampRef, {
        timestamp: serverTimestamp()
    });
}

async function readServerTime() {
    const timeStampDoc = await getDoc(timeStampRef);

    if (timeStampDoc.exists()) {
        console.log(timeStampDoc.data().timestamp.toDate());
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}

async function checkIn() {
    onAuthStateChanged(auth, user => {
        getIPAddress();
        console.log(userIPAddress != schoolIPAddress)
        if (userIPAddress != schoolIPAddress) {
            console.log(`WARNING: User is attempting to log in outside of the school network.`)
            randomModalHeader.innerHTML = `WARNING: User is attempting to log in outside of the school network. Your current ip address is ${userIPAddress}.`;
            randomModalText.innerHTML = `<p>Sign in to the school's wifi.<p>`
            window.$('#randomModal').modal('show');
        }

        else {
            if (user) {
                const attendanceRef = doc(firestore, `users/${user.email}/attendance/${datemmDDYY}`);

                getDoc(attendanceRef).then(docSnap => {
                    if (!docSnap.exists()) {
                        setDoc(doc(firestore, `users/${user.email}/attendance`, `${datemmDDYY}`), {
                            //empty doc
                        });
                    }
                    console.log(docSnap.data())
                    if (typeof docSnap.data().signed_in_ontime !== 'undefined') {
                        let alreadySignedIn = docSnap.data().signInTime.toDate();
                        console.log(`You have signed in already ${alreadySignedIn}`);
                        randomModalHeader.innerHTML = 'WARNING – Already Signed In';
                        randomModalText.innerHTML = `<p>You already signed in on ${alreadySignedIn}. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix this issue.<p>`
                        window.$('#randomModal').modal('show')
                    }
                    else {
                        //not signed in already
                        updateServerTime();

                        let nowServerTime = new Date(Timestamp.now().seconds * 1000);
                        console.log(nowServerTime, nowServerTime.getHours())

                        if (hhMMSS(nowServerTime) >= "06:45:00" && hhMMSS(nowServerTime) <= "07:40:00") {
                            setDoc(attendanceRef, {
                                signed_in_ontime: true,
                                signInTime: serverTimestamp()
                            }, { merge: false }).then(function () {
                                console.log('Check In Successful – On Time');
                                randomModalHeader.innerHTML = 'Check-In Successful – On Time';
                                randomModalText.innerHTML = '<p>Your check in was successful. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> if anything went wrong.<p>'
                                window.$('#randomModal').modal('show');
                            });
                        }

                        else if (hhMMSS(nowServerTime) > "07:40:00" && hhMMSS(nowServerTime) < "14:45:00") {
                            setDoc(attendanceRef, {
                                signed_in_ontime: false,
                                signInTime: serverTimestamp()
                            }, { merge: false }).then(function () {
                                console.log('Check In Successful – Tardy');
                                randomModalHeader.innerHTML = 'Check-In Successful - Tardy';
                                randomModalText.innerHTML = '<p>Your check in was successful but you are tardy. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> if anything went wrong.<p>'
                                window.$('#randomModal').modal('show');
                            });
                        }

                        else {
                            console.log('WARNING – Check In Failed');
                                randomModalHeader.innerHTML = 'WARNING ';
                                randomModalText.innerHTML = '<p>You are attempting to sign in outside of school hours. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix this issue. You will not be able to sign in without contacting an admin.<p>'
                                window.$('#randomModal').modal('show');
                        }
                    }
                });

            } else {
                console.log('WARNING: User is attempting to log in without being signed in.')
            }
        }
    });
}



async function checkOut() {
    onAuthStateChanged(auth, user => {
        getIPAddress();
        console.log(userIPAddress != schoolIPAddress)
        if (userIPAddress != schoolIPAddress) {
            console.log(`WARNING: User is attempting to log in outside of the school network.`)
            randomModalHeader.innerHTML = `WARNING: User is attempting to check out outside of the school network. Your current ip address is ${userIPAddress}.`;
            randomModalText.innerHTML = `<p>Sign in to the school's wifi.<p>`
            window.$('#randomModal').modal('show');
        }

        else {
            if (user) {
                const attendanceRef = doc(firestore, `users/${user.email}/attendance/${datemmDDYY}`);

                getDoc(attendanceRef).then(docSnap => {
                    if (!docSnap.exists()) {
                        setDoc(doc(firestore, `users/${user.email}/attendance`, `${datemmDDYY}`), {
                            //empty doc
                        });
                    }
                    console.log(docSnap.data())
                    if (typeof docSnap.data().checkout_ontime !== 'undefined') {
                        console.log('checkouttime is defined')
                        let alreadyCheckedOut = docSnap.data().checkOutTime.toDate();
                        console.log(`You have checked out already ${alreadyCheckedOut}`);
                        randomModalHeader.innerHTML = 'WARNING – Already Checked Out';
                        randomModalText.innerHTML = `<p>You already checked out on ${alreadyCheckedOut}. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix this issue.<p>`
                        window.$('#randomModal').modal('show')
                    }
                    else {
                        //not signed in already
                        setDoc(doc(firestore, `users/${user.email}/attendance`, `${datemmDDYY}`), {
                            //empty doc
                        });
                        updateServerTime();

                        let nowServerTime = new Date(Timestamp.now().seconds * 1000);
                        console.log(nowServerTime, nowServerTime.getHours())


                        if (hhMMSS(nowServerTime) > "07:45:00" && hhMMSS(nowServerTime) <= "14:45:00") {
                            setDoc(attendanceRef, {
                                checkout_ontime: true,
                                checkOutTime: serverTimestamp(),
                                earlyDismissal: true
                            }, { merge: true }).then(function () {
                                console.log('Check In Successful – Early Dismissal');
                                randomModalHeader.innerHTML = 'Check-In Successful – Early Dismissal';
                                randomModalText.innerHTML = '<p>Your check in was successful. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> if anything went wrong.<p>'
                                window.$('#randomModal').modal('show');
                            });
                        }
                        else if (hhMMSS(nowServerTime) >= "14:45:00" && hhMMSS(nowServerTime) < "16:30:00") {
                            setDoc(attendanceRef, {
                                checkout_ontime: true,
                                checkOutTime: serverTimestamp()
                            }, { merge: true }).then(function () {
                                console.log('Check In Successful – On Time');
                                randomModalHeader.innerHTML = 'Check-In Successful – On Time';
                                randomModalText.innerHTML = '<p>Your check in was successful. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> if anything went wrong.<p>'
                                window.$('#randomModal').modal('show');
                            });
                        }

                        else {
                            console.log('WARNING – Check In Failed');
                            randomModalHeader.innerHTML = 'WARNING';
                            randomModalText.innerHTML = '<p>You are attempting to check out outside of school hours. Please contact me at <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> if anything went wrong.<p>'
                            window.$('#randomModal').modal('show');
                        }
                    }
                });

            } else {
                console.log('WARNING: User is attempting to log out without being signed in.')
            }
        }
    });

}

async function notifications(user) {
    // User is signed in.
    const docRef = doc(firestore, "announcements", "yTZgu681n53wCYL5r5iR");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        document.getElementById('notifications').innerHTML = `Today is ${mmDDYY()}. ${docSnap.data().text}`;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}


function getIPAddress() { 
    userIPAddress = '66.189.50.174';
}
  
  

   

