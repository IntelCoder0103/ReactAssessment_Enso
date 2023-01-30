import React, { useRef } from 'react';
import styled from 'styled-components';
import { SineWave } from 'components';

const Container = styled.div`
    position: relative;
`;

// The Overlay is a div that lies on top of the chart to capture mouse events
const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
`;

// The chart canvas will be the same height/width as the ChartWrapper
// https://www.chartjs.org/docs/3.2.1/configuration/responsive.html#important-note
const ChartWrapper = styled.div``;

const SignalView = () => {
    // Access the height of the chart as chartWrapperRef.current?.clientHeight to determine the height to set on events
    const chartWrapperRef = useRef();

    const handleOverlayClick = (event) => {
        // Prevent the event from bubbling up to the chart
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <Container>
            <ChartWrapper ref={chartWrapperRef}>
                <SineWave samplingRate={50} lowerBound={0} upperBound={10}/>
            </ChartWrapper>
            {/* The overlay covers the same exact area the sine wave chart does */}
            <Overlay onClick={handleOverlayClick}>
                {/* You can place events in here as children if you so choose */}
            </Overlay>
        </Container>
    );
};

export default SignalView;