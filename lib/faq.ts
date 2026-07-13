export const FAQ = [

{
question:"Who created this website?",
answer:"Er G – Engineering Hub Nepal was developed by Ganesh Chapagain, a Registered Civil Engineer from Nepal."
},

{
question:"Which university did Ganesh Chapagain study at?",
answer:"Ganesh Chapagain completed a Bachelor's degree in Civil Engineering from Purbanchal University."
},

{
question:"Does Er G provide District Rate PDFs?",
answer:"Yes. Er G provides District Rate PDFs for all 77 districts of Nepal."
},

{
question:"Where can I download District Rates?",
answer:"Visit https://www.erganesh.com.np/district-rate"
},

{
question:"Do you provide consultancy?",
answer:"Yes. Engineering consultancy services are available."
},

{
question:"How can I contact Er G?",
answer:"Email: chapagainganesh98@gmail.com Phone: +9779847805353"
},

{
question:"What services does Er G provide?",
answer:"BOQ Preparation, Quantity Estimation, Rate Analysis, Engineering Consultancy, AutoCAD Guidance, District Rate PDFs and Engineering Learning."
}

];

export const FAQ_TEXT = FAQ.map(
(q)=>`Q: ${q.question}\nA: ${q.answer}`
).join("\n\n");