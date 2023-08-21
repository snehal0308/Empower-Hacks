import { getStudentProfile } from "./index.js";
var profile = await getStudentProfile(true);

var items = [
    {
        choice1: "Take Honors Classes (+0.25 GPA)",
        choice2: "Take AP Classes (+0.5 GPA)",
        validator: function (choice, profile) {

            if (choice == 1) {
                profile.gpa += 0.25;
            } else {
                profile.gpa += 0.5;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Beware, AP classes can be much more stressful, but can improve your chances of getting into your dream school!"];
        },

    },
    {
        choice1: "Retake the SAT (+50 points)",
        choice2: "Retake the ACT (+2 points)",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.satScore += 50;
            } else {
                profile.actScore += 2;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Retaking the SAT or ACT can be a great way to improve your chances of getting into your dream school, but it may be futile if already over 1500, or 34. Strateically choose which test to retake, as they can be expensive!"];
        }
    },
    {
        choice1: "Get a job (+$5000)",
        choice2: "Invest in extracurriculars",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.hhIncome += 5000;
            } else {
                profile.gpa += 0.5;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Getting a job can be a great way to earn money, but it can also take time away from your studies and extracurriculars. Extracurriculars can be a great way to improve your chances of getting into your dream school, but they can be expensive!"];
        }
    },
    {
        choice1: "Start a (high-impact) club",
        choice2: "Join a (high-impact) club",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.gpa += 0.5;
            } else {
                profile.gpa += 0.3;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Starting a club is a great way to showcase leadership and initiative, but is extremely time consuming. Joining a club may not be as impressive, but it is much less time consuming."];
        }
    },
    {
        choice1: "Take a gap year (and get a job)",
        choice2: "Take a gap year (take community college classes and transfer)",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.hhIncome += 10000;
            } else {
                profile.gpa += 0.3;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Taking a gap year or semester is a great way to take a break from school, get a job, or improve your gpa."];
        }
    },
    {
        choice1: "Strengthen your activities' descriptions",
        choice2: "Lie about your activities",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.gpa += 0.5;
            } else {
                profile.gpa -= 0.3;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Explaining your extracurriculars correctly can be the difference between getting into your dream school and not. Lying on your resume is easier to catch than you think, and will surely get you rejected."];
        }
    },
    {
        choice1: "Strengthen your essays",
        choice2: "Trust your academic record",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.gpa += 0.5;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Essays are a great way to showcase your personality and your passion, but they can also be a great way to show your lack of passion. Make sure your essays showcase your personality, don't rely on your academic record to get you in."];
        }
    },
    {
        choice1: "Get a letter of recommendation from a teacher",
        choice2: "Get a letter of recommendation from a politician",
        validator: function (choice, profile) {
            if (choice == 1) {
                profile.gpa += 0.5;
            } else {
                profile.gpa -= 0.3;
            }
            return [profile.Match(profile.dreamSchoolProfile), "Getting a letter of recommendation from a teacher is a great way to showcase your academic prowess and may be more personal, but getting a letter of recommendation from connections showcases variety and willingness to put yourself out there!"];
        }
    }
    
]
var list = items;
let isPlaying = false;
//var item = items[Math.floor(Math.random()*items.length)];

function nextChoice() {
    if (items.length == 0) {
        isPlaying = false;
        document.getElementById("Prompt").innerHTML = document.getElementById("Chancing").innerHTML + " chance calculated.<br>Don't let this discourage or sway your admissions, but take some advice from our (totally legitimate) super-computer. Hope you enjoyed playing, click continue to restart!";
        document.getElementById("Continue").disabled = false;
        return;
    }
    var num = Math.floor(Math.random() * items.length);
    var item = items[num];
    document.getElementById("Choice1").innerHTML = item.choice1;
    document.getElementById("Choice2").innerHTML = item.choice2;
    document.getElementById("Choice1").onclick = function () {
        var result = item.validator(1, profile);
        document.getElementById("Chancing").innerHTML = result[0].percentChance;
        document.getElementById("Prompt").innerHTML = result[1];
        document.getElementById("Continue").disabled = false;
    }
    document.getElementById("Choice2").onclick = function () {
        var result = item.validator(2, profile);
        document.getElementById("Chancing").innerHTML = result[0].percentChance;
        document.getElementById("Prompt").innerHTML = result[1];
        document.getElementById("Continue").disabled = false;
    }
    items.splice(num, 1);
}

document.getElementById("Continue").onclick = function () {
    if (!isPlaying) {
        
        items = list;
        isPlaying = true;
        document.getElementById("Prompt").innerHTML = "Welcome to the College Admissions Simulator! Click on the buttons to make decisions that will affect your chances of getting into your dream school. Continue to move on. Good luck!";
        document.getElementById("Chancing").innerHTML = profile.Match(profile.dreamSchoolProfile).percentChance;
        return;
    }
    nextChoice();
    document.getElementById("Continue").disabled = true;
}