import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { auth, db } from '../js/firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { generateAvatar, blockNonAdmins } from '../js/utils.js';

const tvEmail = document.querySelector('.dropdown-text-email');
const btnLogout = document.querySelector('#btnLogout');
const navDashboard = document.querySelector('#navDashboard');
const navProducts = document.querySelector('#navProducts');
const tabsOrders = document.querySelector('#tabsOrders');

const btnPending = document.querySelector("#btnPending");
const btnPendingLabel = document.querySelector("#btnPendingLabel");
const btnPreparing = document.querySelector("#btnPreparing");
const btnPreparingLabel = document.querySelector("#btnPreparingLabel");
const btnReadyForPickup = document.querySelector("#btnReadyForPickup");
const btnReadyForPickupLabel = document.querySelector("#btnReadyForPickupLabel");
const btnInTransit = document.querySelector("#btnInTransit");
const btnInTransitLabel = document.querySelector("#btnInTransitLabel");
const btnCompleted = document.querySelector("#btnCompleted");
const btnCompletedLabel = document.querySelector("#btnCompletedLabel");
const btnFailed = document.querySelector("#btnFailed");
const btnFailedLabel = document.querySelector("#btnFailedLabel");

window.addEventListener("load", () => {
});

onAuthStateChanged(auth, user => {
	blockNonAdmins(user);

	if (user) {
		generateAvatar(user.email.toUpperCase());
		tvEmail.textContent = user.email;
	}

	restrictNavbarForEmployees(user);
});

btnLogout.addEventListener("click", () => {
	signOut(auth);
	window.location = "./login.html";
});

function restrictNavbarForEmployees(user) {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;

		if (userType == 2 || userType == 3) {
			navDashboard.className = "d-none";
			navProducts.className = "d-none";

			if (userType == 3) {
				// hide nav pills except for in transit status
				btnPending.className = "d-none";
				btnPendingLabel.className = "d-none";
				btnPreparing.className = "d-none";
				btnPreparingLabel.className = "d-none";
				btnReadyForPickup.className = "d-none";
				btnReadyForPickupLabel.className = "d-none";
				btnCompleted.className = "d-none";
				btnCompletedLabel.className = "d-none";
				btnFailed.className = "d-none";
				btnFailedLabel.className = "d-none";

				btnInTransit.checked = true;
				btnInTransitLabel.style.color = "#ffffff";
			}
		}
	});
}