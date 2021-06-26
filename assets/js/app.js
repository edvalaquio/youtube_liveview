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

var iframeScriptTag = document.createElement('script');
iframeScriptTag.id = 'iframe-demo';
iframeScriptTag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(iframeScriptTag, firstScriptTag);

// FIXME: Place in a separate file
var Hooks = {}
Hooks.Sample = {
    mounted() {
        window.onYouTubeIframeAPIReady = () => {
            initMediaPlayer(this);
        }
    },
}

var _mediaPlayer;
var _mediaPlayerInterval;

function initMediaPlayer(mediaEventHandler) {
    _mediaPlayer = new YT.Player("existing-iframe-example");

    _mediaPlayer.addEventListener("onReady", (_event) => {
        // TODO: Send event that will enable button once ready
        document.getElementById("existing-iframe-example").style.borderColor = "#FF6D00";

        mediaEventHandler.pushEvent(
            "client-video-metadata-event",
            {
                url: _mediaPlayer.getVideoUrl(),
                current_time: _mediaPlayer.getCurrentTime(),
                total_video_time: _mediaPlayer.getDuration(),
            });

        setClientPlaybackEvent(mediaEventHandler)
    });

    _mediaPlayer.addEventListener("onStateChange", (event) => {
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
                color = "#33691E"; // playing = green
                setClientPlaybackInterval(mediaEventHandler)
                break;
            case YT.PlayerState.PAUSED:
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

    _mediaPlayer.addEventListener("onError", (event) => {
        console.error(event.data)
    });
}

function setClientPlaybackEvent(mediaEventHandler) {
    mediaEventHandler.handleEvent(
        "client-playback-event",
        ({ "action": action }) => {
            console.log(`playback-event event called with action - ${action}}`);
            switch (action) {
                case "play":
                    _mediaPlayer.playVideo();
                    break;
                case "pause":
                    _mediaPlayer.pauseVideo();
                    break;
            }
        })
}

function setClientPlaybackInterval(mediaEventHandler) {
    _mediaPlayerInterval = setInterval(
        () => mediaEventHandler.pushEvent(
            "client-video-metadata-event",
            {
                url: _mediaPlayer.getVideoUrl(),
                current_time: _mediaPlayer.getCurrentTime(),
                total_video_time: _mediaPlayer.getDuration(),
            }
        ), 1000);
}

let liveSocket = new LiveSocket("/live", Socket, { hooks: Hooks, params: { _csrf_token: csrfToken } })

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
