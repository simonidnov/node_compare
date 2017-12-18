const firebase_helper = {
    config : {
        apiKey: "AIzaSyDOHKn4lCM3zRi749BA6xbqL7S2IAGx_v0",
        authDomain: "idkids-app-3b52a.firebaseapp.com",
        databaseURL: "https://idkids-app-3b52a.firebaseio.com",
        projectId: "idkids-app-3b52a",
        storageBucket: "",
        messagingSenderId: "607772883942"
    },
    init:function(){
        console.log('initialize app');
        firebase.initializeApp(this.config);
        this.messaging = firebase.messaging();
    },
    set_gcm : function(){
        this.messaging.getToken()
            .then(function(currentToken) {
            if (currentToken) {
                sendTokenToServer(currentToken);
                updateUIForPushEnabled(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                updateUIForPushPermissionRequired();
                setTokenSentToServer(false);
            }
        })
        .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
            //showToken('Error retrieving Instance ID token. ', err);
            //setTokenSentToServer(false);
        });
    }
}
firebase_helper.init();