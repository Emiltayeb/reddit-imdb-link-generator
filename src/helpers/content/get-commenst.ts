import { extractValidMovieTitleFromText, getUniqueId } from ".";
import { Nullable } from "../types";
import { DATA_ID_ATTR, SupportedSites, siteCommentsSelectors } from "./constants";
import { getMultipleDomElements } from "./dom";



export const getMovieTitlesAndIds = (site:Nullable<SupportedSites>) => {
    if(!site) return [];
    const commentsNodes =  Array.from(getMultipleDomElements(siteCommentsSelectors[site]))
    const id = getUniqueId();
   return commentsNodes.map(node=>{
     node.setAttribute(DATA_ID_ATTR, getUniqueId());
    return {
        text:extractValidMovieTitleFromText(node.textContent),
        id
    };
   })
}

