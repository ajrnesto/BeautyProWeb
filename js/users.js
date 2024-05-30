import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, getDocs, setDoc, updateDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { parseButtonAction, showModal } from '../js/utils.js';

const tbodyUsers = document.querySelector("#tbodyUsers");
const tvUserName = document.querySelector("#tvUserName");
const ordersContainer = document.querySelector("#ordersContainer");
// const etId = document.querySelector("#etId");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnSearchUser = document.querySelector("#btnSearchUser");
const btnSearchId = document.querySelector("#btnSearchId");
const dlId = document.querySelector("#dlId");
const dlFirstName = document.querySelector("#dlFirstName");
const dlLastName = document.querySelector("#dlLastName");

onAuthStateChanged(auth, user => {
	const docRef = doc(db, "users", user.uid);
	getDoc(docRef).then(userSnap => {
		const userType = userSnap.data().userType;
	});
});

window.addEventListener("load", function() {
	getUsersData("");
	populateDatalists();
});

btnSearchUser.addEventListener("click", function() {
	etId.value = "";
	getUsersData("name");
});

// btnSearchId.addEventListener("click", function() {
// 	etFirstName.value = "";
// 	etLastName.value = "";
// 	getUsersData("id");
// });

function populateDatalists() {
	dlFirstName.value = "";
}

function getUsersData(filter) {
	let qryUsers = null;
	
	if (filter == "") {
		qryUsers = query(collection(db, "users"));	
	}
	else if (filter == "name") {
		if (etFirstName.value.toUpperCase() && !etLastName.value.toUpperCase()) {
			qryUsers = query(collection(db, "users"), where("firstName", "==", etFirstName.value.toUpperCase()), where("isVerified", "==", true));	
		}
		else if (!etFirstName.value.toUpperCase() && etLastName.value.toUpperCase()) {
			qryUsers = query(collection(db, "users"), where("lastName", "==", etLastName.value.toUpperCase()), where("isVerified", "==", true));	
		}
		else if (etFirstName.value.toUpperCase() && etLastName.value.toUpperCase()) {
			qryUsers = query(collection(db, "users"), where("firstName", "==", etFirstName.value.toUpperCase()), where("lastName", "==", etLastName.value.toUpperCase()), where("isVerified", "==", true));	
		}
	}
	// else if (filter == "id") {
	// 	qryUsers = query(collection(db, "users"), where("uid", "==", etId.value));	
	// }
	
	onSnapshot(qryUsers, (users) => {
		// clear table
		tbodyUsers.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			tbodyUsers.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Users to Display</h4></div>';
		}
		else {
			tbodyUsers.innerHTML = '';
		}
			
		users.forEach(user => {
			if (user.data().email != "beautypro.admin@gmail.com") {
				// const newIdOption = document.createElement('option');
				// newIdOption.value = user.id;
				// dlId.appendChild(newIdOption);

				const newFirstNameOption = document.createElement('option');
				newFirstNameOption.value = user.data().firstName;
				dlFirstName.appendChild(newFirstNameOption);
				
				const newLastNameOption = document.createElement('option');
				newLastNameOption.value = user.data().lastName;
				dlLastName.appendChild(newLastNameOption);
			}

			if (user.data().userType != 1 && user.data().email != "juan@gmail.com") {
				renderUsers(
					user.id,
					user.data().firstName,
					user.data().lastName,
					user.data().email,
					user.data().mobile,
					user.data().addressPurok,
					user.data().addressBarangay,
					user.data().addressMunicipality,
					user.data().isVerified,
					user.data().isDelinquent
				);
			}
		});
	});
}

