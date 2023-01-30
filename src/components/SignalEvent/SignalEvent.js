import React from 'react'

const SignalEvent = (props) => {
  let { left, width, state, height } = props;
  const color = state == "Creating" ? "rgba(0,72,216,.3)" : "rgba(0,240,30,.3)";
  if (width < 0) {
    left += width;
    width = -width;
  }
  return <div style={{
    position: "absolute",
    top: 11,
    height: height ,
    left,
    width,
    backgroundColor: color,
    borderRadius: 12,
    transition: "all .5s"
  }}
  ></div>;
}

export default React.memo(SignalEvent);