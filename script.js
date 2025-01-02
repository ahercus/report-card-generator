document.addEventListener('DOMContentLoaded', () => {
    const competenciesContainer = document.getElementById('competencies');
    const addCompetencyButton = document.getElementById('addCompetency');
    const generateCommentButton = document.getElementById('generateComment');
     const loadingDiv = document.getElementById('loading');


     const subjectCompetencies = {
        'Mathematics': {
             '1-3': ["Number Sense", "Addition and Subtraction", "Basic Geometry", "Measurement", "Problem Solving", "Data Handling"],
             '4-6': ["Multiplication and Division", "Fractions and Decimals", "Advanced Geometry", "Algebraic Thinking", "Data Analysis", "Problem Solving"],
            '7-9': ["Pre-Algebra", "Advanced Geometry", "Statistics and Probability", "Algebra", "Problem Solving", "Mathematical Reasoning"],
             '10-12': ["Calculus", "Advanced Algebra", "Trigonometry", "Statistics", "Mathematical Analysis", "Problem Solving"]
            },
        'Science': {
             '1-3': ["Observation Skills", "Basic Concepts", "Life Science", "Earth Science", "Physical Science", "Scientific Inquiry"],
             '4-6': ["Scientific Inquiry", "Data Collection", "Experimental Design", "Life Science", "Earth Science", "Physical Science"],
            '7-9': ["Biology", "Chemistry", "Physics", "Scientific Reasoning", "Data Analysis", "Experimental Design"],
            '10-12': ["Advanced Biology", "Advanced Chemistry", "Advanced Physics", "Research Skills", "Data Interpretation", "Critical Thinking"]
             },
         'English': {
             '1-3': ["Reading Comprehension", "Basic Writing", "Phonics", "Vocabulary", "Grammar Basics", "Storytelling"],
             '4-6': ["Reading Comprehension", "Writing Skills", "Vocabulary", "Grammar", "Communication Skills", "Literary Analysis"],
            '7-9': ["Advanced Reading Comprehension", "Essay Writing", "Literary Terms", "Grammar and Syntax", "Research Skills", "Critical Analysis"],
            '10-12': ["Advanced Literary Analysis", "Rhetorical Analysis", "Research Papers", "Advanced Grammar", "Argumentation", "Presentation Skills"]
             },
        'History': {
            '1-3': ["Timeline Understanding", "Basic History Concepts", "Local History", "National Symbols", "Storytelling", "Historical Figures"],
            '4-6': ["Historical Events", "Research Skills", "Geographical Knowledge", "Cultural Understanding", "Cause and Effect", "Primary Sources"],
            '7-9': ["Global History", "Political Analysis", "Economic History", "Research and Synthesis", "Interpretation of Sources", "Historical Context"],
            '10-12': ["Advanced Historical Analysis", "Historiography", "Research Papers", "Advanced Research", "Primary Source Analysis", "Interpretation Skills"]
        },
        'Art': {
            '1-3': ["Color Recognition", "Basic Drawing", "Shapes and Patterns", "Creativity", "Art Materials", "Expression"],
            '4-6': ["Composition", "Drawing Techniques", "Use of Color", "Sculpting Basics", "Art History Basics", "Creative Expression"],
            '7-9': ["Advanced Drawing Techniques", "Painting", "Sculpting", "Art History", "Critique and Analysis", "Personal Style Development"],
             '10-12': ["Advanced Medium Techniques", "Conceptual Art", "Critique and Analysis", "Art History Research", "Portfolio Development", "Personal Art Style"]
        }
    };
    
    function getGradeRange(grade) {
        if(grade <= 3) return '1-3'
        if(grade <= 6) return '4-6'
        if(grade <= 9) return '7-9'
        return '10-12'
    }


    function createCompetencyItem(competencyName = 'Competency', initialValue = 5) {
       const id = `competency-${Date.now()}`;
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('competency-item');
        itemDiv.innerHTML = `
            <label for="${id}">${competencyName}:</label>
            <input type="range" id="${id}" min="1" max="10" value="${initialValue}">
            <button class="remove-competency">Remove</button>
        `;
      itemDiv.querySelector('button.remove-competency').addEventListener('click', (e) => {
                e.preventDefault();
                itemDiv.remove();
            });
        return itemDiv;
    }
    function updateCompetencies() {
        const subject = document.getElementById('subject').value;
         const grade = document.getElementById('grade').value;
        const gradeRange = getGradeRange(parseInt(grade))
        competenciesContainer.innerHTML = ''; // Clear existing competencies
        const competencies = subjectCompetencies[subject]?.[gradeRange] || [];

            competencies.forEach(competency => {
                competenciesContainer.appendChild(createCompetencyItem(competency));
            });
    }

     updateCompetencies();
    
    document.getElementById('subject').addEventListener('change', updateCompetencies);
    document.getElementById('grade').addEventListener('change', updateCompetencies);


    addCompetencyButton.addEventListener('click', (e) => {
        e.preventDefault();
        const newCompetencyName = prompt("Enter the name of the new competency:", "New Competency");
        if (newCompetencyName) {
            competenciesContainer.appendChild(createCompetencyItem(newCompetencyName));
        }
    });


    generateCommentButton.addEventListener('click', async (e) => {
        e.preventDefault();
        loadingDiv.style.display = 'block';
    
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const grade = document.getElementById('grade').value;
        const subject = document.getElementById('subject').value;
        const additionalContext = document.getElementById('additionalContext').value;
        const wordLimit = document.getElementById('wordLimit').value;
    
        const competencies = Array.from(competenciesContainer.querySelectorAll('.competency-item')).map(item => {
            const label = item.querySelector('label').textContent.slice(0, -1);
            const slider = item.querySelector('input[type="range"]');
            return {
                competency: label,
                value: parseInt(slider.value)
            };
        });
    
        const prompt = `Please generate a report card comment for ${firstName} ${lastName}, a student in grade ${grade}, for the subject of ${subject}.
        Here are the student's performance scores across various competencies (1 = Weak, 10 = Excels):
        ${competencies.map(comp => `${comp.competency}: ${comp.value}`).join(', ')}.
        Additional context: ${additionalContext}.
        Make the tone encouraging and informative. Do not refer directly to the numerical values of the performance scores - these are for the teacher's internal reference only.
        Please limit the response to approximately ${wordLimit} words.
        `;
    
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                loadingDiv.style.display = 'none';
                throw new Error(data.error || `HTTP error! Status: ${response.status}`);
            }
    
            loadingDiv.style.display = 'none';
            const comment = data.choices[0].message.content;
            document.getElementById('generatedComment').textContent = comment.trim();
    
        } catch (error) {
            loadingDiv.style.display = 'none';
            document.getElementById('generatedComment').textContent = `Error: ${error.message}`;
            console.error('Error generating comment:', error);
        }
    });
});