import { StudentProfile, setStudentProfile } from "./index.js";

const rinputs = ["GPA", "HouseHoldIncome", "Ethnicity"];
const allInputs = ["GPA", "HouseHoldIncome", "Ethnicity", "IsFirstGen", "SATScore", "ACTScore"];

for (let i = 0; i < rinputs.length; i++) {
    document.getElementById(rinputs[i]).addEventListener("change", function () {
        if (this.value != "") {
            document.getElementById("Continue").disabled = false;
        } else {
            document.getElementById("Continue").disabled = true;
        }
    });
}
document.getElementById("Continue").addEventListener("click", function () {
    setStudentProfile(
        new StudentProfile(
            parseFloat(document.getElementById("GPA").value) || 3.0,
            parseInt(document.getElementById("SATScore").value) || 0,
            parseInt(document.getElementById("ACTScore").value) || 0,
            0,
            0,
            0,
            parseInt(document.getElementById("HouseHoldIncome").value) || 50000,
            document.getElementById("IsFirstGen").value,
            document.getElementById("Ethnicity").value,
            document.getElementById("Gender").value,
            document.getElementById("State").value || "CA",
            document.getElementById("State").value || "CA",
    )
    );
    window.location.href = "gameview2.html";
});