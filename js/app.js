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

  data.forEach((page) => {
    createPageRoute(`${page.id}`);
  });
};
initializePages();

//"하위 페이지 없음" 생성 함수
const createEmpty = (ulEl, depth = null) => {
  const newDiv = document.createElement("div");
  newDiv.classList.add("empty");
  newDiv.textContent = "하위 페이지 없음";
  if (depth) newDiv.style.marginLeft = `${(depth + 2) * 10}px`;
  else {
    const getPrev = ulEl.previousElementSibling;
    const getPrevMargin = getPrev.querySelector("div").style.marginLeft;
    const numeric = parseInt(getPrevMargin);
    newDiv.style.marginLeft = `${numeric + 20}px`;
  }
  ulEl.appendChild(newDiv);
};

const createListItem = (doc, depth, ulEl) => {
  const liEl = document.createElement("li");
  liEl.setAttribute("data-id", doc.id);
  ulEl.appendChild(liEl);
  const lileftEl = document.createElement("div");
  lileftEl.classList.add("sidebar__private-left");
  if (depth === null) {
    const getPrev = ulEl.previousElementSibling;
    const getPrevMargin = getPrev.querySelector("div").style.marginLeft;
    const numeric = parseInt(getPrevMargin);
    lileftEl.style.marginLeft = `${numeric + 10}px`;
  } else lileftEl.style.marginLeft = `${depth * 10}px`;
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
  //하위 문서가 들어갈 숨겨진 ul 생성
  const subUl = document.createElement("ul");
  subUl.style.display = "none";
  ulEl.appendChild(subUl);

  //삭제버튼
  const buttonEl1 = document.createElement("div");
  const buttonImgEl1 = document.createElement("img");
  buttonImgEl1.setAttribute("src", "/img/ellip-hor.svg");
  buttonImgEl1.addEventListener("click", async (e) => {
    e.stopPropagation();
    const targetLi = e.target.closest("li");
    const id = targetLi.dataset.id;
    await deleteDoc(Number(id));
    //부모 doc
    const parent = targetLi.parentNode.previousElementSibling;
    const parentId = parent.dataset.id;
    if (parentId) {
      //pages 업데이트
      createPageRoute(parentId);
      //부모 doc으로 이동
      navigateTo(parentId);
      renderPage(pages[parentId]);
      //nav업데이트
      const navEl = document.querySelector(".editor__nav_naviagtor");
      if (navEl.hasChildNodes()) navEl.replaceChildren();
      const currentPath = await findNav(parentId);
      renderNav(currentPath);
    } else {
      //삭제한 것이 최상위라면 첫 번째 페이지로 이동
      const firstLi = targetLi.parentNode.firstChild;
      const firstId = firstLi.dataset.id;
      navigateTo(firstId);
      renderPage(pages[firstId]);
      const navEl = document.querySelector(".editor__nav_naviagtor");
      if (navEl.hasChildNodes()) navEl.replaceChildren();
      const currentPath = await findNav(firstId);
      renderNav(currentPath);
    }

    //하위 삭제 버튼 클릭 시 사이드바 바로 반영
    ulEl.removeChild(targetLi.nextElementSibling);
    ulEl.removeChild(targetLi);
    //삭제 시 하위doc이 없다면 "하위 페이지 없음" 추가
    if (!ulEl.firstChild) {
      createEmpty(ulEl);
    }

    //하위 삭제 버튼 클릭 시 editor 바로 반영
    const editor = document.querySelector(".editor__main-content-contentarea");
    const targetOnEditor = editor.querySelector(`div[data-id="${id}"]`);
    if (targetOnEditor) editor.removeChild(targetOnEditor);
  });
  buttonEl1.appendChild(buttonImgEl1);

  //하위 페이지 추가 버튼
  const buttonEl2 = document.createElement("div");
  const buttonImgEl2 = document.createElement("img");
  buttonImgEl2.setAttribute("src", "/img/plus.svg");
  buttonImgEl2.addEventListener("click", async (e) => {
    e.stopPropagation();
    //doc=created의 상위
    const created = await createDoc(doc.id);
    //하위 doc들이 있는 ul 선택
    const current = e.target.closest("li");
    let nextUl = current.nextElementSibling;
    //화살표 변경
    docImgHiddenEl.classList.add("rotated");

    nextUl.style.display = "block";
    //생성 클릭 시 하위 doc을 리스트에 생성
    if (
      nextUl.firstChild &&
      nextUl.firstChild.getAttribute("class") === "empty"
    )
      nextUl.replaceChildren();

    createListItem(created, null, nextUl);

    navigateTo(created.id);
    //하위 생성 버튼 클릭 시 editor에 바로 반영
    await createPageRoute(created.id);
    await createPageRoute(doc.id);
    //생성한 페이지로 이동
    renderPage(pages[created.id]);
  });
  buttonEl2.appendChild(buttonImgEl2);

  lirightEl.appendChild(buttonEl1);
  lirightEl.appendChild(buttonEl2);
  liEl.appendChild(lileftEl);
  liEl.appendChild(lirightEl);

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
  //doc 이미지 클릭 시 하위 documents 보여줌
  docImgHiddenEl.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = subUl.style.display === "block";
    subUl.style.display = isOpen ? "none" : "block";

    docImgHiddenEl.classList.toggle("rotated");

    //하위 doc 보여주는 버튼 클릭했을 때 아무것도 없으면
    const hiddenUl = e.target.closest("li").nextElementSibling;
    if (!hiddenUl.firstChild) {
      createEmpty(hiddenUl);
    }
  });

  //만약 하위 documents가 있다면 재귀
  if (doc.documents) {
    if (doc.documents.length > 0) {
      makeList(doc.documents, depth + 1, subUl);
      subUl.style.display = "none";
    } else {
      createEmpty(subUl, depth);
    }
  }
};

