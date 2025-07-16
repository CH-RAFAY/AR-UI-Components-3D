document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 650) {
    // Smooth scroll and prevent refresh without interfering touch listeners
    document.body.style.overscrollBehavior = 'contain';
    document.documentElement.style.scrollBehavior = 'smooth';
  }
});