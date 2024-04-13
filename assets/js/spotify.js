
// updating Spotify token

updateSpotifyToken()
let tokenUpdateErrorCount = -1

const history = {
    current:null,
    stack:[],
    addToStack(obj){
        if(obj === null) return
        this.stack.push(obj)
    },
    pop(){
        if(this.stack.length === 0) return
        return this.stack.pop()
    }
}
async function updateSpotifyToken() {
    try {
        const response = await axios.get('https://musicfy-auth.netlify.app/.netlify/functions/spotify-auth')
        const token = JSON.stringify(response.data)
        localStorage.setItem('spotify_access_token', token)
        console.log('updateSpotifyToken = ', response.data)
        return response.data
    } catch (error) {
        console.error('Failed to fetch Spotify token:', error)``
    }
}

async function verifySpotifyToken() {
    try {
        const tokenString = localStorage.getItem('spotify_access_token');
        let obj = tokenString ? JSON.parse(tokenString) : {};
        if (!obj.access_token) {
            console.error('no token found. Updating token');
            obj = updateSpotifyToken(); 
        }
        return obj.access_token;
    } catch (error) {
        console.error('error:', error);
        localStorage.removeItem('spotify_access_token');
        let data = await updateSpotifyToken(); 
        return data.access_token;
    }
}

