// This file contains all the javascript functions used in the index.ejs

let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", ()=>{
    let taxInfo = document.getElementsByClassName("tax-info");
    for(info of taxInfo)
    {
        if(info.style.display!="inline"){
            info.style.display="inline";
        }else{
            info.style.display="none";
        }
    }
})

function submitForm(category) {
// Set the selected category value to the hidden input field
document.getElementById('selectedCategory').value = category;

// Submit the form
document.getElementById('filterForm').submit();
}


