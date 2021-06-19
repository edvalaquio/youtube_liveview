// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

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
let Hooks = {}
Hooks.Sample = {
    clearPlaybackInterval() { clearInterval(this.playbackInterval) },
    getPlaybackInterval() { return this.playbackInterval },
    setPlaybackInterval() {
        this.playbackInterval = setInterval(
            () => {
                this.pushEvent(
                    "current-time-video",
                    { "current_time": this.getPlayer().getCurrentTime() },
                )
            }, 1000)
    },
    getPlayer() { return this.player },
    setPlayer() {
        this.player = new YT.Player("existing-iframe-example");

        this.player.addEventListener("onReady", (_event) => {
            document.getElementById("existing-iframe-example").style.borderColor = "#FF6D00";
        });

        this.player.addEventListener("onStateChange", (event) => {
            const playerStatus = event.data
            console.log(`player status changed ${playerStatus}`)

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
                    // this.playbackInterval = setInterval(
                    //     () => {
                    //         // console.log(this.getPlayer().getCurrentTime())
                    //         this.pushEvent("current-time-video", { "current_time": this.getPlayer().getCurrentTime() })
                    //     }, 1000)
                    this.setPlaybackInterval();
                    break;
                case YT.PlayerState.PAUSED:
                    // NOTE: We can use this video state to pause and play videos.
                    // pros: No need to create custom buttons
                    // cons: Longer delay in playing videos
                    // this.pushEvent("pause-video", {});
                    color = "#DD2C00"; // paused = red
                    this.clearPlaybackInterval()
                    break;
                case YT.PlayerState.BUFFERING:
                    color = "#AA00FF"; // buffering = purple

                    this.clearPlaybackInterval()
                    break;
                case YT.PlayerState.CUED:
                    color = "#FF6DOO"; // video cued = orange
                    break;
            }
            if (color) {
                document.getElementById("existing-iframe-example").style.borderColor = color;
            }

        });

        this.player.addEventListener("onError", (event) => {
            console.error(event.data)
        });
    },
    mounted() {
        this.setPlayer();
        this.handleEvent(
            "client-playback-event",
            ({ "action": action }) => {
                console.log(`playback-event event called with action - ${action}}`);
                switch (action) {
                    case "play":
                        this.getPlayer().playVideo();
                        break;
                    case "pause":
                        this.getPlayer().pauseVideo();
                        break;
                }
            }
        )
    }
}

let liveSocket = new LiveSocket("/live", Socket, { hooks: Hooks, params: { _csrf_token: csrfToken } })

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
