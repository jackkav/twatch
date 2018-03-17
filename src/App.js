import React, { Component } from 'react'
import shortid from 'shortid'
import { pbParse } from './parsers'
import { get } from 'lodash'
import 'tachyons'

class App extends Component {
  render() {
    return <FlexTable />
  }
}

export default App
class FlexTable extends Component {
  render() {
    return (
      <div className="pa2">
        <OuterRow
          key={shortid.generate()}
          full="Rade Blunner 2049.HDRip.XviD.AC3-EVO\n\n\t\t\tUploaded 03-23 2016, Size 3.48 GiB, ULed by  condors369 \n\t\t"
        />

        <OuterRow
          key={shortid.generate()}
          full="Sonu Ke Titu Ki Sweety (2018) Hindi 720p DVDRip PRE x264 AAC \n\n\t\t\tUploaded 11-20 04:08, Size 284.93 MiB, ULed by  makintos13 \n\t\t"
        />
      </div>
    )
  }
}
class OuterRow extends Component {
  state = {
    expanded: false,
    movie: {},
  }
  open = () => this.setState(p => ({ expanded: !p.expanded }))

  componentWillMount() {
    const movie = pbParse(this.props.full)
    this.setState({ movie })
    console.log(movie)
  }

  render() {
    return (
      <div>
        <div className="flex dim" onClick={this.open}>
          <div className="outline w-100 pa3">
            <code>{this.state.movie.title || 'Not available'}</code>
          </div>
        </div>
        {this.state.expanded && <InnerRow movie={this.state.movie} />}
      </div>
    )
  }
}
class InnerRow extends Component {
  render() {
    return (
      <div className="flex flex-wrap items-start">
        <div className="outline w-1 pa3">
          <Trailer movie={this.props.movie} />
        </div>
        <div className="outline w-1 pa3">
          <div>Released: {this.props.movie.uploadedAt.slice(0, 10)}</div>
          <div>Position: #1</div>
          <div>Quality: {this.props.movie.quality}</div>
        </div>
        <div className="outline w-1 pa3">
          <Scores movie={this.props.movie} />
        </div>
      </div>
    )
  }
}
class Scores extends Component {
  state = {
    isFetching: false,
    imdbRating: '',
  }

  async componentWillMount() {
    console.log('t')
    this.setState({ isFetching: true })
    const { imdbRating, Actors, Metascore, Genre, Plot } = await getOmdb(
      this.props.movie.movieTitle,
      this.props.movie.year
    )
    this.setState({ isFetching: false, imdbRating, Actors, Metascore, Genre, Plot })
  }

  render() {
    if (this.state.isFetching) return <div>loading</div>
    return (
      <div>
        <div>IMDB: {this.state.imdbRating}</div>
        <div>Metascore: {this.state.Metascore}</div>
        <div>Genre: {this.state.Genre}</div>
        <div>Actors: {this.state.Actors}</div>
        <div>Plot: {this.state.Plot}</div>
      </div>
    )
  }
}

class Trailer extends Component {
  state = {
    isFetching: false,
  }
  async componentWillMount() {
    this.setState({ isFetching: true })
    const { icon, watch } = await getTrailer(this.props.movie.movieTitle, this.props.movie.year)
    this.setState({ isFetching: false, icon, watch })
  }

  render() {
    if (this.state.isFetching) return <div>loading</div>
    return (
      <a target="blank" href={this.state.watch}>
        <img
          src={this.state.icon || 'http://icons.iconarchive.com/icons/dtafalonso/android-lollipop/72/Youtube-icon.png'}
          alt="yt"
        />
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
const getOmdb = async (name, year) => {
  const url = `http://www.omdbapi.com/?apikey=6cf170d0&t=${name}&y=${year}`
  let f = await fetch(url)
  if (!f.response) {
    console.log(f.Error, name, year)
  }
  let json = await f.json()
  console.log('l', json)
  return json
}
