
getArtistsByGenre('pop');

// close modal
$('#modalCloseBtn').on('click', ()=> {
    $('#modal').hide()
    getArtistsByGenre('pop')
})

// getting pop artists
$("#btn-top-artist").on('click', ()=> getArtistsByGenre('pop'))

// getting btn value 
$(".btn-search").on('click', (ev)=> getArtistsByGenre(ev.target.value))

// getting categories
$("#btn-categories").on('click', ()=> getSpotifyData('browseCategories'))

// manage click events
$('#spotify-content-div').on('click', (e) => {

    // search data
    if(e.target.closest('.spotify-item')){
        const obj = JSON.parse(e.target.closest('.spotify-item').getAttribute('data-info'));

        // updating preItem info
        // console.log('getting pre item info', obj.info)
        if('info' in obj) {
            history.tempPreItemInfo = obj.info
        }

        getSpotifyData(obj.searchType, obj.query)
        return
    }

    // update iframe src
    if(e.target.closest('.track')){
        const obj = JSON.parse(e.target.closest('.track').getAttribute('data-info'));
        $('#spotify-iframe')[0].setAttribute('src', `https://open.spotify.com/embed/track/${obj.query}`)
        return
    }

    // go back
    if(e.target.closest('.spotify-back-btn')){
        // getting last item from history stack
        if(!history.stack.length) { return }
        const last = history.pop();
        // console.log('stack', history.stack.length)
        renderData(last)
    }
});


// searching when clicking the search button
$('#spotifySearchBtn').on('click', ()=> {
    const query = $('#searchBar')[0].value; 
    if(query.length === 0) return 
    getSpotifyData('artist',query)
})

// searching when pressing Enter and deleting token
$('#searchBar').on('keypress', (e) => {
    const query = $('#searchBar')[0].value; 
    if(query.length === 0) return 
    if(e.key === 'Enter') getSpotifyData('artist',query)
})


let tokenUpdateLimiter = -1

// history object
const history = {
    current: {},
    tempPreItemInfo: {},
    stack:[],
    addToStack(obj){
        if(obj === null || obj === undefined) {return} // if is null or undefined
        if(typeof obj === 'object' && Object.values(obj).length === 0) { return } // if object and is empty
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
            obj = await updateSpotifyToken(); 
        }
        return obj.access_token;
    } catch (error) {
        console.error('error:', error);
    }
}

// get artists by genre
async function getArtistsByGenre(genre) {
    const query = `genre:"${genre}"`;
    return getSpotifyData('artist', query);
}

