$(document).ready(function() {

	$("#submitBtn").click(function(e) {
		e.preventDefault();
		var name = $("#username").val();
		var password = $("#password").val();
		var passwordConfirm = $("#passwordConfirm").val();

		if (password === passwordConfirm) {

            fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/signup/${name}/${password}`)
					.then((res) => res.json())
					.then((response) => {
                        let tokens = response.result.token;
                        let userid = response.result.id;
                        localStorage.setItem('tokens', JSON.stringify(tokens));
                        localStorage.setItem('userid', JSON.stringify(userid));
                        $(location).attr('href', 'pageprincipale.html');
					})
					.catch((error) => console.error(error));

		} else if (password !== passwordConfirm) {
			console.log('La confirmation du mot de passe est incorrecte');
			$("#password").val("");
			$("#passwordConfirm").val("");
			$("#response").html("<div class='alert alert-danger'> La confirmation du mot de passe est incorrecte </div>");
		}
	});


});


// CONNEXION

function Connexion() {
	let form = document.getElementById("login-form");
	let username = form.username.value;
	let password = form.password.value;


	fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/login/${username}/${password}`)
		.then((res) => res.json())
		.then((response) => {
			if (response.result.status == "done") {
				let tokens = response.result.token;
				let userid = response.result.id;
				localStorage.setItem('tokens', JSON.stringify(tokens));
				localStorage.setItem('userid', JSON.stringify(userid));

				window.location.href = 'pageprincipale.html';

			} else if (response.result.status == "failure") {
				alert('Username ou Mot de passe incorrect');
				form.username.value = "";
				form.password.value = "";
			} else {
				window.location.href = 'connexion.html';
			}
		})
		.catch((error) => console.error(error));


}


const tokens = localStorage.getItem('tokens');
const recupToken = JSON.parse(tokens);
const userid = localStorage.getItem('userid');
const recupUserId = JSON.parse(userid);


// RECUPERATION DU TOKENS ET DES UTILISATEURS

function Pageprincipale() {


	if (recupToken == null) {
		window.location.href = 'connexion.html';
	}

	fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/list/${recupToken}/0`)
		.then((res) => res.json())
		.then((response) => {
			// Affichage des Bugs dans la barre des Titres
			let cpt1 = 0;
			let cpt2 = 0;
			if (response.result.status == "failure") {
				window.location.href = 'connexion.html';
			}
			const taille = response.result.bug.length;
			const resultBugs = response.result.bug;
			document.getElementById('titre').innerHTML = '';
			Header(cpt1, cpt2, taille, resultBugs);

			let idTable = document.getElementById('table');
			if (idTable) {

				fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/users/${recupToken}`)
					.then((res) => res.json())
					.then((response2) => {

						const tbody = document.getElementById('table');
						const usersTaille = response2.result.user.length;
						const users = response2.result.user;

						// CREATION DU TABLEAU
						tbody.innerHTML = '';
						TableauDesBugs(taille, resultBugs, usersTaille, tbody, users);
					})
					.catch((error) => console.error(error));

			}

		})
		.catch((error) => console.error(error));

}


// AFFICHAGE DE LA LITE DES BUGS - SUPPRESSION - MODIFICATION DU STATE

