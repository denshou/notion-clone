import {
  getAllData,
  getContent,
  createDoc,
  editContent,
  deleteDoc,
} from "../api/api.js";

export const pages = {
  "/": { title: "새 페이지", content: "" },
};

//데이터를 받아와서 pages에 id:{data} 형식으로 넣기
const createPageRoute = async (id) => {
  const data = await getContent(id);
  pages[id] = {
    title: `${data.title}`,
    content: data.content === null ? "" : `${data.content}`,
  };

  if (data.documents && data.documents.length > 0) {
    data.documents.forEach((doc) => {
      createPageRoute(`${doc.id}`);
    });
  }
};
const initializePages = async () => {
  const data = await getAllData();

  const ulEl = document.querySelector(".sidebar__private").querySelector("ul");
  while (ulEl.hasChildNodes()) ulEl.replaceChildren();
  makeList(data);
  data.forEach((page) => {
    createPageRoute(`${page.id}`);
  });
};
initializePages();

//sidebar에서 하위 documents까지 리스트 생성
const makeList = (data, depth = 0, ulEl = null) => {
  if (ulEl === null) ulEl = document.querySelector(".sidebar__private ul");
  // while (ulEl.hasChildNodes()) ulEl.replaceChildren();
  data.forEach((doc) => {
    const liEl = document.createElement("li");
    liEl.setAttribute("data-id", doc.id);
    const lileftEl = document.createElement("div");
    lileftEl.classList.add("sidebar__private-left");
    lileftEl.style.marginLeft = `${depth * 10}px`;
    const docImgEl = document.createElement("img");
    docImgEl.setAttribute("src", "/img/document.svg");
    const docTitleEl = document.createElement("span");
    docTitleEl.textContent = doc.title;
    lileftEl.appendChild(docImgEl);
    lileftEl.appendChild(docTitleEl);
    const lirightEl = document.createElement("div");
    lirightEl.classList.add("sidebar__private-buttons");
    const buttonEl1 = document.createElement("div");
    const buttonImgEl1 = document.createElement("img");
    buttonImgEl1.setAttribute("src", "/img/ellip-hor.svg");
    buttonEl1.appendChild(buttonImgEl1);
    const buttonEl2 = document.createElement("div");
    const buttonImgEl2 = document.createElement("img");
    buttonImgEl2.setAttribute("src", "/img/plus.svg");
    buttonEl2.appendChild(buttonImgEl2);
    lirightEl.appendChild(buttonEl1);
    lirightEl.appendChild(buttonEl2);
    liEl.appendChild(lileftEl);
    liEl.appendChild(lirightEl);
    ulEl.appendChild(liEl);

    //리스트 클릭 시 이동
    liEl.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      navigateTo(id);
      renderPage(pages[id]);
    });

    //만약 하위 documents가 있다면 재귀
    if (doc.documents) {
      const subUl = document.createElement("ul");
      subUl.style.display = "none";
      ulEl.appendChild(subUl);

      //doc 이미지 클릭 시 하위 documents 보여줌
      docImgEl.addEventListener("click", (e) => {
        e.stopPropagation();
        subUl.style.display = subUl.style.display === "none" ? "block" : "none";
      });

      if (doc.documents.length > 0) {
        makeList(doc.documents, depth + 1, subUl);
      } else {
        const newDiv = document.createElement("div");
        newDiv.classList.add("empty");
        newDiv.textContent = "하위 페이지 없음";
        newDiv.style.marginLeft = `${(depth + 2) * 10}px`;
        subUl.appendChild(newDiv);
      }
    }
  });
};

//컨텐츠 \n \n\n 구분해서 나누기
const divideContent = (content) => {
  const paragraph = content.split("\n\n");
  return paragraph;
};

const nav = document.querySelector(".editor__nav").querySelector("div");
//화면에 title, content 표시하기
const renderPage = (data) => {
  //data={ title: `${data.title}`, content: `${data.content}` }
  const titleEl = document
    .querySelector(".editor__main-content")
    .querySelector("h1");
  titleEl.textContent = data.title;

  const divided = divideContent(data.content);
  const contentAreaEl = document.querySelector(
    ".editor__main-content-contentarea"
  );
  while (contentAreaEl.hasChildNodes()) contentAreaEl.replaceChildren();
  divided.forEach((sentence) => {
    const pEl = document.createElement("p");
    pEl.textContent = sentence;
    pEl.classList.add("editor__main-content-text");
    pEl.setAttribute("contenteditable", "true");
    pEl.setAttribute(
      "placeholder",
      "글을 작성하거나 AI를 사용하려면 '스페이스' 키를, 명령어를 사용하려면 ' / ' 키를 누르세요."
    );
    contentAreaEl.appendChild(pEl);
  });

  nav.textContent = data.title;
};
const navigateTo = (id) => {
  history.pushState({ id: id }, "", `/${id}`);
};

window.addEventListener("popstate", (e) => {
  const id = e.state?.id || "/";
  renderPage(pages[id]);
});

//개인 페이지 hide show
const pageHeaderEl = document.querySelector(".sidebar__private-header");
pageHeaderEl.addEventListener("click", () => {
  const ulEl = document.querySelector(".sidebar__private ul");
  ulEl.style.display = ulEl.style.display === "none" ? "block" : "none";
});
