const mainNav = document.querySelector('.site-list')
const btnOpen = document.querySelector('.main-nav__toggle')
const btnClose = document.querySelector('.site-list__close')

btnOpen.addEventListener('click', function() {
  mainNav.classList.toggle('site-list--closed')
})

btnClose.addEventListener('click', function() {
  mainNav.classList.toggle('site-list--closed')
})
