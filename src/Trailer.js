import React, { Component } from 'react'
import { get } from 'lodash'
import ReactLoading from 'react-loading'

export class Trailer extends Component {
  state = {
    isFetching: false,
  }
  async componentWillMount() {
    this.setState({ isFetching: true })
    const { icon, watch } = await getTrailer(this.props.movie.movieTitle, this.props.movie.year)
    this.setState({ isFetching: false, icon, watch })
  }

  render() {
    if (this.state.isFetching) return <ReactLoading type="bars" color="#000" />
    return (
      <a target="blank" href={this.state.watch}>
        <img src={this.state.icon} alt="yt" width="240" height="180" />
      </a>
    )
  }
}
const getTrailer = async (name, year) => {
  const searchTerm = name + ' ' + year + ' trailer'
  const url = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyBjnMTlF9ou968qeDBc6LQpN860jJ0Juj0&q=${searchTerm}&part=snippet`
  let f = await fetch(url)
  let json = await f.json()
  const first = json.items[0]
  return {
    icon: get(first, 'snippet.thumbnails.default.url', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg'),
    watch: `https://www.youtube.com/watch?v=${get(first, 'id.videoId', 'dQw4w9WgXcQ')}`,
  }
}
