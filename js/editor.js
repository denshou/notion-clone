import { editContent, getContent } from "../api/api.js";
import { pages } from "./app.js";

function debounce(func, delay) {
  let timer;
  return function () {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const titleEl = document.querySelector(".editor__main-content h1");
const contentAreaEl = document.querySelector(
  ".editor__main-content-contentarea"
);
//title 변경시 api
titleEl.addEventListener(
  "input",
  debounce(async function (e) {
    const url = window.location.pathname;
    if (url === "/") return;
    const id = url.slice(1);
    const content = pages[id].content;

    //사이드바에 있는 title 실시간 업데이트
    const titleOnList = document.querySelector(`[data-id='${id}']`);
    const title = titleOnList.querySelector("div span");
    title.textContent = e.target.textContent;
    console.log(titleOnList);

    await editContent(Number(id), e.target.textContent, content);
    createPageRoute(id);
  }, 500)
);
//id에 해당하는 pages 객체 수정
const createPageRoute = async (id) => {
  const data = await getContent(id);
  pages[id] = {
    title: `${data.title}`,
    content: data.content === null ? "" : `${data.content}`,
  };
};

//동적으로 추가된 p 요소에 event 추가 (이벤트 위임)
contentAreaEl.addEventListener(
  "input",
  debounce(async function (e) {
    const url = window.location.pathname;
    if (url === "/") return;
    const id = url.slice(1);
    const title = pages[id].title;

    //content 하나의 string 으로 합치기
    const pEls = contentAreaEl.querySelectorAll("p");
    let content = "";
    pEls.forEach((p, index) => {
      content += p.textContent;
      if (index < pEls.length - 1) content += "\n\n";
    });

    await editContent(id, title, content);
    createPageRoute(id);
  }, 500)
);
