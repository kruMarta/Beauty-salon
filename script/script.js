document.getElementById('service1').addEventListener('click', () => openNewPage('1'));

document.getElementById('service2').addEventListener('click', () => openNewPage('2'));

document.getElementById('service3').addEventListener('click', () => openNewPage('3'));

document.getElementById('service4').addEventListener('click', () => openNewPage('4'));

document.getElementById('service5').addEventListener('click', () => openNewPage('5'));

document.getElementById('service6').addEventListener('click', () => openNewPage('6'));

function openNewPage(id) {
    window.location.href = `../pages/service-item.html?id=${id}`;
}

function moveToReserv(){
    console.log("click");
    window.location.href = '../pages/reservation.html';
}