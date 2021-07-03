defmodule YoutubeLiveviewWeb.PageLiveTest do
  use YoutubeLiveviewWeb.ConnCase

  import Phoenix.LiveViewTest

  test "disconnected and connected render", %{conn: conn} do
    assert {:error, {:redirect, %{to: "/video"}}} = live(conn, "/")
  end
end
