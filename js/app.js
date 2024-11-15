import {
  getAllData,
  getContent,
  createDoc,
  editContent,
  deleteDoc,
} from "../api/api.js";

const pages = {};

const getData = async () => {
  const data = await getAllData();
  console.log(data);
};
getData();

const setContent = async () => {
  const data = await getContent(145559);
  const titleEl = document
    .querySelector(".editor__main-content")
    .querySelector("h1");

  const contentEl = document
    .querySelector(".editor__main-content-contentarea")
    .querySelector("p");

  titleEl.textContent = data.title;
  contentEl.textContent = data.content;
};
setContent();

