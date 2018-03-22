import React, { Component } from 'react'

export class Metadata extends Component {
  state = {
    isFetching: false,
    imdbRating: '',
  }

  async componentWillMount() {
    this.setState({ isFetching: true })
    const { imdbRating, Actors, Metascore, Genre, Plot, Error } = await getOmdb(
      this.props.movie.movieTitle,
      this.props.movie.year
    )
    if (!Error) this.setState({ isFetching: false, imdbRating, Actors, Metascore, Genre, Plot, Error: null })
    else this.setState({ isFetching: false, Error })
  }

  render() {
    if (this.state.Error)
      return (
        <div class="flex w-100 items-center justify-center pa4 bg-lightest-blue navy">
          <svg class="w1" data-icon="info" viewBox="0 0 32 32">
            <title>info icon</title>
            <path d="M16 0 A16 16 0 0 1 16 32 A16 16 0 0 1 16 0 M19 15 L13 15 L13 26 L19 26 z M16 6 A3 3 0 0 0 16 12 A3 3 0 0 0 16 6" />
          </svg>
          <span class="lh-title ml3">{this.state.Error}</span>
        </div>
      )
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
            <code className="bg-light-gray light-gray">...............................</code>
          </div>
          <div>
            Plot:
            <code className="bg-light-gray light-gray">.....................</code>
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

const getOmdb = async (name, year) => {
  let cors = 'https://cors-anywhere.herokuapp.com/'
  let f = await fetch(`${cors}www.omdbapi.com/?apikey=6cf170d0&t=${name}&y=${year}`)
  if (f.status === 404) return { Error: 'Omdb is down' }
  let json = await f.json()
  console.log('l', json)
  return json
}
