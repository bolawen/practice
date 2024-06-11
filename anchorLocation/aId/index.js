function computedScrollTabItemOffsetLeft(elementContainer, element) {
  return (
    element.offsetLeft -
    elementContainer.offsetWidth / 2 +
    element.offsetWidth / 2
  );
}

function horizontalScrollTabItem(elementContainer, elementScrollContainer, element) {
  const scrollLeft = computedScrollTabItemOffsetLeft(elementContainer, element);
  elementScrollContainer.scroll({ left: scrollLeft, behavior: 'smooth' });
}

function setTabItemActive(elementList, currentElement) {
  elementList.forEach(element => {
    element.classList.remove('active');
  });
  currentElement.classList.add('active');
}

const content = document.querySelector('.content');
const placeholder = document.querySelector('.placeholder');
placeholder.style.height = content.offsetHeight + 'px';

const tabItemList = document.querySelectorAll('.tab-item');
const tabContainer = document.querySelector('.tab');
const tabScrollContainer = document.querySelector('.tab-scroll-container');

tabScrollContainer.addEventListener('click', e => {
  const target = e.target;
  if (target.nodeName === 'A') {
    setTabItemActive(tabItemList, target);
    horizontalScrollTabItem(tabContainer, tabScrollContainer, target);
  }
});
