
document.documentElement.style.scrollBehavior = 'smooth';

const buttons = document.querySelectorAll('.main-action-button, .gift-section-button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        alert('Thank you for your interest! Registration will open soon.');
    });
});