//sidebar에서 하위 documents까지 리스트 생성
export const makeList = (data, depth = 0, ulEl = null) => {
  if (ulEl === null) ulEl = document.querySelector(".sidebar__private ul");
  // while (ulEl.hasChildNodes()) ulEl.replaceChildren();
  data.forEach((doc) => {
    createListItem(doc, depth, ulEl);
  });
};

//컨텐츠 \n \n\n 구분해서 나누기
const divideContent = (content) => {
  const paragraph = content.split("\n\n");
  return paragraph;
};

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
    createChildDocs(documents);
  }
};
//하위 docs를 매개변수로 받아서 출력
const createChildDocs = (documents) => {
  const contentAreaEl = document.querySelector(
    ".editor__main-content-contentarea"
  );
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

    newWrapper.addEventListener("click", async (e) => {
      navigateTo(item.id);
      renderPage(pages[item.id]);

      const navEl = document.querySelector(".editor__nav_naviagtor");
      if (navEl.hasChildNodes()) navEl.replaceChildren();
      const currentPath = await findNav(item.id);
      renderNav(currentPath);
    });
  }
};

//현재 doc의 id와 상위의 doc id  찾기
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
//찾은 id 경로를 nav에 표시하기
const renderNav = (currentPath) => {
  const navEl = document.querySelector(".editor__nav_naviagtor");

  currentPath.forEach((id, index) => {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("data-id", id);
    newDiv.textContent = pages[id].title === "" ? "새 페이지" : pages[id].title;
    newDiv.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      navigateTo(id);
      renderPage(pages[id]);

      if (navEl.hasChildNodes()) navEl.replaceChildren();
      const currentPath = await findNav(id);
      renderNav(currentPath);
    });
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

window.addEventListener("popstate", async (e) => {
  const id = e.state?.id || "/";
  renderPage(pages[id]);
  //nav업데이트
  const navEl = document.querySelector(".editor__nav_naviagtor");
  if (navEl.hasChildNodes()) navEl.replaceChildren();
  const currentPath = await findNav(id);
  renderNav(currentPath);
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

const editorMainEl = document.querySelector(".editor__main");
const editorContentArea = document.querySelector(
  ".editor__main-content-contentarea"
);

//editor 내부 클릭했을 때
editorMainEl.addEventListener("click", (e) => {
  const { clientX, clientY } = e; // 클릭 좌표
  const pEls = editorContentArea.querySelectorAll("p"); // 모든 <p> 요소 수집

  let nearestP = null;
  let minDistance = Infinity;

  pEls.forEach((p) => {
    const rect = p.getBoundingClientRect(); // 요소의 위치 및 크기 정보
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 유클리드 거리 계산
    const distance = Math.sqrt(
      (centerX - clientX) ** 2 + (centerY - clientY) ** 2
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestP = p;
    }
  });

  if (nearestP) {
    if (e.target.tagName !== "P" && e.target.tagName !== "H1") {
      nearestP.focus();
      if (clientX > nearestP.getBoundingClientRect().right) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(nearestP); // title 내용 전체 선택
        range.collapse(false); // 커서를 끝으로 이동
        selection.removeAllRanges(); // 기존 선택 범위 제거
        selection.addRange(range); // 새로운 범위 설정
      }
      if (
        clientY >
        editorContentArea.lastElementChild.getBoundingClientRect().bottom
      ) {
        if (nearestP.textContent === "") nearestP.focus();
        else {
          const pEl = document.createElement("p");
          pEl.classList.add("editor__main-content-text");
          pEl.setAttribute("contenteditable", "true");

          editorContentArea.append(pEl);
          pEl.focus();
        }
      }
    }
  } else {
    console.log("<p> 요소를 찾을 수 없습니다.");
  }
});
