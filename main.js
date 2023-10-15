import './style.css'
import 'uno.css'
import metro from './metro.json'
import { Heap } from 'heap-js'

const metroSvg = document.querySelector('svg')

function calcTransferStatios() {
  const stations = []
  const transferStations = []
  metro.line.forEach((line) => {
    line.stations.forEach((station) => {
      if(stations.find((s) => s.position.join('') === station.position.join(''))) {
        transferStations.push(station)
      } else {
        stations.push(station)
      }
    })
  })
  return [stations, transferStations]
}
const [stations, transferStations] = calcTransferStatios()

function caleMetroGraph() {
  const graph = {}
  metro.line.forEach((line) => {
    line.stations.forEach((station, index, stations) => {
      const connectStations = index === 0 ? [stations[index+1].name] : index === stations.length - 1 ? [stations[index - 1].name] : [stations[index - 1].name, stations[index + 1].name]
      if(graph[station.name] === undefined) {
        graph[station.name] = connectStations
      } else {
        graph[station.name] = [...graph[station.name], ...connectStations]
      }
    })
  })
  return graph
}
const graph = caleMetroGraph()

function drawMetroGraphSvg() {
  const fragment = document.createDocumentFragment()

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bgRect.setAttribute('width', '2000')
  bgRect.setAttribute('height', '1115')
  bgRect.setAttribute('x', '0')
  bgRect.setAttribute('y', '0')
  bgRect.setAttribute('fill', '#ffffff')
  fragment.append(bgRect)

  metro.line.forEach((line) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-linename', `${line.name}`)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', line.color)
    path.setAttribute('stroke-width', '10')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
  
    const d = line.stations.map((s, i) => {
      return `${i === 0 ? 'M' : 'L'} ${s.position.join(',')}`
    }).join('\n')
    path.setAttribute('d', d)
  
    g.append(path)
  
    line.stations.forEach((s) => {
      const sg = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  
      const x = s.position[0]
      const y = s.position[1]
  
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.textContent = s.name
      text.setAttribute('x', x)
      text.setAttribute('y', y)
      text.setAttribute('dominant-baseline', 'middle')
      text.setAttribute('text-anchor', 'middle')
      let fontSize = 14
  
      if(transferStations.find((ts) => ts.position.join('') === s.position.join(''))) {
        fontSize = 20
  
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
        ellipse.setAttribute('cx', x)
        ellipse.setAttribute('cy', y)
        ellipse.setAttribute('rx', '8')
        ellipse.setAttribute('fill', '#ffffff')
        ellipse.setAttribute('stroke', '#000000')
        ellipse.setAttribute('stroke-width', '1')
        sg.append(ellipse)
      } else {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', x)
        circle.setAttribute('cy', y)
        circle.setAttribute('r', '4')
        circle.setAttribute('fill', '#ffffff')
        sg.append(circle)
      }
  
      text.setAttribute('font-size', fontSize)
  
      if(s.namepos === 't') {
        text.setAttribute('transform', `translate(0,-${fontSize+8})`)
      } else if (s.namepos === 'b') {
        text.setAttribute('transform', `translate(0,${fontSize+8})`)
      } else if (s.namepos === 'l') {
        text.setAttribute('transform', `translate(-${fontSize*s.name.length/2+fontSize},0)`)
      } else if (s.namepos === 'r') {
        text.setAttribute('transform', `translate(${fontSize*s.name.length/2+fontSize},0)`)
      } else if (s.namepos === 'tr') {
        text.setAttribute('transform', `translate(${fontSize*s.name.length/2+fontSize/4},-${fontSize})`)
      } else if (s.namepos === 'tl') {
        text.setAttribute('transform', `translate(-${fontSize*s.name.length/2+fontSize/4},-${fontSize})`)
      } else if (s.namepos === 'br') {
        text.setAttribute('transform', `translate(${fontSize*s.name.length/2+fontSize/4},${fontSize})`)
      } else if (s.namepos === 'bl') {
        text.setAttribute('transform', `translate(-${fontSize*s.name.length/2+fontSize/4},${fontSize})`)
      }
      sg.append(text)
      sg.classList.add('station')
      sg.setAttribute('data-station', s.name)
      sg.style.color = line.color
  
      const ciecel = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      ciecel.setAttribute('cx', x)
      ciecel.setAttribute('cy', y)
      ciecel.setAttribute('r', '25')
      ciecel.setAttribute('fill', 'transparent')
      sg.append(ciecel)
  
      g.append(sg)
    })
  
    fragment.append(g)
  })

  metroSvg.append(fragment)
}
drawMetroGraphSvg()

