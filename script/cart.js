let arrayOfServices = [];
let prices = [];
let total;
window.addEventListener("load", function(event){

    fetch('http://localhost:3000/getposts')
    .then((response) => response.json())
    .then((data) => {
      let cartBlock = document.getElementById("cart");
      data.forEach((object) => {
        let height = cartBlock.offsetHeight;
        const id = object.id;
        const name = object.name;
        const price = object.price;
        prices.push(price);
        const img = object.imgPath;
        let div = document.createElement('div');
        div.className = 'service';

        let photo = document.createElement('img');
        photo.src = img;
        div.appendChild(photo);

        let head = document.createElement('p');
        let headText = document.createTextNode(name);
        head.appendChild(headText);
        div.appendChild(head);

        let span = document.createElement('span');
        let spanText = document.createTextNode(price);
        span.appendChild(spanText);
        div.appendChild(span);

        const close = document.createElement('a');
        const closeImg = document.createElement('img');
        closeImg.src = "../images/close-button.svg";
        closeImg.className = "close";
        close.appendChild(closeImg);
        close.addEventListener('click', function(event) {
          console.log('Close button clicked');
          deleteService(id, div);
        });
        div.appendChild(close);

        const cart = document.querySelector(".bookings");
        cart.appendChild(div);

        height += div.offsetHeight;
        if (height > 750){
        cartBlock.style.height = height + 'px'; } 
        else {
          cartBlock.style.height = '850px'; 
        }
        countSum();
        arrayOfServices.push(name);
      });

      if (data.length === 0) {
        cartBlock.style.height = '750px'; 
      }

      console.log(arrayOfServices);
      const dateField = document.getElementById('date');
      dateField.addEventListener("change", function() {
        const date = new Date(dateField.value);
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayOfWeek = date.getDay();
        const dayName = weekdays[dayOfWeek];
        console.log(dayName);

        arrayOfServices.forEach((element) => {
          findArtists(element, dayName);
        });
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});


function findArtists(serviceName, dayOfWeek){
  fetch('http://localhost:3000/getService', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: serviceName, dayOfWeek: dayOfWeek }),
  })
  .then((response) => response.text())
  .then((data) => {
    const dataArray = JSON.parse(data);
    const artistsLabel = document.querySelector('label[for="artist"]');

    const lineBreak = document.createElement('br');
    const selectArt = document.createElement('select');

    let disabledOption = document.createElement('option');
    disabledOption.disabled = true;
    disabledOption.text = serviceName;
    selectArt.add(disabledOption);

    const artistExist = document.getElementById(serviceName);

    if (artistExist === null || artistExist === "undefined"){
      dataArray.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.text = option.name;
        selectArt.add(optionElement);
      });
      selectArt.id = serviceName;
    }
    else {
      while (artistExist.options.length > 1) {
        artistExist.remove(1);
      }
      dataArray.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.text = option.name;
        artistExist.add(optionElement);
        });
      selectArt = artistExist;
    }
      
    selectArt.addEventListener("click", function(event) {
      let options = selectArt.querySelectorAll("option");
      let count = options.length;
      const artist = selectArt.value;
        getWorkHours(artist, serviceName);
    });

    // Insert the select element after the "Artists" label
    artistsLabel.after(lineBreak);
    lineBreak.after(selectArt);
    selectArt.insertAdjacentHTML('afterend', '<br>');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

