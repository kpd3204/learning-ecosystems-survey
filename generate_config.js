/**
 * This script takes the raw form_data.json and restructures it into a
 * role-based branching tree so it's easy for the React app to navigate.
 */
import fs from 'fs';
import path from 'path';

// Load raw data
const rawDataPath = path.resolve('./form_data.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

// The primary role question (index 2 in the raw data array)
const roleQuestion = rawData.find(q => q.title.includes("best describes your current primary role"));
const roleOptions = roleQuestion.options;

// Helper to find a question by exact or partial title
const findQ = (partialTitle) => {
  return rawData.find(q => q.title.toLowerCase().includes(partialTitle.toLowerCase()));
}

// We know from the form structure that:
// Q0-Q2 are common Introduction
// Then there are specific blocks for each role.
// We'll create an object grouped by paths.

const formConfig = {
  formId: "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A",
  commonInitial: [
    findQ("Current City"),
    findQ("Age Group"),
    findQ("primary role")
  ],
  branches: {
    // We will define the subsets of questions for each branch.
    // Given the length of the form, I'll extract some of the prominent questions for the main roles
    // and map them out. 
  },
  commonFinal: [
    findQ("top recommendation"),
    findQ("open feedback")
  ]
};

// --- Determine Branches based on the raw data ---
// 1. School Student
const schoolStudentQs = [
    findQ("split your daily study time"),
    findQ("main goal"),
    findQ("biggest reason for studying right now"),
    findQ("level of academic pressure"),
    findQ("hands-on activities"),
    findQ("skills do you feel you need to develop"), // The one right after hands-on
    findQ("school helping you in developing"),
    findQ("explore topics or learn new things on your own"),
    findQ("access the internet and digital devices"),
    findQ("teachers use technology in class"),
    findQ("use AI tools such as ChatGPT"),
    findQ("personally define success"),
    findQ("build your absolute dream school")
].filter(Boolean);

// 2. College Student
const collegeStudentQs = [
    findQ("balance between theoretical learning"),
    findQ("confident are you that your degree will help you find a job"),
    findQ("relevant do you feel your course content is"),
    findQ("feel when you think about graduating"),
    findQ("college mainly test you"),
    findQ("check AI-generated answers"),
    // findQ("skills do you feel you need to develop"), // Another variant exists
    findQ("college helping you in developing"),
    findQ("learning culture among students at your college"),
    findQ("active problem-solver or a passive follower"),
    findQ("learn the most useful skills"),
    findQ("confident do you feel about starting your career"),
    findQ("When you need to learn something new"),
    findQ("change one thing about college education"),
    findQ("differences, if any, do you notice between what you learn in college")
].filter(Boolean);

// 3. Parent
const parentQs = [
    findQ("decide if a school or college is actually good"),
    findQ("financial impact on your household"),
    findQ("focuses enough on your child’s emotional"),
    findQ("current schooling assessment system do to your child's natural curiosity"),
    findQ("preference for your child's supplementary learning"),
    findQ("steer your child toward specific career paths"),
    findQ("educational success mean to you for your child"),
    findQ("child wants to spend a weekend working on a personal project"),
    findQ("biggest worry about your child's education"),
    findQ("preparing your child well for a fast-changing"),
    findQ("important life skill is the school failing"),
    findQ("enroll your child in a new type of learning ecosystem"),
    findQ("human qualities or life skills do you want your child to have"),
    findQ("want your child's experience to be different")
].filter(Boolean);

// 4. Teachers
const teacherQs = [
    findQ("freedom do you have to step away from the syllabus"),
    findQ("depending too much on AI tools"),
    findQ("good training on how to teach with digital tools"),
    findQ("testing students through projects instead of regular"),
    findQ("actively teach problem-solving"),
    findQ("regular exams accurately measure if a student is ready"),
    findQ("new digital teaching tools"),
    findQ("forced to focus on finishing the syllabus"),
    findQ("unconventional answer or challenges the textbook"),
    findQ("ready is the school system to move toward real-world"),
    findQ("invest in your own professional growth"),
    findQ("incorporate AI tools into your teaching"),
    findQ("syllabus and exam requirements were not a constraint")
].filter(Boolean);

// 5. Experienced Professionals + Entry Level (They seem to share this block)
const professionalQs = [
    findQ("college degree prepare you for the day-to-day"),
    findQ("aspects of starting work were most different"),
    findQ("thinking or people skill was missing from your college"),
    findQ("use the theories you studied in college at your job"),
    findQ("confidence in communication and adaptability"),
    findQ("job directly related to what you studied in college"),
    findQ("primarily acquire the skills you use most in your work today"),
    findQ("shape your attitude toward taking risks"),
    findQ("advise your younger self on how to prepare for jobs"),
    findQ("mindset your college should have taught you"),
    findQ("become more curious or less curious"),
    findQ("formal education versus what you learned on the job")
].filter(Boolean);

// 6. Employers
const employerQs = [
    findQ("biggest challenge you and your colleagues face at work today"),
    findQ("skills are missing in the fresh graduates you work with today")
].filter(Boolean);


formConfig.branches = {
    "School Student": schoolStudentQs,
    "College/University Student": collegeStudentQs,
    "Parent/Guardian of a Student": parentQs,
    "Teachers & Educators": teacherQs,
    "Entry-Level Professional (0-5 Years Exp)": professionalQs,
    "Experienced Professional (5+ Years Exp)": professionalQs,
    "Employer / Hiring Manager": employerQs,
    // The others can route directly to the end if we don't have their specific qs in this extraction
    "School / College Administrators": [],
    "Education Experts / Policymakers": [],
    "Counsellors & Wellbeing Professionals": []
};

// Filter out any undefined questions from branches (in case exact titles changed slightly)
Object.keys(formConfig.branches).forEach(key => {
    formConfig.branches[key] = formConfig.branches[key].filter(q => q !== undefined);
});

// Since there is a duplicate question text for "skills need to develop" (one for school, one for college)
// Let's grab them directly by index to be safe:
// Indexes based on previous array:
// School Student skills needed (index 8)
// College Student skills needed (index 22)
const schoolSkillsIndex = rawData.findIndex(q => q.entry_id === "entry.2059375593");
const collegeSkillsIndex = rawData.findIndex(q => q.entry_id === "entry.1187535366");

if(schoolSkillsIndex !== -1 && formConfig.branches["School Student"]) {
    // replace or insert
    const q = rawData[schoolSkillsIndex];
    if(!formConfig.branches["School Student"].find(sq => sq.entry_id === q.entry_id)){
        formConfig.branches["School Student"].push(q);
    }
}
if(collegeSkillsIndex !== -1 && formConfig.branches["College/University Student"]) {
    const q = rawData[collegeSkillsIndex];
     if(!formConfig.branches["College/University Student"].find(cq => cq.entry_id === q.entry_id)){
        formConfig.branches["College/University Student"].push(q);
    }
}

// Ensure dir exists
if (!fs.existsSync(path.resolve('./src/data'))) {
    fs.mkdirSync(path.resolve('./src/data'));
}

fs.writeFileSync(path.resolve('./src/data/formConfig.json'), JSON.stringify(formConfig, null, 2));
console.log("Successfully generated formConfig.json with branching logic!");
