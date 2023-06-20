import {default_keywords} from "../data/negative-words.js";

function loadTable() {
    let table_content = document.getElementsByTagName("table")[0].innerHTML;
    for (let i = 0; i < default_keywords.length; i++) {
        table_content += '<tr class="bg-slate-700 border-gray-700 hover:bg-gray-600"><th scope="row" class="py-4 px-6 font-medium whitespace-nowrap text-white">' + default_keywords[i] + '</tr><th>'
    }

    document.getElementsByTagName("table")[0].innerHTML = table_content;
    document.getElementById("loader").style.display = "none"
    document.getElementsByTagName("table")[0].style.display = "table";
}

setTimeout(loadTable, 500);
