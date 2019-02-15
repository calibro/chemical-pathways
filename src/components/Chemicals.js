import React, { useState, useEffect, Component } from 'react';
import sanityClient from '../lib/sanity';
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceLink
} from 'd3-force';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

const query = `*[_type=="chemical"]{
  name,
  "relatedProjects": count(*[_type=='project' && references(^._id)])
}`;

const svgWidth = window.innerWidth / 2;
const svgHeight = window.innerHeight - 80;

const radiusScale = scaleLinear().range([0, 50]);

// const Chemicals = ({ type }) => {
//   const [chemicals, setChemicals] = useState([]);
//   const [nodes, setNodes] = useState([]);
//   const [simulation, setSimulation] = useState(null);

//   // Similar to componentDidMount and componentDidUpdate:
//   useEffect(() => {
//     sanityClient
//       .fetch(query)
//       .then(res => {
//         //setUpForceLayout(res);
//         setChemicals(res);
//         return () => {
//           // Clean up
//         };
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   }, [type]);

// useEffect(() => {
//   const simulationNodes = nodes
//     .filter(r => r.relatedProjects > 0)
//     .sort((a, b) => {
//       return b.relatedProjects - a.relatedProjects;
//     })
//     .map(r => {
//       r.radius = radiusScale(r.relatedProjects);
//       return r;
//     });

//   console.log(simulationNodes);

//   const links = simulationNodes
//     .map((n, i) => {
//       if (i < simulationNodes.length - 1) {
//         return {
//           source: i,
//           target: i + 1
//         };
//       }
//     })
//     .slice(0, simulationNodes.length - 1);
//   console.log(links);
//   const simulation = forceSimulation(simulationNodes)
//     .force('charge', forceManyBody().strength(50))
//     //.force('link', forceLink(links))
//     .force('center', forceCenter(svgWidth / 2, svgHeight / 2))
//     .force(
//       'collision',
//       forceCollide()
//         .radius(30)
//         .strength(2)
//         .iterations(2)
//     )
//     .on('tick', a => {
//       console.log('here');
//       setNodes(simulationNodes);
//       //setNodes(nodes);
//     });
//   setSimulation(simulation);
// });

//   return (
//     <div className='w-100 h-100 d-flex flex-column'>
//       <div className='w-100 d-flex p-3' />
//       <div className='w-100 h-100 d-flex flex-column'>
//         <svg width={svgWidth} height={svgHeight}>
//           <defs>
//             <filter x='0' y='0' width='1' height='1' id='solid'>
//               <feFlood floodColor='white' />
//               <feComposite in='SourceGraphic' />
//             </filter>
//           </defs>
//           {nodes.map((node, index) => {
//             if (node.relatedProjects > 0) {
//               return (
//                 <g key={index}>
//                   <circle
//                     cx={node.x}
//                     cy={node.y}
//                     fill='white'
//                     stroke='black'
//                     strokeWidth={2}
//                     r={30}
//                   />
//                   {/* <text
//                     dx={node.x}
//                     dy={node.y}
//                     style={{
//                       fontSize: '10px',
//                       textTransform: 'uppercase',
//                       dominantBaseline: 'central'
//                     }}
//                     fill={'black'}
//                     textAnchor='middle'
//                     filter='url(#solid)'
//                   >
//                     {node.name}
//                   </text> */}
//                 </g>
//               );
//             }
//           })}
//         </svg>
//       </div>
//     </div>
//   );
// };
//export default Chemicals;

export default class Chemicals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chemicals: [],
      nodes: []
    };
  }

  componentDidMount() {
    sanityClient
      .fetch(query)
      .then(res => {
        //setUpForceLayout(res);
        this.setState({ chemicals: res });
        this.setUpForceLayout(res);
      })
      .catch(err => {
        console.error(err);
      });
  }

  setUpForceLayout = res => {
    const [min, max] = extent(res, d => d.relatedProjects);
    radiusScale.domain([0, max]);

    const simulationNodes = res
      .filter(r => r.relatedProjects > 0)
      .sort((a, b) => {
        return b.relatedProjects - a.relatedProjects;
      })
      .map(r => {
        r.radius = radiusScale(r.relatedProjects);
        return r;
      });

    const links = simulationNodes
      .map((n, i) => {
        if (i < simulationNodes.length - 1) {
          return {
            source: i,
            target: i + 1
          };
        }
      })
      .slice(0, simulationNodes.length - 1);

    const simulation = forceSimulation(simulationNodes)
      .force('charge', forceManyBody().strength(50))
      .force('link', forceLink(links))
      .force('center', forceCenter(svgWidth / 2, svgHeight / 2))
      .force(
        'collision',
        forceCollide()
          .radius(n => n.radius + 12)
          .strength(2)
          .iterations(1)
      )
      .on('tick', a => {
        simulationNodes.forEach(function(d) {
          d.x =
            d.x < radiusScale(d.relatedProjects)
              ? radiusScale(d.relatedProjects)
              : d.x > svgWidth - radiusScale(d.relatedProjects)
              ? svgWidth - radiusScale(d.relatedProjects)
              : d.x;

          d.y =
            d.y < radiusScale(d.relatedProjects)
              ? radiusScale(d.relatedProjects)
              : d.y > svgHeight - radiusScale(d.relatedProjects)
              ? svgHeight - radiusScale(d.relatedProjects)
              : d.y;
        });
        this.setState({ nodes: simulationNodes });
      });
  };

  render() {
    const { nodes } = this.state;
    return (
      <div className='w-100 h-100 d-flex flex-column'>
        <div className='w-100 d-flex p-3' />
        <div className='w-100 h-100 d-flex flex-column'>
          <svg width={svgWidth} height={svgHeight}>
            <defs>
              <filter x='0' y='0' width='1' height='1' id='solid'>
                <feFlood floodColor='white' />
                <feComposite in='SourceGraphic' />
              </filter>
            </defs>
            {nodes.map((node, index) => {
              const radius = radiusScale(node.relatedProjects);
              if (node.relatedProjects > 0) {
                return (
                  <g key={index}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      fill='white'
                      stroke='black'
                      strokeWidth={2}
                      r={radiusScale(node.relatedProjects)}
                    />
                    {
                      <text
                        dx={node.x}
                        dy={node.y}
                        style={{
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          dominantBaseline: 'central'
                        }}
                        fill={'black'}
                        textAnchor='middle'
                        filter='url(#solid)'
                      >
                        {node.name}
                      </text>
                    }
                  </g>
                );
              }
            })}
          </svg>
        </div>
      </div>
    );
  }
}