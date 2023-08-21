const baseURL = 'http://api.data.gov/ed/collegescorecard/v1/schools.json?';
const apiKey = "6786P6CUurTf7yR4gvsasrAxLzdvBri9aEKOkgVR"
const abbreviations = {
    "SAT": "admissions.sat_scores.average.overall",
    "ACT": "admissions.act_scores.midpoint.cumulative",
    "Acceptance Rate": "admissions.admission_rate.overall",
}
const abbreviate = (str, range = false) => {
    return abbreviations[str] + (range ? "__range" : "");
}
const bounds = (lower, upper) => {
    return lower + ".." + upper;
}
const fields = [ // Fields to be returned, all that will go into college profile
    "school.name", // Name
    "school.city", // City
    "school.state", // State
    "school.school_url", // School Website
    "school.price_calculator_url", // Net Price Calculator
    "school.zip", // Zip Code
    "latest.admissions.admission_rate.overall", // Acceptance Rate
    "latest.admissions.sat_scores.average.overall", // SAT
    "latest.admissions.sat_scores.75th_percentile.math", // SAT Math 75th Percentile
    "latest.admissions.sat_scores.25th_percentile.math", // SAT Math 25th Percentile
    "latest.admissions.sat_scores.75th_percentile.writing", // SAT Writing 75th Percentile
    "latest.admissions.sat_scores.25th_percentile.writing", // SAT Writing 25th Percentile
    "latest.admissions.sat_scores.75th_percentile.critical_reading", // SAT Reading 75th Percentile
    "latest.admissions.sat_scores.25th_percentile.critical_reading", // SAT Reading 25th Percentile
    "latest.admissions.act_scores.75th_percentile.cumulative", // ACT 75th Percentile
    "latest.admissions.act_scores.25th_percentile.cumulative", // ACT 25th Percentile
    "latest.admissions.act_scores.midpoint.cumulative", // ACT
    "latest.student.size", // Size
    "latest.cost.tuition.in_state", // In-State Tuition
    "latest.cost.tuition.out_of_state", // Out-of-State Tuition
    "latest.cost.attendance.academic_year", // Average Cost of Attendance
    "latest.student.demographics.first_generation", // Percent First Generation
    "latest.student.demographics.median_hh_income", // Median Household Income
    "latest.student.demographics.race_ethnicity.white", // White
    "latest.student.demographics.race_ethnicity.black", // Black
    "latest.student.demographics.race_ethnicity.hispanic", // Hispanic
    "latest.student.demographics.race_ethnicity.asian", // Asian
    "latest.student.demographics.race_ethnicity.aian", // American Indian/Alaska Native
    "latest.student.demographics.race_ethnicity.unknown", // Unknown
    "latest.student.demographics.men", // Percent Men
    "latest.student.demographics.women", // Women
    "latest.student.FAFSA_applications", // Number of students who applied for FAFSA
    "latest.student.students_with_pell_grant", // Number of students who received Pell Grant


].join(",");
const convertSearchParams = (searchParams) => {
    return Object.keys(searchParams).map((key) => {
        return `${key}=${searchParams[key]}`;
    }).join("&");
}
class Match {
    constructor(college, percentMatch, breakdown) {
        this._college = college;
        this._percentMatch = percentMatch;
        this.college = (college * 100).toFixed(2) + "%";
        this.percentMatch = Math.max(0, Math.min(100, percentMatch)).toFixed(2) + "%";
        this.breakdown = breakdown;
    }
}