// Get Spotify data
async function getSpotifyData(searchType = 'artist', query) {
    const countryCode = 'US'
    const url = {
        'artist': `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}`,
        'albums': `https://api.spotify.com/v1/artists/${query}/albums`,
        'tracks': `https://api.spotify.com/v1/artists/${query}/top-tracks?country=${countryCode}`,
        'relatedArtists': `https://api.spotify.com/v1/artists/${query}/related-artists`,
        'playlistDetails': `https://api.spotify.com/v1/playlists/${query}`,
        'userPlaylists': `https://api.spotify.com/v1/me/playlists`,
        'browseCategories': `https://api.spotify.com/v1/browse/categories`,
        'newReleases': `https://api.spotify.com/v1/browse/new-releases`,
        'recommendations': `https://api.spotify.com/v1/recommendations?seed_artists=${query}`,
        'albumTracks': `https://api.spotify.com/v1/albums/${query}/tracks`
    }
    const token = await verifySpotifyToken()
    axios.get(url[searchType], {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(r => {
        history.addToStack(history.current)
        renderData(searchType, r.data)
    })
    .catch(error => {
        // updating token if it's expired
        window.alert('Token was updated. Please try again.')
        console.error('error:', error)
        tokenUpdateErrorCount++
        if(tokenUpdateErrorCount > 1) return
        updateSpotifyToken()
        
    })
}

function renderData(type, data, test = '') {

    // update history current
    history.current = {'type':type, 'data':data}

    const backBtnStr = '<button class="spotify-back-btn btn btn-sm border border-secondary">Back</button>'

    if(type == 'artist') {
        // const searchType = Object.keys(data)[0]
        const items = Object.values(data)[0].items
        $('#spotify-content-div')[0].innerHTML = `
            <div id="list-container" class="p-2">
                <div class="d-flex">
                    ${backBtnStr}
                    <h5>Spotify Results</h5>
                </div>
            </div>
        `
        // loop through the data and display it
        items.forEach(item => {
            const obj = JSON.stringify({
                'id': item.id,
                'type': item.type,
                'searchType':'albums'
            }).replace(/"/g, '&quot;')
            
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5
                </div>
            `
        })
    }

    if(type == 'albums') {
        const items = data.items
        $('#spotify-content-div')[0].innerHTML = `
            <div id="list-container" class="p-2">
                <div class="d-flex">
                    ${backBtnStr}
                    <h5>Albums</h5>
                </div>
            </div>
        `
        // loop through the data and display it
        items.forEach(item => {
            const obj = JSON.stringify({
                'id': item.id,
                'type': item.type,
                'searchType':'albumTracks'
            }).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5
                </div>
            `
        })
    }

    if(type == 'albumTracks') {
        const items = data.items
        $('#spotify-content-div')[0].innerHTML = `
            <div id="list-container" class="p-2">
                <div class="d-flex">
                    ${backBtnStr}
                    <h5>Tracks</h5>
                </div>
            </div>
        `
        // loop through the data and display it
        items.forEach(item => {
            const obj = JSON.stringify({
                'id': item.id,
            }).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="track d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <h5>${item.name}</h5
                </div>
            `
        })
    }

    if(type == 'tracks') {
        const items = data.tracks
        $('#spotify-content-div')[0].innerHTML = `
            <div id="list-container" class="p-2">
                <div class="d-flex">
                    ${backBtnStr}
                    <h5>Top Tracks</h5>
                </div>
            </div>
        `
        // loop through the data and display it
        items.forEach((item,i) => {
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${item.id}">
                    <img src="${item.album.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5
                </div>
            `
        })
    }

    // if(type == 'tracks') {
    //     const items = data.tracks;
    //     $('#spotify-content-div')[0].innerHTML = `
    //         <div id="list-container" class="p-2">
    //             <h5>Top Tracks</h5>
    //         </div>
    //     `
    //     // loop through the data and display it
    //     items.forEach((item,i) => {
    //         $('#spotify-content-div #list-container')[0].innerHTML += `
    //             <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${item.id}">
    //                 <img src="${item.album.images[0].url}" alt="${item.name}" class="spotify-img-sm">
    //                 <h5>${item.name}</h5
    //             </div>
    //         `;
    //     })
    // }

    // if(type == 'relatedArtists') {
    //     const items = data.artists;
    //     $('#spotify-content-div')[0].innerHTML = `
    //         <div id="list-container" class="p-2">
    //             <h5>Related Artists</h5>
    //         </div>
    //     `
    //     // loop through the data and display it
    //     items.forEach((item,i) => {
    //         $('#spotify-content-div #list-container')[0].innerHTML += `
    //             <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${item.id}">
    //                 <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
    //                 <h5>${item.name}</h5
    //             </div>
    //         `;
    //     })
    // }

    // if(type == 'playlistDetails') {
    //     const items = data.tracks.items;
    //     $('#spotify-content-div')[0].innerHTML = `
    //         <div id="list-container" class="p-2">
    //             <h5>${data.name}</h5>
    //         </div>
    //     `
    //     // loop through the data and display it
    //     items.forEach((item,i) => {
    //         $('#spotify-content-div #list-container')[0].innerHTML += `
    //             <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${item.id}">
    //                 <img src="${item.album.images[0].url}" alt="${item.name}" class="spotify-img-sm">
    //                 <h5>${item.name}</h5
    //             </div>
    //         `;
    //     })
    // }
}

// manage click events
$('#spotify-content-div').on('click', (e) => {

    // search data
    if(e.target.closest('.spotify-item')){
        const obj = JSON.parse(e.target.closest('.spotify-item').getAttribute('data-info'));
        getSpotifyData(obj.searchType, obj.id)
    }

    // play track
    if(e.target.closest('.track')){
        const obj = JSON.parse(e.target.closest('.track').getAttribute('data-info'));
        $('#spotify-iframe')[0].setAttribute('src', `https://open.spotify.com/embed/track/${obj.id}`)
    }

    // go back
    if(e.target.closest('.spotify-back-btn') && history.stack.length > 0){
        const last = history.pop();
        renderData(last.type, last.data)
    }
});


// searching when clicking the search button
$('#spotifySearchBtn').on('click', ()=> {
    const query = $('#searchBar')[0].value; 
    if(query.length === 0) return 
    getSpotifyData('artist',query)
})

// searching when pressing Enter
$('#searchBar').on('keypress', (e) => {
    const query = $('#searchBar')[0].value; 
    if(query.length === 0) return 
    if(e.key === 'Enter') getSpotifyData('artist',query)
})


  



