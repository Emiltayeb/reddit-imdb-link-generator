
const MINE_TITLE_LENGTH =3;

const redditSpecificWords:Record<string,any> = {
  "edit": "edit",
}
const invalidWords:Record<string,any> ={
  "the": "the",
  "but": "but",
  "yes": "yes",
  "no": "no",
  "and": "and",
  "or": "or",
  "a": "a",
  "an": "an",
  "of": "of",
  "in": "in",
  "on": "on",
  "at": "at",
  "to": "to",
  "for": "for",
  "from": "from",
  "by": "by",
  "with": "with",
  "without": "without",
  "about": "about",
  "above": "above",
  "after": "after",
  "along": "along",
  "among": "among",
  "around": "around",
  "as": "as",
  "before": "before",
  "behind": "behind",
  "below": "below",
  "beneath": "beneath",
  "beside": "beside",
  "between": "between",
  "beyond": "beyond",
  "during": "during",
  "except": "except",
  "following": "following",
  "inside": "inside",
  "into": "into",
  "like": "like",
  "near": "near",
  "off": "off",
  "onto": "onto",
  "opposite": "opposite",
  "outside": "outside",
  "over": "over",
  "past": "past",
  "since": "since",
  "through": "through",
  "till": "till",
  "toward": "toward",
  "under": "under",
  "underneath": "underneath",
  "until": "until",
  "up": "up",
  "upon": "upon",
  "across": "across",
  "against": "against",
  "amongst": "amongst",
  "amid": "amid",
  "amidst": "amidst",
  "atop": "atop",
  "via": "via",
  "within": "within",
  "down": "down",
  "out": "out",
  "back": "back",
  "forward": "forward",
  "here": "here",
  "there": "there",
  "now": "now",
  "then": "then",
  "when": "when",
  "where": "where",
  "why": "why",
  "how": "how",
  "all": "all",
  "any": "any",
  "both": "both",
  "each": "each",
  "few": "few",
  "more": "more",
  "most": "most",
  "other": "other",
  "some": "some",
  "such": "such",
  "only": "only",
  "own": "own",
  "same": "same",
  "so": "so",
  "than": "than",
  "too": "too",
  "very": "very",
  "s": "s",
  "t": "t",
  "can": "can",
  "will": "will",
  "just": "just",
  "don": "don",
  "should": "should",
  "i": "i",
  "you": "you",
  "he": "he",
  "she": "she",
  "it": "it",
  "we": "we",
  "they": "they",
  "me": "me",
  "him": "him",
  "her": "her",
  "us": "us",
  "them": "them",
  "my": "my",
  "your": "your",
  "his": "his",
  "its": "its",
  "our": "our",
  "their": "their",
  "mine": "mine",
  "yours": "yours",
  "hers": "hers",
  "ours": "ours",
  "theirs": "theirs",
  "this": "this",
  "that": "that",
  "these": "these",
  "those": "those",
  "who": "who",
  "whom": "whom",
  "which": "which",
  "what": "what",
  "whose": "whose",
  "whoever": "whoever",
  "whatever": "whatever",
  "whichever": "whichever",
  "whomever": "whomever",
  "whosever": "whosever",
  "so i": "so i",
  "am i": "am i",
  "i've": "i've",
  "i'm": "i'm",
  "i'll": "i'll",
  "i'd": "i'd",
  "you've": "you've",
  "you're": "you're",
  "you'll": "you'll",
  "you'd": "you'd",
  "he's": "he's",
  "she's": "she's",
  "it's": "it's",
  "we've": "we've",
}

type Nullable<T> = T | null | undefined;

const validateTitle = function(title:Nullable<string>){
    if(!title){
    return false;
    }
  // check if the title is a single word and if so, its must not match any of the invalid words
  return title.length > MINE_TITLE_LENGTH && !invalidWords[title.toLowerCase()] && !redditSpecificWords[title.toLowerCase()];
}

function isUppercaseStart(str:string) {
 if (str.includes('.') ) {
  const haveMultipleDots =str.split(".").slice(1).length > 1
  if(haveMultipleDots){
    return false;
  }
   const indexOfPoints =str.indexOf(".");
   if(indexOfPoints === 0 ||( str.length > 2 && indexOfPoints !== str.length -1)){
    return false;
    
   }
  }
  // Check if the first character is uppercase
  return /[A-Z]$/.test(str[0]) 
}
export function extractValidMovieTitleFromText(text:Nullable<string>) {
    if(!text){
        return {}
    }
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
  return Object.keys(res).filter(validateTitle)
}
 