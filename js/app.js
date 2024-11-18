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
    id,
    title: `${data.title}`,
    content: data.content === null ? "" : `${data.content}`,
    documents: data.documents,
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

  // 리스트 다시 생성 후 상태 복원
  Object.keys(openStates).forEach((id) => {
    const ul = document.querySelector(`li[data-id="${id}"] + ul`);
    if (ul) ul.style.display = openStates[id] ? "block" : "none";
  });

  data.forEach((page) => {
    createPageRoute(`${page.id}`);
  });
};
initializePages();

//list를 새로 불러와도 펼쳐진 상태 유지
let openStates = {};
const saveOpenStates = () => {
  const allLists = document.querySelectorAll(".sidebar__private ul");
  allLists.forEach((ul) => {
    const parentLi = ul.previousElementSibling?.closest("li");
    if (parentLi) {
      const id = parentLi.dataset.id;
      openStates[id] = ul.style.display === "block";
    }
  });
};
//sidebar에서 하위 documents까지 리스트 생성
export const makeList = (data, depth = 0, ulEl = null) => {
  if (ulEl === null) ulEl = document.querySelector(".sidebar__private ul");
  // while (ulEl.hasChildNodes()) ulEl.replaceChildren();
  data.forEach((doc) => {
    const liEl = document.createElement("li");
    liEl.setAttribute("data-id", doc.id);
    const lileftEl = document.createElement("div");
    lileftEl.classList.add("sidebar__private-left");
    lileftEl.style.marginLeft = `${depth * 10}px`;
    //문서 이미지
    const imgDiv = document.createElement("div");
    const docImgEl = document.createElement("img");
    docImgEl.setAttribute("src", "/img/document.svg");
    const docImgHiddenEl = document.createElement("img");
    docImgHiddenEl.setAttribute("src", "/img/arrow-right.svg");
    docImgHiddenEl.style.display = "none";
    const docTitleEl = document.createElement("span");
    if (doc.title === "") docTitleEl.textContent = "새 페이지";
    else docTitleEl.textContent = doc.title;
    imgDiv.appendChild(docImgEl);
    imgDiv.appendChild(docImgHiddenEl);
    lileftEl.appendChild(imgDiv);
    lileftEl.appendChild(docTitleEl);
    const lirightEl = document.createElement("div");
    lirightEl.classList.add("sidebar__private-buttons");

    //삭제버튼
    const buttonEl1 = document.createElement("div");
    const buttonImgEl1 = document.createElement("img");
    buttonImgEl1.setAttribute("src", "/img/ellip-hor.svg");
    buttonImgEl1.addEventListener("click", async (e) => {
      e.stopPropagation();
      const targetLi = e.target.closest("li");
      const id = targetLi.dataset.id;
      await deleteDoc(Number(id));
      saveOpenStates();
      initializePages();
    });
    buttonEl1.appendChild(buttonImgEl1);

    //하위 페이지 추가 버튼
    const buttonEl2 = document.createElement("div");
    const buttonImgEl2 = document.createElement("img");
    buttonImgEl2.setAttribute("src", "/img/plus.svg");
    buttonImgEl2.addEventListener("click", async (e) => {
      e.stopPropagation();
      await createDoc(doc.id);
      openStates[doc.id] = true;
      initializePages();
    });
    buttonEl2.appendChild(buttonImgEl2);

    lirightEl.appendChild(buttonEl1);
    lirightEl.appendChild(buttonEl2);
    liEl.appendChild(lileftEl);
    liEl.appendChild(lirightEl);
    ulEl.appendChild(liEl);

    //리스트 클릭 시 이동
    liEl.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      navigateTo(id);
      renderPage(pages[id]);

      const navEl = document.querySelector(".editor__nav_naviagtor");
      if (navEl.hasChildNodes()) navEl.replaceChildren();
      const currentPath = await findNav(id);
      renderNav(currentPath);
    });
    //리스트 hover 이벤트
    liEl.addEventListener("mouseover", (e) => {
      lirightEl.style.display = "flex";
      docImgEl.style.display = "none";
      docImgHiddenEl.style.display = "block";

      lileftEl.style.width = "80%";
    });
    liEl.addEventListener("mouseout", (e) => {
      lirightEl.style.display = "none";
      docImgEl.style.display = "block";
      docImgHiddenEl.style.display = "none";

      lileftEl.style.width = "100%";
    });

    //만약 하위 documents가 있다면 재귀
    if (doc.documents) {
      const subUl = document.createElement("ul");
      subUl.style.display = openStates[doc.id] ? "block" : "none"; // 초기 상태 복원
      ulEl.appendChild(subUl);

      //doc 이미지 클릭 시 하위 documents 보여줌
      docImgHiddenEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = subUl.style.display === "block";
        subUl.style.display = isOpen ? "none" : "block";

        openStates[doc.id] = !isOpen;
        //openStates 에 따라 화살표 방향 변경
        if (openStates[doc.id]) docImgHiddenEl.classList.add("rotated");
        else docImgHiddenEl.classList.remove("rotated");
      });

      if (doc.documents.length > 0) {
        makeList(doc.documents, depth + 1, subUl);
        subUl.style.display = openStates[doc.id] ? "block" : "none";
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
export const renderPage = (data) => {
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

    contentAreaEl.appendChild(pEl);
  });

  //현재 페이지에 하위 document editor에 출력
  const documents = data.documents;
  if (documents && documents.length > 0) {
    for (let item of documents) {
      const newWrapper = document.createElement("div");
      newWrapper.classList.add("linkWrapper");
      newWrapper.setAttribute("data-id", item.id);
      const newImgDiv = document.createElement("div");
      newImgDiv.style.marginRight = "8px";
      const newImg = document.createElement("img");
      newImg.setAttribute("src", "/img/document.svg");
      newImgDiv.appendChild(newImg);
      newWrapper.appendChild(newImgDiv);
      const newSpan = document.createElement("span");
      newSpan.textContent = item.title === "" ? "새 페이지" : item.title;
      newWrapper.appendChild(newSpan);
      contentAreaEl.appendChild(newWrapper);

      newWrapper.addEventListener("click", (e) => {
        navigateTo(item.id);
        renderPage(pages[item.id]);
      });
    }
  }

  nav.textContent = data.title === "" ? "새 페이지" : data.title;
};

