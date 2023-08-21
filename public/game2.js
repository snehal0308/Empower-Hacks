import { searchSchool, getStudentProfile, getSchool, setStudentProfile } from "./index.js";

document.getElementById("DreamSchoolSelector").addEventListener("change", async function () {
    const schools = await searchSchool(this.value);
    if (!schools) return;
    document.getElementById("Schools").innerHTML = ""; // Clear the dropdown
    schools.forEach((school) => {
        const option = document.createElement("option");
        option.value = school["id"];
        option.innerHTML = school["school.name"];
        document.getElementById("Schools").appendChild(option);
    });
    
});

document.getElementById("Continue").addEventListener("click", async function () {
    var ds = document.getElementById("DreamSchoolSelector").value;
    
    if (ds && getSchool(ds)) {
        var profile = await getStudentProfile();
        console.log(profile);
        profile.dreamSchool = ds;
        profile.preferredState = getSchool(ds).state;
        setStudentProfile(profile);
        window.location.href = "gameview3.html";
    }

    window.location.href = "gameview3.html";
});