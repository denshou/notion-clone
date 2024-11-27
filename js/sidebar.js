const sidebar = document.querySelector(".sidebar");
const header = document.querySelector(".sidebar__header");
const hideBtn = document.querySelector(".hide");
const editor = document.querySelector(".editor");
const showHideBtn = () => {
  hideBtn.style.opacity = 1;
};
const hideHideBtn = () => {
  hideBtn.style.opacity = 0;
};
hideBtn.addEventListener("mouseover", () => {
  hideBtn.style.opacity = 1;
});
header.addEventListener("mouseover", showHideBtn);
header.addEventListener("mouseout", hideHideBtn);
let isHidden = false;
hideBtn.addEventListener("click", () => {
  isHidden = !isHidden;
  if (isHidden) {
    header.removeEventListener("mouseover", showHideBtn);
    header.removeEventListener("mouseout", hideHideBtn);

    // sidebar.style.transform = "translateX(-100%)";
    sidebar.style.left = "-251px";
    sidebar.style.minWidth = "0px";
    sidebar.style.width = "0px";

    editor.style.maxWidth = "100%";

    hideBtn.style.display = "none";
    setTimeout(() => {
      hideBtn.style.display = "flex";
    }, 100);

    hideBtn.style.position = "static";
    hideBtn.style.opacity = 1;

    hideBtn.querySelector("img").style.transform = "rotate(180deg)";
  } else {
    header.addEventListener("mouseover", showHideBtn);
    header.addEventListener("mouseout", hideHideBtn);

    sidebar.style.left = "0px";
    sidebar.style.minWidth = "251px";

    editor.style.maxWidth = "calc(100% - 251px)";

    hideBtn.style.position = "absolute";
    hideBtn.style.opacity = 0;

    hideBtn.querySelector("img").style.transform = "rotate(0)";
  }
});
