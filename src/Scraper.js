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
    // console.log(movies)
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

class FlexTable extends Component {
  state = { showCAM: true }
  toggle = () => this.setState(p => ({ showCAM: !p.showCAM }))
  render() {
    return (
      <div className="pa2 bg-gray">
        <Header toggle={this.toggle} />
        {sortBy(this.props.movies, x => moment(x))
          .filter(x => (this.state.showCAM ? true : x.hd))
          .reverse()
          .map(x => <OuterRow key={shortid.generate()} movie={x} />)}
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
        <div className="flex bg-lightest-blue black" onClick={this.open}>
          <div className="outline w-100 pa3 tc">
            <code>Pastybay</code>
          </div>
        </div>
        {this.state.expanded && <Inner toggle={this.props.toggle} />}
      </div>
    )
  }
}
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
      <div className="flex flex-wrap bg-white items-start">
        <div className="w-1 pa3">
          <code>Next refresh: {moment(this.state.expires).fromNow()}</code>
        </div>
        <div className="w-1 pa3 grow">
          <code onClick={this.props.toggle}>Only show HD</code>
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
    return (
      <div>
        <div className="flex bg-lightest-blue black" onClick={this.open}>
          <div className="outline w-100 pa3">
            <div className="grow">
              <code>{this.props.movie.movieTitle}</code>
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
