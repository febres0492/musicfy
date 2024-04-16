
updateSpotifyToken()
// getArtistsByGenre('pop');
getSpotifyData('browseCategories')

$("#btn-top-artist").on('click', ()=> getArtistsByGenre('pop'))
$(".btn-search").on('click', (ev)=> getArtistsByGenre(ev.target.value))
$("#btn-categories").on('click', ()=> getSpotifyData('browseCategories'))

// manage click events
$('#spotify-content-div').on('click', (e) => {

    // search data
    if(e.target.closest('.spotify-item')){
        const obj = JSON.parse(e.target.closest('.spotify-item').getAttribute('data-info'));
        getSpotifyData(obj.searchType, obj.query)
        return
    }

    // play track
    if(e.target.closest('.track')){
        const obj = JSON.parse(e.target.closest('.track').getAttribute('data-info'));
        $('#spotify-iframe')[0].setAttribute('src', `https://open.spotify.com/embed/track/${obj.query}`)
        return
    }

    // go back
    if(e.target.closest('.spotify-back-btn') && history.stack.length > 0){
        const last = history.pop();
        renderData(last.type, last.data)
        return
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


let tokenUpdateErrorCount = -1

// history object
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

// update Spotify token
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

// verify Spotify token
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

// get artists by genre
async function getArtistsByGenre(genre) {
    const query = `genre:"${genre}"`;
    return getSpotifyData('artist', query);
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
        'category': `https://api.spotify.com/v1/browse/categories/${query}/playlists`,
        'newReleases': `https://api.spotify.com/v1/browse/new-releases`,
        'recommendations': `https://api.spotify.com/v1/recommendations?seed_artists=${query}`,
        'albumTracks': `https://api.spotify.com/v1/albums/${query}/tracks`,
        'madeForYou': 'https://api.spotify.com/v1/me/top/artists',
        'href': query
    }

    console.log('url', url[searchType])

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
        console.error('error:', error)
        tokenUpdateErrorCount++
        if(tokenUpdateErrorCount > 1) return
        // updating token if it's expired
        updateSpotifyToken()
        window.alert('Token was updated. Please try again.')
    })
}

