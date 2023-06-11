let coll = document.getElementsByClassName("collapsible");
let i;
let div = document.getElementById("services");
let computedStyle = window.getComputedStyle(div);
let height = computedStyle.height;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    let computedStyle = window.getComputedStyle(div);
    let height = computedStyle.height;

    if (content.style.maxHeight){
      div.style.height = (parseInt(height)  - parseInt(content.style.maxHeight)) + 'px'; 
      content.style.maxHeight = null;
    } 
    else {
      content.style.maxHeight = content.scrollHeight + "px";
      div.style.height = (parseInt(height) + parseInt(content.style.maxHeight)) + 'px'; 
    } 
  });
}

document.querySelectorAll('.button').forEach(button => button.addEventListener('click', e => {
  if(!button.classList.contains('loading')) {

      button.classList.add('loading');

      setTimeout(() => button.classList.remove('loading'), 3700);

  }
  e.preventDefault();
}));

function buttonCLiked(paragraph, img){

  const strongElement = paragraph.querySelector('strong'); 
  const spanElement = paragraph.querySelector('span'); 

  const name = strongElement.textContent;
  const price = spanElement.textContent;
  const imgPath = img.getAttribute('src');

  fetch('http://localhost:3000/addpost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, price, imgPath }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}