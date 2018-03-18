import React, { Component } from 'react'

export class Metadata extends Component {
  state = {
    isFetching: false,
    imdbRating: '',
  }

  async componentWillMount() {
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