let artistsInCart = []; 
function getWorkHours(artist, serviceName){
  artistsInCart.push(artist);
  fetch('http://localhost:3000/getTime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: artist}),
  })
  .then((response) => response.text())
  .then((data) => {
    const result = JSON.parse(data);
    const start = parseInt(result[0].start_hour);
    const end = parseInt(result[0].end_hour);
    const hours = end - start;

    const timeLabel = document.querySelector('label[for="time"]');
    const lineBreak = document.createElement('br');
    let selectTime = document.createElement('select');
    
    const timeExist = document.getElementById(serviceName  + "art");


    const date = document.getElementById('date').value;
    let takenHours = [];

    fetch('http://localhost:3000/checkReservedTime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: artist, date: date}),
    })
    .then((response) => response.text())
    .then((data) => {
      const result = JSON.parse(data);
      takenHours = result;
      
      if (timeExist === null || typeof timeExist === "undefined"){
        let disabledOption = document.createElement('option');
        disabledOption.disabled = true;
        disabledOption.text = artist;
        selectTime.add(disabledOption);
        selectTime.id = serviceName + "art";
        timeLabel.after(lineBreak);
        lineBreak.after(selectTime);
        selectTime.insertAdjacentHTML('afterend', '<br>');
      } 
      else {
        while (timeExist.options.length > 1) {
          timeExist.remove(0);
        }
        timeExist.options[0].text = artist;
        timeExist.options[0].disabled = true;
        let currentTime = start;
        for (let i = 0; i <= hours; i ++){
          const optionElement = document.createElement('option');
          if (checkMatch(currentTime.toString(), takenHours)){
            currentTime++;
            continue;
          }
          else{
          optionElement.text = currentTime + ":00";
          timeExist.add(optionElement);
        }
          currentTime++; 
        }
        selectTime = timeExist;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}  

function checkMatch(string, array) {
  const escapedString = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedString);
  for (let i = 0; i < array.length; i++) {
    if (regex.test(JSON.stringify(array[i]))) {
      return true; 
    }
  }
  return false; 
}

let submitOrderController = new AbortController();
function submitOrder(){
  let name = document.getElementById('name').value;
  let phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const date = document.getElementById('date').value;
  const wishes = document.getElementById('notes').value;
  let service;
  let time;
  let price;
  let i = 0;

  if(validateInfo(name, phone)) {
   // Cancel the previous fetch request
    submitOrderController.abort();
    submitOrderController = new AbortController();
    arrayOfServices.forEach((element) => {

    service = element;
    const artist = document.getElementById(service).value;
    time = document.getElementById(service + "art").value;
    price = prices[i];

    fetch('http://localhost:3000/confirmBooking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, phone, email, service, date, artist, time, price, wishes }),
    })
    .then((response) => {
    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }
    })
    .catch((error) => {
    console.error('Fetch error:', error); 
    });
    i++;
  });
  
  modalInfo(name, arrayOfServices, date);
  const modal = new bootstrap.Modal(document.getElementById('myModal'));
  modal.show();

  fetch(`http://localhost:3000/cleanTable`)
  .then(response => response.json())
  .catch(error => console.log(error));
}
}

const closeButtonElements = document.getElementsByClassName('closeButton');
for (let i = 0; i < closeButtonElements.length; i++) {
  closeButtonElements[i].addEventListener('click', function() {
    console.log("clicked!");
    location.reload();
  });
}

function modalInfo(name, arrayOfServices, date){

  const modal = document.getElementsByClassName('modal-body')[0];
  modal.innerHTML = `Dear, ${name}!<br> Your appointment info on ${date}:<br> `;
  arrayOfServices.forEach((element) => {
    let time = document.getElementById(element + "art").value;
    let artist = document.getElementById(element).value;
    modal.innerHTML += `Service: ${element}, artist: ${artist}, time: ${time}<br>`;
  });

  const email = document.getElementById('email').value;
  if(email !== ""){
    console.log("email exists!");

  const mailOptions = {
    from: 'madenemar@gmail.com', 
    to: email, 
    subject: 'Receipt' 
  };

  let response = {
    body: {
      name: name,
      intro: "Here are you appointments:",
      table: {
        data: [],
      }
    }
  };

  let i = 0;
  arrayOfServices.forEach((element) => {
    let time = document.getElementById(element + "art").value;
    let artist = document.getElementById(element).value;

    response.body.table.data.push({
      item: element + "( " +date + " " + time + " )",
      description: artist,
      price: prices[i]
    });
    i++;
  });

  response.body.table.data.push({
    outro: "Total: $"  +total
    
  })

  fetch('http://localhost:3000/sendEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({mailOptions, response})
  })
    .then(response => response.json())
    .then(response => {
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }
    })
  }
}

function validateInfo(name, phone){
  if(name === ""){
    alert("Name field can`t be empty!");
    return false;
  }
  if(phone === "") {
    alert("Phone number field can`t be empty!");
    return false;
  }

  let appointments = [];
  arrayOfServices.forEach((service)=>{
    appointments.push(document.getElementById(service + "art").value);
  });

  const encounteredElements = new Set();
  for (let i = 0; i < appointments.length; i++) {
    const element = appointments[i];
    if (encounteredElements.has(element)) {
      alert("Services can`t be at the same time!");
      return false; 
    }
    encounteredElements.add(element);
    console.log(encounteredElements);
  }
  return true;
}

function deleteService(id, div) {
  console.log(id);
  div.remove(); 

  fetch(`http://localhost:3000/deletepost/${id}`)
  .then(response => response.json())
  .catch(error => console.log(error));

  location.reload();
  countSum();
}

function countSum(){
  fetch(`http://localhost:3000/countSum`)
  .then(response => response.json())
  .then((data) => {
    const sum = data[0]['SUM(price)'];
    const price = document.getElementById('sumPrice');
    price.innerHTML = sum + " $";
    total = sum;
  })
  .catch(error => console.log(error));
}