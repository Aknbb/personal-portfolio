import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import './modernizr-2.6.2.min.js';

const renderWithAnimation = () => {
  const renderingElements = document.querySelectorAll('.animate-box');
  /* eslint-disable  no-undef */
  const rootObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        if (!element.classList.contains('animated-fast')) {
          element.classList.add('item-animate');
          setTimeout(() => {
            const elements = document.querySelectorAll('.animate-box.item-animate');
            elements.forEach((elm, index) => {
              const animationEffect = elm.dataset.animateEffect;
              setTimeout(() => {
                if (animationEffect === 'fadeIn') {
                  elm.classList.add('fadeIn', 'animated-fast');
                } else {
                  elm.classList.add('fadeInUp', 'animated-fast');
                }
                elm.classList.remove('item-animate');
                rootObserver.unobserve(element);
              }, index * 100);
            });
          }, 50);
        }
      }
    });
  }, { threshold: 0.15 });
  renderingElements.forEach((renderingElement) => {
    rootObserver.observe(renderingElement);
  });
};

const toggleVisibilityOnScroll = () => {
  const home = document.getElementById('home');
  const about = document.getElementById('about');
  const jsTopElement = document.getElementById('go-top-button-wrapper');
  const navigationBar = document.getElementById('navigation-bar');
  const scrollIndicator = document.getElementById('scroll-indicator');
  /* eslint-disable  no-undef */
  const aboutSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        jsTopElement.classList.add('active');
        navigationBar.classList.add('active');
        scrollIndicator.classList.add('hide');
      }
    });
  }, { threshold: 0.1 });
  aboutSectionObserver.observe(about);
  /* eslint-disable  no-undef */
  const homeSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        jsTopElement.classList.remove('active');
        navigationBar.classList.remove('active');
        scrollIndicator.classList.remove('hide');
      }
    });
  }, { threshold: 0.85 });
  homeSectionObserver.observe(home);
};

const goToSections = () => {
  const sourceTargetMap = {
    'nav-button-home': 'html',
    'nav-button-about': '#about',
    'nav-button-skills': '#skills',
    'nav-button-experience': '#experience',
    'nav-button-projects': '#projects',
    'nav-button-resume': '#resume',
    'go-top-button': 'html',
    'scroll-indicator': '#about',
  };
  Object.entries(sourceTargetMap).forEach(([key, value]) => {
    const sourceDomElement = document.getElementById(key);
    if (sourceDomElement) {
      sourceDomElement.addEventListener('click', function (event) {
        event.preventDefault();
        scrollToElement(value);
        return false;
      });
    }
  });
};

const scrollToElement = (targetElementSelector) => {
  const position = getOffsetTop(document.querySelector(targetElementSelector));
  window.scroll({
    top: position,
    behavior: 'smooth',
  });
};

const getOffsetTop = (element) => {
  const boundingRect = element.getBoundingClientRect();
  return boundingRect.top + window.scrollY;
};

const changeActiveSectionOnScroll = () => {
  const sectionIdList = ['home', 'about', 'skills', 'experience', 'projects', 'resume'];
  const sections = [];
  const navigationBarListItems = document.querySelectorAll('#navbar-list li');
  sectionIdList.forEach(function (sectionId) {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sections.push(sectionElement);
    }
  });
  window.addEventListener('scroll', function () {
    let currentActiveListItemId = 'nav-li-';
    let activeSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 200) {
        activeSectionId = section.getAttribute('id');
      }
    });
    currentActiveListItemId += activeSectionId;
    navigationBarListItems.forEach(function (listItem) {
      listItem.classList.remove('active-item');
      if (listItem.id === currentActiveListItemId) {
        listItem.classList.add('active-item');
      }
    });
  }, { passive: true });
};

const hidePageLoader = () => {
  const pageLoader = document.getElementById('page-loader');
  pageLoader.classList.add('hidden');
};

const flipProfilePhoto = () => {
  const flipCardContainer = document.getElementById('flip-card-container');
  flipCardContainer.onclick = function () {
    flipCardContainer.classList.toggle('flip');
  };
};

const stickToResumeCanvas = () => {
  const resumeCanvas = document.getElementById('resume');
  /* eslint-disable  no-undef */
  const stickToResumeSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scrollToElement('#resume');
      }
    });
  }, { threshold: 0.5 });
  stickToResumeSectionObserver.observe(resumeCanvas);
};

const loadAssets = () => {
  import('./3DModelDrawer.js');
};

const loadBackgroundIframe = () => {
  const iframeElement = document.createElement('iframe');
  iframeElement.id = 'background';
  iframeElement.setAttribute('src', 'bg.html');
  document.body.appendChild(iframeElement);
  const fastForwardRenderingOnScroll = () => {
    iframeElement.contentWindow.handleScroll();
  };
  const experienceSection = document.getElementById('experience');
  const aboutSection = document.getElementById('about');
  const intersectionObserver = new IntersectionObserver(function (entries) {
    let intersecting = false;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        intersecting = true;
      }
    });
    const { startRendering } = iframeElement.contentWindow;
    const { stopRendering } = iframeElement.contentWindow;
    if (intersecting && startRendering) {
      startRendering();
      document.addEventListener('scroll', fastForwardRenderingOnScroll);
    } else if (stopRendering) {
      stopRendering();
      document.removeEventListener('scroll', fastForwardRenderingOnScroll);
    }
  }, { threshold: 0.05 });
  intersectionObserver.observe(experienceSection);
  intersectionObserver.observe(aboutSection);
};

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

// window.addEventListener('poststate', function() {
//   window.scrollTo(0, 0);
// });

window.onload = function() {
  window.scrollTo(0, 0);
  loadBackgroundIframe();
  loadAssets();
};

toggleVisibilityOnScroll();
renderWithAnimation();
changeActiveSectionOnScroll();
goToSections();
hidePageLoader();
stickToResumeCanvas();
flipProfilePhoto();
