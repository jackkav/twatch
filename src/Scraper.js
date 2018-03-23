import React, { Component } from 'react'
import shortid from 'shortid'
import { pbParse } from './parsers'
import { sortBy } from 'lodash'
import cheerio from 'cheerio'
import moment from 'moment'
import fromNow from 'moment-from-now'
import { Trailer } from './Trailer'
import { Metadata } from './Metadata'

export class Scraper extends Component {
  state = { movies: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }
  fetch = async () => {
    console.log('loading fresh scrape')
    const movies = await getPB()
    // console.log(movies)

    this.setState({
      movies: sortBy(movies, 'uploadedAt').reverse(),
      fresh: true,
    })

    const scrapeKey = 'aggro.pb.201'
    setExpiry(scrapeKey, movies, 2)
  }
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
    this.fetch()
  }

  render() {
    return <Main movies={this.state.movies} />
  }
}

class Main extends Component {
  state = { showAll: true }
  toggle = () => this.setState(p => ({ showAll: !p.showAll }))
  render() {
    return (
      <div className="pa2 bg-gray avenir">
        <Header toggle={this.toggle} showAll={this.state.showAll} />
        {sortBy(this.props.movies, 'uploadedAt')
          .reverse()
          .filter(x => this.state.showAll || x.hd)
          .map(x => <OuterRow key={shortid.generate()} movie={x} />)}
      </div>
    )
  }
}
const Introduction = () => (
  <article class="mw7 center ph3 ph5-ns tc br2 pv5 bg-washed-green dark-green mb5">
    <h1 class="fw6 f3 f2-ns lh-title mt0 mb3">Welcome</h1>
    <h2 class="fw2 f4 lh-copy mt0 mb3">The following is a list of the most popular content available.</h2>
    <p class="fw1 f5 mt0 mb3">Come back often and see what else is new.</p>
  </article>
)
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
        {this.state.expanded && <Inner toggle={this.props.toggle} showAll={this.props.showAll} />}
      </div>
    )
  }
}

const StyledButton = ({ onClick, href, children }) => (
  <div className="" onClick={onClick}>
    <a
      href={href || '#'}
      class="f6 br-pill bg-dark-green no-underline washed-green ba b--dark-green grow pv2 ph3 dib mr3"
    >
      {children}
    </a>
  </div>
)
class Inner extends Component {
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
        <StyledButton onClick={this.props.toggle}>{this.props.showAll ? 'Only show HD' : 'Show all'}</StyledButton>
        <div className="pa2">
          <div>Next refresh: {fromNow(this.state.expires)}</div>
        </div>
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
    if (!this.props.movie.title) {
      return (
        <div>
          <div className="flex bg-washed-green black">
            <div className="outline w-100 pa3">
              <div className="fl bg-dark-green dark-green">.......................................</div>
              <div className="fr bg-dark-green dark-green">....</div>
            </div>
          </div>
        </div>
      )
    }
    // console.log(this.props.movie.movieTitle, this.props.movie.uploadedAt)
    const selected = this.state.expanded ? 'bg-dark-green white' : 'bg-washed-green black'
    return (
      <div>
        <div className={'flex ' + selected} onClick={this.open}>
          <div className="outline w-100 pa3">
            <div className="dim">
              <div className="fl">
                {this.props.movie.movieTitle} [{fromNow(this.props.movie.uploadedAt)}]
              </div>
              <div className="fr">{this.props.movie.hd ? 'HD' : 'CAM'}</div>
            </div>
          </div>
        </div>
        {this.state.expanded && <InnerRow movie={this.props.movie} />}
      </div>
    )
  }
}
const LabelRow = ({ children }) => <div className="pa1">{children}</div>
class InnerRow extends Component {
  render() {
    return (
      <div className="flex flex-wrap bg-washed-green items-start">
        <div className="w-1 pa3">
          <LabelRow>Name: {this.props.movie.title}</LabelRow>
          <LabelRow>Released: {fromNow(this.props.movie.uploadedAt)}</LabelRow>
          <LabelRow>Position: #{this.props.movie.index + 1}</LabelRow>
          <LabelRow>Quality: {this.props.movie.quality}</LabelRow>
          <LabelRow>Size: {this.props.movie.size}</LabelRow>
          <StyledButton href={this.props.movie.magnet}>Download</StyledButton>
        </div>
        <div className="w-1 pa3">
          <Trailer movie={this.props.movie} />
        </div>
        <div className=" w-1 pa3">
          <Metadata movie={this.props.movie} />
        </div>
      </div>
    )
  }
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