function renderUsers(id, firstName, lastName, email, mobile, addressPurok, addressBarangay, addressMunicipality, isVerified, isDelinquent) {
	const newRow = document.createElement('tr');
	// const cellId = document.createElement('td');
	const cellName = document.createElement('td');
	const cellAddress = document.createElement('td');
	const cellMobile = document.createElement('td');
	const cellEmail = document.createElement('td');
	// const cellVerification = document.createElement('td');
	// const btnVerificationAction = document.createElement('button');
	// const tvVerificationMessage = document.createElement('p');
	const cellHistory = document.createElement('td');
	const btnHistoryAction = document.createElement('button');
	const cellDelinquency = document.createElement('td');
	const btnDelinquencyAction = document.createElement('button');

	// cellId.innerHTML = id;
	cellName.innerHTML = firstName + " " + lastName;
	cellAddress.innerHTML = addressPurok + ", " + addressBarangay + ", " + addressMunicipality;
	cellMobile.innerHTML = mobile;
	cellEmail.innerHTML = email;

	// btnVerificationAction.className = "btn btn-no-border btn-success";
	// btnVerificationAction.innerHTML = "Verify";
	// tvVerificationMessage.className = "text-success";
	// tvVerificationMessage.innerHTML = "Verified";
	// if (!isVerified) {
	// 	btnVerificationAction.classList.toggle("d-none", false);
	// 	tvVerificationMessage.classList.toggle("d-none", true);
	// }
	// else {
	// 	btnVerificationAction.classList.toggle("d-none", true);
	// 	tvVerificationMessage.classList.toggle("d-none", false);
	// }
	// btnVerificationAction.onclick = function() {
	// 	verifyUser(id);
	// }

	btnHistoryAction.className = "btn btn-no-border btn-primary";
	btnHistoryAction.innerHTML = "View";
	btnHistoryAction.onclick = function() {
		viewUserHistory(id, firstName, lastName);
	}

	if (!isDelinquent) {
		btnDelinquencyAction.className = "btn btn-no-border btn-danger";
		btnDelinquencyAction.innerHTML = "Mark as Delinquent";
	}
	else {
		btnDelinquencyAction.className = "btn btn-no-border btn-light";
		btnDelinquencyAction.innerHTML = "Unmark as Delinquent";
	}
	btnDelinquencyAction.onclick = function() {
		toggleUserDelinquency(id, isDelinquent);
	}
	
	// newRow.appendChild(cellId);
	newRow.appendChild(cellName);
	newRow.appendChild(cellAddress);
	newRow.appendChild(cellMobile);
	newRow.appendChild(cellEmail);
	// newRow.appendChild(cellVerification);
	// cellVerification.appendChild(btnVerificationAction);
	// cellVerification.appendChild(tvVerificationMessage);
	newRow.appendChild(cellHistory);
	cellHistory.appendChild(btnHistoryAction);
	newRow.appendChild(cellDelinquency);
	cellDelinquency.appendChild(btnDelinquencyAction);
	
	tbodyUsers.append(newRow);
}

// function verifyUser(userId) {
// 	updateDoc(doc(db, "users", userId), {
// 		isVerified: true
// 	});
// }

function viewUserHistory(userId, firstName, lastName) {
	tvUserName.innerHTML = firstName + " " + lastName;
	showModal("#modalViewHistory");

	getDocs(query(collection(db, "orders"), where("customer", "==", userId), orderBy("timestamp", "asc"))).then((users) => {
		// clear table
		ordersContainer.innerHTML = '';

		console.log("Users size: "+users.size);
		if (users.size == 0) {
			ordersContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Orders to Display</h4></div>';
		}
		else {
			ordersContainer.innerHTML = '';
		}
			
		users.forEach(order => {
			renderOrderCard(
				order.id,
				order.data().deliveryAddress,
				order.data().customer,
				order.data().deliveryOption,
				order.data().status,
				order.data().timestamp,
				order.data().total,
				userId,
				firstName,
				lastName
			);
		});
	});
}

function toggleUserDelinquency(userId, isDelinquent) {
	updateDoc(doc(db, "users", userId), {
		isDelinquent: !isDelinquent,
		wasNotifiedForDelinquency: false
	});
}