// geting Spotify data
async function getSpotifyData(searchType = 'artist', query) {

    // showing spinner
    $('.spinner-border').show()

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

    const token = await verifySpotifyToken()
    axios.get(url[searchType], {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(r => {
        history.addToStack(history.current)
        // console.log('stack', history.stack.length)
        renderData({'type':searchType, 'data':r.data, 'preItemInfo':history.tempPreItemInfo})

        // hiding spinner
        $('.spinner-border').hide()
        
    })
    .catch(async error => {
        console.error('error:', error)
        tokenUpdateLimiter++
        if(tokenUpdateLimiter > 1) return

        // updating token if it's expired
        await updateSpotifyToken()
        $('#modal').show();
    })
}

function renderData(obj) {
    const { type, data, preItemInfo } = obj

    history.current = {'type':type, 'data':data, 'preItemInfo':preItemInfo}
    history.tempPreItemInfo = {}

    // console.log('stack', history.stack)

    $('#spotify-content-div')[0].innerHTML = `
        <div class="d-flex flex-column ">
            <div class="d-flex gap-3 pb-2">
                <button class="spotify-back-btn btn btn-sm border border-secondary" type="button">Back</button>
                <h5 id="resultTitle" class="m-0">${capFirst(type)}</h5>
            </div>
            <div id="infoBox"> 
                <!-- this div is to append previously selected item Info when neccesary --> 
            </div>
        </div>
        <div id="list-container" class="scrollable pt-2 d-flex flex-wrap jcsb"></div>
    `

    // hidding back button
    if(history.stack.length === 0) {
        $('.spotify-back-btn').hide()
    }

    // adding preItem info
    if(Object.values(preItemInfo).length){
        // console.log('preItemInfo', preItemInfo)
        let preItem = preItemInfo

        const img = 'imgUrl' in preItem ? `<img src="${preItem.imgUrl}" alt="${preItem.name}" class="spotify-img-sm">` : ''
        const preItemData = Object.entries(preItem).map(([key, value]) => {
            if(key === 'imgUrl'){ return }
            return `<p class="m-0"><b>${capFirst(key).replace('_',' ')}:</b> ${value}</p>`
        })

        const subtitle = type === 'albumTracks' ? 'Tracks' : capFirst(type)
        $("#infoBox")[0].innerHTML = `
            <div class="d-flex bg-l1 rounded p-2 mb-3">
                ${img}
                <div class="d-flex flex-column">
                    ${preItemData.join('')}
                </div>
            </div>
            <h5 id="sub-title" class="m-0">${subtitle}:</h5>
        `
    }

    const searchTypes = {
        'artist': 'albums',
        'albums': 'albumTracks',
        'albumTracks': 'tracks',
        'browseCategories': 'category',
        'category': 'href',
        'href': 'href',
    }

    if(type == 'artist') {
        // console.log('render', type)

        $('#spotify-content-div #resultTitle')[0].innerText = "Artists"

        // displaying items
        const items = Object.values(data)[0].items
        items.forEach((item,i) => {
            const info = {
                'name':item.name ,
                'imgUrl':item.images[0].url, 
                'followers':item.followers.total, 
                'genres':item.genres.join(', ')
            }
            let obj = { 'query': item.id, 'type': item.type, 'searchType':searchTypes[type], 'info':info }
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item d-flex" data-info="${obj}">
                    <img src="${info.imgUrl}" alt="${info.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${info.name}</h5>
                        <p>Followers: ${info.followers}</p>
                        <p>Genres: ${info.genres}</p>
                    </div>
                </div>
            `
        })
        return
    } 

    if(type == 'albums') {
        // console.log('render', type)

        $('#spotify-content-div #resultTitle')[0].innerText = "Artist"

        // displaying items
        const items = data.items
        items.forEach((item,i) => {
            const info = {
                'name':item.name ,
                'imgUrl':item.images[0].url, 
                'release_date':item.release_date, 
                'artists':item.artists.map(a => a.name).join(', ')
            }
            
            let obj = { 'query': item.id, 'type': item.type, 'searchType':searchTypes[type], 'info':info}
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item" data-info="${obj}">
                    <img src="${info.imgUrl}" alt="${info.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${info.name}</h5>
                        <p>Artists: ${info.artists}</p>
                        <p>Release Date: ${info.release_date}</p>
                    </div>
                </div>
            `
        })
        return
    }

    if(type == 'albumTracks') {
        // console.log('render', type)

        $('#spotify-content-div #resultTitle')[0].innerText = "Album"

        // displaying items
        const items = data.items
        items.forEach((item, i) => {
            let obj = { 'query': item.id, 'searchType':searchTypes[type] || null }
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="track pointer mb-2" data-info="${obj}">
                    <p class="h6">${item.name}</p>
                </div>
            `
        })
        return
    }

    if(type == 'category') {
        // console.log('render', type)
        
        $('#spotify-content-div #resultTitle')[0].innerText = capFirst(data.message)
        
        // displaying items
        const items = data.playlists.items
        items.forEach((item,i) => {
            const info = {
                'name':item.name ,
                'imgUrl':item.images[0].url,
                'description':item.description,
            }

            searchTypes[type] = 'href'

            let obj = { 'query': item.tracks.href, 'searchType':searchTypes[type], 'info':info }
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')


            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item" data-info="${obj}">
                    <img src="${info.imgUrl}" alt="${info.name}" class="spotify-img-sm">
                    <div class="d-flex flex-column">
                        <h5>${info.name}</h5>
                        <p>${info.description}</p>
                    </div>
                </div>
            `
        })
        return
    }
    if(type == 'tracks') {
        // console.log('render', type)

        // displaying items
        const items = data.tracks
        items.forEach((item,i) => {

            let obj = { 'query': item.id, 'searchType':searchTypes[type] }
            obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item" data-info="${obj}">
                    <img src="${item.album.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5>
                </div>
            `
        })
        return
    }

    if(type == 'href') {
        // console.log('render', type)
        if(data.items) {
            data.items.forEach((item, i) => {

                if(item.track) {
                    const info = {
                        'name':item.track.name,
                        'album':item.track.album,
                        'imgUrl':item.track.album.images[2].url, 
                        'artists':item.track.artists.map(a => a.name).join(', '),
                    }
                    
                    // run only once
                    if(i==0){
                        $('#spotify-content-div #resultTitle')[0].innerText = 'Album'
                        $('#sub-title')[0].innerText = 'Tracks'
                    }
        
                    let obj = { 'query': item.track.id, 'info':info}
                    obj = JSON.stringify(obj).replace(/"/g, '&quot;')
            
                    $('#spotify-content-div #list-container')[0].innerHTML += `
                        <div class="track" data-info="${obj}">
                            <img src="${info.imgUrl}" alt="${item.track.album.name}" class="spotify-img-sm">
                            <div>
                                <h5>${info.name}</h5>
                                <p>${info.artists}</p>
                            </div>
                        </div>
                    `
                    return
                }

                // console.log('other item', item)
                i<1 && console.log('other item', item)
            })
            return
        }
        return
    }

    // if playlists
    const keys = Object.keys(data)
    if(keys.indexOf('playlists')>-1) {
        // console.log('playlists', data.playlists)

        $('#spotify-content-div #resultTitle')[0].innerText = capFirst(data.message)

        // displaying items
        const items = data.playlists.items
        items.forEach((item,i) => {

        let obj = { 'query': item.id, 'searchType':searchTypes[type] }
        obj = JSON.stringify(obj).replace(/"/g, '&quot;')

            $('#spotify-content-div #list-container')[0].innerHTML += `
                <div class="spotify-item" data-info="${obj}">
                    <img src="${item.images[0].url}" alt="${item.name}" class="spotify-img-sm">
                    <h5>${item.name}</h5>
                </div>
            `
        })
        return
    }

    // every other case
    const items = Object.values(data)[0].items
    const groupdName = Object.keys(data)[0]
    // console.log('groupdName', groupdName, 'type', type, 'searchType', searchTypes[type])
    // console.log('other cases', items, 'groupdName', groupdName )

    $('#spotify-content-div #resultTitle')[0].innerText = capFirst(groupdName)

    // displaying items
    items.forEach((item, i) => {

        if(item.name === 'Made For You') return // item (Made For You) gives no results

        let obj = { 'query': item.id, 'type': item.type, 'searchType': searchTypes[type] }
        obj = JSON.stringify(obj).replace(/"/g, '&quot;')

        $('#spotify-content-div #list-container')[0].innerHTML += `
            <div class="spotify-item" data-info="${obj}">
                <img src="${item.icons[0].url}" alt="${item.name}" class="spotify-img-sm">
                <h5>${item.name}</h5>
            </div>
        `
    })
}

function capFirst(str) {
    if (typeof str !== "string" || str.length === 0) return "null"
    return str.charAt(0).toUpperCase() + str.slice(1);
}
