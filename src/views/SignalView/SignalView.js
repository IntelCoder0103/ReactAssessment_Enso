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
  const [tickWidth, setTickWidth] = useState(0); // space between each tick
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const [resizeEventIndex, setResizeEventIndex] = useState(-1);
  const [resizePosition, setResizePosition] = useState("start");
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

  /**
   * handling click event
   */
  const handleOverlayClick = (event) => {
    // Prevent the event from bubbling up to the chart

    if (event.buttons == 1) {
      event.stopPropagation();
      event.preventDefault();
      let pos = (event.clientX - PADDING.left) / tickWidth;

      let eventIndexToResize = findEventIndexToResize(pos);
      setResizeEventIndex(eventIndexToResize);

      if (eventIndexToResize >= 0) {
        handleClickForResize(pos, eventIndexToResize);
      } else {
        handleClickForCreating(pos);
      }
    }
  };

  const handleClickForResize = (pos, index) => {
    const ev = events[index];
    setResizePosition(Math.abs(pos - ev.start) < 1e-2 ? "start" : "end");
  };

  const handleClickForCreating = (pos) => {
    let start = pos;
    setCurrentEvent({
      start,
      duration: 0,
      state: "Creating",
      tick: tickWidth,
      height,
    });
  };

  /**
   * handling dragging event
   */
  const handleOverlayMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    let pos = (event.clientX - PADDING.left) / tickWidth;
    if (event.buttons == 1) {
      if (resizeEventIndex >= 0) {
        handleDragForResize(pos);
      } else {
        handleDragForCreating(pos);
      }
    } else {
      updateMouseCursor(pos);
    }
  };

  const handleDragForResize = (pos) => {
    let start = events[resizeEventIndex].start;
    let end = events[resizeEventIndex].duration + start;
    setEvents((events) => {
      if (resizePosition == "start") start = pos;
      else end = pos;
      events[resizeEventIndex].start = start;
      events[resizeEventIndex].duration = end - start;
      return [...events];
    });
  };
  const handleDragForCreating = (pos) => {
    let end = pos;
    setCurrentEvent((currentEvent) => ({
      ...currentEvent,
      duration: end - currentEvent?.start,
    }));
  };

  /**
   *
   */
  const findEventIndexToResize = (pos) => {
    return events.findIndex((ev) => {
      return (
        Math.abs(pos - ev.start) < 1e-2 ||
        Math.abs(pos - ev.start - ev.duration) < 1e-2
      );
    });
  };

  const updateMouseCursor = (pos) => {
    if (findEventIndexToResize(pos) >= 0) {
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.cursor = "pointer";
    }
  };

  /**
   * handling release event
   */
  const handleOverlayRelease = () => {
    setEvents((events) => [
      ...events,
      {
        ...currentEvent,
        state: "Created",
      },
    ]);
    setCurrentEvent();
    setResizeEventIndex(-1);
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
        {/* already created events */}
        {events.map((ev, index) => (
          <SignalEvent
            key={index}
            left={ev.start * tickWidth + PADDING.left}
            width={ev.duration * tickWidth}
            height={height}
            state={ev.state}
          />
        ))}
        {/* newly creating event */}
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
