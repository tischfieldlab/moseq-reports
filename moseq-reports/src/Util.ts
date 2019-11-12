

export function saveFile(name:string, type:string, data:string) {
    if (data != null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type: type }), name);

    var a = document.createElement('a')
    a.setAttribute('style', 'display: none;');
    var url = window.URL.createObjectURL(new Blob([data], {type: type}));
    a.setAttribute("href", url);
    a.setAttribute("download", name);
    document.body.append(a);
    a.click();
    setTimeout(function(){  // fixes firefox html removal bug
        window.URL.revokeObjectURL(url);
        a.remove();
    }, 500);  
}

export function transpose(data: Array<Array<number>>) : Array<Array<number>>{
    return data[0].map((col, i) => data.map(row => row[i]));
}