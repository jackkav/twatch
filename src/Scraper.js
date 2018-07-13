import React, { Component } from 'react'
import shortid from 'shortid'
import { pbParse, sanitiseMusic } from './parsers'

import sortBy from 'lodash/sortBy'
import cheerio from 'cheerio'
import fromNow from 'moment-from-now'
import { Trailer } from './Trailer'
import { Metadata } from './Metadata'
import { Introduction, StyledButton } from './components'

const topics = {
  movies: 'aggro.pb.201',
  movieId: '201',
  music: 'aggro.pb.101',
  musicId: '101',
}
export class Scraper extends Component {
  state = { movies: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
  fetch = async () => {
    console.log('loading fresh scrape')
    const movies = (await getPBTagAndMagnetByTopic(topics.movieId)).map(x => ({
      ...x,
      ...pbParse(x.fullTag, topics.movies),
    }))
    setExpiry(topics.movies, movies, 2)

    // console.log(movies)

    this.setState({
      movies: sortBy(movies, 'uploadedAt').reverse(),
      fresh: true,
    })
  }
  fetchMusic = async () => {
    console.log('loading fresh 101 scrape')
    const music = (await getPBTagAndMagnetByTopic(topics.musicId)).map(x => ({
      ...x,
      ...pbParse(x.fullTag, topics.music),
    }))
    console.log('t', music)
    setExpiry(topics.music, music, 2)
    this.setState({
      music: sortBy(music, 'uploadedAt').reverse(),
    })
  }
  async componentWillMount() {
    if (isExpired(topics.movies)) this.fetch()
    else {
      console.log('loading cached pb scrape')
      this.setState({
        movies: JSON.parse(localStorage.getItem(topics.movies)),
        fresh: false,
      })
    }

    if (isExpired(topics.music)) this.fetchMusic()
    else {
      console.log('loading cached pb 101 scrape')
      this.setState({
        music: JSON.parse(localStorage.getItem(topics.music)),
      })
    }
  }

  render() {
    return <Main movies={this.state.movies} music={this.state.music} />
  }
}

class Main extends Component {
  state = { showAll: false, locked: true, canSeeMusic: false }
  toggleQuality = () => this.setState(p => ({ showAll: !p.showAll }))
  toggleMedia = () => this.setState(p => ({ canSeeMusic: !p.canSeeMusic }))
  unlock = () => {
    this.setState({ locked: false })
    localStorage.setItem('unlocked', 'true')
  }
  componentWillMount() {
    if (localStorage.getItem('unlocked')) this.setState({ locked: false })
  }
  render() {
    return (
      <div className="pa2 bg-gray avenir">
        <Header
          unlock={this.unlock}
          locked={this.state.locked}
          toggleQuality={this.toggleQuality}
          showAll={this.state.showAll}
          toggleMedia={this.toggleMedia}
          canSeeMusic={this.state.canSeeMusic}
        />
        {this.state.canSeeMusic
          ? sortBy(this.props.music, 'uploadedAt')
              .reverse()
              .map(x => <ListElement key={shortid.generate()} movie={x} locked={this.state.locked} />)
          : this.props.movies[0] === 1
            ? this.props.movies.map(x => <ListElementSkeleton key={shortid.generate()} />)
            : sortBy(this.props.movies, 'uploadedAt')
                .reverse()
                .filter(x => this.state.showAll || x.hd)
                .map(x => <ListElement key={shortid.generate()} movie={x} locked={this.state.locked} />)}
      </div>
    )
  }
}
class Header extends Component {
  state = {
    expanded: false,
  }
  open = () => this.setState(p => ({ expanded: !p.expanded }))

  render() {
    return (
      <div>
        <div className="flex bg-washed-green black" onClick={this.open}>
          <div className="outline w-100 tc">
            <Introduction />
          </div>
        </div>
        {this.state.expanded && (
          <HeaderMenu
            unlock={this.props.unlock}
            locked={this.state.locked}
            toggleQuality={this.props.toggleQuality}
            showAll={this.props.showAll}
            toggleMedia={this.props.toggleMedia}
            canSeeMusic={this.props.canSeeMusic}
          />
        )}
      </div>
    )
  }
}

class HeaderMenu extends Component {
  state = { last: null }
  componentWillMount() {
    const scrapeKey = 'aggro.pb.201.lastScrape'
    const expires = localStorage.getItem(scrapeKey)
    this.setState({
      expires,
    })
  }

