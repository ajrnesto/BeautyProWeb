import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL, deleteObject, connectStorageEmulator } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

const cardOrders = document.querySelector("#cardOrders");
const cardProducts = document.querySelector("#cardProducts");
const tvPending = document.querySelector("#tvPending");
const tvPreparing = document.querySelector("#tvPreparing");
const tvReadyForPickup = document.querySelector("#tvReadyForPickup");
const tvInTransit = document.querySelector("#tvInTransit");
const tvCompleted = document.querySelector("#tvCompleted");
const tvFailedDelivery = document.querySelector("#tvFailedDelivery");
const tvRevenueToday = document.querySelector("#tvRevenueToday");
const tvRevenueThisWeek = document.querySelector("#tvRevenueThisWeek");
const tvRevenueThisMonth = document.querySelector("#tvRevenueThisMonth");
const tvCategories = document.querySelector("#tvCategories");
const tvProducts = document.querySelector("#tvProducts");

const tvEmptyRevenue = document.querySelector("#tvEmptyRevenue");
const divRevenue = document.querySelector("#divRevenue");
let chartRevenue = Chart.getChart("chartRevenue");

const date = new Date();
const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

onAuthStateChanged(auth, user => {
});

cardProducts.addEventListener("click", function() {
	window.location = "products.html";
});

cardOrders.addEventListener("click", function() {
	window.location = "orders.html";
});

window.addEventListener("load", function() {
	listenToPendingOrders();
	// listenToPreparingOrders();
	listenToReadyForPickupOrders();
	listenToInTransitOrders();
	// listenToCompletedOrders();
	// listenToFailedDeliveryOrders();
	listenToRevenue();
	listenToRevenueDetails();
	listenToProducts();
	// listenToCategories();
});

function listenToPendingOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "Pending"));

	onSnapshot(qry, (orders) => {
		tvPending.innerHTML = orders.size;
	});
}

function listenToPreparingOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "Preparing"));

	onSnapshot(qry, (orders) => {
		tvPreparing.innerHTML = orders.size;
	});
}

function listenToReadyForPickupOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "Ready for Pick-up"));

	onSnapshot(qry, (orders) => {
		tvReadyForPickup.innerHTML = orders.size;
	});
}

function listenToInTransitOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "In Transit"));

	onSnapshot(qry, (orders) => {
		tvInTransit.innerHTML = orders.size;
	});
}

function listenToCompletedOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "Delivered/Picked-up"));

	onSnapshot(qry, (orders) => {
		tvCompleted.innerHTML = orders.size;
	});
}

function listenToFailedDeliveryOrders() {
	const qry = query(collection(db, "orders"), where("status", "==", "Failed Delivery"));

	onSnapshot(qry, (orders) => {
		tvFailedDelivery.innerHTML = orders.size;
	});
}

function listenToRevenueDetails() {
	const now = new Date();
	const thisMonth = ("0" + (now.getMonth() + 1)).slice(-2);
	const thisYear = now.getFullYear();

	const qryMonth = query(doc(db, "revenue", thisYear+thisMonth));
	onSnapshot(qryMonth, (revenue) => {
		if (!revenue.exists()) {
			tvRevenueThisMonth.innerHTML = "₱0.00";
			return;
		}

		tvRevenueThisMonth.innerHTML = "₱"+Number(parseFloat(revenue.data().revenue)).toFixed(2);
	});

	const qryToday = query(collection(db, "orders"), where("status", "==", "Delivered/Picked-up"), where("timestamp", ">=", new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,0,0).getTime()));

	onSnapshot(qryToday, (docs) => {
		if (docs.size == 0) {
			tvRevenueToday.innerHTML = "₱0.00";
			return;
		}

		let totalRevenue = 0;
		docs.forEach(doc => {
			totalRevenue += doc.data().total;
			tvRevenueToday.innerHTML = "₱"+Number(parseFloat(totalRevenue)).toFixed(2);
		});
	});

	const qryThisWeek = query(collection(db, "orders"), where("status", "==", "Delivered/Picked-up"), where("timestamp", ">=", getFirstDayOfWeek(new Date()).getTime()));

	onSnapshot(qryThisWeek, (docs) => {
		if (docs.size == 0) {
			tvRevenueThisWeek.innerHTML = "₱0.00";
			return;
		}

		let totalRevenue = 0;
		docs.forEach(doc => {
			totalRevenue += doc.data().total;
			tvRevenueThisWeek.innerHTML = "₱"+Number(parseFloat(totalRevenue)).toFixed(2);
		});
	});
}



function listenToRevenue() {
	const qryRevenue = query(collection(db, "revenue"));

	onSnapshot(qryRevenue, (revenue) => {
		let totalRevenue = 0;
		let labels = [];
		let data = [];

		revenue.forEach(snap => {
			totalRevenue += snap.data().revenue;
			data.push(snap.data().revenue);
			labels.push(months[new Date(snap.id.slice(0, 4) + '-' + snap.id.slice(4)).getMonth()]);
		
			if (chartRevenue != undefined) {
				chartRevenue.destroy();
			}
		
			chartRevenue = new Chart("chartRevenue", {
				type: "line",
				data: {
					labels: labels,
					datasets: [{
						label: 'Revenue',
						data: data
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});
		
			if (totalRevenue == 0) {
				tvEmptyRevenue.classList.toggle("d-none", false);
				divRevenue.classList.toggle("d-none", true);
			}
			else {
				tvEmptyRevenue.classList.toggle("d-none", true);
				divRevenue.classList.toggle("d-none", false);
			}
		});
	});
}

function listenToProducts() {
	const qry = query(collection(db, "products"));

	onSnapshot(qry, (products) => {
		tvProducts.innerHTML = products.size;
	});
}

function listenToCategories() {
	const qry = query(collection(db, "categories"));

	onSnapshot(qry, (categories) => {
		tvCategories.innerHTML = categories.size;
	});
}

function getFirstDayOfWeek(d) {
	d = new Date(d);
	var day = d.getDay(),
	  diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
	return new Date(d.setDate(diff));
  }