const findNav = async (id) => {
  const data = await getAllData();
  const circuitData = (data) => {
    for (const doc of data) {
      const currentPath = [doc.id];
      if (doc.id === Number(id)) return currentPath;

      if (doc.documents && doc.documents.length > 0) {
        const res = circuitData(doc.documents);
        if (res) return currentPath.concat(res);
      }
    }
    return null;
  };
  return circuitData(data) || [];
};
const renderNav = (currentPath) => {
  const navEl = document.querySelector(".editor__nav_naviagtor");

  currentPath.forEach((id, index) => {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("data-id", id);
    newDiv.textContent = pages[id].title === "" ? "새 페이지" : pages[id].title;
    navEl.appendChild(newDiv);
    if (index !== currentPath.length - 1) {
      const newSpan = document.createElement("span");
      newSpan.textContent = "/";
      navEl.appendChild(newSpan);
    }
  });
};

export const navigateTo = (id) => {
  history.pushState({ id: id }, "", `/${id}`);
};

window.addEventListener("popstate", (e) => {
  const id = e.state?.id || "/";
  renderPage(pages[id]);
});

//개인 페이지 hide show
const pageHeaderEl = document.querySelector(".sidebar__private-header");
const buttons = pageHeaderEl.querySelector(".sidebar__private-buttons");
pageHeaderEl.addEventListener("click", () => {
  const ulEl = document.querySelector(".sidebar__private ul");
  ulEl.style.display = ulEl.style.display === "none" ? "block" : "none";
});
//header hover 이벤트
pageHeaderEl.addEventListener("mouseover", () => {
  buttons.style.display = "flex";
});
pageHeaderEl.addEventListener("mouseout", () => {
  buttons.style.display = "none";
});
