import React, { Component } from 'react'
import shortid from 'shortid'
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
        <OuterRow full="A 2018 HDRip XviD AC3-EVO[EtMovies]" />
        <OuterRow full="B W 2018 HDRip XviD AC3-EVO" />
        <OuterRow full="T R 2018 ENG HDCAM XViD-AKOAM" />
      </div>
    )
  }
}
class OuterRow extends Component {
  state = {
    expanded: true,
  }
  open = () => this.setState(p => ({ expanded: !p.expanded }))
  render() {
    return (
      <div>
        <div class="flex dim" onClick={this.open}>
          <div class="outline w-100 pa3">
            <code>{this.props.full || 'Not available'}</code>
          </div>
        </div>
        {this.state.expanded && <InnerRow />}
      </div>
    )
  }
}
class InnerRow extends Component {
  render() {
    return (
      <div class="flex flex-wrap items-start">
        <div class="outline w-1 pa3">
          <a target="blank" href="https://www.youtube.com/watch?v=2w5VZmos5I4">
            <img src="https://i.ytimg.com/vi/2w5VZmos5I4/default.jpg" alt="yt" />
          </a>
        </div>
        <div class="outline w-1 pa3">
          <div>Released: 12-12-12</div>
          <div>Position: #1</div>
          <div>Quality: CAM</div>
          <div>IMDB: 7.7</div>
          <div>Metascore: 7.7</div>
        </div>
        <div class="outline w-1 pa3">
          <div>Actors: Someone Something</div>
          <div>Description: Lorum ipsum dora sit Lorum ipsum dora sit</div>
        </div>
      </div>
    )
  }
}
