const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function fetchData(id) {
  fetch(`http://localhost:3000/data/${id}`)
    .then(response => response.json())
    .then(data => {
      const header = document.getElementById('header');
      header.innerHTML = data[0].name;
      const description = document.getElementById('description');
      description.innerHTML = "&emsp;" + data[0].description;
      const image = document.getElementById('image');
      image.src = data[0]['image-path'];;
    })
    .catch(error => console.log(error));
}

fetchData(id);