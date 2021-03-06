import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import sanityClient from "../lib/sanity";
import { scaleLinear } from "d3-scale";
import { groupBy } from "lodash";
import { AppContext } from "../appContext";
import { timeLabels, quantizeTime } from "../timeUtils";
import { parseQueryParams } from "../utils";
import Responsive from "react-responsive";

const query = `*[_type == "project"]{
  endDate, startDate
}`;

const monthDiff = (d1, d2) => {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth() + 1;
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

const Times = ({ type, history }) => {
  const [times, setTimes] = useState([]);
  const [derivedTimes, setDerivedTimes] = useState();
  const context = useContext(AppContext);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (times.length === 0) {
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
    const derivedTimes = res.map((time, index) => {
      const diff = monthDiff(new Date(time.startDate), new Date(time.endDate));
      time.months = quantizeTime(diff);
      return time;
    });
    setDerivedTimes(derivedTimes);

    const sortedTimes = derivedTimes.sort((a, b) => a.months - b.months);
    const groupedByTimes = Object.values(groupBy(sortedTimes, el => el.months));

    setTimes(groupedByTimes.reverse());
  };

  const selectTime = (type, value) => {
    context.toggleSelected({ type: type, value: value });
    const queryParams = parseQueryParams(context.selected);
    history.push(`/${context.section}${queryParams}`);
  };

  const selected = context.selected.map(s => s.value);

  const widthScale = scaleLinear()
    .range([12, 20, 35, 65, 95, 100])
    .domain([0, 3, 6, 12, 24, 36]);

  const sum = times.reduce((a, b) => {
    return a + b.length;
  }, 0);

  return (
    <div className="viz-container">
      {/* <Search items={times} selectionCallBack={selectTime} type={'time'} /> */}
      <Responsive minWidth={768}>
        <div className="w-100 pt-3 overflow-auto flex-grow-1 flex-shrink-1 d-none d-md-block h-100">
          {times.map((time, index) => {
            const duration = time[0].months;
            return duration >= 12 ? (
              <div
                key={index}
                className={`px-3 time-block d-flex align-items-center justify-content-between ${
                  selected.indexOf(duration) > -1 ? "active" : ""
                }`}
                style={{
                  width: `${widthScale(duration)}%`,
                  height: `${Math.floor((time.length / sum) * 100)}%`,
                  borderTop: index === 0 ? "1px solid #d7d7d7" : "none"
                }}
                onClick={() => selectTime("time", duration)}
              >
                <div>{`${time.length} projects`}</div>
                <div>{`${timeLabels[duration]}`}</div>
              </div>
            ) : (
              <div
                key={index}
                style={{
                  height: `${Math.floor((time.length / sum) * 100)}%`,
                  width: "100%"
                }}
                className=" d-flex align-items-center"
              >
                <div
                  className={`px-3 time-block h-100 d-flex align-items-center ${
                    selected.indexOf(duration) > -1 ? "active" : ""
                  }`}
                  style={{
                    width: `${widthScale(duration)}%`,
                    borderTop: index === 0 ? "1px solid #d7d7d7" : "none"
                  }}
                  onClick={() => selectTime("time", duration)}
                >
                  <div>{`${time.length} projects`}</div>
                </div>
                <div className="ml-2">{`${timeLabels[duration]}`}</div>
              </div>
            );
          })}
        </div>
      </Responsive>
    </div>
  );
};

export default withRouter(Times);
