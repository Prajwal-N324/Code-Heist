
async function listModels() {
    const API_KEY = "AIzaSyCHj9vHUCIC99hiMI_V1U1hn-OTL2BQ_Ls";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const r = await fetch(url);
        const d = await r.json();
        console.log(JSON.stringify(d, null, 2));
    } catch (e) {
        console.error(e);
    }
}
listModels();