class StudentProfile {
    constructor(gpa, satScore, actScore, ECMap, numAPClasses, offeredAPClasses, hhIncome, isFirstGeneration, ethnicity, isFemale, currentState, preferredState) {
        this.gpa = gpa;
        this.satScore = satScore;
        this.actScore = actScore;
        this.ECMap = ECMap;
        this.numAPClasses = numAPClasses;
        this.offeredAPClasses = offeredAPClasses;
        this.hhIncome = hhIncome;
        this.isFirstGeneration = isFirstGeneration;
        this.ethnicity = ethnicity;
        this.isFemale = isFemale;
        this.currentState = currentState;
        this.preferredState = preferredState;
        this.dreamSchool = null;
        this.matches = [];
        this.reconstruct = [gpa, satScore, actScore, ECMap, numAPClasses, offeredAPClasses, hhIncome, isFirstGeneration, ethnicity, isFemale, currentState, preferredState, this.dreamSchool];
    }
    Match(collegeProfile) {
        let base = collegeProfile.acceptanceRate;
        var adjustedTestScoreToCollege;
        var percentMatchByTestScores, percentMatchByGPA, percentMatchByFirstGen, percentMatchByEthnicity, percentMatchByGender, percentMatchByState, percentMatchByHHIncome, percentMatchByECs;
        // 400 - -1, sat25 - -0.5, sat - 0, sat75 - +.25, 1600 - +.5
        // 1 - -1, act25 - -0.5, act - 0, act75 - +.25, 36 - +.5
        if (this.satScore != 0 && this.actScore != 0) {
            adjustedTestScoreToCollege = Math.max(map_range(this.satScore, collegeProfile.sat25, collegeProfile.sat75, -0.3, .3) * base, map_range(this.actScore, collegeProfile.act25, collegeProfile.act75, -0.3, .3) * base); // Boosts score if greater than 50th percentile, lowers if less than 50th percentile
            percentMatchByTestScores = Math.max(Math.max(Math.min(map_range(this.satScore, collegeProfile.sat25, collegeProfile.sat, .4, 1), 1), 0) + Math.max(Math.min(map_range(this.actScore, collegeProfile.act25, collegeProfile.act, .4, 1), 1), 0));
        } else if (this.satScore != 0) {
            adjustedTestScoreToCollege = map_range(this.satScore, collegeProfile.sat25, collegeProfile.sat75, -0.3, .3) * base;
            percentMatchByTestScores = Math.max(Math.min(map_range(this.satScore, collegeProfile.sat25, collegeProfile.sat, .4, 1), 1), 0);
        } else if (this.actScore != 0) {
            adjustedTestScoreToCollege = map_range(this.actScore, collegeProfile.act25, collegeProfile.act75, -0.3, .3) * base;
            percentMatchByTestScores = Math.max(Math.min(map_range(this.actScore, collegeProfile.act25, collegeProfile.act, .4, 1), 1), 0);
        } else {
            // Went test optional
            adjustedTestScoreToCollege = 0;
        }
        
        percentMatchByGPA = Math.max(Math.min(map_range(this.gpa, map_range(1 - collegeProfile.acceptanceRate, 0, 1, 0, 1.0, .25, 1), map_range(1 - collegeProfile.acceptanceRate, 0, 1, 3, 4), .25, 1), 1), 0);
        //percentMatchByIncome = Math.max(Math.min(map_range(this.hhIncome, collegeProfile.MedianHHIncome - 10000, collegeProfile.MedianHHIncome + 10000, 0, 1), 1), 0);
        percentMatchByFirstGen = collegeProfile.PercentFirstGeneration > .4 ? 1 : 0.97;
        
        var majorityDemographic = Math.max(collegeProfile.PercentWhite, collegeProfile.PercentBlack, collegeProfile.PercentHispanic, collegeProfile.PercentAsian, collegeProfile.PercentAIAN);
        switch (this.ethnicity) {
            case "White":
                percentMatchByEthnicity = majorityDemographic == collegeProfile.PercentWhite;
                break;
            case "Black":
                percentMatchByEthnicity = majorityDemographic == collegeProfile.PercentBlack;
                break;
            case "Hispanic":
                percentMatchByEthnicity = majorityDemographic == collegeProfile.PercentHispanic;
                break;
            case "Asian":
                percentMatchByEthnicity = majorityDemographic == collegeProfile.PercentAsian;
                break;
            case "American Indian/Alaska Native":
                percentMatchByEthnicity = majorityDemographic == collegeProfile.PercentAIAN;
                break;
            default:
                percentMatchByEthnicity = true;
                break;
        }
        percentMatchByEthnicity = percentMatchByEthnicity ? 1 : 0.95;
        if (this.isFemale && collegeProfile.PercentWomen > .4) {
            percentMatchByGender = 1;
        } else if (!this.isFemale && collegeProfile.PercentMen > .4) {
            percentMatchByGender = 1;
        } else {
            percentMatchByGender = 0.98;
        }
        percentMatchByState = this.preferredState == collegeProfile.state ? 1 : 0.98;
        percentMatchByHHIncome = map_range(this.hhIncome, collegeProfile.MedianHHIncome - 10000, collegeProfile.MedianHHIncome + 10000, 0, 1) * 0.5 + Math.min(1, map_range(this.hhIncome * .22,0, collegeProfile.state == this.currentState ? collegeProfile.ISTuition : collegeProfile.OOSTuition, 0, 1)) * 0.5;
        percentMatchByHHIncome *= 1.85; // Miniscule effect of hh income
        percentMatchByHHIncome = Math.max(Math.min(percentMatchByHHIncome, 1), 0);
        percentMatchByECs = 1;
        base += adjustedTestScoreToCollege + (this.isFirstGeneration ? .2 : 0) + (this.isMinority ? .05 : 0) + (this.isFemale ? .1 : 0); // Arbitrary weights
        var mtch = new Match(base, percentMatchByTestScores * percentMatchByGPA * percentMatchByHHIncome * percentMatchByFirstGen * percentMatchByEthnicity * percentMatchByGender * percentMatchByState * percentMatchByECs * 100, [percentMatchByTestScores, percentMatchByGPA, percentMatchByHHIncome, percentMatchByFirstGen, percentMatchByEthnicity, percentMatchByGender, percentMatchByState, percentMatchByECs]);
        this.matches.push(mtch);
        return mtch;
    }
}
class CollegeProfile {
    constructor(name, city, state, url, netpricecalculator, zip, acceptanceRate, sat, sat25, sat75, act, act25, act75, size, ISTuition, OOSTuition, AvgAttendanceCost, PercentFirstGeneration, MedianHHIncome, PercentWhite, PercentBlack, PercentHispanic, PercentAsian, PercentAIAN, PercentUnknown, PercentMen, PercentWomen, NumFAFSA, NumPellGrant) {
        this.name = name;
        this.city = city;
        this.state = state;
        this.url = url;
        this.netpricecalculator = netpricecalculator;
        this.zip = zip;
        this.acceptanceRate = acceptanceRate;
        this.sat = sat;
        this.sat25 = sat25;
        this.sat75 = sat75;
        this.act = act;
        this.act25 = act25;
        this.act75 = act75;
        this.size = size;
        this.ISTuition = ISTuition;
        this.OOSTuition = OOSTuition;
        this.AvgAttendanceCost = AvgAttendanceCost;
        this.PercentFirstGeneration = PercentFirstGeneration;
        this.MedianHHIncome = MedianHHIncome;
        this.PercentWhite = PercentWhite;
        this.PercentBlack = PercentBlack;
        this.PercentHispanic = PercentHispanic;
        this.PercentAsian = PercentAsian;
        this.PercentAIAN = PercentAIAN;
        this.PercentUnknown = PercentUnknown;
        this.PercentMen = PercentMen;
        this.PercentWomen = PercentWomen;
        this.NumFAFSA = NumFAFSA;
        this.NumPellGrant = NumPellGrant;
    }
    PrettyPrint() {
        return `${this.name} (${this.city}, ${this.state}) - ${this.url}\n${this.acceptanceRate * 100}% Acceptance Rate - SAT Range ${this.sat25},${this.sat},${this.sat75} - ACT Range ${this.act25},${this.act},${this.act75}\n${this.size} Student Body - In-State ${this.ISTuition} Out-of-State ${this.OOSTuition}`;
    }
    Match(studentProfile) {
        return studentProfile.Match(this);
    }
}
const searchSchool = async (name) => {
    const result = await fetch(`${baseURL}&school.name=${encodeURIComponent(name)}&fields=school.name,id&api_key=${apiKey}&per_page=6`);
    const data = await result.json();
    if (data.metadata.total == 0) {
        return null;
    }
    return data.results;
}
const getSchool = async (id) => {
    const result = await fetch(`${baseURL}&id=${id}&api_key=${apiKey}&fields=${fields}`);
    const data = await result.json();
    if (data.metadata.total == 0) {
        return null;
    }
    var college = data.results[0];
    return new CollegeProfile(
        college["school.name"],
        college["school.city"],
        college["school.state"],
        college["school.school_url"],
        college["school.price_calculator_url"],
        college["school.zip"],
        college["latest.admissions.admission_rate.overall"] || 0.1,
        college["latest.admissions.sat_scores.average.overall"],
        (college["latest.admissions.sat_scores.25th_percentile.critical_reading"] + college["latest.admissions.sat_scores.25th_percentile.writing"]) / 2 + college["latest.admissions.sat_scores.25th_percentile.math"],
        (college["latest.admissions.sat_scores.75th_percentile.critical_reading"] + college["latest.admissions.sat_scores.75th_percentile.writing"]) / 2 + college["latest.admissions.sat_scores.75th_percentile.math"],
        college["latest.admissions.act_scores.midpoint.cumulative"],
        college["latest.admissions.act_scores.25th_percentile.cumulative"],
        college["latest.admissions.act_scores.75th_percentile.cumulative"],
        college["latest.student.size"],
        college["latest.cost.tuition.in_state"],
        college["latest.cost.tuition.out_of_state"],
        college["latest.cost.attendance.academic_year"],
        college["latest.student.share_firstgeneration"],
        college["latest.student.demographics.median_hh_income"],
        college["latest.student.demographics.race_ethnicity.white"],
        college["latest.student.demographics.race_ethnicity.black"],
        college["latest.student.demographics.race_ethnicity.hispanic"],
        college["latest.student.demographics.race_ethnicity.asian"],
        college["latest.student.demographics.race_ethnicity.aian"],
        college["latest.student.demographics.race_ethnicity.unknown"],
        college["latest.student.demographics.men"],
        college["latest.student.demographics.women"],
        college["latest.student.FAFSA_applications"],
        college["latest.student.students_with_pell_grant"]
    );
}
const getCollegeSelectionByStudentProfile = async (studentProfile) => {
    const searchParams = {
        [abbreviate("SAT", true)]: bounds(studentProfile.satScore - 80, studentProfile.satScore + 80),
        "school.degrees_awarded.predominant": "1,2,3",

    };
    const result = await fetch(`${baseURL}${convertSearchParams(searchParams)}&fields=${fields}&api_key=${apiKey}&per_page=10&sort=latest.admissions.admission_rate.overall`);
    const data = await result.json();
    var collegeProfiles = data.results.map((college) => {
        return new CollegeProfile(
            college["school.name"],
            college["school.city"],
            college["school.state"],
            college["school.school_url"],
            college["school.price_calculator_url"],
            college["school.zip"],
            college["latest.admissions.admission_rate.overall"] || 0.1,
            college["latest.admissions.sat_scores.average.overall"],
            (college["latest.admissions.sat_scores.25th_percentile.critical_reading"] + college["latest.admissions.sat_scores.25th_percentile.writing"]) / 2 + college["latest.admissions.sat_scores.25th_percentile.math"],
            (college["latest.admissions.sat_scores.75th_percentile.critical_reading"] + college["latest.admissions.sat_scores.75th_percentile.writing"]) / 2 + college["latest.admissions.sat_scores.75th_percentile.math"],
            college["latest.admissions.act_scores.midpoint.cumulative"],
            college["latest.admissions.act_scores.25th_percentile.cumulative"],
            college["latest.admissions.act_scores.75th_percentile.cumulative"],
            college["latest.student.size"],
            college["latest.cost.tuition.in_state"],
            college["latest.cost.tuition.out_of_state"],
            college["latest.cost.attendance.academic_year"],
            college["latest.student.share_firstgeneration"],
            college["latest.student.demographics.median_hh_income"],
            college["latest.student.demographics.race_ethnicity.white"],
            college["latest.student.demographics.race_ethnicity.black"],
            college["latest.student.demographics.race_ethnicity.hispanic"],
            college["latest.student.demographics.race_ethnicity.asian"],
            college["latest.student.demographics.race_ethnicity.aian"],
            college["latest.student.demographics.race_ethnicity.unknown"],
            college["latest.student.demographics.men"],
            college["latest.student.demographics.women"],
            college["latest.student.FAFSA_applications"],
            college["latest.student.students_with_pell_grant"]
        )
    });
    collegeProfiles.sort((a, b) => {
        return b.Match(studentProfile)._percentMatch - a.Match(studentProfile)._percentMatch;
    });
    return Promise.resolve(collegeProfiles);
}

// 400, 1300, 1500, -0.5, 0.25
// -0.5 +  -5 = -5.5 
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
var currentStudentProfile;

function setStudentProfile(studentProfile) {
    if (studentProfile.reconstruct[12] == null) {
        studentProfile.reconstruct[12] = studentProfile.dreamSchool;
    }
    localStorage.setItem("studentProfile", JSON.stringify(studentProfile.reconstruct));
}
async function getStudentProfile(convert = false) {
    var arry = JSON.parse(localStorage.getItem("studentProfile"));
    var dreamSchool = arry.pop();
    
    var profile = new StudentProfile(...arry);
    profile.reconstruct = [...arry, dreamSchool];
    profile.dreamSchool = dreamSchool;
    if (convert) {
        profile.dreamSchoolProfile = await getSchool(dreamSchool);
    }
    return profile;
}

export { getCollegeSelectionByStudentProfile, StudentProfile, CollegeProfile, searchSchool, getSchool, setStudentProfile, getStudentProfile };