  render() {
    return (
      <div className="flex flex-wrap bg-washed-green items-start pa3">
        {this.props.locked && <StyledButton onClick={this.props.unlock}>Don't Press This Button</StyledButton>}
        <StyledButton onClick={this.props.toggleMedia}>
          {this.props.canSeeMusic ? 'Show Movies' : 'Show Music'}
        </StyledButton>
        {this.props.canSeeMusic || (
          <StyledButton onClick={this.props.toggleQuality}>
            {this.props.music ? 'Only show HD' : 'Show all'}
          </StyledButton>
        )}
        {/* <div className="pa2">
          <div>Cache expires: {fromNow(this.state.expires)}</div>
        </div> */}
      </div>
    )
  }
}
const ListElementSkeleton = () => (
  <div>
    <div className="flex bg-washed-green black">
      <div className="outline w-100 pa3">
        <div className="fl bg-light-gray light-gray br2">........... .............. ................ ..........</div>
        <div className="fr bg-light-gray light-gray br2">........</div>
      </div>
    </div>
  </div>
)

class ListElement extends Component {
  state = {
    expanded: false,
  }
  open = () => this.setState(p => ({ expanded: !p.expanded }))

  render() {
    const selected = this.state.expanded
      ? 'bg-dark-green white '
      : 'bg-washed-green black bg-animate hover-bg-dark-green hover-white'
    return (
      <div>
        <div className={'flex ' + selected} onClick={this.open}>
          <div className="outline w-100 pa3">
            <div className="bg-animate hover-bg-dark-green">
              <div className="fl">
                {this.props.movie.movieTitle || sanitiseMusic(this.props.movie.title)} [{fromNow(
                  this.props.movie.uploadedAt
                )}]
              </div>
              {this.props.locked || (
                <div className="fr">{this.props.movie.movieTitle && (this.props.movie.hd ? 'HD' : 'CAM')}</div>
              )}
            </div>
          </div>
        </div>
        {this.state.expanded && <InnerRow movie={this.props.movie} locked={this.props.locked} />}
      </div>
    )
  }
}
const LabelRow = ({ children }) => <div className="pa1">{children}</div>
class InnerRow extends Component {
  render() {
    return (
      <div className="flex flex-wrap bg-washed-green items-start">
        {!this.props.locked && (
          <div className="w-1 pa3">
            <LabelRow>Name: {this.props.movie.title}</LabelRow>
            <LabelRow>Released: {fromNow(this.props.movie.uploadedAt)}</LabelRow>
            <LabelRow>Position: #{this.props.movie.index + 1}</LabelRow>
            <LabelRow>Quality: {this.props.movie.quality}</LabelRow>
            <LabelRow>Size: {this.props.movie.size}</LabelRow>
            <StyledButton href={this.props.movie.magnet}>Download</StyledButton>
          </div>
        )}
        <div className="w-1 pa3">
          <Trailer movie={this.props.movie} />
        </div>
        <div className=" w-1 pa3">{this.props.movie.movieTitle && <Metadata movie={this.props.movie} />}</div>
      </div>
    )
  }
}
const getPBTagAndMagnetByTopic = async id => {
  let cors = 'https://cors-anywhere.herokuapp.com/'
  let f = await fetch(cors + 'thepiratebay.rocks/top/' + id)
  console.log(f.status)
  if (f.status !== 200) f = await fetch(cors + 'pirateproxy.sh/top/' + id)
  if (f.status !== 200) f = await fetch(cors + 'thepiratebay.red/top/' + id)
  if (f.status !== 200) f = await fetch(cors + 'thepiratebay.org/top/' + id)
  if (!f.ok) {
    return
  }

  const body = await f.text()
  const $ = cheerio.load(body)

  const s = []
  let index = 0
  $('a[title="Download this torrent using magnet"]').each((a, item) => {
    //console.log(item)
    const magnet = item.attribs.href
    const fullTag = $(item)
      .parent()
      .text()
    let url = ''
    const url1 = $(item)
      .parent()
      .find('.detName a')
    if (url1.length) url = url1[0].attribs.href
    // else console.log('hmm', item)
    const id = magnet.match(/(?![magnet:?xt=urn:btih:])(.*)(?=&dn)/)[0]

    const newItem = {
      id,
      magnet,
      url,
      fullTag,
      index,
    }
    // console.log(newItem)
    index++
    s.push(newItem)
  })
  return s
}

export const setExpiry = (key, value, hours = 1) => {
  if (!value || !value.length) return
  let today = new Date()
  today.setHours(today.getHours() + hours)
  localStorage.setItem(key + '.lastScrape', today.toISOString())
  localStorage.setItem(key, JSON.stringify(value))
}
export const isExpired = key => {
  const expire = localStorage.getItem(key + '.lastScrape')
  const value = localStorage.getItem(key)
  if (!expire || !value) return true
  const expiryTime = new Date(expire)
  let today = new Date()
  console.log(key + ' has Expired', today > expiryTime)
  return today > expiryTime
}
