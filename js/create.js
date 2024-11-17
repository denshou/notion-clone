import { createDoc, getContent } from "../api/api.js";
import { makeList, navigateTo, pages, renderPage } from "./app.js";

//id에 해당하는 pages 객체 수정
const createPageRoute = async (id) => {
  const data = await getContent(id);
  pages[id] = {
    id,
    title: `${data.title}`,
    content: data.content === null ? "" : `${data.content}`,
  };
};

//상단의 create버튼 누르면 새로운 페이지 렌더링
//사이드바에도 생성
const creatBtnEl = document.querySelector(".create");
creatBtnEl.addEventListener("click", async (e) => {
  e.stopPropagation();
  const created = await createDoc();
  const id = created.id;
  await createPageRoute(id);
  const data = [pages[id]];
  navigateTo(id);
  makeList(data);
  renderPage(pages[id]);
});

//header에 있는 plus 버튼 누르면 새 페이지 생성
const headerCreateBtnEl = document.querySelector(".sidebar__private-buttons");
const buttonEls = headerCreateBtnEl.querySelectorAll("div");
buttonEls[1].addEventListener("click", async (e) => {
  e.stopPropagation();
  const created = await createDoc();
  const id = created.id;
  await createPageRoute(id);
  const data = [pages[id]];
  navigateTo(id);
  makeList(data);
  renderPage(pages[id]);
});
