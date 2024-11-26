const sidebar = document.querySelector(".sidebar");
const header = document.querySelector(".sidebar__header");
const hideBtn = document.querySelector(".hide");
const showHideBtn = () => {
  hideBtn.style.opacity = 1;
};
const hideHideBtn = () => {
  hideBtn.style.opacity = 0;
};
header.addEventListener("mouseover", showHideBtn);
header.addEventListener("mouseout", hideHideBtn);
let isHidden = false;
hideBtn.addEventListener("click", () => {
  isHidden = !isHidden;
  if (isHidden) {
    header.removeEventListener("mouseover", showHideBtn);
    header.removeEventListener("mouseout", hideHideBtn);

    sidebar.style.transform = "translateX(-100%)";

    hideBtn.style.opacity = 1;
    hideBtn.style.position = "absolute";
    hideBtn.style.right = "-40px";

    hideBtn.querySelector("img").style.transform = "rotate(180deg)";
  } else {
    header.addEventListener("mouseover", showHideBtn);
    header.addEventListener("mouseout", hideHideBtn);
    sidebar.style.transform = "translateX(0)";

    hideBtn.style.opacity = 0;
    hideBtn.style.position = "static";
    hideBtn.style.right = "0";

    hideBtn.querySelector("img").style.transform = "rotate(0)";
  }
});
