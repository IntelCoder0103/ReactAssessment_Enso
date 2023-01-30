import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { SineWave, SignalEvent } from "components";
import { useDebounce } from "hooks/useDebounce";

const Container = styled.div`
  position: relative;
`;

// The Overlay is a div that lies on top of the chart to capture mouse events
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
`;

const PADDING = {
  top: 10,
  left: 24,
  right: 9,
  bottom: 30,
};
// The chart canvas will be the same height/width as the ChartWrapper
// https://www.chartjs.org/docs/3.2.1/configuration/responsive.html#important-note
const ChartWrapper = styled.div``;

const getTickWidth = (totalWidth) => {
  return (totalWidth - PADDING.left - PADDING.right) / 10;
};

const SignalView = () => {
  // Access the height of the chart as chartWrapperRef.current?.clientHeight to determine the height to set on events
  const chartWrapperRef = useRef();
  const [tickWidth, setTickWidth] = useState(0);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const debouncedEvent = useDebounce(currentEvent, 5);
  const height =
    chartWrapperRef.current?.clientHeight - (PADDING.bottom + PADDING.top) || 0;

  const updateTickWidth = () => {
    setTickWidth(getTickWidth(chartWrapperRef.current?.clientWidth));
  };

  window.addEventListener("resize", updateTickWidth);

  useEffect(() => {
    updateTickWidth();
  }, []);

  console.log(tickWidth);
  const handleOverlayClick = (event) => {
    // Prevent the event from bubbling up to the chart
    if (event.buttons == 1) {
      event.stopPropagation();
      event.preventDefault();
      console.log(event);
      let start = (event.clientX - PADDING.left) / tickWidth;
      setCurrentEvent({
        start,
        duration: 0,
        state: "Creating",
        tick: tickWidth,
        height,
      });
      console.log(start);
    }
  };

  const handleOverlayMove = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.buttons == 1) {
      let end = (event.clientX - PADDING.left) / tickWidth;
      setCurrentEvent((currentEvent) => ({
        ...currentEvent,
        duration: end - currentEvent?.start,
      }));
    }
  };

    const handleOverlayRelease = () => {
        setEvents(events => [
            ...events,
            {
                ...currentEvent,
                state: "Created",
            }
        ]);
        setCurrentEvent();
  }

  const event = {
    start: 3,
    duration: 2,
    state: "Creating",
    tick: tickWidth,
    height,
  };

  return (
    <Container>
      <ChartWrapper ref={chartWrapperRef}>
        <SineWave samplingRate={50} lowerBound={0} upperBound={10} />
      </ChartWrapper>
      {/* The overlay covers the same exact area the sine wave chart does */}
      <Overlay
        onMouseDown={handleOverlayClick}
        onMouseMove={handleOverlayMove}
        onMouseUp={handleOverlayRelease}
      >
        {/* You can place events in here as children if you so choose */}
        {events.map((ev, index) => (
          <SignalEvent
            key={index}
            left={ev.start * tickWidth + PADDING.left}
            width={ev.duration * tickWidth}
            height={height}
                state={ev.state}
          />
        ))}
        {debouncedEvent && (
          <SignalEvent
            left={debouncedEvent.start * tickWidth + PADDING.left}
            width={debouncedEvent.duration * tickWidth}
            height={height}
            state={debouncedEvent.state}
          />
        )}
      </Overlay>
    </Container>
  );
};

export default SignalView;
