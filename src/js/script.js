import "/src/sass/style.scss";
import Swiper from 'swiper';
import {Autoplay, Navigation, Pagination} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperEl = document.querySelector('.swiper');
if (swiperEl) {
  const swiper = new Swiper('.swiper', {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    
    speed: 500,
    effect: 'slide',

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    breakpoints: {
      1200: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      1920: {
        slidesPerView: 3,
        spaceBetween: 30,
      }
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });

  swiper.on('slideChange', function () {
    console.log('slide changed');
  });
}

const burgerBtn = document.getElementById('burger-btn');
const menu = document.getElementById('menu');
const menuClose = document.getElementById('menu-close');
const menuLinks = document.querySelectorAll('.menu__link');

function openMenu() {
  if (menu && burgerBtn) {
    menu.classList.add('menu--active');
    menu.classList.remove('menu--closing');
    burgerBtn.classList.add('burger--active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMenu() {
  if (menu && burgerBtn) {
    menu.classList.add('menu--closing');
    setTimeout(() => {
      menu.classList.remove('menu--closing');
      menu.classList.remove('menu--active');
      document.body.style.overflow = '';
    }, 400);
    burgerBtn.classList.remove('burger--active');
  }
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', openMenu);
}

if (menuClose) {
  menuClose.addEventListener('click', closeMenu);
}

if (menuLinks.length > 0) {
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

if (menu) {
  menu.addEventListener('click', (e) => {
    if (e.target === menu || e.target.classList.contains('menu__overlay')) {
      closeMenu();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu && menu.classList.contains('menu--active')) {
    closeMenu();
  }
});

// Функция для подчеркивания текущей страницы
function setActiveNavLink() {
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll('.promo__link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');

    const linkHref = link.getAttribute('href');
    
    if (currentPage === '/' && linkHref === '#') {
      link.classList.add('active');
    } else if (currentPage.includes('blog') && linkHref.includes('blog')) {
      link.classList.add('active');
    } else if (currentPage.includes('catalog') && linkHref.includes('catalog')) {
      link.classList.add('active');
    } else if (currentPage.includes('about') && linkHref.includes('about')) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);