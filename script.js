const PLAYER_URL = "https://raw.githubusercontent.com/nicnews/data/refs/heads/main/nice.json";
const STATUS_ENDPOINT = "/status-json.xsl";
const MOUNTPOINT = "/nice.mp3";
const ONLINE_DEFAULT = "<<< En línea >>>";
const OFFLINE = "~ Fuera de línea ~";
let serverUrl = null;
let online = null;
const title = document.getElementById("title");
const player = document.getElementById("player");


async function updatePlayer() {
    await fetch(PLAYER_URL, { cache: "no-store" })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            if (serverUrl !== json.serverUrl) {
                serverUrl = json.serverUrl;
                player.src = serverUrl + MOUNTPOINT;
            }

            if (online !== json.online && json.online) {
                player.load();
                player.play();
            }
            online = json.online;
        })
        .catch(error => {
            title.innerText = OFFLINE;
            console.error("Error: ", error);
        });
}

function extractTitle(icestats) {
    let theSource;
    let theTitle;

    if (Array.isArray(icestats.source))
        theSource = icestats.source.find(source => source.listenurl.endsWith(MOUNTPOINT));
    else
        theSource = icestats.source;
    
    if (typeof theSource.title !== "undefined")
        theTitle = theSource.title;
    else
        theTitle = null;

    return theTitle;
}

async function updateTitle() {
    if (online)
        await fetch(serverUrl + STATUS_ENDPOINT, { cache: "no-store" })
            .then(response => response.json())
            .then(json => {
                let theTitle = extractTitle(json.icestats);

                if (theTitle !== null)
                    title.innerText = theTitle;
                else
                    title.innerText = ONLINE_DEFAULT;
            })
            .catch(error => {
                title.innerText = OFFLINE;
                console.log("Error: ", error);
            });
    else
        title.innerText = OFFLINE;
}

async function updateStatus() {
    await updatePlayer();
    await updateTitle();
}


updateStatus();
setInterval(updateStatus, 25000);