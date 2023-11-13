import { extractValidMovieTitleFromText,filterProcessedNodes, getUniqueId } from ".";
import { Nullable } from "../types";
import { DATA_ID_ATTR, DATA_PROCESSED_ATTR, SupportedSites, siteCommentsSelectors } from "./constants";
import { getMultipleDomElements } from "./dom";



export const processMovieTitlesAndIds = (site:Nullable<SupportedSites>) => {
    if(!site) return [];
    const commentsNodes =  Array.from(getMultipleDomElements(siteCommentsSelectors[site])).filter(filterProcessedNodes)
    let allText= "";
    const res = commentsNodes.map(node=>{
     const id = getUniqueId();
    node.setAttribute(DATA_ID_ATTR, id);

    const text = extractValidMovieTitleFromText(node)
    if(!text.length) return null;
    allText += text.join(" ") + " ";
    return {
        text,
        id
    };
   }).filter(Boolean)
   console.log(allText);
   
   return res;
}

