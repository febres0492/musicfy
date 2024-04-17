const userFormEl = document.querySelector('#searchBtn');
const topicSearchEl = document.querySelector('#searchByBtn')
const languageButtonsEl = document.querySelector('#language-buttons');
const nameInputEl = document.querySelector('#searchBar');
const repoContainerEl = document.querySelector('#video-results');
const repoSearchTerm = document.querySelector('#repo-search-term');

///New code
//using async, await to wait until the function is complete
const getReposByTopic = async (topic) => {

    const link = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&q=${topic}&type=video&order=title&videoEmbeddable=true&location=40.730610, -73.935242&location_radius=100km&order=relevance`
    const response = await axios.get(link)
  
      let repos = response.data.items

    displayRepos(repos)
    showVideoOnClick()
}



const displayRepos = (repos) => {
    repoContainerEl.innerHTML = ``;
    repos.forEach((repo) => {
    let url = `https://www.youtube.com/watch?v=${repo.id.videoId}`;
    url = url.replace("watch?v=", "embed/");
    

    repoContainerEl.innerHTML += 
    `
        <div class="yt-results yt-link bg-d1" data-link="${url}">
            <img src="${repo.snippet.thumbnails.medium.url}">
            <h5>${repo.snippet.title}</h5>  
        </div>
    `;
  })
}



userFormEl.addEventListener('click', (event) => {
    event.preventDefault();
    const user = nameInputEl.value;
    console.log(`user form is clicked.`, user)
    if (user) {getReposByTopic(user)}
})

topicSearchEl.addEventListener('click', (event) => {
  event.preventDefault();
  const topic = event.target
  console.log(`user form is clicked.`, topic.textContent)
  if (topic) {getReposByTopic(topic.textContent)}
})
// selector function
function $(str){
    return document.querySelectorAll(str);
}

function showVideoOnClick(){
    
  [...$('.yt-link')].forEach(el => {
    el.addEventListener('click', (event) => {
        event.preventDefault();
        $('#iframe')[0].classList.remove('d-none')
        console.log(`link was clicked`)
        const el = event.target.closest('.yt-link')
        const link = el.getAttribute('data-link')
        $('#iframe')[0].setAttribute('src', link)
      })
  } )  
}