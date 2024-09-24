// src/components/NetworkVisualization.js

import React, { useEffect } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ peers }) => {
    useEffect(() => {
        const svg = d3.select('#network-graph');

        // Clear previous graph
        svg.selectAll('*').remove();

        // Define nodes and links
        const nodes = peers.map((peer, index) => ({ id: index + 1, name: peer }));
        const links = peers.map((peer, index) => ({
            source: 1, // Central node (current user)
            target: index + 1
        }));

        // Render graph
        svg.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 20)
            .attr('cx', (d) => d.id * 50)
            .attr('cy', 50);

        svg.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('x1', (d) => d.source * 50)
            .attr('y1', 50)
            .attr('x2', (d) => d.target * 50)
            .attr('y2', 50);

    }, [peers]);

    return <svg id="network-graph" width="600" height="400"></svg>;
};

export default NetworkVisualization;
