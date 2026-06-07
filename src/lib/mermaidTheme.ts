import mermaid from 'mermaid';

// Shared dark ISRD Mermaid theme — import this for its side effect
// (mermaid.initialize) wherever diagrams may need to render.
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background:          '#060f16',
    primaryColor:        '#0f2333',
    primaryBorderColor:  '#3a8fa8',
    primaryTextColor:    '#c8dfe8',
    secondaryColor:      '#0a1a26',
    secondaryBorderColor:'#1e3a4a',
    secondaryTextColor:  '#7acce0',
    tertiaryColor:       '#0d1e2b',
    tertiaryBorderColor: '#1e3a4a',
    lineColor:           '#3a8fa8',
    textColor:           '#c8dfe8',
    fontSize:            '13px',
    fontFamily:          'Inter, system-ui, sans-serif',
    edgeLabelBackground: '#0d1e2b',
    clusterBkg:          '#0a1820',
    clusterBorder:       '#1e3a4a',
    titleColor:          '#7acce0',
  },
  flowchart: { curve: 'basis', useMaxWidth: true },
});

export default mermaid;
