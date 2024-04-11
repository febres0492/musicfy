
const spotifyAuthUrl = 'https://musicfy-auth.netlify.app/.netlify/functions/spotify-auth' 

async function getSpotifyToken () {
    const response = await axios.get(spotifyAuthUrl)
    const token = response.data.access_token
    localStorage.setItem('spotify_access_token', token)
}
getSpotifyToken()
