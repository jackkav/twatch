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
    if (this.state.Error) return <div>{this.state.Error}</div>
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

const getOmdb = async (name, year) => {
  let cors = 'https://cors-anywhere.herokuapp.com/'
  let f = await fetch(`${cors}www.omdbapi.com/?apikey=6cf170d0&t=${name}&y=${year}`)
  if (!f.response) {
    console.log(f, name, year)
    if (f.status === 200) return { Error: 'Movie not found' }
    if (f.status === 404) return { Error: 'Omdb is down' }
  }
  let json = await f.json()
  // console.log('l', json)
  return json
}
