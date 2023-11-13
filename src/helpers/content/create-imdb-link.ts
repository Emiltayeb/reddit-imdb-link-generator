export const createImdbHref = function (movieTitle:string) {
const encodedSearchQuery = encodeURIComponent(movieTitle);
const imdbSearchUrl = `https://www.imdb.com/find/?q=${encodedSearchQuery}&ref_=nv_sr_sm`;
return imdbSearchUrl

}
export const createImdbLink = function (movieTitle:string) {
const linkEl = document.createElement("a");
linkEl.href = createImdbHref(movieTitle);
linkEl.target = "_blank";
linkEl.rel = "noopener noreferrer";
linkEl.textContent = movieTitle;
linkEl.setAttribute("style", "color: rgb(245, 197, 24); text-decoration: underline; font-weight: bold;")
return linkEl.outerHTML;
}
