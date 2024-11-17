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

//id에 해당하는 pages 객체 수정
const createPageRoute = async (id) => {
  const data = await getContent(id);
  pages[id] = {
    title: `${data.title}`,
    content: data.content === null ? "" : `${data.content}`,
  };
};

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
    if (e.target.textContent === "") title.textContent = "새 페이지";
    else title.textContent = e.target.textContent;

    await editContent(Number(id), e.target.textContent, content);
    createPageRoute(id);
  }, 500)
);

//title에서 enter 눌렀을 때 이벤트 처리
titleEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (e.shiftKey) {
      return;
    }
    // 첫 번째 줄에 p 생성 후 focus 옮기기
    const pEl = document.createElement("p");
    pEl.classList.add("editor__main-content-text");
    pEl.setAttribute("contenteditable", "true");

    contentAreaEl.prepend(pEl);
    pEl.focus();
  }
});

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
contentAreaEl.addEventListener("keydown", (e) => {
  const currentPEl = e.target;
  //엔터
  if (e.key === "Enter") {
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    const newPEl = document.createElement("p");
    newPEl.classList.add("editor__main-content-text");
    newPEl.setAttribute("contenteditable", "true");

    contentAreaEl.appendChild(newPEl);
    newPEl.focus();
  }
  //백스페이스
  else if (e.key === "Backspace") {
    if (currentPEl.innerHTML === "<br><br>") {
      e.preventDefault();
      currentPEl.innerHTML = "";
      return;
    }
    if (currentPEl.innerHTML === "") {
      e.preventDefault();
      if (contentAreaEl.firstChild === currentPEl) {
        titleEl.focus();
        // 커서를 끝으로 이동
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(titleEl); // title 내용 전체 선택
        range.collapse(false); // 커서를 끝으로 이동
        selection.removeAllRanges(); // 기존 선택 범위 제거
        selection.addRange(range); // 새로운 범위 설정
      } else {
        currentPEl.previousSibling.focus();
        // 커서를 끝으로 이동
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(currentPEl.previousSibling); // title 내용 전체 선택
        range.collapse(false); // 커서를 끝으로 이동
        selection.removeAllRanges(); // 기존 선택 범위 제거
        selection.addRange(range); // 새로운 범위 설정
      }
      contentAreaEl.removeChild(currentPEl);
    }
  }
});

// 포커스가 된 p 요소에만 placeholder를 표시
contentAreaEl.addEventListener("focusin", (e) => {
  const currentPEl = e.target;
  if (
    currentPEl &&
    currentPEl.tagName === "P" &&
    currentPEl.hasAttribute("contenteditable")
  ) {
    if (currentPEl.textContent === "") {
      currentPEl.setAttribute(
        "placeholder",
        "글을 작성하거나 AI를 사용하려면 '스페이스' 키를, 명령어를 사용하려면 ' / ' 키를 누르세요."
      );
    }
  }
});

// 포커스가 떨어지면 placeholder를 숨김
contentAreaEl.addEventListener("focusout", (e) => {
  const currentPEl = e.target;
  if (
    currentPEl &&
    currentPEl.tagName === "P" &&
    currentPEl.hasAttribute("contenteditable")
  ) {
    if (currentPEl.textContent === "") {
      currentPEl.removeAttribute("placeholder");
    }
  }
});
