import os, argparse, json, sys, glob, subprocess
import pandas as pd
import moseq2_extras
from moseq2_extras.util import ensure_dir
from moseq2_viz.util import parse_index
from moseq2_viz.model.util import parse_model_results, \
        results_to_dataframe

METADATAPATH = os.getcwd()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', help='Index file to be used to create groups.',
            dest='indexFile')
    parser.add_argument('-m', help='Model file to be used to create figures.',
            dest='modelFile')
    parser.add_argument('--output', help='The output directory for the metadata.json file to be saved to.',
            dest='outputPath')
    parser.add_argument('--filter', nargs='+', dest='filterGroups',
            help='The list of groups that are desired to be in the report.')
    parser.set_defaults(indexFile=None, modelFile=None, outputPath=METADATAPATH, filterGroups=[])
    args = parser.parse_args()

    sort = True
    max_syllable = 100
    count = 'usage'

    ensure_dir(args.outputPath)


    df = getUsageDataframe(args.modelFile, args.indexFile, args.filterGroups, max_syllable, sort, count)
    dfGroups = getGroupsFromDataframe(df)
    writeMetadataFile(df, dfGroups, args.outputPath)
    
    create_spinograms(args.modelFile, args.indexFile, args.outputPath, max_syllable, sort, count)
#end main()

def writeMetadataFile(df, dfGroups, outputPath):
    ensure_dir(outputPath)
    
    outputPath = os.path.join(outputPath, 'metadata.msq')
    res = {}
    res['cohortGroups'] = dfGroups
    res['dataframeJson'] = df
    with open(outputPath, 'w') as f:
        json.dump(res, f)
#end writeMetadataFile

def getGroupsFromDataframe(df):
    return list(df['group'].unique())
#end getGroupsFromDataframe()

def getUsageDataframe(model, index, groups, max_syl, sort, count):
    _, sortedIndex = parse_index(index)
    modelRes = parse_model_results(model)

    df, _ = results_to_dataframe(modelRes, sortedIndex, max_syllable=max_syl, sort=sort, count=count)

    if (groups):
        df = df.loc[df['group'].isin(groups)]

    return df
#end getUsageDataframe()

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

if __name__ == '__main__':
    main()