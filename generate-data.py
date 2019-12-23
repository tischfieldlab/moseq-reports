import os, argparse, json

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

    df = convertModelToJson(args)
    dfGroups = getGroupsFromDataframe(df)

    writeMetadataFile(df, dfGroups, args.outputPath)
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
    jsonObj = json.loads(df)

    groups = set()
    for arr in jsonObj['data']:
        groups.add(arr[1])

    groups = list(groups)

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

if __name__ == '__main__':
    main()