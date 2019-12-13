export default [{
    title: 'Usage heatmap',
    type: 'heat-map',
    layout: {
        width: 300,
        height: 600,
        position: {
            x: 260,
            y: 60,
        },
    },
    settings: {
        style: {
            colorscale: 'Portland',
        },
    },
}, {
    type: 'detailed-usage',
    title: 'Usage Details',
    layout: {
        width: 900,
        height: 600,
        position: {
            x: 570,
            y: 60,
        },
    },
    settings: {
        show_points: true,
        show_boxplot: true,
        show_violinplot: false,
    },
}, {
    title: 'Selected Syllable',
    type: 'test-syllable',
    layout: {
        width: 250,
        height: 300,
        position: {
            x: 1480,
            y: 60,
        },
    },
    settings: {},
}];
