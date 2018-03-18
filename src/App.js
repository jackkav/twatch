import React, { Component } from 'react'
import shortid from 'shortid'
import { pbParse } from './parsers'
import { get, sortBy } from 'lodash'
import cheerio from 'cheerio'
import moment from 'moment'
import 'tachyons'

class App extends Component {
  state = { movies: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
  async componentWillMount() {
    const scrapeKey = 'aggro.pb.201'
    if (!isExpired(scrapeKey)) {
      console.log('loading cached pb scrape')
      this.setState({
        movies: JSON.parse(localStorage.getItem(scrapeKey)),
        fresh: false,
      })
      return
    }
    console.log('loading fresh pb scrape')
    const movies = await getPB()
    console.log(movies)
    this.setState({
      movies,
      fresh: true,
    })
    setExpiry(scrapeKey, movies, 12)
  }

  render() {
    return <FlexTable movies={this.state.movies} />
  }
}

export default App
class FlexTable extends Component {
  render() {
    return (
      <div className="pa2 bg-gray">
        {sortBy(this.props.movies, x => moment(x))
          .reverse()
          .map(x => <OuterRow key={shortid.generate()} movie={x} />)}
      </div>
    )
  }
}
class OuterRow extends Component {
  state = {
    expanded: false,
  }
  open = () => this.setState(p => ({ expanded: !p.expanded }))

  render() {
    console.log(this.props.movie.uploadedAt)
    if (!this.props.movie.title) {
      return (
        <div>
          <div className="flex">
            <div className="outline w-100 pa3">
              <code className="bg-light-gray light-gray">
                .................................. ...........................
              </code>
            </div>
          </div>
        </div>
      )
    }
    const className = this.props.movie.hd ? 'white' : 'gray'
    return (
      <div>
        <div className="flex bg-lightest-blue black" onClick={this.open}>
          <div className="outline w-100 pa3">
            <code>{this.props.movie.movieTitle}</code>
            <code className="fr">{this.props.movie.hd ? 'HD' : 'CAM'}</code>
          </div>
        </div>
        {this.state.expanded && <InnerRow movie={this.props.movie} />}
      </div>
    )
  }
}
class InnerRow extends Component {
  render() {
    return (
      <div className="flex flex-wrap bg-white items-start">
        <div className=" w-1 pa3">
          <Trailer movie={this.props.movie} />
        </div>
        <div className=" w-1 pa3">
          <div>Name: {this.props.movie.title}</div>
          <div>Released: {this.props.movie.uploadedAt.slice(0, 10)}</div>
          <div>Position: #{this.props.movie.index + 1}</div>
          <div>Quality: {this.props.movie.quality}</div>
          <div>
            Download: <a href={this.props.movie.magnet}>Here</a>
          </div>
        </div>
        <div className=" w-1 pa3">
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
    if (!this.state.imdbRating)
      return (
        <div>
          <div>
            IMDB: <code className="bg-light-gray light-gray">7.5</code>
          </div>
          <div>
            Metascore: <code className="bg-light-gray light-gray">7.5</code>
          </div>
          <div>
            Genre: <code className="bg-light-gray light-gray">Comedy, Crime, Mystery</code>
          </div>
          <div>
            Actors:
            <code className="bg-light-gray light-gray">
              Jason Bateman, Rachel McAdams, Kyle Chandler, Sharon Horgan
            </code>
          </div>
          <div>
            Plot:
            <code className="bg-light-gray light-gray">
              A group of friends who meet regularly for game nights find themselves trying to solve a murder mystery.
            </code>
          </div>
        </div>
      )
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
    // if (this.state.isFetching) return <div>loading</div>
    return (
      <a target="blank" href={this.state.watch}>
        <img
          src={this.state.icon || 'http://icons.iconarchive.com/icons/dtafalonso/android-lollipop/72/Youtube-icon.png'}
          alt="yt"
          width="120"
          height="90"
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
const getPB = async () => {
  let cors = 'https://cors-anywhere.herokuapp.com/'
  let f = await fetch(cors + 'thepiratebay.rocks/top/201')
  if (f.status === 404) f = await fetch(cors + 'thepiratebay.org/top/201')
  if (!f.ok) {
    return
  }
  const body = await f.text()
  const $ = cheerio.load(body)

  const s = []
  let index = 0
  $('a[title="Download this torrent using magnet"]').each((a, item) => {
    const magnet = item.attribs.href
    const fullTag = $(item)
      .parent()
      .text()
    const url = $(item)
      .parent()
      .find('.detName a')[0].attribs.href
    const id = magnet.match(/(?![magnet:?xt=urn:btih:])(.*)(?=&dn)/)[0]
    const p = pbParse(fullTag)
    const newItem = {
      id,
      magnet,
      url,
      ...p,
      index,
    }
    index++
    s.push(newItem)
  })
  return s
}
export const setExpiry = (key, value, hours = 1) => {
  localStorage.setItem(
    key + '.lastScrape',
    moment()
      .add(hours, 'hour')
      .format()
  )
  localStorage.setItem(key, JSON.stringify(value))
}
export const isExpired = key => {
  const expire = localStorage.getItem(key + '.lastScrape')
  const value = localStorage.getItem(key)
  if (!expire || !value) return true
  console.log(key + ' has Expired', moment().isAfter(expire))
  return moment().isAfter(expire)
}
