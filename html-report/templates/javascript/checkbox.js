window.onload = createchkboxes()

function createchkboxes()
{
    for (var i = 0; i < dataframe_groups.length; i++) 
    {
        var label = document.createElement('label');
        var br = document.createElement('br');
        var alabel = document.getElementById('checkbox');
        var last = alabel[alabel.length - 1];
        var li = document.createElement('li');

        label.htmlFor = "lbl"+i;
        label.appendChild(Createcheckbox(dataframe_groups[i]));
        label.appendChild(document.createTextNode(dataframe_groups[i]));
        label.appendChild(br);
        alabel.appendChild(li);

        document.getElementById('checkbox').appendChild(label);
    }
    handleClickEvent();
}

function handleClickEvent()
{
    var el = document.getElementById('checkbox');
    var tops = el.getElementsByTagName('input');

    for (var i = 0; i < tops.length; i++)
    {
        if (tops[i].type === 'checkbox')
            tops[i].onclick = function() { if($(this).prop("checked") == true) { getValues('checkbox') } }
    }

    update_groups();
}

function Createcheckbox(chkboxid) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    //checkbox.checked = true;

    checkbox.id = chkboxid;
    checkbox.value = chkboxid;

    return checkbox;
}

function getValues(divId){
    var boxes = document.getElementById(divId).getElementsByTagName('input');
    var selected = [];

    for(var i = 0; i < boxes.length; ++i)
    {
        if (boxes[i].checked === true)
            selected.push(boxes[i].value);
    }

   // alert(selected.join('\n'));
    return selected;
}

function update_groups()
{
    cohortGroups = getValues('checkbox');
    console.log(cohortGroups);
}

