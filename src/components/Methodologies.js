import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import sanityClient from "../lib/sanity";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { AppContext } from "../appContext";
import Search from "./Search";
import { parseQueryParams } from "../utils";

const query = `*[_type == "methodology"]{
  _id, name,
  "relatedProjects": count(*[_type=='project' && references(^._id)])
}`;

const Methodologies = ({ type, history }) => {
  const [methodologies, setMethodologies] = useState([]);
  const context = useContext(AppContext);

  useEffect(() => {
    if (methodologies.length === 0) {
      sanityClient
        .fetch(query)
        .then(res => {
          handleStatusChange(res);
          return () => {
            // Clean up
          };
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [type]);

  const handleStatusChange = res => {
    setMethodologies(res);
  };

  const selectMethod = (type, value) => {
    context.toggleSelected({ type: type, value: value });
    const queryParams = parseQueryParams(context.selected);
    history.push(`/${context.section}${queryParams}`);
  };

  const max = extent(methodologies, d => d.relatedProjects)[1];
  const heightScale = scaleLinear()
    .range([30, 150])
    .domain([0, max]);

  return (
    <div className="viz-container">
      <Search
        items={methodologies}
        selectionCallBack={selectMethod}
        type={"method"}
      />
      <div className="overflow-auto flex-grow-1 flex-shrink-1 d-none d-md-block">
        {methodologies
          .sort((a, b) => b.relatedProjects - a.relatedProjects)
          .map((methodology, index) => {
            const selected = context.selected.map(s => s.value);
            return (
              <div
                className={`px-3 method-block ${
                  selected.indexOf(methodology.name) > -1 ? "active" : ""
                }`}
                key={index}
                style={{
                  height: `${heightScale(methodology.relatedProjects)}px`
                }}
                onClick={() => selectMethod("method", methodology.name)}
              >
                {methodology.relatedProjects} {methodology.name}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default withRouter(Methodologies);
