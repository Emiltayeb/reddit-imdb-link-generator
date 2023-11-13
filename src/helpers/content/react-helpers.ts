      // TODO maybe we should inject the react dom only when we have data to show
      // injectReactDomIntoPage()
    
      // show imdb button near each comment with a movie title});
      
export const injectReactDomIntoPage = () => {
    // if its already injected, do nothing
    if (document.getElementById('extension-movie-titles')) return
    document.body.insertAdjacentHTML('beforeend', `
      <div id="extension-movie-titles"></div>
    `)
  }
  