const userFormEl = document.querySelector('#user-form');
const nameInputEl = document.querySelector('#username');
const repoContainerEl = document.querySelector('#video-content-div');
const repoSearchTerm = document.querySelector('#repo-search-term');



///New code
//using async, await to wait until the function is complete
// const getYoutubeData = async (topic) => {
//     // const url = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&q=cooking+tips&type=video&order=title&videoEmbeddable=true `
//     const url = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&q=${topic}&type=video&order=title&videoEmbeddable=true`
//     let res = await axios.get(url)

//     console.log('getYoutubeData', res)

//     res = response.data.items

    
//     displayYoutubeResults(res)
//     showVideoOnClick()
// }

const displayYoutubeResults = (data) => {
    console.log('data', data)
  repoContainerEl.innerHTML = ``;
  data.forEach((repo) => {
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

const getYoutubeData = async (topic) => {
   const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyD7neHHqfKylKN206rx0tnSRa5uq1nvmoY&part=snippet&maxResults=30&q=${topic}&type=video&order=title&videoEmbeddable=true`)
    console.log('result',response.data.items)
    let repos = response.data.items
  
    // displayYoutubeResults(repos)
    // showVideoOnClick()
  }







$('#searchBtn').addEventListener("click", (event)=> {
    event.preventDefault();
    const topic = $('#searchBar')[0].value

    // if(topic) {
    //     console.log('topic', topic)
    //     getYoutubeData(topic.textContent)
    // }

    // displayYoutubeResults(topic.textContent)
}


)


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