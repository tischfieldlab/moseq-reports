const path = require('path');
const fs = require('fs');

let folders = [];

function findFiles(startPath,filter){
    //console.log('Starting from dir '+startPath+'/');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            findFiles(filename,filter); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log('-- found: ',filename);
            folders.push(filename)
        };
    };
};

//Clear docs folder
function clearFolder(folder){
    fs.rmdir(folder, { recursive: true }, (err) => {if (err) {throw err;}});
};

function moveFiles(){
    let folder = "";
    for(const file of folders) {
        folder = file.replace('src\\', 'docs\\dev_guide\\').substring(0, file.lastIndexOf("\\")+1);
        if(!(fs.existsSync(folder))){
            fs.mkdirSync(folder, { recursive: true })
        }
        fs.rename(file, file.replace('src\\', 'docs\\dev_guide\\'), (err)=>{if(err) throw err;});
    }
};

findFiles('./src/components','.md');
clearFolder('./docs/dev_guide/components');
moveFiles();