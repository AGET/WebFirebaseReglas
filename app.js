$(document).ready(function() {

    $("#btnLogout").hide();
    $(".authUserData").hide();
    $("#btnSend").click(sendData);

    var config = {
      apiKey: "AIzaSyD8hpaZc0CbFT_v2213sWo43W0gifLBddI",
      authDomain: "fmc-test-f01c4.firebaseapp.com",
      databaseURL: "https://fmc-test-f01c4.firebaseio.com"
    };
    firebase.initializeApp(config);
    var rootRef = firebase.database().ref();


    var getData = function() {
        rootRef.on("value", function(snapshot) {
            //console.log(snapshot.val());

            var data = snapshot.val();

            $("#playersTable tbody").empty();

            var row = "";

            for (player in snapshot.val()) {
                //console.log(player, ',', data[player]);

                row += "<tr>" +
                    "<td class=\"playerName\">" + player + "</td>" +
                    "<td class=\"mail\">" + data[player].mail + "</td>" +
                    "<td class=\"number\">" + data[player].number + "</td>" +
                    "<td class=\"position\">" + data[player].position + "</td>" +
                    "<td> <div class=\"btnEdit btn btn-warning glyphicon glyphicon-edit\"></div> </td>" +
                    "<td> <div class=\"btnDelete btn btn-danger glyphicon glyphicon-remove\"></div> </td>" +
                    "</tr>"
            }

            // console.log(row)

            $("#playersTable tbody").append(row);
            row = "";

            //*** Delete record from firebase
            $(".btnDelete").click(function() {
                console.log('clicked')
                var selectedPlayer = $(this).closest("tr")
                    .find(".playerName")
                    .text();

                // Si dejas rootRef.remove() son parametros se borra toda la base de datos ¡CUIDADO!
                console.log(selectedPlayer)
                rootRef.child(selectedPlayer).remove();

            })

            //*** Edit record from firebase
            $(".btnEdit").click(function() {
                console.log('clicked')
                var selectedPlayer = $(this).closest("tr")
                    .find(".playerName")
                    .text();

                //console.log(selectedPlayer)
                //Asign data to form fields
                $("#fullName").val($(this).closest("tr").find(".playerName").text());
                $("#mail").val($(this).closest("tr").find(".mail").text());
                $("#number").val($(this).closest("tr").find(".number").text());
                $("#position").val($(this).closest("tr").find(".position").text());
                $("#btnSend").text("Actualizar").removeClass("btn-primary").addClass("btn-warning").unbind("click").click(function() {

                    rootRef.child(selectedPlayer).update({
                        mail: $("#mail").val(),
                        number: $("#number").val(),
                        position: $("#position option:selected").text()
                    }, function() {
                        $("#fullName").val("");
                        $("#mail").val("");
                        $("#number").val("");
                        $("#position").val("");
                        $("#btnSend").text("Enviar").removeClass("btn-warning").addClass("btn-primary").unbind("click").click(sendData);
                    })

                });
            })



        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }



    $("#btnLogin").click(function() {
        // $("#btnLogin").toggle();
        // $("#btnLogout").toggle();
        login();
    })

    $("#btnLogout").click(function() {
        cierre();
    })


    var setDataLabels = function(result) {
        $("#authUser").text(result.user.displayName + "( " + result.user.providerData[0].uid+ " )");
        $(".usrPhoto").css('background-image', 'url(' + result.user.photoURL+')');
        $("#authProvider").text(result.user.providerData[0].providerId);
        $(".authUserData").toggle();
    }

    var clearDataLabels = function(authData) {
        $("#authUser").text("");
        $(".usrPhoto").css('background-image', 'none');
        $("#authProvider").text("");
        $(".authUserData").toggle();
    }



    //Ask for session and auth data
    // var authData = rootRef.getAuth();
    // if (authData) {
    //     console.log("Usuario " + authData.uid + " logueado con " + authData.provider);
    //     $("#btnLogin").toggle();
    //     $("#btnLogout").toggle();
    //     getData();
    // } else {
    //     console.log("El usuario ha cerrado sesión");
    //      $('#myModalNoSession').modal('show');
    // }


    //Login method
    // var login = function() {
    //     rootRef.authWithOAuthPopup("github", function(error, authData) {
    //         if (error) {
    //             console.log("EL login fallo :( ", error);
    //         } else {
    //             console.log("Autenticado con los datos:", authData);
    //             getData();
    //             setDataLabels(authData);
    //         }
    //     })
    // }


    var cierre = function(){
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            console.log("cerrado");
            $("#btnLogin").toggle();
            $("#btnLogout").toggle();
            clearDataLabels();
            $("#myModalNoSession").modal('show');  
            
        }, function(error) {
            // An error happened.
            console.log("error en el cierre");
        });

        $("#playersTable tbody").empty();
        $('#myModalNoSession').modal('show');
    }
//Preguntr si el usuario aun mantiene la sesion
    firebase.auth().onAuthStateChanged(function(user) {
        if ( user ){
            console.log(user);
            console.log("Usuario " + user.uid + "Logueado con " + user.provider);
            $("#btnLogin").toggle();
            $("#btnLogout").toggle();
            getData();
        }else{
            $("#myModalNoSession").modal('show');
        }
    });

    var provider = new firebase.auth.GithubAuthProvider();

    var login = function(){
         firebase.auth().signInWithPopup(provider).then(function(result) {

        console.log(result);
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user.displayName;
        
        console.log("token: " + token );
        console.log("usuario: " + user );
        $("#btnLogin").toggle();
        $("#btnLogout").toggle();
        getData();
        setDataLabels(result);

        // ...
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        console.log("Errores: \nCodigo: " + errorCode + "\nmenssage:" + errorMessage +"\nEmail:"+ email +"\nCredencial:"+ credential);

        $("#label_error").html("Menssage:" + errorMessage);
        $("#myModalErrorSession").modal('show');  
        // ...
    })
}




    //*** Sending data to firebase
    function sendData() {
        var fullName = $("#fullName").val();

        var dataPlayer = {
            mail: $("#mail").val(),
            number: $("#number").val(),
            position: $("#position option:selected").text()
        }

        var onComplete = function(error) {
            if (error) {
                console.log(error, 'La sincronización fallo');
            } else {
                console.log(error, 'La sincronización ha sido exitosa');
            }
        }

        rootRef.once('value', function(snapshot) {
            if (snapshot.hasChild(fullName)) {
                $('#myModal').modal('show');
            } else {
                rootRef.child(fullName).set(dataPlayer, onComplete);
            }
        })
    }




});
