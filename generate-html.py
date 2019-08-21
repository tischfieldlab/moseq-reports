import os, numpy as np, seaborn as sns, shutil

from moseq2_viz.util import parse_index
from moseq2_viz.model.util import get_transition_matrix, parse_model_results, results_to_dataframe
from moseq2_extras.plotutil import plot_syllable_usage_heatmap

import matplotlib.pyplot as plt
import plotly.offline as ply
import plotly.graph_objs as go
import plotly.tools as tls

index = r'data\moseq2-index-genotype-sex.yaml'
model = r'data\first_model.p'
json = r'templates\json'
templates = r'templates'
jscript = r'templates\javascript'
output_path = r'html-report'

def main():
    print('Hello, World!')
    create_structure(".")
    get_results_dataframe_as_json(['+/+_female', '+/CT_female', 'CT/CT_female'], '.')
#end main()

def create_structure(output):
    outdir = os.path.join(output, output_path)
    if not os.path.exists(outdir):
        os.mkdir(outdir, 7777)

    if os.path.exists(os.path.join(outdir, 'templates')):
        shutil.rmtree(os.path.join(outdir, 'templates'))

    shutil.copytree(templates, os.path.join(outdir, 'templates'))
#end create_structure()

def get_results_dataframe_as_json(groups, output):
    _, sorted_index = parse_index(r'C:\Users\chester\Documents\GitHub\vue-reports\data\moseq2-index-genotype-sex.yaml')
    model_res = parse_model_results(r'C:\Users\chester\Documents\GitHub\vue-reports\data\first_model.p')

    # Create the results dataframe
    df, _ = results_to_dataframe(model_res, sorted_index, max_syllable=100, sort=True, count='usage')
    df_filt = df.loc[df['group'].isin(groups)]
    df_filt_summary = df_filt.pivot_table("usage", "syllable", "group", aggfunc=np.mean)
    print(df_filt_summary)
  #  df_filt_summary = df_filt_summary[groups] #reorder groups!

  #  df_json = df_filt_summary.to_json(orient='split')
    df_json = df.to_json(orient='split')

    metadata_path = os.path.join(output, output_path, jscript, 'metadata.js')
    # Write it in the metadata.js file
    with open(metadata_path, 'r') as f:
        conts = f.read()
    conts = conts.replace('$dataframeJson', df_json)
    with open(metadata_path, 'w') as f:
        f.write(conts)
#end create_heatmap()

if __name__ == '__main__':
    main()