function renderData(type, data) {

    // update history current
    history.current = {'type':type, 'data':data}
    console.log('------------------------------------------------------')
    console.log('type', type, 'data', data)

    $('#spotify-content-div')[0].innerHTML = `
        <div class="d-flex gap-2 align-items-center pb-2">
            <button class="spotify-back-btn btn btn-sm border border-secondary" type="button">Back</button>
            <h5 id="resultTitle" class="m-0">${capFirst(type)}</h5>
        </div>
        <div id="list-container" class="scrollable pt-2"></div>
    `
    const searchTypes = {
        'artist': 'albums',
        'albums': 'albumTracks',
        'albumTracks': 'tracks',
        'browseCategories': 'category',
        'category': 'href',
        'href': 'href',
    }

    if(type == 'artist') {
        console.log('render', type)
        // loop through the data and display it
        const items = Object.values(data)[0].items
        items.forEach((item,i) => {
            i == 0 && console.log('item', item)
            let obj = { 'query': item.id, 'type': item.type, 'searchType':searchTypes[type] }
            console.log('obj', obj)
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${item.name}</h5
                        <p>Followers:${item.followers.total}</p>
                        <p>Genres:${item.genres.join(', ')}</p>
                    </div>
                </div>
            `
        })
        return
    } 

    if(type == 'albums') {
        console.log('render', type)
        // loop through the data and display it
        const items = data.items
        items.forEach((item,i) => {
            i == 0 && console.log('item', item)

            let obj = { 'query': item.id, 'type': item.type, 'searchType':searchTypes[type] }
            console.log('obj', obj)
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${item.name}</h5
                        <p>Release Date: ${item.release_date}</p>
                        <p>Total Tracks: ${item.total_tracks}</p>
                    </div>
                </div>
            `
        })
        return
    }

    if(type == 'albumTracks') {
        console.log('render', type)
        $('#spotify-content-div #resultTitle')[0].innerText = capFirst(searchTypes[type])

        // loop through the data and display it
        const items = data.items
        items.forEach((item, i) => {
            let obj = { 'query': item.id, 'searchType':searchTypes[type] || null }
            i<2 && console.log('obj', obj)
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="track d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <h5>${item.name}</h5
                </div>
            `
        })
        return
    }

    if(type == 'category') {
        console.log('render', type)
        
        $('#spotify-content-div #resultTitle')[0].innerText = capFirst(data.message)
        
        // loop through the data and display it
        const items = data.playlists.items
        items.forEach((item,i) => {
            i<5 && console.log('item', item)


            // searchTypes[type] = 'playlistDetails'
            searchTypes[type] = 'href'

            let obj = { 'query': item.tracks.href, 'searchType':searchTypes[type] }
            i<5 && console.log('obj', obj)
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')


            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${item.name}</h5
                        <p>${item.description}</p>
                    </div>
                </div>
            `
        })
        return
    }
    if(type == 'tracks') {
        console.log('render', type)
        // loop through the data and display it
        const items = data.tracks
        items.forEach((item,i) => {

            let obj = { 'query': item.id, 'searchType':searchTypes[type] }
            console.log('obj', obj)
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.album.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5
                </div>
            `
        })
        return
    }

    if(type == 'href') {
        console.log('render', type)
        if(data.items) {
            data.items.forEach((item, i) => {
                
                if(item.track) {
                    const track = item.track
                    const album = track.album
                    const artitsts = track.artists.map(a => a.name).join(', ')

                    $('#spotify-content-div #resultTitle')[0].innerText = 'Tracks'
        
                    let obj = { 'query': track.id}
                    i < 1 && console.log('track render item', item)
                    i < 1 && console.log('obj', obj)
                    obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
                    $('#spotify-content-div #list-container')[0].innerHTML += `
                        <div class="track d-flex p-2 gap-2 border rounded pointer mb-2" data-info="${obj}">
                            <img src="${track.album.images[2].url}" alt="${album.name}" class="spotify-img-sm">
                            <div>
                                <h5>${track.name}</h5
                                <p>${artitsts}</p>
                            </div>
                        </div>
                    `
                    return
                }

                // default render
                const track = item.track
                const album = track.album
                const artitsts = track.artists.map(a => a.name).join(', ')
    
                let obj = { 'query': item.id, 'type': item.type, 'searchType': searchTypes[type] }
                i < 1 && console.log('default render, item', item)
                i < 1 && console.log('obj', obj)
                obj = JSON.stringify(obj).replace(/"/g, '&quot;')
        
                $('#spotify-content-div #list-container')[0].innerHTML += `
                    <div class="spotify-item d-flex p-2 gap-2 border rounded pointer mb-2" data-info="${obj}">
                        <img src="${track.album.images[2].url}" alt="${album.name}" class="spotify-img-sm">
                        <div>
                            <h5>${track.name}</h5
                            <p>${artitsts}</p>
                        </div>
                    </div>
                `
            })
            return
        }
        return
    }

    // if playlists
    const keys = Object.keys(data)
    if(keys.indexOf('playlists')>-1) {
        console.log('playlists', data.playlists)

        $('#spotify-content-div #resultTitle')[0].innerText = capFirst(data.message)

        // loop through the data and display it
        const items = data.playlists.items
        items.forEach((item,i) => {

        let obj = { 'query': item.id, 'searchType':searchTypes[type] }
        console.log('obj', obj)
        obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5
                </div>
            `
        })
        return
    }

    // every other case
    const items = Object.values(data)[0].items
    const groupdName = Object.keys(data)[0]

    $('#spotify-content-div #resultTitle')[0].innerText = capFirst(groupdName)

    // loop through the data and display it
    items.forEach((item, i) => {

        if(item.name === 'Made For You') return // Made For You gives no results

        let obj = { 'query': item.id, 'type': item.type, 'searchType': searchTypes[type] }
        i < 1 && console.log('type',type, 'item', item)
        i < 1 && console.log('obj', obj)
        obj = JSON.stringify(obj).replace(/"/g, '&quot;')

        $('#spotify-content-div #list-container')[0].innerHTML += `
            <div class="spotify-item d-flex p-2 border rounded pointer mb-2" data-info="${obj}">
                <img src="${item.icons[0].url}" alt="${item.name}" class="spotify-img-sm">
                <h5>${item.name}</h5
            </div>
        `
    })
}

function capFirst(str) {
    if (typeof str !== "string" || str.length === 0) return "null"
    return str.charAt(0).toUpperCase() + str.slice(1);
}