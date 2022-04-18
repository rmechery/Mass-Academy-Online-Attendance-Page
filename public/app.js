
///// User Authentication /////
const db = firebase.firestore();

const auth = new firebase.auth.EmailAuthProvider();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const userDetails = document.getElementById('userDetails');
const formFailMessage = document.getElementById('form-fail-message');
const checkInSection = document.getElementById('check-in-section');

const resetPasswordContainer = document.getElementById('reset-password-container');
const profileContainer = document.getElementById('profile-container');

const timeStampDB = db.collection("time").doc("timeStamp");

var datemmDDYY = mmDDYY();

function mmDDYY(){
    let fullDate
    let date = new Date();
    year  = date.getFullYear();
    month = (date.getMonth() + 1).toString().padStart(2, "0");
    day  = date.getDate().toString().padStart(2, "0");
    fullDate = String(month)+"-"+String(day)+"-"+String(year);
    return String(fullDate);
}

//code from https://stackoverflow.com/a/53307588/210336
//navigation is deprecated but it works so 🤷🏽
const hasPageReloaded = (
    (window.performance.navigation && window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload')
  );
  
//this function below resets both sections to hidden so weird things don't appear briefly
if(hasPageReloaded == true){
    whenSignedOut.hidden = true;
    whenSignedIn.hidden = true;
}

let d = new Date(new Date().toLocaleString("en-US", {timeZone: "EST"})); // getting EST timezone
document.getElementById('date').getElementsByTagName('h2')[0].innerHTML = 'Today is '+(d.getMonth()+1)+"/"+(d.getDate())+'/'+(d.getFullYear())+'.';


///// Firestore /////
firebase.auth().onAuthStateChanged(user => {
    if (user) {//signed in
        checkInSection.hidden = false;
        whenSignedOut.hidden = true;
        whenSignedIn.hidden = false;
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
        userID = user.uid;
    }
    else { //signed out
        // Unsubscribe when the user signs out
       // unsubscribe && unsubscribe();
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        checkInSection.hidden = true;
        resetPasswordContainer.hidden = true;
        profileContainer.hidden = true;
    }
});

function darkMode(){
    const mainBody = document.body;
    mainBody.classList.toggle("bg-dark");
    mainBody.classList.toggle("text-light");
    const  darkModeButton = document.getElementById('dark-mode-button')
    if(mainBody.className.includes('dark')){
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

function updatePassword(){
    const newPassword = String(document.getElementById('reset-password').value);
    firebase.auth().currentUser.updatePassword(newPassword).then(() => {
        // Update successful.
        document.getElementById('reset-password-message').innerHTML = "Password was updated successfully."
    }, (error) => {
        // An error happened.
        document.getElementById('reset-password-message').innerHTML = error.message;
    });
}

function credentials() {
    un = String(document.getElementById("username").value);
    pw = String(document.getElementById("password").value);
    console.log('Username:' + un + '\nPassword: ' + pw);
    const cred_array = [un, pw];
    firebase.auth().signInWithEmailAndPassword(cred_array[0], cred_array[1])
        .then((userCredential) => {
            // Signed in 
            console.log('Successfully Signed In')
            const user = userCredential.user;
            
        })
        .catch((error) => {
            console.log('Sign In Failed')
            const errorCode = error.code;
            const errorMessage = error.message;
            formFailMessage.innerHTML = errorMessage+' Please try again.';
        });
    return cred_array;
}

function setProfile(){
    const name = document.getElementById('profile-name').value;
    firebase.auth().onAuthStateChanged(user => {
        if (user) {//signed in
            user.updateProfile({
                displayName: name,
              }).then(function() {
                // Update successful.
                userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;//reload this element
                document.getElementById("profile-container").appendChild(document.createElement("p").appendChild(document.createTextNode("You have successfully updated your profile.")));
                console.log("Profile Update Sucessful.")
              }).catch(function(error) {
                // An error happened.
                console.log("Profile Update FAILED.")
              });
        }
    });
}

//This function reloads an element
function reload(elementId){
    elementId = String(elementId)
    var container = document.getElementById(elementId);
    var content = container.innerHTML;
    container.innerHTML= content; 
    console.log("Reload Successful")
}

//idea from https://stackoverflow.com/a/196038
function removeClass(nameOfClass, replaceString){
    nameOfClass = String(nameOfClass)
    replaceString = String(replaceString)
    document.getElementById(nameOfClass).className =
    document.getElementById(nameOfClass).className.replace
        ( /(?:^|\s)"+replaceString+"(?!\S)/g , '' )
}

//https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
const delay = ms => new Promise(res => setTimeout(res, ms));

function serverTimeStamp(req, typeOf){
    let hours
    
    timeStampDB.set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    return new Promise((resolve,reject)=>{
        //here our function should be implemented 
        timeStampDB.onSnapshot(function(snapshot) {
            let timeStamp = snapshot.data().timestamp;
            let date = timeStamp.toDate();
            
            //console.log(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))
            let hours = parseInt(date.getHours());
            if(typeof hours !== 'undefined'){
                console.log('This the hours', hours);
                //return hours
                if (typeOf == "Date()"){
                    resolve(date)
                }
                else {
                    resolve(hours);
                }
            }
            else{
                resolve(undefined)
            }
        })
    });
}

async function serverTimeStampCaller(hour){
    console.log("Caller");
    result = await serverTimeStamp(hour);
    console.log("After waiting");
    return result
}

function checkInCheck(email){
    datemmDDYY = String(mmDDYY())
    checkInDocPath = String("users/"+email+"/attendance/")
    console.log(checkInDocPath+datemmDDYY)
    let checkInDoc = db.collection(String("users/"+email+"/attendance/")).doc(datemmDDYY)
    let signed_in
    
    checkInDoc.get().then((doc) => {
        if (doc.exists) {
            signed_in = doc.get("signed_in")
            checkInTimeEleme = doc.get("checkInTimeEleven")
            console.log("Sign In status:", signed_in);
            if(signed_in == undefined){
                console.log('Time to sign in.')
                 setTimeout(function() {
        serverTimeStamp().then(result => {
            serverHour = result
            console.log(serverHour)
            console.log('Server Hour should be above.')

            if(signed_in == false && serverHour >= 8 && serverHour <= 13){
                console.log('The time is between 8 and 1. You can sign in now.')
            }
        }).catch(err => {
            console.log(err)
        });
    }, 1000);
                doc.set({
                    signed_in: false,
                    checkInTime: "yo"
                })
            }

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            checkInDoc.set({
                signed_in: false,
                checkInTime : Date(2022, 11, 20)
                
            }, {merge: true})
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

    //serverHour = serverTimeStampCaller('hour')
    setTimeout(function() {
        serverTimeStamp().then(result => {
            serverHour = result
            console.log(serverHour)
            console.log('Server Hour should be above.')

            if(signed_in == false && serverHour >= 8 && serverHour <= 13){
                console.log('The time is between 8 and 1. You can sign in now.')
            }
        }).catch(err => {
            console.log(err)
        });
    }, 1000);
    return signed_in
}

function checkInButton(){
    firebase.auth().onAuthStateChanged(user => {
        if(checkInCheck(String(user.email))){
            if(user){
                console.log('You can sign in now.')
            }
        }
    });
}

function returnTime(){
    firebase.database().ref('/time/timeStamp')
    .once('value')
    .then(function stv(data) {
        console.log(data.val() + Date.now());
    }, function (err) {
        return err;
    });
}

function timeEventListener(hour, minutes){
    var now = new Date();
    var millisTillTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, 0, 0) - now;
    if (millisTillTime < 0) {
        millisTillTime += 86400000; // it's after time, try the time tomorrow.
    }
    return millisTillTime
}

//code from https://stackoverflow.com/questions/4455282/call-a-javascript-function-at-a-specific-time-of-day

//setTimeout(function(){alert("It's 10am!")}, millisTill10);