function renderOrderCard(orderId, deliveryAddress, customerId, deliveryOption, status, timestamp, total, userId, firstName, lastName) {
	const cardContainer = document.createElement('div');
		const card = document.createElement('div');
			const cardHeader = document.createElement('div');
			const tvTimestamp = document.createElement('p');
			const tvStatus = document.createElement('p');
			const divButtonContainer = document.createElement('div');
				const btnAction = document.createElement('button');
				const btnSecondaryAction = document.createElement('button');
			const tvVerification = document.createElement('p');
			const tvDelinquency = document.createElement('p');
			const tvCustomerName = document.createElement('h6');
			const tvMobile = document.createElement('p');
			const tvDeliveryOption = document.createElement('p');
			const tvDeliveryAddress = document.createElement('p');
			const tvItems = document.createElement('h6');
		const cardBody = document.createElement('div');
			const table = document.createElement('table');
				const thead = document.createElement('thead');
					const tr = document.createElement('tr');
						const thImage = document.createElement('th');
						const thProduct = document.createElement('th');
						const thQuantity = document.createElement('th');
						const thDetails = document.createElement('th');
						const thPrice = document.createElement('th');
						const thSubtotal = document.createElement('th');
				const tbody = document.createElement('tbody');
		const cardFooter = document.createElement('div');
			const tvTotal = document.createElement('h6');

	cardContainer.className = "row container mx-auto col p-4 justify-content-center";
	card.className = "rounded bg-white col-12 text-center p-4";
	cardHeader.className = "row";
	tvTimestamp.className = "col-6 text-start text-dark fs-6";
	tvStatus.className = "col-6 text-end text-danger fs-6";
	divButtonContainer.className = "col-6 text-end";
	btnAction.className = "btn btn-primary";
	btnSecondaryAction.className = "ms-2 btn btn-danger text-white";
	tvDeliveryOption.className = "text-primary col-6 text-start";
	tvVerification.className = "col-12 text-start fst-italic my-0";
	tvDelinquency.className = "col-12 text-start text-danger fst-italic my-0";
	tvCustomerName.className = "text-primary col-12 text-start my-0";
	tvMobile.className = "text-primary col-12 text-start";
	tvDeliveryAddress.className = "col-12 text-start text-dark fs-6";
	tvItems.className = "text-primary col-12 text-start mt-2";
	cardBody.className = "row";
	table.className = "table align-middle";
	thImage.className = "col-1 invisible";
	thProduct.className = "col-2";
	thDetails.className = "col-2";
	thPrice.className = "col-1";
	thQuantity.className = "col-1";
	thSubtotal.className = "col-1";
	cardFooter.className = "row";
	tvTotal.className = "text-primary col-12 text-end mt-2";

	tvItems.innerHTML = "Items";
	thProduct.innerHTML = "Product";
	thDetails.innerHTML = "Details";
	thPrice.innerHTML = "Unit Price";
	thQuantity.innerHTML = "Quantity";
	thSubtotal.innerHTML = "Subtotal";

	const date = new Date(timestamp);
	tvTimestamp.innerHTML = date.toLocaleString();
	tvStatus.innerHTML = "Status: "+status;

	const btnActionValue = parseButtonAction(status, deliveryOption);
	if (btnActionValue == -1) {
		btnAction.className = "invisible";
	}
	else {
		btnAction.innerHTML = btnActionValue;
	}
	btnAction.onclick = function() { updateOrderStatus(orderId, status, deliveryOption, total, customerId, firstName, lastName) }

	if (status == "In Transit"){
		btnSecondaryAction.innerHTML = "Failed To Deliver";
	}
	else {
		btnSecondaryAction.className = "invisible";
	}
	btnSecondaryAction.onclick = function() { updateOrderStatus(orderId, "Marked as Failed Delivery", deliveryOption, total, customerId, firstName, lastName) }

	tvDeliveryOption.innerHTML = "Delivery Option: " + deliveryOption;

	getDoc(doc(db, "users", customerId)).then((user) => {
		if (user.data() == null) {
			tvCustomerName.innerHTML = "<s>Deleted user</s>";
			return;
		}
		const firstName = user.data().firstName;
		const lastName = user.data().lastName;
		const mobile = user.data().mobile;
		const isVerified = user.data().isVerified;
		const isDelinquent = user.data().isDelinquent;
		
		tvDeliveryAddress.innerHTML = "Delivery Address: " + deliveryAddress;
		tvTotal.innerHTML = "Total: ₱"+Number(parseInt(total)).toFixed(2);
		tvMobile.innerHTML = mobile;

		if (isVerified) {
			tvVerification.innerHTML = "Verified User";
			tvVerification.classList.toggle("text-success", true);
			btnAction.classList.toggle("btn-light", false);
			btnAction.classList.toggle("btn-primary", true);
			btnAction.disabled = false;
		}
		else {
			tvVerification.innerHTML = "Unverified User";
			tvVerification.classList.toggle("text-danger", true);
			btnAction.classList.toggle("btn-primary", false);
			btnAction.classList.toggle("btn-light", true);
			btnAction.disabled = true;
		}

		if (isDelinquent) {
			tvDelinquency.classList.toggle("d-none", false);
		}
		else {
			tvDelinquency.classList.toggle("d-none", true);
		}

			tvDelinquency.innerHTML = "Delinquent User";
			tvCustomerName.innerHTML = firstName + " " + lastName;
	});

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(tvStatus);
			// cardHeader.appendChild(tvVerification);
			// cardHeader.appendChild(tvDelinquency);
			// cardHeader.appendChild(tvCustomerName);
			// cardHeader.appendChild(tvMobile);
			cardHeader.appendChild(tvDeliveryOption);
			cardHeader.appendChild(divButtonContainer);
				divButtonContainer.appendChild(btnAction);
				divButtonContainer.appendChild(btnSecondaryAction);
			// cardHeader.appendChild(tvDeliveryAddress);
			cardHeader.appendChild(tvItems);
		card.appendChild(cardBody);
			card.appendChild(table);
				table.appendChild(thead);
					thead.appendChild(tr);
						tr.appendChild(thImage);
						tr.appendChild(thProduct);
						//tr.appendChild(thDetails);
						tr.appendChild(thPrice);
						tr.appendChild(thQuantity);
						tr.appendChild(thSubtotal);
				table.appendChild(tbody);
		card.appendChild(cardFooter);
			cardFooter.appendChild(tvTotal);

	ordersContainer.prepend(cardContainer);

	getOrderItemsData(orderId, tbody);
}

