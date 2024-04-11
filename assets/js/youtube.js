const userFormEl = document.querySelector('#user-form');
const languageButtonsEl = document.querySelector('#language-buttons');
const nameInputEl = document.querySelector('#username');
const repoContainerEl = document.querySelector('#repos-container');
const repoSearchTerm = document.querySelector('#repo-search-term');



///New code
//using async, await to wait until the function is complete
const getReposByTopic = async (topic) => {

  // if (topic==="Most Popular by Title") {
  //   topic = "mostPopular"

  // }
  // const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&chart=${topic}&videoEmbeddable=true`)
  const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&q=${topic} z&type=video&order=title&videoEmbeddable=true`)
  
  console.log(response.data.items)
  let repos = response.data.items
  // return response.data.items
  //Function to get all urls from the response data
  // let repos = response.data.items.forEach(item => { console.log(item.url)} )


  displayRepos(repos)
  showVideoOnClick()
}

const getReposByUser = async (user) => {
  const response = await axios.get(`https://api.github.com/users/${user}/repos`)
  let repos = response.data || "";
  if (repos === "" || `404` in repos) console.log("repo is empty")

  displayRepos(repos)

}

const getRepos = (url) => axios.get(url)


const displayRepos = (repos) => {
  repoContainerEl.innerHTML = ``;
  repos.forEach((repo) => {
    let url = `https://www.youtube.com/watch?v=${repo.id}`;
    url = url.replace("watch?v=", "embed/");
    

    repoContainerEl.innerHTML += 
    
    `
        <div class="list-item yt-link flex-row justify-space-between align-center" data-link="${url}">
            <span>${repo.snippet.title}</span>
            <span class="flex-row align-center">
                <i class="fab fa-youtube"></i>
            </span>
            <img src="${repo.snippet.thumbnails.medium.url}"
            <a href=${url}>MyLink</a>
        </div>
    `;
  })
}


const getReponseByThumb = async () => {
  let thumb = repo.snippet.thumbnails.standard.url
  const thumbresponse = await axios.get(thumb)
  let thumbimage = thumbresponse
  repos.forEach((repo) => {
    

    repoContainerEl.innerHTML += 

    `
        <div class="list-item flex-row justify-space-between align-center"><span></span></i>${thumbimage}</span></div>
    `;

  })

}



userFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log(`user form is clicked.`)
  const user = nameInputEl.value;
  if (user) getReposByUser(user)
})

languageButtonsEl.addEventListener("click", (event)=> {

  event.preventDefault();
  console.log(`button was clicked`)
  const topic = event.target

  if(topic) getReposByTopic(topic.textContent)
  // displayRepos(topic.textContent)
}


)

console.log('test', $('.yt-link'))

// selector function
function $(str){
    return document.querySelectorAll(str);
}

function showVideoOnClick(){
    
  [...$('.yt-link')].forEach(el => {
    el.addEventListener('click', (event) => {
        event.preventDefault();
        console.log(`link was clicked`)
        const el = event.target
        const link = el.getAttribute('data-link')
        $('#iframe')[0].setAttribute('src', link)
        
      })
  } )
  
}