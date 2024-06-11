let scrollTimer = null;
let isAllowListener = true;
const tab = document.querySelector(".tab");
const tabScroll = document.querySelector(".tab-scroll-container");
const tabItemList = document.querySelectorAll(".tab-item");
const content = document.querySelector(".content");
const contentScroll = document.querySelector(".content-scroll-container");
const rangeList = getContentItemRange(content, contentScroll.children);

function getContentOffsetTop(element) {
  return element.offsetTop;
}

function getContentItemOffsetTop(element) {
  return element.offsetTop;
}

function getContentItemRange(element, elementChildren) {
  const rangeList = Array.from(elementChildren).reduce(
    (range, elementItem, index) => {
      let startOffsetTop = 0;
      if (index === 0) {
        range.push(startOffsetTop);
        return range;
      }
      startOffsetTop = getContentItemOffsetTop(elementItem);
      range.push(startOffsetTop);
      return range;
    },
    []
  );
  return rangeList.map((range, index) => {
    if (index === rangeList.length - 1) {
      return [range];
    }
    return [range, rangeList[index + 1]];
  });
}

function findTabItemIndex(target) {
  return Array.from(tabItemList).findIndex(
    (tabItem) => tabItem.id === target.id
  );
}

function findContentItemIndex(scrollTop, rangeList) {
  let index = 0;
  let isFirstFind = false;
  rangeList.forEach((rangeItem, rangeIndex) => {
    if (!isFirstFind) {
      if (rangeIndex === rangeList.length - 1 && scrollTop >= rangeItem[0]) {
        index = rangeIndex;
        isFirstFind = true;
      } else if (scrollTop >= rangeItem[0] && scrollTop < rangeItem[1]) {
        index = rangeIndex;
        isFirstFind = true;
      }
    }
  });
  return index;
}

function computedScrollTabItemOffsetLeft(elementContainer, element) {
  return (
    element.offsetLeft -
    elementContainer.offsetWidth / 2 +
    element.offsetWidth / 2
  );
}

function horizontalScrollTabItem(
  elementContainer,
  elementScrollContainer,
  element
) {
  const scrollLeft = computedScrollTabItemOffsetLeft(elementContainer, element);
  elementScrollContainer.scroll({ left: scrollLeft, behavior: "smooth" });
}

const setTabItemActive = (
  elementContainer,
  elementScrollContainer,
  elementList,
  currentElement
) => {
  elementList.forEach((element) => {
    element.classList.remove("active");
  });
  currentElement.classList.add("active");
  horizontalScrollTabItem(
    elementContainer,
    elementScrollContainer,
    currentElement
  );
};

function scrollContentItem(elementContainer, elementScrollContainer, index) {
  const range = rangeList[index];
  elementScrollContainer.scroll({
    top: range[0] - elementContainer.offsetTop,
    behavior: "smooth",
  });
}

function init() {
  setTabItemActive(tab, tabScroll, tabItemList, tabItemList[0]);
}

const handleTabItemClick = (e) => {
  const target = e.target;
  if (target.className.indexOf("tab-scroll-container") === -1) {
    isAllowListener = false;
    const index = findTabItemIndex(target);
    setTabItemActive(tab, tabScroll, tabItemList, target);
    scrollContentItem(content, contentScroll, index);
  }
};

const handleContentScroll = (e) => {
  const { target } = e;
  if (target.id === "content-scroll-container") {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!isAllowListener) {
        isAllowListener = true;
      }
    }, 100);

    if (isAllowListener) {
      const contentOffsetTop = getContentOffsetTop(content);
      const top = contentOffsetTop + target.scrollTop;
      const index = findContentItemIndex(top, rangeList);
      setTabItemActive(tab, tabScroll, tabItemList, tabItemList[index]);
    }
  }
};

init();
tabScroll.addEventListener("click", handleTabItemClick);
window.addEventListener("scroll", handleContentScroll, true);
