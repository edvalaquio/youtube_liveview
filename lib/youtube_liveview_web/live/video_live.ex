defmodule YoutubeLiveviewWeb.VideoLive do
  use YoutubeLiveviewWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    assigns = [
      data: "",
      embedded_link: ""
    ]

    {:ok, assign(socket, assigns)}
  end

  @impl true
  def handle_event("load-video", %{"data" => data}, socket) do
    assigns = [
      data: data,
      embedded_link: create_embedded_link(data)
    ]

    IO.inspect(create_embedded_link(data), label: "embedded_link")
    {:noreply, assign(socket, assigns)}
  end

  defp create_embedded_link(data) do
    [match] = Regex.run(~r/[\d\w]{11}/, data)
    # IO.inspect(match, label: "match")
    "https://www.youtube.com/embed/#{match}"
  end
end
