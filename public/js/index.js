/*carousel section js*/
let slideIndex = 0;

function moveSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    slides[slideIndex].classList.remove('active');
    
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    
    slides[slideIndex].classList.add('active');
}

setInterval(() => moveSlide(1), 7000);

/* popular movie section js */
document.getElementById('scrollLeft1').addEventListener('click', function() {
    document.getElementById('movieCards1').scrollBy({
        left: -300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollRight1').addEventListener('click', function() {
    document.getElementById('movieCards1').scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollLeft2').addEventListener('click', function() {
    document.getElementById('movieCards2').scrollBy({
        left: -300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollRight2').addEventListener('click', function() {
    document.getElementById('movieCards2').scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollLeft3').addEventListener('click', function() {
    document.getElementById('movieCards3').scrollBy({
        left: -300,
        behavior: 'smooth'
    });
});

document.getElementById('scrollRight3').addEventListener('click', function() {
    document.getElementById('movieCards3').scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});



