import { Nullable, SupportedSitesUrls } from "../types";
import { DATA_ID_ATTR, DATA_PROCESSED_ATTR, MINE_TITLE_LENGTH, SupportedSites, config } from "./constants";
import { createImdbHref, getUniqueId } from "./utils";



export const createImdbLink = function (movieTitle:string) {
  const linkEl = document.createElement("a");
  linkEl.href = createImdbHref(movieTitle);
  linkEl.target = "_blank";
  linkEl.rel = "noopener noreferrer";
  linkEl.textContent = movieTitle;
  linkEl.classList.add("rovie-btn");
  return linkEl.outerHTML;
} 


export const getMultipleDomElements = (selector:string)=>document.querySelectorAll(selector);

export const filterProcessedNodes = function(node:Nullable<Element>) {
  return node?.getAttribute(DATA_PROCESSED_ATTR) !== "true";
}

const redditSpecificWords:Record<string,any> = {
  "edit": "edit",
}
const invalidWords: Record<string, boolean> = {
  "the": true,
  "but": true,
  "but i": true,
  "yes": true,
  "thanks": true,
  "anyway": true,
  "someone": true,
  "actually": true,
  "one": true,
  "two": true,
  "great": true,
  "three": true,
  "yeah": true,
  "first": true,
  "second": true,
  "third": true,
  "someones": true,
  "thats": true,
  "that's": true,
  "dont": true,
  "don't": true,
  "but,": true,
  "shame": true,
  "stupid": true,
  "nope": true,
  "nope.": true,
  "nope,": true,
  "damm": true,
  "haha": true,
  "damn": true,
  "yes.": true,
  "yes,": true,
  "yes!": true,
  "one is": true,
  "no": true,
  "and": true,
  "or": true,
  "a": true,
  "an": true,
  "of": true,
  "in": true,
  "on": true,
  "at": true,
  "to": true,
  "for": true,
  "from": true,
  "by": true,
  "with": true,
  "without": true,
  "about": true,
  "above": true,
  "after": true,
  "along": true,
  "among": true,
  "around": true,
  "have": true,
  "has": true,
  "had": true,
  "having": true,
  "came": true,
  "as": true,
  "before": true,
  "behind": true,
  "below": true,
  "beneath": true,
  "beside": true,
  "between": true,
  "beyond": true,
  "during": true,
  "except": true,
  "following": true,
  "inside": true,
  "into": true,
  "theres": true,
  "like": true,
  "although": true,
  "near": true,
  "off": true,
  "onto": true,
  "opposite": true,
  "outside": true,
  "over": true,
  "past": true,
  "since": true,
  "through": true,
  "till": true,
  "toward": true,
  "under": true,
  "underneath": true,
  "until": true,
  "up": true,
  "upon": true,
  "across": true,
  "against": true,
  "amongst": true,
  "amid": true,
  "amidst": true,
  "atop": true,
  "via": true,
  "within": true,
  "down": true,
  "out": true,
  "back": true,
  "forward": true,
  "here": true,
  "there": true,
  "now": true,
  "then": true,
  "when": true,
  "where": true,
  "why": true,
  "how": true,
  "all": true,
  "any": true,
  "both": true,
  "each": true,
  "few": true,
  "more": true,
  "most": true,
  "other": true,
  "some": true,
  "such": true,
  "only": true,
  "own": true,
  "same": true,
  "so": true,
  "than": true,
  "too": true,
  "very": true,
  "s": true,
  "t": true,
  "can": true,
  "will": true,
  "just": true,
  "don": true,
  "should": true,
  "i": true,
  "you": true,
  "he": true,
  "she": true,
  "it": true,
  "we": true,
  "they": true,
  "me": true,
  "him": true,
  "her": true,
  "us": true,
  "them": true,
  "my": true,
  "your": true,
  "his": true,
  "its": true,
  "our": true,
  "their": true,
  "mine": true,
  "yours": true,
  "hers": true,
  "ours": true,
  "theirs": true,
  "this": true,
  "that": true,
  "these": true,
  "those": true,
  "who": true,
  "whom": true,
  "which": true,
  "what": true,
  "whose": true,
  "whoever": true,
  "even" : true,
  "whatever": true,
  "whichever": true,
  "whomever": true,
  "whosever": true,
  "so i": true,
  "am i": true,
  "ive": true,
  "im": true,
  "ill": true,
  "id": true,
  "youve": true,
  "youre": true,
  "youll": true,
  "youd": true,
  "hes": true,
  "got": true,
  "agree": true,
  "havent": true,
  "fuck" :true,
  "shes": true,
  "would" : true,
  "weve": true,
  "thank": true,
  "if i": true,
};

const filterTitle = function(title:Nullable<string>){
    if(!title){
    return false;
    }
    if(title.split('.').length > 1){
      return false
    }
    title = title.replace(/,|"|\.|'/g, "");
    return title.split(" ").length > 1 &&  title.length >= MINE_TITLE_LENGTH &&
    !invalidWords[title.toLowerCase()] &&
  !redditSpecificWords[title.toLowerCase()];
}

function isUppercaseStart(str:string) {
  const firstChar = str[0];
 if (str.includes('.') ) {
  const haveMultipleDots =str.split(".").slice(1).length > 1
  if(haveMultipleDots){
    return false;
  }
   const indexOfPoints =str.indexOf(".");
   if(indexOfPoints === 0  ||( str.length > 2 && indexOfPoints !== str.length -1)){
    return false;
    
   }
  }
  if(`"` === firstChar){
    return true
  }
  // Check if the first character is uppercase
  return /[A-Z]$/.test(firstChar) 
}

export function extractValidMovieTitleFromText(node:Element):string[] {
  if(!node.textContent) return [];
  node.textContent = node.textContent.replaceAll("’","'")
  const text = node?.textContent;
    if(!text){
        return []
    }
    // try to ex
     const res:Record<string,boolean> = {}
    let tempWord = "";
   const titleWords = text.split(" ");
    for(const word of titleWords){  
      if(isUppercaseStart(word)){
        tempWord += " " +word;
      }else{
        const text = tempWord.trim();
        if(text.length && text.length > 1){
          res[text] = true
          }
          tempWord = ""
        }
     const text = tempWord.trim();
      if(text.length > 1 && word === titleWords[titleWords.length -1] && !res[tempWord] ){
        res[text] = true
      }    
    }      
  const final =  Object.keys(res).filter(filterTitle)
  if(final.length){
   try {
    const regex = new RegExp(final.join("|"), "gi");
    node.innerHTML = node.textContent.replace(regex,(movieTitle)=>createImdbLink(movieTitle))
   } catch (error) {
    
   }
  }
  return final;
}
 

export const processMovieTitlesAndIds = (site:SupportedSitesUrls) => {
  if(!site || site !== SupportedSites.REDDIT) return [];
  const commentsNodes =  Array.from(getMultipleDomElements(config[site].selectors.commentContent)).filter(filterProcessedNodes)
  const res = commentsNodes.map(node=>{
   const id = getUniqueId();
  node.setAttribute(DATA_ID_ATTR, id);

  const text = extractValidMovieTitleFromText(node)
  if(!text.length) return null;
  return {
      text,
      id
  };
 }).filter(Boolean)
 return res;
}
