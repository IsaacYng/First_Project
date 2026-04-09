// १. सुरुको डेटा
const initialBikes = [
    { name: "Platina 100 ES", price: "218,900", Insurance: "5600", img: "https://cdn-icons-png.flaticon.com/512/8163/8163149.png" },
];

let bikes = JSON.parse(localStorage.getItem('bajajInventory')) || initialBikes;

function updateApp() {
    localStorage.setItem('bajajInventory', JSON.stringify(bikes));
    
    if (document.getElementById("bike-container")) {
        displayBikes();
    }
    
    if (document.getElementById("admin-bike-list")) {
        displayAdminTable();
    }
}

function displayBikes() {
    let container = document.getElementById("bike-container");
    if(!container) return;

    container.innerHTML = bikes.map(bike => `
        <div class="bike-card">
            <img src="${bike.img}" alt="${bike.name}">
            <div class="bike-info">
                <h3>${bike.name}</h3>
                <p>Insurance: Rs. ${bike.Insurance}</p>
                <div class="price">Rs. ${bike.price}</div>
            </div>
        </div>
    `).join('');
}

// ५. एडमिन पेजको टेबल (Edit बटन थपिएको)
function displayAdminTable() {
    let list = document.getElementById("admin-bike-list");
    if(!list) return;

    list.innerHTML = bikes.map((bike, index) => `
        <tr>
            <td><img src="${bike.img}" style="width:40px; height:auto;"></td>
            <td><strong>${bike.name}</strong></td>
            <td>Rs. ${bike.price}</td>
            <td>Rs. ${bike.Insurance}</td>
            <td>
                <!-- Edit Button -->
                <button onclick="editBike(${index})" style="background:#f39c12; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; margin-right:5px;">
                   Edit
                </button>
                <!-- Remove Button -->
                <button onclick="deleteBike(${index})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">
                   Remove
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit फङ्सन
function editBike(index) {
    let bike = bikes[index];

    let newName = prompt("Enter New Bike Name:", bike.name);
    let newPrice = prompt("Enter New Price (Numbers only):", bike.price);
    let newIns = prompt("Enter New Insurance Cost:", bike.Insurance);

    if (newName && newPrice) {
        bikes[index].name = newName;
        bikes[index].price = newPrice;
        bikes[index].Insurance = newIns;

        updateApp();
    }
}

function handleForm() {
    let name = document.getElementById('newName').value;
    let price = document.getElementById('newPrice').value;
    let ins = document.getElementById('newIns') ? document.getElementById('newIns').value : "0";
    let img = document.getElementById('newImg').value || "https://cdn-icons-png.flaticon.com/512/8163/8163149.png";

    if (name && price) {
        bikes.push({ name: name, price: price, Insurance: ins, img: img });
        updateApp();
        
        document.getElementById('newName').value = "";
        document.getElementById('newPrice').value = "";
        if(document.getElementById('newIns')) document.getElementById('newIns').value = "";
    } else {
        alert("Please fill name and price!");
    }
}

function deleteBike(index) {
    if(confirm("Are you Sure?")) {
        bikes.splice(index, 1);
        updateApp();
    }
}

function filterBikes() {
    let input = document.getElementById('bikeSearch').value.toUpperCase();
    let cards = document.getElementsByClassName('bike-card');

    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByTagName('h3')[0];
        if (title) {
            let textValue = title.textContent || title.innerText;
            cards[i].style.display = (textValue.toUpperCase().indexOf(input) > -1) ? "" : "none";
        }
    }
}

updateApp();