function dijkstra(startStation, endStation) {
  /* // DFS
  const stack = []
  stack.push(startStation.name)
  const seen = []
  seen.push(startStation.name)
  const parents = {[startStation.name]:null}

  while(stack.length > 0) {
    const vertex = stack.pop()
    console.log(vertex)
    const nodes = graph[vertex]
    for (const node of nodes) {
      if(!seen.includes(node)) {
        stack.push(node)
        seen.push(node)
        parents[node] = vertex
      } 
    }
  }

  const paths = []
  let key = endStation.name
  console.log(parents)
  while(key !== startStation.name) {
    console.log(key)
    paths.unshift(key)
    key = parents[key]
  }
  paths.unshift(startStation.name)
  paths.reverse()
  console.log(paths) */

  const heapq = new Heap((a, b) => a.distance - b.distance)
  heapq.push({
    name: startStation.name,
    distance: 0,
  })
  const seen = []
  const parents = { [startStation.name]: null }
  const distance = {}
  Object.keys(graph).forEach((key) => {
    if(key === startStation.name) {
      distance[key] = 0
    } else {
      distance[key] = Infinity
    }
  })

  while(heapq.length !== 0) {
    const vertex = heapq.pop()
    seen.push(vertex.name)

    const nodes = graph[vertex.name]

    for (const node of nodes) {
      if(!seen.includes(node)) {
        if(vertex.distance + 1 < distance[node]) {
          heapq.push({
            name: node,
            distance: vertex.distance + 1,
          })
          parents[node] = vertex.name
          distance[node] = vertex.distance + 1
        }
      }
    }
  }

  const paths = []
  let key = endStation.name
  while(key !== startStation.name) {
    paths.unshift(key)
    key = parents[key]
  }
  paths.unshift(startStation.name)

  return paths
}

function bindDrawLink() {
  let markPath = null

  const linkPath = document.getElementById('linkpath')
  let linking = false
  let M = ''
  let startStation = null
  let endStation = null
  document.body.addEventListener('pointerdown', (e) => {
    if(markPath !== null) {
      markPath.remove()
    }

    const stationName = e.target.parentElement.getAttribute('data-station')
    if(!stationName) return
  
    startStation = stations.find((s) => s.name === stationName)
  
    const x = e.clientX
    const y = e.clientY
    M = `M ${x},${y}`
    linking = true
  })
  document.body.addEventListener('pointerup', (e) => {
    linking = false
    linkPath.setAttribute('d', '')
  
    const stationName = e.target.parentElement.getAttribute('data-station')
    if(!stationName || stationName === startStation.name) {
      startStation = null
      return
    }
    endStation = stations.find((s) => s.name === stationName)
    const paths = dijkstra(startStation, endStation)
    console.log(paths)
    const pathPositions = paths.map((p) => {
      return stations.find((s) => s.name === p).position
    })

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#e879f9')
    path.setAttribute('stroke-width', '10')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('class', 'markpath')
    path.setAttribute('d', pathPositions.map((pos, index) => `${index === 0 ? 'M' : 'L'} ${pos[0]},${pos[1]}`).join('\n'))

    markPath = path
    metroSvg.append(markPath)
  })
  document.body.addEventListener('pointermove', (e) => {
    if(!linking) return
    linkPath.setAttribute('d', `${M} L${e.clientX},${e.clientY}`)
  })
}
bindDrawLink()