function updateOrderStatus(orderId, status, deliveryOption, total, userUid, firstName, lastName) {
	if (status == "Pending") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Preparing"
		});

		const now = new Date();
		const thisMonth = ("0" + (now.getMonth() + 1)).slice(-2);
		const thisYear = now.getFullYear();
		setDoc(doc(db, "revenue", thisYear+thisMonth), {
			revenue: increment(total)
		},
		{
			merge:true
		});
	}
	else if (status == "Preparing") {
		if (deliveryOption == "Delivery") {
			updateDoc(doc(db, "orders", orderId), {
				status: "In Transit"
			});
		}
		else if (deliveryOption == "Pick-up") {
			updateDoc(doc(db, "orders", orderId), {
				status: "Ready for Pick-up"
			});
		}
	}
	else if (status == "In Transit" || status == "Ready for Pick-up") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Delivered/Picked-up"
		});
	}
	else if (status == "Marked as Failed Delivery") {
		updateDoc(doc(db, "orders", orderId), {
			status: "Failed Delivery"
		});
	}
	
	viewUserHistory(userUid, firstName, lastName);
}

async function getOrderItemsData(orderId, tbody) {
const querySnapshot = await getDocs(collection(db, "orders", orderId, "orderItems"));
querySnapshot.forEach((item) => {
	// renderOrderItems
	
	const refProduct = doc(db, "products", item.id);
	getDoc(refProduct).then((product) => {
		if (!product.exists()) {
			renderOrderItems(
				tbody,
				"-1",
				"Deleted Item",
				"Deleted Item",
				0,
				0,
				null
			);

			return;
		}

		renderOrderItems(
			tbody,
			product.id,
			product.data().productName,
			product.data().productDetails,
			product.data().price,
			item.data().quantity,
			product.data().thumbnail
		);
	});
});
}

function renderOrderItems(tbody, productId, productName, productDetails, price, quantity, thumbnail) {
const newRow = document.createElement('tr');
const cellProductThumbnail = document.createElement('td');
	const imgThumbnail = document.createElement('img');
const cellProductName = document.createElement('td');
const cellProductDetails = document.createElement('td');
const cellUnitPrice = document.createElement('td');
const cellQuantity = document.createElement('td');
const cellSubtotal = document.createElement('td');

if (thumbnail == null){
	imgThumbnail.src = "https://via.placeholder.com/150?text=No+Image";
}
else {
	getDownloadURL(ref(storage, 'products/'+thumbnail))
		.then((url) => {
			imgThumbnail.src = url;
		});
}
imgThumbnail.className = "col-12";
imgThumbnail.style.width = "50px";
imgThumbnail.style.height = "50px";
imgThumbnail.style.objectFit = "fill";

cellProductName.innerHTML = productName;
cellProductDetails.innerHTML = productDetails;
if (productId == "-1") {
	cellUnitPrice.innerHTML = "₱--.--";
	cellQuantity.innerHTML = "--";
	cellSubtotal.innerHTML = "₱--.--";
}
else {
	cellUnitPrice.innerHTML = "₱"+Number(price).toFixed(2);
	cellQuantity.innerHTML = quantity;
	cellSubtotal.innerHTML = "₱"+Number(parseFloat(price) * parseFloat(quantity)).toFixed(2);
}

newRow.appendChild(cellProductThumbnail);
	cellProductThumbnail.appendChild(imgThumbnail);
newRow.appendChild(cellProductName);
// newRow.appendChild(cellProductDetails);
newRow.appendChild(cellUnitPrice);
newRow.appendChild(cellQuantity);
newRow.appendChild(cellSubtotal);

tbody.append(newRow);
}