import argparse
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile

import pandas as pd
from moseq2_extras.model import get_syllable_id_mapping
from moseq2_extras.util import ensure_dir

from moseq2_viz.model.util import parse_model_results, results_to_dataframe
from moseq2_viz.util import parse_index


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', help='Index file to be used to create groups.', dest='indexFile')
    parser.add_argument('-m', help='Model file to be used to create figures.', dest='modelFile')
    parser.add_argument('--output', help='The output directory for the metadata.json file to be saved to.', dest='outputPath')
    parser.add_argument('--filter', nargs='+', dest='filterGroups', help='The list of groups that are desired to be in the report.')
    parser.set_defaults(indexFile=None, modelFile=None, outputPath=os.getcwd(), filterGroups=[])
    args = parser.parse_args()

    max_syllable = 100

    ensure_dir(args.outputPath)

    # write map of syllable id's between various count methods
    writeSyllableIdMap(args.modelFile, args.outputPath)
    
    # write out the groups and their preferred ordering
    writePrefferedGroups(args.indexFile, args.filterGroups, args.outputPath)

    # write out usage data
    writeUsageDataframe(args.modelFile, args.indexFile, args.filterGroups, max_syllable, True, 'usage', args.outputPath)
    writeUsageDataframe(args.modelFile, args.indexFile, args.filterGroups, max_syllable, True, 'frames', args.outputPath)

    create_spinograms(args.modelFile, args.indexFile, args.outputPath, max_syllable, True, 'usage')

    create_crowd_movies(args.modelFile, args.indexFile, os.path.join(args.outputPath, 'crowd_movies'), max_syllable, True, 'usage')
    
    archiveData(args.outputPath)
#end main()

def archiveData(outputPath):
    zipf = zipfile.ZipFile('{}.msq'.format(outputPath), 'w', zipfile.ZIP_DEFLATED)
    
    for root, _, files in os.walk(outputPath):
        for file in files:
            zipf.write(os.path.join(root, file), file)
    zipf.close()
#end archiveData()

def writePrefferedGroups(index, groups, outputPath):
    idx, _ = parse_index(index)
    known_groups = list(set([f['group'] for f in idx['files']]))
    known_groups.sort()
    
    if groups is None or len(groups) == 0:
        groups = known_groups
    
    final_groups = [g for g in groups if g in known_groups]

    with open(os.path.join(outputPath, 'groups.json'), 'w') as f:
        json.dump(final_groups, f)
#end writePrefferedGroups()

def writeSyllableIdMap(model, outputPath):
    syllable_mapping = get_syllable_id_mapping(model)
    sm_df = pd.DataFrame(syllable_mapping)
    sm_df.to_json(os.path.join(outputPath, "label_map.json"), orient='split')
#end writeSyllableIdMap()

def writeUsageDataframe(model, index, groups, max_syl, sort, count, outputPath):
    _, sortedIndex = parse_index(index)
    modelRes = parse_model_results(model)

    df, _ = results_to_dataframe(modelRes, sortedIndex, max_syllable=max_syl, sort=sort, count=count)

    if groups:
        df = df.loc[df['group'].isin(groups)]

    dest = os.path.join(outputPath, 'usage.ms{}.c{}.s{}.json'.format(max_syl, count, sort))
    df.to_json(dest, orient='split')
#end writeUsageDataframe()

def create_spinograms(model, index, out_dir, max_syl, sort, count):
    out_dir = ensure_dir(out_dir)
    
    #check if spinograms already exist
    basename = 'spinogram'
    out_name = "{}.corpus-{}-{}".format(basename,
                                        'sorted' if sort else 'unsorted',
                                        count)
    if len(glob.glob(os.path.join(out_dir, '{}.json'.format(out_name)))) > 0:
        sys.stderr.write("It appears spinograms already exist. Skipping. \n")
        return
    
    sys.stderr.write("Creating spinograms at {}\n".format(out_dir))
    spinogram_args = [
        'spinogram',
        'plot-corpus',
        index,
        model,
        '--dir', out_dir,
        '--save-data',
        '--no-plot',
        '--max-syllable', str(max_syl),
        '--name', basename,
        '--count', count
    ]
    if sort:
        spinogram_args.append('--sort')
    subprocess.call(spinogram_args)
#end create_spinograms()

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