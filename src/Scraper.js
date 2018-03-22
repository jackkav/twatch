import React, { Component } from 'react'
import shortid from 'shortid'
import { pbParse } from './parsers'
import { sortBy } from 'lodash'
import cheerio from 'cheerio'
import moment from 'moment'
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
    return <FlexTable movies={this.state.movies} />
  }
}

class FlexTable extends Component {
  state = { showAll: true }
  toggle = () => this.setState(p => ({ showAll: !p.showAll }))
  render() {
    return (
      <div className="pa2 bg-gray">
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
    <h1 class="fw6 f3 f2-ns lh-title mt0 mb3">This is a tagline. For x.</h1>
    <h2 class="fw2 f4 lh-copy mt0 mb3">
      This will change things. And we want you to be involved. This text needs to be longer for testing sake.
    </h2>
    <p class="fw1 f5 mt0 mb3">Sign up for beta access or learn more about x.</p>
    <div>
      <a class="f6 br-pill bg-dark-green no-underline washed-green ba b--dark-green grow pv2 ph3 dib mr3" href="#">
        Sign Up
      </a>
      <a class="f6 br-pill dark-green no-underline ba grow pv2 ph3 dib" href="#">
        Learn More
      </a>
    </div>
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
        <div className="flex bg-lightest-blue black" onClick={this.open}>
          <div className="outline w-100 tc">
            <h1>Pastybay</h1>
          </div>
        </div>
        {this.state.expanded && <Inner toggle={this.props.toggle} showAll={this.props.showAll} />}
      </div>
    )
  }
}
const StyledButton = ({ onClick, href, children }) => (
  <div className="" onClick={onClick}>
    <a href={href || '#'} class="no-underline pa3 f6 tc db w-100 bg-animate bg-blue hover-bg-dark-blue white br2">
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
      <div className="flex flex-wrap bg-white items-start pa3">
        <StyledButton onClick={this.props.toggle}>{this.props.showAll ? 'Only show HD' : 'Show all'}</StyledButton>
        <div className="pa2">
          <code>Next refresh: {moment(this.state.expires).fromNow()}</code>
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
          <div className="flex bg-lightest-blue black">
            <div className="outline w-100 pa3">
              <code className="bg-light-blue light-blue">......................</code>
              <code className="fr bg-light-blue light-blue">....</code>
            </div>
          </div>
        </div>
      )
    }
    // console.log(this.props.movie.movieTitle, this.props.movie.uploadedAt)
    return (
      <div>
        <div className="flex bg-lightest-blue black" onClick={this.open}>
          <div className="outline w-100 pa3">
            <div className="dim">
              <code>
                {this.props.movie.movieTitle} [{moment(this.props.movie.uploadedAt).fromNow()}]
              </code>
              <code className="fr">{this.props.movie.hd ? 'HD' : 'CAM'}</code>
            </div>
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
        <div className="w-1 pa3">
          <Trailer movie={this.props.movie} />
        </div>
        <div className="w-1 pa3">
          <div>Name: {this.props.movie.title}</div>
          <div>Released: {moment(this.props.movie.uploadedAt).fromNow()}</div>
          <div>Position: #{this.props.movie.index + 1}</div>
          <div>Quality: {this.props.movie.quality}</div>
          <div>Size: {this.props.movie.size}</div>
          <StyledButton href={this.props.movie.magnet}>Download</StyledButton>
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
