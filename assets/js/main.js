// Smooth scrolling for buttons (optional for internal links)
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Optional: Add custom behavior here
            console.log(`${button.textContent} button clicked`);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to CryptoCalc!');
});

