import os, numpy as np, seaborn as sns, shutil
import argparse, json

from moseq2_viz.util import parse_index
from moseq2_viz.model.util import parse_model_results, \
        results_to_dataframe

templates = r'templates'

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('-i', help='Index file to be used to create groups.',
            dest='index_file')

    parser.add_argument('-m', help='Model file to be used to create figures.',
            dest='model_file')

    parser.add_argument('--output', help='Output destination path for everything to be'
            + 'saved to.', dest='output_path')

    parser.set_defaults(index_file=None, model_file=None, output_path=os.getcwd())
    args = parser.parse_args()

    # Assign the file paths for the report
    metadata_path = os.path.join(args.output_path, 'html-report', templates,
            'javascript', 'metadata.js')

    # Creating the hierarchy for the results
    create_directory(args.output_path)

    # Get the results dataframe
    df_json = get_results_dataframe_as_json(args)
    groups_str = get_groups_from_dataframe_json(df_json)

    # Write out the data to the metadata_path file for use when loading
    # the index.html page.
    replace_expression_in_file(metadata_path, '$dataframeGroups', groups_str)
    replace_expression_in_file(metadata_path, '$dataframeJson', df_json)
#end main()

def get_groups_from_dataframe_json(df_json):
    ''' Takes in the dataframe json string and creates a string
    containing the unique groups from within the dataframe.

    Parameters:
    df_json (json string): Json string form of the pandas
    dataframe created from the model file.

    Returns:
    groups (string): String containing the list of unique
    groups gathered from the model dataframe json string.
    '''

    json_obj = json.loads(df_json)

    groups = set()
    for arr in json_obj['data']:
        groups.add(arr[1])

    groups = list(groups)
    groups = ', '.join("'" + str(e) + "'" for e in groups)
    groups = '[' + groups + ']'

    return groups
#end get_groups_from_dataframe_json()

def replace_expression_in_file(file_path, target, replacing_string):
    ''' Replaces the target string in the passed in file with another
    passed in string.

    Parameters:
    file_path (string path): Path to file that will be opened and edited.
    target (string): Target to string to parse for and replace.
    replacing_string (string): String to replace the target string with.
    '''

    with open(file_path, 'r') as f:
        conts = f.read()

    conts = conts.replace(target, replacing_string)

    with open(file_path, 'w') as f:
        f.write(conts)
#end replace_expression_in_file()

def get_results_dataframe_as_json(args):
    ''' Creates a json object from a pandas dataframe created
    by parsing the index and model files passed in.

    Parameters:
    args (argparse arguments): Argument object that contains the index
    file and model file path.

    Returns:
    df_json (json object): A json object containing the dataframe created
    from the model file converted to json.
    '''

    _, sorted_index = parse_index(args.index_file)
    model_res = parse_model_results(args.model_file)

    df, _ = results_to_dataframe(model_res, sorted_index, max_syllable=100,
            sort=True, count='usage')

    print(df)

    df_json = df.to_json(orient='split')

    return df_json
#end get_results_dataframe_as_json()

def create_directory(output):
    ''' Creates the directory structure for the html report at the passed
    in string path.

    Parameters:
    output (string path): String path of desired output path.
    '''

    outdir = os.path.join(output, 'html-report')
    if not os.path.exists(outdir):
        os.mkdir(outdir, 7777)

    if os.path.exists(os.path.join(outdir, 'templates')):
        shutil.rmtree(os.path.join(outdir, 'templates'))

    shutil.copytree(templates, os.path.join(outdir, 'templates'))
#end create_directory()

if __name__ == "__main__":
    main()
