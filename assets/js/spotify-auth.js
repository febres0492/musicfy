
// updating Spotify token
async function updateSpotifyToken() {
    try {
        const response = await axios.get('https://musicfy-auth.netlify.app/.netlify/functions/spotify-auth');
        const token = JSON.stringify(response.data); 
        localStorage.setItem('spotify_access_token', token); 
        console.log('Token updated and saved:', token);
    } catch (error) {
        console.error('Failed to fetch Spotify token:', error);
    }
}

// Get Spotify data
function getSpotifyData() {
    let obj = JSON.parse(localStorage.getItem('spotify_access_token'));
    const query = $('#searchBar')[0].value || 'sugar'; 
    const searchType = 'track'; // Could be 'album', 'track', 'playlist', etc.

    axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}`, {
        headers: {
            'Authorization': `Bearer ${obj.access_token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(r => {
        // updating token if it's expired
        if(r.data.error?.message.includes('expired')) {
            updateSpotifyToken();
        }
        
        console.log('Spotify data:', r.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}





