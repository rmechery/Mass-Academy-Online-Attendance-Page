import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { getFirestore, getDoc, collection, serverTimestamp, updateDoc, setDoc, Timestamp, query, where, getDocs, collectionGroup, doc} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
//import('https://cdn.datatables.net/1.11.4/js/jquery.dataTables.min.js')

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

    $(document).ready(function() {

        $('#datetimepicker1').datepicker();

    });
    

      // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    //const db = getDatabase();
    const firestore = getFirestore();
    let clickedDate = '02/22/2021';

   
    $("#datePickerSubmit").click(function(){
        clickedDate = $("#datetimepicker1").val().replaceAll("/", "-");
        console.log($("#datetimepicker1").val().replaceAll("/", "-"))
        $("#attendanceTable > tbody").html("");
        attendanceTable();
    }); 

    const darkModeButton = document.getElementById('dark-mode-button');
    darkModeButton.onclick = function() {
       darkMode();
     }; 

    const signOutButton = document.getElementById('sign-out-button');
    signOutButton.onclick = function() {
        auth.signOut();
     }; 

    const timeStampRef = doc(firestore, 'time', 'timeStamp');

    const randomModal = document.getElementById('randomModal');
    const randomModalHeader = document.getElementById('randomModalHeader');
    const randomModalText = document.getElementById('randomModalText');

    let datemmDDYY = mmDDYY();

    $(document).ready( function () {
        $('#attendanceTable').DataTable();
    } );
    

    // const onClick = (event) => {
    //     if(Date.parse(event.srcElement.id)){

    //         document.getElementById(`${clickedDate}`).classList.remove("bg-danger");
           
    //         event.srcElement.classList.add("bg-danger");

    //         clickedDate = event.srcElement.id;
    //         console.log(event.srcElement.id);
    //         $("#attendanceTable > tbody").html("");
    //         attendanceTable();
    //     }
    //   }

    // window.addEventListener('click', onClick);

    onAuthStateChanged(auth, user => {
        if (user) {
           console.log('user is signed in')
           attendanceTable();
        
        } else {
            console.log('user is not signed in')
            setTimeout(function() {
                location.href = "../index.html"
            }, 100);
        }
    });


    function pad2Digits(num) {
        return num.toString().padStart(2, '0');
    }      

    function mmDDYY(){
        let fullDate = "";
        let date = new Date();
        let year  = date.getFullYear();
        let month = pad2Digits(date.getMonth() + 1);
        let day  = pad2Digits( date.getDate());
        fullDate = String(month)+"-"+String(day)+"-"+String(year);
        return String(fullDate);
    }

    function hhMMSS(d){
        d = new Date(d);
        return `${pad2Digits(d.getHours())}:${pad2Digits(d.getMinutes())}:${pad2Digits(d.getSeconds())}`
    }

    function announcement(){
        const announcement = onSnapshot(doc(firebaseConfig, "announcment", "text"), (doc) => {
            console.log("Current data: ", doc.data());
            
        });
    }

    let d = new Date(new Date().toLocaleString("en-US", {timeZone: "EST"})); // getting EST timezone
    document.getElementById('date').getElementsByTagName('h2')[0].innerHTML = 'Today is '+(d.getMonth()+1)+"/"+(d.getDate())+'/'+(d.getFullYear())+'.';

    function darkMode(){
        const mainBody = document.body;
        mainBody.classList.toggle("bg-dark");
        mainBody.classList.toggle("text-light");
        const  darkModeButton = document.getElementById('dark-mode-button')
        const calendarCard = document.getElementById('calendarCard')
        if(mainBody.className.includes('dark')){
            darkModeButton.innerHTML = 'Light Mode';
            darkModeButton.classList.remove('btn-dark');
            darkModeButton.classList.add('btn-light');
            calendarCard.classList.remove('bg-light');
            calendarCard.classList.add('bg-transparent');
        }
        else {
            document.getElementById('dark-mode-button').innerHTML = 'Dark Mode';
            darkModeButton.classList.remove('btn-light');
            darkModeButton.classList.add('btn-dark');
            calendarCard.classList.remove('bg-light');
            calendarCard.classList.add('bg-transparent');
        }
    }

    async function attendanceTable(){
        const q = query(collection(firestore, "users"), where("account", "==", "s-2023"));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((document) => {
            attendanceTableSub(document);
        });
    }

    async function attendanceTableSub(document){
        console.log("users", document.id, "attendance", clickedDate)
        const attendanceRef = doc(firestore, "users", document.id, "attendance", clickedDate)
        const attendanceSnap = await getDoc(attendanceRef)
        const userSnap = await getDoc(doc(firestore, "users", document.id));
    
        if (attendanceSnap.exists()) {
            console.log("Document data:", attendanceSnap.data());
            let  signInTimeDate = 'Not signed in.';
            let checkOutTimeDate = 'Not check out.';
            if( attendanceSnap.data().signInTime != null) {
                signInTimeDate = attendanceSnap.data().signInTime.toDate();
            }
            if( attendanceSnap.data().checkOutTime != null) {
                checkOutTimeDate = attendanceSnap.data().checkOutTime.toDate();
            }

            
            $("#attendanceTable tbody").append(`
                <tr>
                    <th scope="row">${userSnap.data().locker}</th>
                    <td id=${userSnap.data().locker}-name>${userSnap.data().name}</td>
                    <td id=${userSnap.data().locker}-signInTime>${signInTime}</td>
                    <td id=${userSnap.data().locker}-checkOutTime>${checkOutTime}</td>
                </tr>`            
            );
            if(attendanceSnap.data().signed_in_ontime == false){
                $(`#${userSnap.data().locker}-signInTime`).addClass("bg-warning");
            }
            if(attendanceSnap.data().signed_in_ontime == true){
                $(`#${userSnap.data().locker}-signInTime`).addClass("bg-success");
            }
            if(attendanceSnap.data().checkout_ontime == false){
                $(`#${userSnap.data().locker}-checkOutTime`).addClass("bg-warning");
            }
            if(attendanceSnap.data().checkout_ontime == true && attendanceSnap.data().earlyDismissal == true){
                $(`#${userSnap.data().locker}-checkOutTime`).addClass("bg-info");
            }
            else if(attendanceSnap.data().checkout_ontime == true){
                $(`#${userSnap.data().locker}-checkOutTime`).addClass("bg-success");
            }
            if(attendanceSnap.data().checkout_ontime == false){
                $(`#${userSnap.data().locker}-checkOutTime`).addClass("bg-warning");
            }
            if(attendanceSnap.data().signed_in_ontime == null){
                $(`#${userSnap.data().locker}-signInTime`).addClass("bg-warning");
            }
            if(attendanceSnap.data().checkout_ontime == null){
                $(`#${userSnap.data().locker}-checkOutTime`).addClass("bg-warning");
            }
           
        } else {
            // doc.data() will be undefined in this case
            console.log(`No such document! ${document.id}`);
            // $("errorModalMessage").innerHTML = `<p>An error occured:.
            //     <br>If the issue persists, please contact me immediately at 
            //     <a href="mailto:ryanmechery@gmail.com">ryanmechery@gmail.com</a> to fix the issue.</p>
            //     `;
            // window.$('#errorModal').modal('show'); 
        }
    }

    //Following code was adapted from https://www.aspsnippets.com/Articles/Convert-Export-HTML-Table-to-PDF-file-using-jQuery.aspx#:~:text=Explanation%3A,PDF%20using%20the%20pdfmake%20plugin.
    //This jQuery function will render the attendanceTable as a pdf 
    $("body").on("click", "#btnExport", function () {
        html2canvas($('#attendanceTable')[0], {
            onrendered: function (canvas) {
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                        image: data,
                        width: 500
                    }]
                };
                pdfMake.createPdf(docDefinition).download(`Attendance_Table_${clickedDate}`);
            }
        });
    });

    