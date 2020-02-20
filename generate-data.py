import os, argparse, json
import sys
import glob
import hashlib
import os
import re
import subprocess
import sys
from moseq2_extras.util import ensure_dir
from moseq2_viz.util import parse_index
from moseq2_viz.model.util import parse_model_results, \
        results_to_dataframe
import numpy as np
import plotly.figure_factory as ff
from scipy.cluster.hierarchy import linkage


from moseq2_extras.util import NumpyEncoder
from moseq2_viz.model.util import (get_transition_matrix, parse_model_results,
                                   results_to_dataframe)
from moseq2_viz.util import parse_index

METADATAPATH = os.getcwd()

def main():
    index = input("Enter path of indexfile: ")
    newindex = index.replace('\\','/')
    modelfile = input("enter path of model file: ")
    newmodel = modelfile.replace('\\','/')
    outputpath = input('enter output path: ')
    newoutput = outputpath.replace('\\','/')
    parser = argparse.ArgumentParser()
    parser.add_argument('--../moseq2-index.yaml', help='Index file to be used to create groups.',
            dest='indexFile')
    parser.add_argument('--../first_model.p', help='Model file to be used to create figures.',
            dest='modelFile')
    parser.add_argument('--../ok', help='The output directory for the metadata.json file to be saved to.',
            dest='outputPath')
    parser.add_argument('--filter', nargs='+', dest='filterGroups',
            help='The list of groups that are desired to be in the report.')
    parser.set_defaults(indexFile=newindex, modelFile=newmodel, outputPath=outputpath, filterGroups=[])
    args = parser.parse_args()

    df = convertModelToJson(args)
    dfGroups = getGroupsFromDataframe(df)
    
    writeMetadataFile(df, dfGroups, args.outputPath)
    create_crowd_movies('first_model.p','moseq2-index.yaml','ok', 100, False, 'usage')

#end main()

def writeMetadataFile(df, dfGroups, outputPath):
    ensure_dir(outputPath)

    outputPath = os.path.join(outputPath, 'metadata.js')
    with open(outputPath, 'w') as f:
        f.write('export let dataframeJson = {}\n'.format(df))
        f.write('export let cohortGroups = {}\n'.format(dfGroups))

#end writeMetadataFile

def getGroupsFromDataframe(df):
    jsonObj = json.loads(df)

    groups = set()
    for arr in jsonObj['data']:
        groups.add(arr[1])

    groups = list(groups)
    groups = ', '.join("'" + str(e) + "'" for e in groups)
    groups = '[' + groups + ']'

    return groups
#end getGroupsFromDataframe()

def convertModelToJson(args):
  _, sortedIndex = parse_index(args.indexFile)
  modelRes = parse_model_results(args.modelFile)

  df, _ = results_to_dataframe(modelRes, sortedIndex, max_syllable=100,
          sort=True, count='usage')

  if (args.filterGroups):
    df = df.loc[df['group'].isin(args.filterGroups)]

  dfJson = df.to_json(orient='split')

  return dfJson
#end createMetadataFile()
def create_crowd_movies(model, index, out_dir, max_syl, sort, count):
    out_dir = ensure_dir(out_dir)
    
    #check if movies already exist
    
    if ((sort and count == 'usage') or not sort) and len(glob.glob(os.path.join(out_dir, '*(usage)*.mp4'))) > 0:
        sys.stderr.write("It appears crowd movies already exist. Skipping. \n")
        return
    elif (sort and count == 'frames') and len(glob.glob(os.path.join(out_dir, '*(frames)*.mp4'))) > 0:
        sys.stderr.write("It appears crowd movies already exist. Skipping. \n")
        return
    
    sys.stderr.write("Creating crowd movies at {}\n".format(out_dir))
    args = [
        'moseq2-viz',
        'make-crowd-movies',
        index,
        model,
        '--max-syllable', str(max_syl),
        '--output-dir', out_dir,
        '--sort', str(sort),
        '--count', count
    ]
    subprocess.call(args)
#end create_crowd_movies()

if __name__ == '__main__':
    main()
