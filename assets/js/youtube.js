const userFormEl = document.querySelector('#user-form');
const languageButtonsEl = document.querySelector('#language-buttons');
const nameInputEl = document.querySelector('#username');
const repoContainerEl = document.querySelector('#repos-container');
const repoSearchTerm = document.querySelector('#repo-search-term');

//   event.preventDefault();

//   const username = nameInputEl.value.trim();

//   if (username) {
//     getUserRepos(username);

//     repoContainerEl.textContent = '';
//     nameInputEl.value = '';
//   } else {
//     alert('Please enter a GitHub username');
//   }
// };

// const buttonClickHandler = function (event) {
//   const language = event.target.getAttribute('data-language');

//   if (language) {
//     getFeaturedRepos(language);

//     repoContainerEl.textContent = '';
//   }
// };

// const getUserRepos = function (user) {
//   const apiUrl = `https://api.github.com/users/${user}/repos`;

//   fetch(apiUrl)
//     .then(function (response) {
//       if (response.ok) {
//         response.json().then(function (data) {
//           displayRepos(data, user);
//         });
//       } else {
//         alert(`Error:${response.statusText}`);
//       }
//     })
//     .catch(function (error) {
//       alert('Unable to connect to GitHub');
//     });
// };

// const getFeaturedRepos = function (language) {
//   const apiUrl = `https://api.github.com/search/repositories?q=${language}+is:featured&sort=help-wanted-issues`;

//   fetch(apiUrl).then(function (response) {
//     if (response.ok) {
//       response.json().then(function (data) {
//         displayRepos(data.items, language);
//       });
//     } else {
//       alert(`Error:${response.statusText}`);
//     }
//   });
// };

// const displayRepos = function (repos, searchTerm) {
//   if (repos.length === 0) {
//     repoContainerEl.textContent = 'No repositories found.';
//     return;
//   }

//   repoSearchTerm.textContent = searchTerm;

//   for (let repoObj of repos) {
//     const repoName = `${repoObj.owner.login}/${repoObj.name}`;

//     const repoEl = document.createElement('div');
//     repoEl.classList = 'list-item flex-row justify-space-between align-center';

//     const titleEl = document.createElement('span');
//     titleEl.textContent = repoName;

//     repoEl.appendChild(titleEl);

//     const statusEl = document.createElement('span');
//     statusEl.classList = 'flex-row align-center';

//     if (repoObj.open_issues_count > 0) {
//       statusEl.innerHTML =
//         `<i class='fas fa-times status-icon icon-danger'></i>${repoObj.open_issues_count} issue(s)`;
//     } else {
//       statusEl.innerHTML = "<i class='fas fa-check-square status-icon icon-success'></i>";
//     }

//     repoEl.appendChild(statusEl);

//     repoContainerEl.appendChild(repoEl);
//   }
// };

// userFormEl.addEventListener('submit', formSubmitHandler);
// languageButtonsEl.addEventListener('click', buttonClickHandler);

///New code
//using async, await to wait until the function is complete
const getReposByTopic = async (topic) => {

  https://www.googleapis.com/youtube/v3/videos?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&chart=mostPopular
  if (topic==="Most Popular by Title") {
    topic = "mostPopular"

  }
  const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&chart=${topic}`)
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
     repo.snippet > 0 ?

    `
        <div class="list-item yt-link flex-row justify-space-between align-center"><span>${repo.snippet.title}</span><span class="flex-row align-center"><i class="fas fa-times status-icon icon-danger"></i>${repo.open_issues} issue(s)</span></div>
    `:
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