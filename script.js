"use strict";

/*GLOBAL VARIABLES */

// Theme toggle button and icon
let themeToggle;
let themeIcon;

// Vinyl display elements
let vinylButtons;
let vinylItems;

// Game elements
let guessInput;
let guessSubmit;
let gameResult;

// Contact form elements
let contactForm;
let firstNameInput;
let lastNameInput;
let emailInput;
let phoneInput;
let commentsInput;
let contactMethodRadios;
let formSuccess;

// Validation
const nameRegex = /^[A-Za-z]{2,}(?:[\s'-][A-Za-z]+)*$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;


function init() {
    
    getDOMElements();
    
    setupEventListeners();
    
    initializeTheme();
    
    displayVinyl('vinyl1');
}

function getDOMElements() {

    themeToggle = document.getElementById('theme-toggle');
    themeIcon = document.querySelector('.theme-icon');
    
    vinylButtons = document.querySelectorAll('.vinyl-btn');
    vinylItems = document.querySelectorAll('.vinyl-item');
    
    guessInput = document.getElementById('guess-input');
    guessSubmit = document.getElementById('guess-submit');
    gameResult = document.getElementById('game-result');
    
    contactForm = document.getElementById('contact-form');
    firstNameInput = document.getElementById('first-name');
    lastNameInput = document.getElementById('last-name');
    emailInput = document.getElementById('email');
    phoneInput = document.getElementById('phone');
    commentsInput = document.getElementById('comments');
    contactMethodRadios = document.querySelectorAll('input[name="contactMethod"]');
    formSuccess = document.getElementById('form-success');
}

function setupEventListeners() {

    themeToggle.addEventListener('click', toggleTheme);
    
    vinylButtons.forEach(function(button) {
        button.addEventListener('click', handleVinylClick);
    });
    
    guessSubmit.addEventListener('click', handleGuess);
    guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });
    
    contactForm.addEventListener('submit', handleFormSubmit);
    
    contactMethodRadios.forEach(function(radio) {
        radio.addEventListener('change', updateRequiredFields);
    });
}


function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}


function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}


function handleVinylClick(event) {
    const vinylName = event.target.getAttribute('data-product');
    displayVinyl(vinylName);
}


function displayVinyl(vinylName) {
    
    vinylButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    vinylItems.forEach(function(item) {
        item.classList.remove('active');
    });
    
    const activeButton = document.querySelector('[data-product="' + vinylName + '"]');
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    const activeVinyl = document.querySelector('[data-product-name="' + vinylName + '"]');
    if (activeVinyl) {
        activeVinyl.classList.add('active');
    }
}


function handleGuess() {
    const userGuess = parseInt(guessInput.value);
    
    if (!userGuess || userGuess < 1 || userGuess > 10) {
        displayGameResult('Please enter a valid number between 1 and 10.', false);
        return;
    }
    
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    
    if (userGuess === randomNumber) {
        displayGameResult('Congratulations! You guessed ' + userGuess + ' and the lucky number was ' + randomNumber + '. You win a free vinyl record!', true);
    } else {
        displayGameResult('Sorry! You guessed ' + userGuess + ' but the lucky number was ' + randomNumber + '. Try again!', false);
    }
    
    guessInput.value = '';
}


function displayGameResult(message, isWin) {
    gameResult.textContent = message;
    gameResult.className = 'game-result';
    
    if (isWin) {
        gameResult.classList.add('success');
    } else {
        gameResult.classList.add('error');
    }
}


function updateRequiredFields() {
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    const emailLabel = document.querySelector('label[for="email"] .conditional-required');
    const phoneLabel = document.querySelector('label[for="phone"] .conditional-required');
    
    if (selectedMethod === 'email') {
        emailLabel.textContent = '*';
        emailLabel.classList.add('required');
        emailLabel.classList.remove('conditional-required');
        
        phoneLabel.textContent = '';
        phoneLabel.classList.remove('required');
        phoneLabel.classList.add('conditional-required');
    } else {
        phoneLabel.textContent = '*';
        phoneLabel.classList.add('required');
        phoneLabel.classList.remove('conditional-required');
        
        emailLabel.textContent = '';
        emailLabel.classList.remove('required');
        emailLabel.classList.add('conditional-required');
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    clearFormErrors();
    
    let isValid = true;
    
    if (!validateName(firstNameInput.value, 'First name')) {
        showError(firstNameInput, 'Please enter a valid first name (at least 2 letters, only letters, spaces, hyphens, and apostrophes allowed).');
        isValid = false;
    }
    
    if (!validateName(lastNameInput.value, 'Last name')) {
        showError(lastNameInput, 'Please enter a valid last name (at least 2 letters, only letters, spaces, hyphens, and apostrophes allowed).');
        isValid = false;
    }
    
    if (!commentsInput.value.trim()) {
        showError(commentsInput, 'Please tell us how we can help you.');
        isValid = false;
    }
    
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    if (selectedMethod === 'email') {
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address (e.g., user@example.com).');
            isValid = false;
        }
    } else {
        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567).');
            isValid = false;
        }
    }
    
    if (isValid) {
        createUserObject();
    }
}

function validateName(name, fieldName) {
    return nameRegex.test(name.trim());
}

function validateEmail(email) {
    return emailRegex.test(email.trim());
}

function validatePhone(phone) {
    return phoneRegex.test(phone.trim());
}

function showError(input, message) {
    input.classList.add('error');
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFormErrors() {
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(function(input) {
        input.classList.remove('error');
    });
    
    const errorMessages = contactForm.querySelectorAll('.error-message');
    errorMessages.forEach(function(error) {
        error.textContent = '';
    });
}

function createUserObject() {
 
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    const user = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        contactMethod: selectedMethod,
        email: selectedMethod === 'email' ? emailInput.value.trim() : '',
        phone: selectedMethod === 'phone' ? phoneInput.value.trim() : '',
        comments: commentsInput.value.trim()
    };
    
    displaySuccessMessage(user);
    

    contactForm.reset();
    
    
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function displaySuccessMessage(user) {
    const fullName = user.firstName + ' ' + user.lastName;
    const contactInfo = user.contactMethod === 'email' ? user.email : user.phone;
    
    formSuccess.innerHTML = '<h3>Thank You for Contacting Groove Haven Records!</h3>' +
        '<p><strong>Name:</strong> ' + fullName + '</p>' +
        '<p><strong>Preferred Contact Method:</strong> ' + capitalizeFirstLetter(user.contactMethod) + '</p>' +
        '<p><strong>' + capitalizeFirstLetter(user.contactMethod) + ':</strong> ' + contactInfo + '</p>' +
        '<p><strong>Your Message:</strong> ' + user.comments + '</p>' +
        '<p>We\'ll get back to you soon about your vinyl inquiry!</p>';
    
    formSuccess.classList.remove('hidden');
    
    setTimeout(function() {
        formSuccess.classList.add('hidden');
    }, 10000);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener('DOMContentLoaded', init);
