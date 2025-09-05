console.log("welcome to console")

let playBtn = document.getElementById("play");
let pauseBtn = document.getElementById("pause");
let nextBtn = document.getElementById("next");
let previousBtn = document.getElementById("previous");

let currentSongIndex = 0;

pauseBtn.style.visibility = "hidden";

playBtn.addEventListener("click", () => {
    playBtn.style.visibility = "hidden";  // Hide play button
    pauseBtn.style.visibility = "visible"; // Show pause button
});

pauseBtn.addEventListener("click", () => {
    pauseBtn.style.visibility = "hidden"; // Hide pause button
    playBtn.style.visibility = "visible";  // Show play button
});

function convertSecondsToTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.round(seconds % 60); // Round the seconds to nearest whole number

    minutes = minutes < 10 ? "0" + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    return minutes + ":" + remainingSeconds;
}

async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as)
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }
    return songs
}

async function defaultSongs(folder, songs){

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songTitle = song.split(`/${folder}/`)[1].replaceAll("%20", " ").replaceAll("%2C", " ")
        songName = songTitle.split("-")[0]
        songArtist = songTitle.includes("-") ? songTitle.split("-")[1]: "Unknown Artist";
        songUl.innerHTML = songUl.innerHTML +
            `<li>
        <div class = "song-info">
        <p style="font-size:13px; font-weight: 550;">${songName}</p>
        <p>${songArtist.replace(".mp3", " ")}</p>
        <img id="on" src="https://cdn-icons-png.flaticon.com/512/483/483054.png " class="img-small invert">
        <img id="off" src="https://cdn-icons-png.flaticon.com/512/2088/2088562.png" class="img-small invert">
        </div>
        </li>`
    }

}

async function main() {

    let songs = await getSongs("songs")
    console.log(songs[0])

    await defaultSongs("songs", songs);
    
    var audio = new Audio(songs[currentSongIndex])

    playBtn.addEventListener("click", () => {
        audio.play();
        playBtn.style.visibility = "hidden";
        pauseBtn.style.visibility = "visible";
    });

    pauseBtn.addEventListener("click", () => {
        audio.pause();
        playBtn.style.visibility = "visible";
        pauseBtn.style.visibility = "hidden";
    });

    nextBtn.addEventListener("click", () => {
        audio.pause()
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        audio.src = songs[currentSongIndex];
        audio.play();
        playBtn.style.visibility = "hidden";
        pauseBtn.style.visibility = "visible";
    });

    previousBtn.addEventListener("click", () => {
        audio.pause();
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        // audio = new Audio(songs[currentSongIndex]); Instead of creating a new Audio object every time, just update audio.src
        audio.src = songs[currentSongIndex];
        audio.play();
        playBtn.style.visibility = "hidden";
        pauseBtn.style.visibility = "visible";
    });

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e, index) => {
        let on = e.querySelector("#on")
        let off = e.querySelector("#off")
        on.style.visibility = "visible"
        off.style.visibility = "hidden"
        e.addEventListener("click", element => {
            element.preventDefault()
            document.querySelectorAll(".song-list ul li div").forEach(div => {
                div.style.backgroundColor = "rgb(46, 54, 58)"; // Reset to original color
            });
            document.querySelectorAll(".song-list li #on").forEach(icon => {
                icon.style.visibility = "visible"; // Reset all "on" icons
            });
            document.querySelectorAll(".song-list li #off").forEach(icon => {
                icon.style.visibility = "hidden"; // Reset all "off" icons
            });
            audio.pause()
            currentSongIndex = index
            audio.src = songs[currentSongIndex]
            audio.play();

            document.getElementById("now-playing").innerHTML = e.querySelector(".song-info p").textContent + " - " + e.querySelectorAll(".song-info p")[1].textContent

            playBtn.style.visibility = "hidden";
            pauseBtn.style.visibility = "visible";
            e.querySelector("div").style.backgroundColor = "rgb(93, 96, 98)"
            on.style.visibility = "hidden"
            off.style.visibility = "visible"



            playBtn.style.visibility = "hidden";
            pauseBtn.style.visibility = "visible";

        })
        off.addEventListener("click", (event) => {
            event.stopPropagation();
            audio.pause()
            off.style.visibility = "hidden"
            on.style.visibility = "visible"
            playBtn.style.visibility = "visible";
            pauseBtn.style.visibility = "hidden";
        })
        audio.addEventListener("timeupdate", () => {
            console.log(audio.currentTime, audio.duration)
            document.querySelector("#duration").innerHTML = `${convertSecondsToTime(audio.currentTime)}/${convertSecondsToTime(audio.duration)}`
            document.querySelector("#seek-circle").style.left = (audio.currentTime / audio.duration) * 100 + "%"
        })

        document.querySelector("#seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width);
            audio.currentTime = audio.duration * percent; // Correctly updating time without restart

            // Resume only if it was playing before
            if (!audio.paused) {
                setTimeout(() => audio.play(), 10); // Ensures it plays from the new position
            }

            document.querySelector("#seek-circle").style.left = (percent * 100) + "%";
        })

        
    })

        document.querySelector(".hamburger").addEventListener("click", ()=>{
            document.querySelector(".left").style.left = "0"
        })

        document.getElementById("home").addEventListener("click", ()=>{
            document.querySelector(".left").style.left = "-100%"
        })

}
main()
