// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"
import "../node_modules/@fortawesome/fontawesome-free/js/all.js"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"
import { Socket } from "phoenix"
import topbar from "topbar"
import { LiveSocket } from "phoenix_live_view"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" })
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())


// FIXME: Place in a separate file

var Hooks = {}
Hooks.Sample = {
    mounted() {
        setMediaPlayer(this);
        setMediaPlaybackEventHandler(this);
    },
    beforeUpdate() {
        setMediaPlayer(this);
        setMediaPlaybackEventHandler(this);
    }
}


let _mediaPlayer;
let _mediaPlayerInterval;

function setMediaPlayer(mediaEventHandler) {
    const mediaPlayer = new YT.Player("existing-iframe-example");

    mediaPlayer.addEventListener("onReady", (_event) => {
        document.getElementById("existing-iframe-example").style.borderColor = "#FF6D00";
    });

    mediaPlayer.addEventListener("onStateChange", (event) => {
        const playerStatus = event.data
        console.log(`mediaPlayer status changed ${playerStatus}`)

        let color;
        switch (playerStatus) {
            case YT.PlayerState.UNSTARTED:
                color = "#37474F"; // unstarted = gray
                break;
            case YT.PlayerState.ENDED:
                color = "#FFFF00"; // ended = yellow
                break;
            case YT.PlayerState.PLAYING:
                // NOTE: We can use this video state to pause and play videos.
                // pros: No need to create custom buttons
                // cons: Longer delay in playing videos
                // this.pushEvent("play-video", {});
                color = "#33691E"; // playing = green
                _mediaPlayerInterval = setInterval(
                    () => {
                        mediaEventHandler.pushEvent(
                            "client-video-metadata-event",
                            {
                                current_time: getMediaPlayer().getCurrentTime(),
                                duration: getMediaPlayer().getDuration(),
                            })
                    }, 1000);
                break;
            case YT.PlayerState.PAUSED:
                // NOTE: We can use this video state to pause and play videos.
                // pros: No need to create custom buttons
                // cons: Longer delay in playing videos
                // this.pushEvent("pause-video", {});
                color = "#DD2C00"; // paused = red
                clearInterval(_mediaPlayerInterval);
                break;
            case YT.PlayerState.BUFFERING:
                color = "#AA00FF"; // buffering = purple

                clearInterval(_mediaPlayerInterval);
                break;
            case YT.PlayerState.CUED:
                color = "#FF6DOO"; // video cued = orange
                break;
        }
        if (color) {
            document.getElementById("existing-iframe-example").style.borderColor = color;
        }

    });

    mediaPlayer.addEventListener("onError", (event) => {
        console.error(event.data)
    });

    _mediaPlayer = mediaPlayer;
}

function getMediaPlayer() { return _mediaPlayer }

function setMediaPlaybackEventHandler(mediaEventHandler) {
    mediaEventHandler.handleEvent(
        "client-playback-event",
        ({ "action": action }) => {
            console.log(`playback-event event called with action - ${action}}`);
            switch (action) {
                case "play":
                    getMediaPlayer().playVideo();
                    break;
                case "pause":
                    getMediaPlayer().pauseVideo();
                    break;
            }
        })
}

let liveSocket = new LiveSocket("/live", Socket, { hooks: Hooks, params: { _csrf_token: csrfToken } })

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
