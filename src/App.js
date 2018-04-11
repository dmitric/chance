import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayColorPickers: true,
      backgroundColor: "#f5f5f5",
      lineColor: "black",
      dimension: 13,
      padding: 50,
      innerPadding: 100,
      lineWidth: 8,
      groups: 4,
      choices: 4,
      running: false,
      debug: false,
      forceSquare: true,
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.decrementDimension())
      .on("swipeup", ev => this.incrementDimension())
      .on("swipeleft", ev => this.decrementLineWidth())
      .on("swiperight", ev => this.incrementLineWidth())
      .on("pinchin", ev => { this.incrementDimension(); this.incrementChoices() } )
      .on("pinchout", ev => { this.decrementDimension(); this.decrementChoices() })
  }

  incrementGroups () {
    this.setState({groups: Math.min(10, this.state.groups + 1) })
  }

  decrementGroups () {
    this.setState({groups: Math.max(1, this.state.groups - 1)})
  }

  incrementChoices () {
    this.setState({choices:  Math.min(10, this.state.choices + 1)})
  }

  decrementChoices () {
    this.setState({choices:  Math.max(1, this.state.choices - 1)})
  }

  incrementDimension () {
    this.setState({dimension: Math.min(40, this.state.dimension + 1)})
  }

  decrementDimension () {
    this.setState({dimension: Math.max(2, this.state.dimension - 1)})
  }

  incrementLineWidth () {
    this.setState({lineWidth: Math.min(30, this.state.lineWidth + 2)})
  }

  decrementLineWidth () {
    this.setState({lineWidth: Math.max(2, this.state.lineWidth - 2)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `radiate.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  generateRandomNumbers (n, m, minRandom) {
    let i = 0
    let randNums = []
    let sum = 0
    
    for (i = 0; i < n; i++) {
      randNums[i] = Math.max(Math.random(), minRandom)
      sum += randNums[i]
    }

    for (i = 0; i < n; i++) {
      randNums[i] /= sum
      randNums[i] *= m
    }

    return randNums;
  }

  getInnerHeight () {
    return this.getActualHeight() - 2*this.state.innerPadding
  }

  getInnerWidth () {
    return this.getActualWidth() - 2*this.state.innerPadding
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    const dim = Math.min(width, height)

    const settings = { width: width, height: height }

    if (this.state.forceSquare) {
      settings.width = dim
      settings.height = dim
    }

    if (width < 500) {
      settings.padding = 0
      settings.innerPadding = 50
      settings.height = width
    } else {
      settings.padding = 50
      settings.innerPadding = 100
    }

    this.setState(settings)
  }

  handleKeydown (ev) {
    if (ev.which === 68 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({debug: !this.state.debug})
    } else if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83) {
      ev.preventDefault()
      if (ev.metaKey || ev.ctrlKey) {
        this.handleSave()
      }
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.decrementGroups()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementDimension()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.incrementGroups()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementDimension()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.decrementLineWidth()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementChoices()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.incrementLineWidth()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementChoices()
    }
  }

  showGrid () {
    const dots = []

    const width = this.getInnerWidth()
    const unitDim = width/(this.state.dimension -1)

    const height = this.getInnerHeight()
    const vunitDim = height/(this.state.dimension -1)

    for (let j = 0; j < this.state.dimension; j++) {
      for (let i=0; i < this.state.dimension; i++) {
        dots.push(<circle cx={i*unitDim + this.state.innerPadding} cy={j*vunitDim + this.state.innerPadding}
                          r={1} stroke={this.state.lineColor} strokeWidth={1} />)
      }
    }

    return dots
  }

  renderCircle (point) {
    return (
      <g key={point.label}>
        <circle r={4} fill="none" id={point.label} cx={point.x} cy={point.y} stroke={"red"} strokeWidth={this.state.lineWidth/4} />
        <text x={point.x} y={point.y} fontSize={2*this.state.lineWidth}>{point.label}</text>
      </g>
    )
  }

  distance (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2) )
  }

  renderLine (line) {
    const dist = this.distance(line.x1, line.y1, line.x2, line.y2)

    const ang = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180 / Math.PI

    let markup = (
      <g>
        <rect x={line.x1} y={line.y1-this.state.lineWidth/4} fill={this.state.lineColor} height={this.state.lineWidth/2} width={dist} />
      </g>
    )


    for (let i=0, bigSpaceStart = 1, smallSpaceStart = 1.5; i < Math.min(4, line.intersections.length) ; i++) {
      let intersectData = line.intersections[i]

      let startPoint = line.x1 // +intersectData.distance
      let lineDist = dist //- intersectData.distance
      
      markup = (
        <g>
          <rect x={startPoint} y={line.y1-smallSpaceStart*this.state.lineWidth - this.state.lineWidth/4} fill={this.state.lineColor} height={this.state.lineWidth/2} width={lineDist} />
          <rect x={startPoint} y={line.y1-bigSpaceStart*this.state.lineWidth -this.state.lineWidth/4} fill={this.state.backgroundColor} height={this.state.lineWidth} width={lineDist} />
          {markup}
        </g>
      )

      bigSpaceStart += 1.5
      smallSpaceStart += 1.5
    }

    return (
      <g key={`${line.group}-${line.order}`}>
        <g transform={`rotate(${ang} ${line.x1} ${line.y1})`}>
          {markup}
        </g>
      </g>
    )
  }

  generateSpiralPoints () {
    const points = []

    const width = this.getInnerWidth()
    const unitDim = width/(this.state.dimension -1)

    const height = this.getInnerHeight()
    const vunitDim = height/(this.state.dimension -1)
    
    let label = 1

    for (let i=0; i < this.state.dimension-1; i++, label++) {
      points.push({x: i * unitDim + this.state.innerPadding, y: this.state.innerPadding, label: label})
    }

    for (let i=0; i < this.state.dimension-1; i++, label++) {
      points.push({x: (this.state.dimension-1) * unitDim + this.state.innerPadding, y: i*vunitDim + this.state.innerPadding, label:label })
    }

    for (let i=this.state.dimension-1; i > 0; i--, label++) {
      points.push({x: i * unitDim + this.state.innerPadding, y: (this.state.dimension-1)*vunitDim + this.state.innerPadding, label: label})
    }

    for (let i=this.state.dimension-1; i > 0; i--, label++) {
      points.push({x: this.state.innerPadding, y: i*vunitDim + this.state.innerPadding, label:label})
    }

    return points
  }

  generateLinePoints (iterations, group) {

    const lines = []

    let spiralPoints = this.generateSpiralPoints()

    let i = 0

    while (i < iterations && spiralPoints.length >= 2) {

      this.shuffle(spiralPoints)

      let a = spiralPoints.shift()
      let b = spiralPoints.shift()

      if (this.distance(a.x, a.y, b.x, b.y) <= this.getInnerWidth()/4) {
        spiralPoints.push(a)
        spiralPoints.push(b)
        continue
      }

      lines.push({x1: a.x, y1:a.y, x2: b.x, y2: b.y, group: group, order: i, intersections:[]})
      
      i++

      spiralPoints = this.generateSpiralPoints()
    }

    return lines

  }

  segmentIntersection(x1,y1,x2,y2, x3,y3,x4,y4) {
      var eps = 0.0000001;
      var between = function (a, b, c) {
        return a-eps <= b && b <= c+eps;
      }
      var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
              ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
      var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
              ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
      if (isNaN(x)||isNaN(y)) {
          return false;
      } else {
          if (x1>=x2) {
              if (!between(x2, x, x1)) {return false;}
          } else {
              if (!between(x1, x, x2)) {return false;}
          }
          if (y1>=y2) {
              if (!between(y2, y, y1)) {return false;}
          } else {
              if (!between(y1, y, y2)) {return false;}
          }
          if (x3>=x4) {
              if (!between(x4, x, x3)) {return false;}
          } else {
              if (!between(x3, x, x4)) {return false;}
          }
          if (y3>=y4) {
              if (!between(y4, y, y3)) {return false;}
          } else {
              if (!between(y3, y, y4)) {return false;}
          }
      }
      return [x, y];
  }

  calculateIntersections (lines) {
    const intersects = []
    
    for (let i=0; i < lines.length - 1; i++) {
      
      let line = lines[i]

      for (let j = i + 1; j < lines.length; j++) {
        // do they intersect? if so where
        let nextLine = lines[j]

        let intersectionOccurs = this.segmentIntersection(
                                        line.x1, line.y1, line.x2, line.y2,
                                        nextLine.x1, nextLine.y1 , nextLine.x2, nextLine.y2)

        if (intersectionOccurs &&
            intersectionOccurs[0] >= this.state.innerPadding && intersectionOccurs[0] <= this.state.innerPadding + this.getInnerWidth() &&
            intersectionOccurs[1] >= this.state.innerPadding && intersectionOccurs[1] <= this.state.innerPadding + this.getInnerHeight()) {
          
          line.intersections.push({
            x: intersectionOccurs[0],
            y: intersectionOccurs[1],
            distance: this.distance(line.x1, line.y1, intersectionOccurs[0], intersectionOccurs[1])
          })
          
          intersects.push(<circle cx={intersectionOccurs[0]} cy={intersectionOccurs[1]} r={this.state.lineWidth*2} fill={"none"} strokeWidth={this.state.lineWidth/2} stroke="red" />)
        }
      }

      line.intersections.sort(function(a, b){
        return a-b
      })
    }
    return intersects
  }

  render() {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    let linePoints = []

    for (let groups = 0; groups < this.state.groups; groups++) {
      linePoints = linePoints.concat(this.generateLinePoints(this.state.choices, groups))
    }

    const renderLinePoints = linePoints.concat([]).reverse()

    let intersects = this.calculateIntersections(renderLinePoints)

    console.log(renderLinePoints)

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.lineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({lineColor: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} />
            {renderLinePoints.map(this.renderLine.bind(this))}
            {this.state.debug ? intersects : null}
            {this.state.debug ? this.generateSpiralPoints().map(this.renderCircle.bind(this)) : null}
          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