function TableauDesBugs(taille, resultBugs, usersTaille, tbody, users) {


	for (let i = 0; i < taille; i++) {

		//convertion de timestamp en date
		var time1 = resultBugs[i].timestamp
		var date = new Date(time1 * 1000);
		var time2 = (+date.getDate() +
			"/" + (date.getMonth() + 1) +
			"/" + date.getFullYear() +
			" " + date.getHours() +
			":" + date.getMinutes() +
			":" + date.getSeconds());

		let bugId = resultBugs[i].id;


		for (let j = 0; j < usersTaille; j++) {
			if (resultBugs[i].user_id == j) {

				tbody.innerHTML +=
					'<tr id=' + bugId + '><td>' + resultBugs[i].title + '<br>' + resultBugs[i].description + '</td>' +
					'<td class="td">' + time2 + '</td>' +
					'<td class="td">' + users[j] + '</td>' +
					'<td class="td">' +
					'<select id="monselect' + i + '">' +
					'<option>' + resultBugs[i].state + '</option>' +
					'<option value="0">0</option>' +
					'<option value="1">1</option>' +
					'<option value="2">2</option>' +
					'</select></td>' +
					'<td class="td"><button type="submit" id="btn-supp' + i + '"><i class="fas fa-trash"></i></button></td>' +
					'</tr>';

			}

		}

	}


	// SUPPRESSION D'UN BUG

	for (let a = 0; a < taille; a++) {
		let supp = document.getElementById('btn-supp' + a);
		let bugId = resultBugs[a].id;


		supp.addEventListener("click", function() {

				fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/delete/${recupToken}/${bugId}`)
					.then((res) => res.json())
					.then((response) => {
						window.location.reload();

					})
					.catch((error) => console.error(error));
			})
			// MODIFICATION D'UN STATE
		let stateTest = $('#monselect' + a).on('change', function(e) {
			let state = e.target.value;

			fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/state/${recupToken}/${bugId}/${state}`)
				.then((res) => res.json())
				.then((response) => {
					window.location.reload();
				})
				.catch((error) => console.error(error));

		});

	}

}


// ENTÊTE POUR AFFICHER LE NOMBRE DE BUGS 

function Header(encours, traite, taille, resultBugs) {

	for (let k = 0; k < taille; k++) {
		if (resultBugs[k].state == 1) {
			encours = encours + 1;
		}
		if (resultBugs[k].state == 2) {
			traite = traite + 1;
		}
	}

	return document.getElementById('titre').innerHTML += taille + ' Bug(s) ' + encours + ' en cours ' + traite + ' traité(s)';

}


// AJOUTER UN NOUVEAU BUG

function AjoutBug() {

	const form = document.getElementById("bug-form");
	const formData = new FormData(form);
	const jsonData = JSON.stringify(Object.fromEntries(formData));



	fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/add/${recupToken}/${recupUserId}`, {
			method: 'POST',
			body: jsonData
		})
		.then(function(response) {
			alert('Bug ajouté avec succès');
			window.location.href = 'pageprincipale.html';
			return response.text();
		})
		.then(function(text) {

		})
		.catch(function(error) {
			console.error(error);
		});


}


// DECONNEXION 

$(document).ready(function() {

	$("#deconnexion").click(function(e) {
		e.preventDefault();

		const tokens = localStorage.getItem('tokens');
		const recupToken = JSON.parse(tokens);

		$.get("http://greenvelvet.alwaysdata.net/bugTracker/api/logout/" + recupToken,
			function(result) {
				window.localStorage.removeItem('tokens');
				window.localStorage.removeItem('userid');
				$(location).attr('href', 'connexion.html');


			});

	});

});


// BUGS TRAITES PAR UN UTILISATEUR

function PageAtraiter() {
	if (recupToken == null) {
		window.location.href = 'connexion.html';
	}

	fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/list/${recupToken}/${recupUserId}`)
		.then((res) => res.json())
		.then((response) => {
			// Affichage des Bugs dans la barre des Titres
			let cpt1 = 0;
			let cpt2 = 0;
			const taille = response.result.bug.length;
			const resultBugs = response.result.bug;
			document.getElementById('titre').innerHTML = '';
			Header(cpt1, cpt2, taille, resultBugs);

			let idTable = document.getElementById('table');
			if (idTable) {

				fetch(`http://greenvelvet.alwaysdata.net/bugTracker/api/users/${recupToken}`)
					.then((res) => res.json())
					.then((response2) => {

						const tbody = document.getElementById('table');

						const usersTaille = response2.result.user.length;
						const users = response2.result.user;

						// CREATION DU TABLEAU
						tbody.innerHTML = '';
						TableauDesBugs(taille, resultBugs, usersTaille, tbody, users);

					})
					.catch((error) => console.error(error));



			}

		})
		.catch((error) => console.error(error));

}