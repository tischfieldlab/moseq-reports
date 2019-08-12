import os

from _plotly_future_ import v4_subplots
from plotly.subplots import make_subplots
import plotly.offline as plt
import plotly.graph_objs as go

templates = os.path.join('templates')

def main():
    index_template = os.path.join(templates, 'views', 'index-template.html')
    navigation_template = os.path.join(templates, 'views', 'navigation-bar.html')
    
    with open(navigation_template, 'r') as f:
            nav_conts = f.read()
    
    with open('index.html', 'w') as index_file:
        with open(index_template, 'r') as f:
           index_conts = f.read()
        
        index_conts = index_conts.replace('$navBar', nav_conts)
        index_file.write(index_conts)
    
    graphs_template = os.path.join(templates, 'views', 'usage-heatmap-template.html')
    fig = make_subplots(rows=1, cols = 2, subplot_titles=('Plot 1', 'Plot 2'))
    
    fig.add_trace(go.Scatter(x=[0, 1, 2, 3, 4, 5], y=[10, 20, 30, 40, 50, 60], mode='markers+lines',
        name="Name of Trace 1"), row=1, col=1)
    
    fig.add_trace(go.Scatter(x=[2, 6, 8, 12, 14, 16], y=[100, 200, 300, 400, 500, 600], mode='markers+lines', 
        name='Name of Trace 2'), row=1, col=2)
    
    fig.layout.update(title=go.layout.Title(text='Plot Title'),)

    plt.plot(fig, auto_open=False, filename=graphs_template)

    with open(graphs_template, 'r') as f:
        conts = f.read()
    with open(graphs_template, 'w') as f:
        conts = conts.replace('<body>', '<body>\n' + nav_conts)
        f.write(conts)

#end main()

if __name__ == '__main__':
    main()