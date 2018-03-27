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
    if (this.state.isFetching)
      return (
        <div className="bg-black" style={{ width: 240, height: 180 }}>
          <ReactLoading type="bars" color="#FFF" />
        </div>
      )
    return (
      <div className="bg-black" style={{ width: 240, height: 180 }}>
        <a target="blank" href={this.state.watch}>
          <img src={this.state.icon} alt="yt" width="240" height="180" />
        </a>
      </div>
    )
  }
}
const getTrailer = async (name, year) => {
  const searchTerm = name + ' ' + year + ' trailer'
  let cors = 'https://cors-anywhere.herokuapp.com/'
  let f = await fetch(
    `${cors}https://www.googleapis.com/youtube/v3/search?key=AIzaSyBjnMTlF9ou968qeDBc6LQpN860jJ0Juj0&q=${searchTerm}&part=snippet`
  )
  // console.log(f)
  let json = await f.json()
  const items = get(json, 'items')
  let first = {}
  if (items.length) first = items[0]
  return {
    icon: get(first, 'snippet.thumbnails.default.url', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg'),
    watch: `https://www.youtube.com/watch?v=${get(first, 'id.videoId', 'dQw4w9WgXcQ')}`,
  }
}
